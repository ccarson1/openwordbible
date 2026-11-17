import os
import sqlite3
import sys
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import Chroma

RAG_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get("OWB_DB_PATH", os.path.join(RAG_DIR, "..", "db.sqlite3"))
VECTOR_DIR = os.environ.get("RAG_VECTOR_DIR", os.path.join(RAG_DIR, "vectordb"))

embeddings = OllamaEmbeddings(model="mxbai-embed-large:latest")

def ingest_book(book_id: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, text, page, sentence_index, chapter_id
        FROM api_sentence
        WHERE book_id = ?
        ORDER BY chapter_id, sentence_index
    """, (book_id,))

    rows = cursor.fetchall()
    conn.close()

    if not rows:
        print(f"No sentences found for book_id={book_id}")
        return

    texts = []
    metadatas = []
    ids = []

    for row in rows:
        sentence_id, text, page, sentence_index, chapter_id = row

        texts.append(text)
        ids.append(f"sentence_{sentence_id}")
        metadatas.append({
            "book_id": book_id,
            "chapter_id": chapter_id,
            "page": page,
            "sentence_index": sentence_index
        })

    db = Chroma(
        persist_directory=VECTOR_DIR,
        embedding_function=embeddings
    )

    # Sentences get new ids when a book is re-annotated, so drop the old ones first
    existing = db.get(where={"book_id": book_id})
    if existing["ids"]:
        db.delete(ids=existing["ids"])

    db.add_texts(
        texts=texts,
        metadatas=metadatas,
        ids=ids
    )

    db.persist()
    print(f"Ingested {len(texts)} sentences for book {book_id}")

if __name__ == "__main__":
    # python ingest_sentences.py <book_id> [<book_id> ...]
    if len(sys.argv) < 2:
        print("Usage: python ingest_sentences.py <book_id> [<book_id> ...]")
        sys.exit(1)
    for book_id in sys.argv[1:]:
        ingest_book(int(book_id))
