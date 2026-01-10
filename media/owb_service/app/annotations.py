import tensorflow as tf
from transformers import TFAutoModelForTokenClassification, AutoTokenizer
from app.progress import progress_state
import numpy as np
import json
import re
import csv
import os

class Annotation:
    """
    Performs named entity recognition (NER) annotations using a pre-trained BERT model.

    This class loads a HuggingFace Transformers model and tokenizer for token classification,
    then provides methods to annotate batches of sentences and integrate the results into
    a structured JSON representation of a book.
    """

    def __init__(self):
        """
        Initializes the Annotation class.

        - Loads the `dbmdz/bert-large-cased-finetuned-conll03-english` model and tokenizer.
        - Selects a GPU if available.
        - Prepares label mappings from the model config.
        """
        snapshot_path = os.path.join(
            "models", "dbmdz-bert-large",
            "models--dbmdz--bert-large-cased-finetuned-conll03-english",
            "snapshots", "4c534963167c08d4b8ff1f88733cf2930f86add0"
        )

        self.model_name = snapshot_path  # Replace remote model name with local path
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name, local_files_only=True)

        # Auto-select GPU if available
        physical_devices = tf.config.list_physical_devices('GPU')
        if physical_devices:
            print("🟢 Using GPU")
        else:
            print("🟡 GPU not available, using CPU")

        self.model = TFAutoModelForTokenClassification.from_pretrained(self.model_name, local_files_only=True)
        self.label_list = self.model.config.id2label

    def annotate_sentences_batch(self, sentences):
        """
        Performs NER tagging on a batch of sentences.

        Args:
            sentences (List[str]): A list of raw text sentences to annotate.

        Returns:
            List[dict or None]: A list of annotation results. Each item is a dictionary with:
                - "labels": List of predicted entity labels.
                - "text": Reconstructed sentence without subword tokens.
                If no valid annotations are found for a sentence, `None` is returned in that slot.
        """
        

        batch = self.tokenizer(
            sentences, return_tensors="tf", padding=True, truncation=True, is_split_into_words=False
        )
        outputs = self.model(batch)
        predictions = tf.math.argmax(outputs.logits, axis=-1).numpy()
        input_ids = batch["input_ids"].numpy()
        attention_mask = batch["attention_mask"].numpy()

        results = []
        for i in range(len(sentences)):
            tokens = self.tokenizer.convert_ids_to_tokens(input_ids[i])
            preds = predictions[i]

            token_label_pairs = [
                (token, self.label_list[pred])
                for token, pred, mask in zip(tokens, preds, attention_mask[i])
                if mask and token not in self.tokenizer.all_special_tokens
            ]

            reconstructed = []
            current_word = ""
            current_label = ""
            for token, label in token_label_pairs:
                if token.startswith("##"):
                    current_word += token[2:]
                else:
                    if current_word:
                        reconstructed.append((current_word, current_label))
                    current_word = token
                    current_label = label
            if current_word:
                reconstructed.append((current_word, current_label))

            if reconstructed:
                tokens, labels = zip(*reconstructed)
                results.append({
                    "labels": list(labels),
                    "text": " ".join(tokens)
                })
            else:
                results.append(None)
        return results

    def initiate_annotations(self, published_book):
        """
        Annotates an entire book structure and reports accurate progress.
        """

        test = published_book

        # --------------------------------------------------
        # 1. Pre-calculate TOTAL SENTENCES (true workload)
        # --------------------------------------------------
        total_sentences = 0
        for chapter in test["content"]:
            for page in chapter["pages"]:
                for paragraph in page:
                    total_sentences += len(
                        re.split(r'(?<=[.!?]) +', paragraph)
                    )

        progress_state.clear()
        progress_state.update({
            "status": "running",
            "phase": "annotating",
            "total": total_sentences,
            "current": 0,
            "percent": 30,
            "message": "Starting annotation",
            "done": False
        })

        # --------------------------------------------------
        # 2. Process chapters → pages → sentences
        # --------------------------------------------------
        for cha_index, chapter in enumerate(test["content"]):
            for page_index, page in enumerate(chapter["pages"]):

                # Split page into sentences
                all_sentences = []
                for paragraph in page:
                    all_sentences.extend(
                        re.split(r'(?<=[.!?]) +', paragraph)
                    )

                if not all_sentences:
                    continue

                # Run model inference
                batch_results = self.annotate_sentences_batch(all_sentences)
                filtered = [r for r in batch_results if r is not None]

                # Replace page content with annotated data
                chapter["pages"][page_index] = filtered

                # --------------------------------------------------
                # 3. Update progress AFTER real work is done
                # --------------------------------------------------
                progress_state["current"] += len(all_sentences)
                progress_state["percent"] = 30 + int(
                    (progress_state["current"] / progress_state["total"]) * 70
                )

                progress_state["message"] = (
                    f"Chapter {cha_index + 1}, "
                    f"Page {page_index + 1} "
                    f"({progress_state['percent']}%)"
                )

                print(
                    f"⏳ Chapter {cha_index + 1}, "
                    f"Page {page_index + 1} — "
                    f"{len(all_sentences)} sentences"
                )

        # --------------------------------------------------
        # 4. FINAL STATE (ONLY HERE)
        # --------------------------------------------------
        progress_state.update({
            "status": "complete",
            "percent": 100,
            "message": "Annotation complete",
            "done": True
        })

        print("✅ Annotation complete")

        return test

