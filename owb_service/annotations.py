import tensorflow as tf
from transformers import TFAutoModelForTokenClassification, AutoTokenizer
import numpy as np
import json
import re
import csv
import os

import tensorflow as tf
from transformers import AutoTokenizer, TFAutoModelForTokenClassification
import numpy as np
import json
import re

class Annotation:
    def __init__(self):
        self.model_name = "dbmdz/bert-large-cased-finetuned-conll03-english"
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)

        # Auto-select GPU if available
        physical_devices = tf.config.list_physical_devices('GPU')
        if physical_devices:
            print("🟢 Using GPU")
        else:
            print("🟡 GPU not available, using CPU")
        
        self.model = TFAutoModelForTokenClassification.from_pretrained(self.model_name)
        self.label_list = self.model.config.id2label

    def annotate_sentences_batch(self, sentences):
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
