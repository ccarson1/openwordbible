import numpy as np
import spacy
import json

class POS:
    """
    A class for processing text with Part-of-Speech (POS) tagging using spaCy.
    """

    def __init__(self):
        """
        Initializes the POS tagger by loading the English spaCy language model.
        """
        self.nlp = spacy.load("en_core_web_sm")

    def pos_label_process(self, data):
        """
        Processes nested JSON-style book content to assign POS tags to each sentence.

        This method modifies the input data in-place by adding a 'POS' key
        containing the POS tag sequence for each sentence.

        Args:
            data (dict): A dictionary containing book content under the structure:
                         {
                             "published_book": {
                                 "content": [
                                     {
                                         "pages": [
                                             [
                                                 {"text": "This is a sentence."},
                                                 ...
                                             ],
                                             ...
                                         ]
                                     },
                                     ...
                                 ]
                             }
                         }

        Returns:
            dict: The input dictionary, with POS tags added to each sentence.
        """

        for a in data['content']:
            for b in a['pages']:
                for c in b:
                    print(c)
                    # Process the sentence with the spaCy model
                    doc = self.nlp(c['text'])

                    # Extract tokens and their predicted POS tags
                    tokens = [token.text for token in doc]
                    pos_tags = [token.pos_ for token in doc]

                    # Display the results
                    print("Tokens:", tokens)
                    print("POS Tags:", pos_tags)
                    c['POS'] = pos_tags

        return data
