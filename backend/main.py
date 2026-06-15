import math
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI()

rag_store = []

SIMILARITY_THRESHOLD = 0.5

class Message(BaseModel):
    text: str


def split_text(text: str, chunk_size: int = 500, overlap: int = 100):
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - overlap

    return chunks


def get_embedding(text: str):
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )

    return response.data[0].embedding

def cosine_similarity(vec1, vec2):
    dot = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = math.sqrt(sum(a * a for a in vec1))
    norm2 = math.sqrt(sum(b * b for b in vec2))

    if norm1 == 0 or norm2 == 0:
        return 0

    return dot / (norm1 * norm2)


def search_similar_chunks(question: str, top_k: int = 3):
    question_embedding = get_embedding(question)

    results = []

    for item in rag_store:
        score = cosine_similarity(question_embedding, item["embedding"])

        results.append({
            "filename": item["filename"],
            "file_type": item["file_type"],
            "page": item["page"],
            "chunk_index": item["chunk_index"],
            "chunk": item["chunk"],
            "score": score
        })

    results.sort(key=lambda x: x["score"], reverse=True)

    return results[:top_k]


def build_context(references):
    context_parts = []

    for index, ref in enumerate(references, start=1):
        context_parts.append(
            f"""
【参考資料{index}】
ファイル名: {ref["filename"]}
チャンク番号: {ref["chunk_index"]}
本文:
{ref["chunk"]}
"""
        )

    return "\n".join(context_parts)


@app.post("/chat")
def chat(message: Message):
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": message.text}
            ]
        )

        return {"response": response.choices[0].message.content}

    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500,
            detail="AIの応答取得中にエラーが発生しました"
        )


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith(".txt"):
        raise HTTPException(
            status_code=400,
            detail=".txtファイルのみ対応しています"
        )

    try:
        content = await file.read()
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="UTF-8で読み込めないファイルです"
        )

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="空のファイルはアップロードできません"
        )

    try:
        chunks = split_text(text)

        for index, chunk in enumerate(chunks):
            embedding = get_embedding(chunk)

            rag_store.append({
                "filename": file.filename,
                "file_type": "txt",
                "page": None,
                "chunk_index": index,
                "chunk": chunk,
                "embedding": embedding
            })

        return {
            "message": "アップロード完了",
            "filename": file.filename,
            "file_type": "txt",
            "chunk_count": len(chunks),
            "stored_count": len(rag_store)
        }

    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500,
            detail="ファイル処理中にエラーが発生しました"
        )

@app.post("/rag-chat")
def rag_chat(message: Message):
    if not message.text.strip():
        raise HTTPException(
            status_code=400,
            detail="質問を入力してください"
        )

    if not rag_store:
        raise HTTPException(
            status_code=400,
            detail="RAG用の資料がアップロードされていません"
        )

    try:
        references = search_similar_chunks(message.text)
        
        if not references or references[0]["score"] < SIMILARITY_THRESHOLD:
            return {
                "response": "アップロード済み資料内に、質問に関連する情報が見つかりませんでした。",
                "references": []
            }
        
        context = build_context(references)

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """
あなたはアップロードされた資料をもとに回答するAIです。
必ず参考資料の内容に基づいて回答してください。
参考資料に書かれていない内容は推測しないでください。
参考資料内に答えが見つからない場合は、「資料内には確認できません」と答えてください。
"""
                },
                {
                    "role": "user",
                    "content": f"""
参考資料:
{context}

質問:
{message.text}
"""
                }
            ]
        )

        return {
            "response": response.choices[0].message.content,
            "references": references
        }

    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500,
            detail="RAG回答生成中にエラーが発生しました"
        )