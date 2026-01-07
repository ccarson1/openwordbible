from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_community.llms import Ollama
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

app = FastAPI(title="Book RAG API")

origins = [
   "http://localhost:8000",
   "http://127.0.0.1:8000",
   "http://192.168.56.101:8000",
]

app.add_middleware(
   CORSMiddleware,
   allow_origins=origins,
   allow_methods=["POST", "GET", "OPTIONS"],
   allow_headers=["*"]
)


# -------------------------
# Load models ONCE
# -------------------------
embeddings = OllamaEmbeddings(model="mxbai-embed-large:latest")

db = Chroma(
    persist_directory="vectordb",
    embedding_function=embeddings
)

llm = Ollama(
    model="phi3:mini",
    temperature=0.2
)

prompt = PromptTemplate(
    template="""
You are a book analysis assistant.

Use ONLY the context below.
If the answer is not present, say so.

Context:
{context}

Question:
{question}

Answer:
""",
    input_variables=["context", "question"]
)

# -------------------------
# Request schema
# -------------------------
class QueryRequest(BaseModel):
    question: str
    book_id: int


@app.post("/query")
def query_book(req: QueryRequest):
    retriever = db.as_retriever(
        search_kwargs={
            "k": 5,
            "filter": {"book_id": req.book_id}
        }
    )

    qa = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        chain_type_kwargs={"prompt": prompt},
        return_source_documents=True
    )

    result = qa(req.question)

    sources = [
        {
            "chapter": doc.metadata["chapter_id"],
            "page": doc.metadata["page"],
            "sentence_index": doc.metadata["sentence_index"]
        }
        for doc in result["source_documents"]
    ]

    return {
        "book_id": req.book_id,
        "question": req.question,
        "answer": result["result"],
        "sources": sources
    }
