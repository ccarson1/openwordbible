from flask import Flask, request, jsonify
from flask_cors import CORS
from app.annotations import Annotation
from app.pos import POS
import json
import tensorflow as tf


app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 10000 * 10240 * 10240 
CORS(app) 

chunk_store = {}

@app.route('/process', methods=['POST'])
def process():
    # Handle text fields
    book_name = request.form.get("book_name")
    book_author = request.form.get("book_author")
    published_book = request.form.get("published_book")
    book_index = request.form.get("book_index")

    print(published_book)
    print(f"Max content length: {app.config.get('MAX_CONTENT_LENGTH')}")
    
    
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

# import os
# from flask import Flask, request, jsonify
# from flask_cors import CORS

# app = Flask(__name__)
# CORS(app)

# UPLOAD_DIR = "temp_chunks"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# @app.route('/process', methods=['POST'])
# def process():
#     book_name = request.form.get("book_name")
#     book_author = request.form.get("book_author")
#     book_index = request.form.get("book_index")

#     chunk_index = int(request.form.get("chunkIndex"))
#     total_chunks = int(request.form.get("totalChunks"))
#     chunk_data = request.form.get("chunkData")

#     session_id = request.form.get("sessionId")  # must be a unique ID per upload
#     session_folder = os.path.join(UPLOAD_DIR, session_id)
#     os.makedirs(session_folder, exist_ok=True)

#     # Save each chunk as a separate file
#     chunk_filename = os.path.join(session_folder, f"{chunk_index}.txt")
#     with open(chunk_filename, "w", encoding="utf-8") as f:
#         f.write(chunk_data)

#     # Once all chunks are uploaded, merge and process
#     if len(os.listdir(session_folder)) == total_chunks:
#         all_chunks = []
#         for i in range(total_chunks):
#             chunk_path = os.path.join(session_folder, f"{i}.txt")
#             with open(chunk_path, "r", encoding="utf-8") as f:
#                 all_chunks.append(f.read())
#         published_book = "".join(all_chunks)

#         # Clean up
#         for file in os.listdir(session_folder):
#             os.remove(os.path.join(session_folder, file))
#         os.rmdir(session_folder)

#         # === Process full text ===
#         annotation = Annotation()
#         ner_labeled = annotation.initiate_annotations(published_book)

#         pos = POS()
#         new_pos_labeled = pos.pos_label_process(ner_labeled)

#         return jsonify({
#             "message": "Processing complete",
#             "book_name": book_name,
#             "book_author": book_author,
#             "published_book": new_pos_labeled,
#             "book_index": book_index
#         })

#     return jsonify({"message": f"Chunk {chunk_index + 1}/{total_chunks} received."})

    
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