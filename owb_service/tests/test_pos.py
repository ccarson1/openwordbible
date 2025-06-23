# tests/test_pos.py
import unittest
from app.pos import POS   
import copy

class TestPOS(unittest.TestCase):
    """Unit tests for the POS.pos_label_process method."""

    @classmethod
    def setUpClass(cls):
        # Load spaCy once for the whole test run
        cls.pos_tagger = POS()

        # Minimal synthetic data mimicking the real structure
        cls.sample_data = {
            "published_book": {
                "content": [
                    {
                        "pages": [
                            [  # first page (list of sentence dicts)
                                {"text": "I like apples."},
                                {"text": "She reads books."}
                            ],
                            [  # second page
                                {"text": "Dogs bark."}
                            ]
                        ]
                    }
                ]
            }
        }

    def test_pos_labels_are_added(self):
        """
        After processing, each sentence dict should contain a new
        'POS' key holding a list of part‑of‑speech tags.
        """
        # Work on a deep copy so we don't mutate the class‑level fixture
        data_copy = copy.deepcopy(self.sample_data)

        processed = self.pos_tagger.pos_label_process(data_copy)

        # Navigate to first sentence of first page
        first_sentence = (
            processed["published_book"]["content"][0]["pages"][0][0]
        )

        # Check key existence
        self.assertIn("POS", first_sentence, msg="'POS' key missing")

        # Check type and length
        self.assertIsInstance(first_sentence["POS"], list)
        self.assertGreater(len(first_sentence["POS"]), 0)

        # Optional sanity: the number of tags equals the number of tokens
        self.assertEqual(
            len(first_sentence["POS"]),
            len(first_sentence["text"].split()),
            msg="POS tag count does not match token count",
        )

    def test_original_structure_preserved(self):
        """
        Ensure the method returns the same nested structure, only annotated.
        """
        data_copy = copy.deepcopy(self.sample_data)
        processed = self.pos_tagger.pos_label_process(data_copy)

        self.assertEqual(
            list(processed.keys()),
            ["published_book"],
            msg="Top‑level keys changed",
        )


if __name__ == "__main__":
    unittest.main()
