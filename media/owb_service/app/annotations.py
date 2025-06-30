import tensorflow as tf
from transformers import TFAutoModelForTokenClassification, AutoTokenizer
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
        Annotates an entire book-like JSON string by splitting and processing its content page by page.

        Args:
            published_book (str): A JSON string with the structure:
                {
                    "content": [
                        {
                            "pages": [
                                ["Sentence 1.", "Sentence 2.", ...],
                                ...
                            ]
                        },
                        ...
                    ]
                }

        Returns:
            dict: The modified structure with entity label annotations added to each page.
                  Each page becomes a list of dictionaries with "text" and "labels" fields.
        """
        test = json.loads(published_book)

        for cha in range(len(test['content'])):
            for s in range(len(test['content'][cha]['pages'])):
                page = test['content'][cha]['pages'][s]
                all_sentences = []
                for c in page:
                    all_sentences.extend(re.split(r'(?<=[.!?]) +', c))

                print(f"⏳ Processing chapter {cha}, section {s} with {len(all_sentences)} sentences...")

                batch_results = self.annotate_sentences_batch(all_sentences)
                filtered = [r for r in batch_results if r is not None]
                test['content'][cha]['pages'][s] = filtered
                print(f"✅ Done chapter {cha}, section {s}")
        return test
