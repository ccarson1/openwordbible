import sqlite3
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import Chroma

DB_PATH = "/home/carson/openwordbible/db.sqlite3"
VECTOR_DIR = "/home/carson/rag/vectordb"

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

    db.add_texts(
        texts=texts,
        metadatas=metadatas,
        ids=ids
    )

    db.persist()
    print(f"Ingested {len(texts)} sentences for book {book_id}")

if __name__ == "__main__":
    # Replace 1 with the actual book_id you want to ingest
    ingest_book(6)
