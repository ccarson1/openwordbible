from flask import Flask, request, jsonify
from flask_cors import CORS
from app.annotations import Annotation
from app.pos import POS
import json
import tensorflow as tf


app = Flask(__name__)
CORS(app) 

@app.route('/process', methods=['POST'])
def process():
    # Handle text fields
    book_name = request.form.get("book_name")
    book_author = request.form.get("book_author")
    published_book = request.form.get("published_book")
    book_index = request.form.get("book_index")

    print(published_book)

    
    
    annotation = Annotation()
    ner_labeled = annotation.initiate_annotations(published_book)

    pos = POS()
    new_pos_labeled = pos.pos_label_process(ner_labeled)

    return jsonify({
        "message": "Processed multipart form data",
        "book_name": book_name,
        "book_author": book_author,
        "published_book": new_pos_labeled,
        "book_index": book_index
    })
    
@app.route("/gpu-connection")
def gpu_connection():
    
    physical_devices = tf.config.list_physical_devices('GPU')
    gpu_available = tf.test.is_gpu_available()
    device_name = tf.test.gpu_device_name()
    tensorflow_version = tf.__version__
    
    return jsonify({"physical_devices": physical_devices,
                    "gpu_available": gpu_available,
                    "device_name": device_name,
                    "tensorflow_version": tensorflow_version
                    })

@app.route('/')
def index():
    return "Local Flask service is running"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)