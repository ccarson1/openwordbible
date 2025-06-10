import tensorflow as tf
from transformers import TFAutoModelForTokenClassification, AutoTokenizer
import numpy as np
import json
import re
import csv
import os

class Annotation():

    def __init__(self):
        self.model_name = "dbmdz/bert-large-cased-finetuned-conll03-english"
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = TFAutoModelForTokenClassification.from_pretrained(self.model_name)
        self.entities = []

    def initiate_annotations(self, published_book):
        test = json.loads(published_book)
        for cha in range(len(test['content'])):
            for s in range(len(test['content'][cha]['pages'])):
                sentences = []
                for c in test['content'][cha]['pages'][s]:
                    #print(c.split(" "))
                    temp_sentences = re.split(r'(?<=[.!?]) +', c)
                    for x in temp_sentences:

                        self.make_prediction(x)
                        reconstructed = self.interpret_prediction()
                        if len(reconstructed) > 2:
                            tokens, labels = zip(*reconstructed[1:-1])
                            labels = list(labels)
                            token_text = " ".join(tokens)
                            sentence = {
                            "labels": labels,
                            "text": token_text
                            }
                            print(sentence)
                            sentences.append(sentence)
                        else:
                            pass

                        
                test['content'][cha]['pages'][s] = sentences
        return test


    def make_prediction(self, sentence):
        self.entities = []
        inputs = self.tokenizer(sentence, return_tensors="tf")

        outputs = self.model(inputs)
        logits = outputs.logits
        predictions = tf.math.argmax(logits, axis=-1).numpy()[0]

        label_list = self.model.config.id2label

        tokens = self.tokenizer.convert_ids_to_tokens(inputs["input_ids"][0])
        

        for token, prediction in zip(tokens, predictions):
            label = label_list[prediction]
            self.entities.append((token, label))

        return self.entities[1:-1]
    

    def interpret_prediction(self):
        tokens, labels =  zip(*self.entities[1:-1])

        tokens = list(tokens)
        labels = list(labels)

        # Reconstruct words and align labels
        reconstructed = []
        current_word = ""
        current_label = ""

        for token, label in zip(tokens, labels):
            if token.startswith("##"):
                current_word += token[2:]
            else:
                if current_word:  # Save previous word
                    reconstructed.append((current_word, current_label))
                current_word = token
                current_label = label
        # Add final token
        if current_word:
            reconstructed.append((current_word, current_label))

        return reconstructed
    

    def export_to_CSV(self, file_path):

        with open(file_path, 'r', encoding='utf-8') as file:
            content = json.load(file)

        labels = []
        sentences = []

        for x in content['published_book']['content']:
            for y in x['pages']:
                for sent in y:
                    for z in sent['labels']:
                        if z != 'O ' and z != 'O':
                            temp_labels = ' '.join(sent['labels'])
                            labels.append(temp_labels)
                            sentences.append(sent['text'])
                            print(temp_labels)
                            print(sent['text'])
                            break
        
        # Reconstruct words and align labels
        reconstructed = []
        current_word = ""
        current_label = ""

        for token, label in zip(sentences, labels):
            if token.startswith("##"):
                current_word += token[2:]
            else:
                if current_word:  # Save previous word
                    reconstructed.append((current_word, current_label))
                current_word = token
                current_label = label
        # Add final token
        if current_word:
            reconstructed.append((current_word, current_label))


        output_dir = "media/datasets"
        os.makedirs(output_dir, exist_ok=True)

        # Output to CSV
        with open(os.path.join(output_dir, "ner_labeled_data.csv"), "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["word", "label"])
            writer.writerows(reconstructed)

        
    def print_tensorflow_version(self):
        print(tf.__version__)