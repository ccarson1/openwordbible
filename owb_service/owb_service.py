from flask import Flask, request, jsonify
from flask_cors import CORS
from annotations import Annotation
import json

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
    test = annotation.initiate_annotations(published_book)

    return jsonify({
        "message": "Processed multipart form data",
        "book_name": book_name,
        "book_author": book_author,
        "published_book": test,
        "book_index": book_index
    })

@app.route('/')
def index():
    return "Local Flask service is running"

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001)