from flask import Flask, request, jsonify
from flask_cors import CORS
from app.annotations import Annotation
from app.pos import POS
import json
import tensorflow as tf
from app.progress import progress_state

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 10000 * 10240 * 10240 
CORS(app) 

chunk_store = {}

@app.route('/process', methods=['POST'])
def process():
    book_name = request.form.get("book_name")
    book_author = request.form.get("book_author")
    book_index = request.form.get("book_index")

    chunk = request.form.get("published_book_chunk")
    chunk_index = int(request.form.get("chunk_index"))
    total_chunks = int(request.form.get("total_chunks"))

    # RESET STATE ONLY ON FIRST CHUNK
    if chunk_index == 0:
        progress_state.clear()
        progress_state.update({
            "status": "uploading",
            "phase": "receiving",
            "total": 0,
            "current": 0,
            "percent": 0,
            "message": "Receiving book data",
            "done": False
        })

    # Use book_name as session key (OK for now)
    if book_name not in chunk_store:
        chunk_store[book_name] = [None] * total_chunks

    chunk_store[book_name][chunk_index] = chunk

    # Not done yet
    if None in chunk_store[book_name]:
        return jsonify({
            "message": f"Chunk {chunk_index + 1}/{total_chunks} received"
        })

    # All chunks received → rebuild book
    full_book_json = "".join(chunk_store[book_name])
    del chunk_store[book_name]

    published_book = json.loads(full_book_json)

    # === Your NLP pipeline ===
    annotation = Annotation()
    ner_labeled = annotation.initiate_annotations(published_book)

    pos = POS()
    new_pos_labeled = pos.pos_label_process(ner_labeled)

    return jsonify({
        "message": "Book fully processed",
        "book_name": book_name,
        "book_author": book_author,
        "published_book": new_pos_labeled,
        "book_index": book_index
    })

@app.route("/progress", methods=["GET"])
def get_progress():
    return jsonify(progress_state)

    
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