"""
K-Camp Python

This is a Python application that provides a REST API for a semantic search system.
"""
import os
from typing import Union
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pocketbase import PocketBase
from pocketbase.client import ClientResponseError
from dotenv import load_dotenv
import openai
import pinecone

load_dotenv()

app = FastAPI(title="K-Camp Python", description="A semantic search system for K-Camp")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize APIs
pc = pinecone.Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("k-camp-index")

# PocketBase client
pb = PocketBase(os.getenv("POCKETBASE_URL"))

class SearchQuery(BaseModel):
    """Search Query"""
    query: str
    top_k: int = 5
    collection: str = "camps"

def create_embedding(text: str):
    """Helper to create embeddings"""
    response = openai_client.embeddings.create(
        input=text,
        model="text-embedding-3-small",
        dimensions=512
    )
    return response.data[0].embedding

@app.post("/index-pocketbase/{collection}")
async def index_pocketbase_collection(collection: str):
    """
    Fetch all records from PocketBase collection and index them
    This should be run periodically or triggered on data changes
    """
    try:
        # Fetch all records from PocketBase
        records = pb.collection(collection).get_full_list()
        vectors_to_upsert = []

        for record in records:
            record = pb.collection(collection).get_one(record.id)
            # Combine relevant fields for embedding
            # Adjust these fields based on your collection schema
            searchable_text = f"{record.title} {record.description}"
            
            # Create embedding
            embedding = create_embedding(searchable_text)
            
            # Prepare for Pinecone (id, embedding, metadata)
            vectors_to_upsert.append((
                record.id,  # PocketBase record ID
                embedding,
                {
                    "collection": collection,
                    "title": record.title,
                    "text": searchable_text[:500]  # Store snippet
                }
            ))
        
        # Batch upsert to Pinecone
        index.upsert(vectors_to_upsert)
        
        return {
            "status": "success",
            "indexed_count": len(records),
            "collection": collection
        }
    
    except ClientResponseError as e:
        raise HTTPException(status_code=400, detail=f"PocketBase error: {e}")

@app.post("/search")
async def semantic_search(query: SearchQuery):
    """
    AI-powered semantic search across PocketBase data
    """
    try:
        # 1. Create embedding for user's search query
        query_embedding = create_embedding(query.query)
        
        # 2. Search in Pinecone vector database
        vector_results = index.query(
            vector=query_embedding,
            top_k=query.top_k,
            include_metadata=True,
            filter={"collection": query.collection}  # Filter by collection
        )
        
        # 3. Get full records from PocketBase using the IDs
        full_results = []
        for match in vector_results['matches']:
            record_id = match['id']
            try:
                # Fetch full record from PocketBase
                record = pb.collection(query.collection).get_one(record_id)
                full_results.append({
                    "score": match['score'],  # Similarity score
                    "record": record.__dict__,
                    "matched_text": match['metadata'].get('text', '')
                })
            except ClientResponseError:
                # Record might have been deleted
                continue
        
        return {
            "query": query.query,
            "results": full_results,
            "count": len(full_results)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sync-single-record/{collection}/{record_id}")
async def sync_single_record(collection: str, record_id: str):
    """
    Update embedding for a single record (useful for webhooks)
    """
    try:
        # Fetch record from PocketBase
        record = pb.collection(collection).get_one(record_id)
        
        # Create searchable text
        searchable_text = f"{record.name} {record.description}"
        
        # Create and store embedding
        embedding = create_embedding(searchable_text)
        
        index.upsert([(
            record.id,
            embedding,
            {
                "collection": collection,
                "name": record.name,
                "text": searchable_text[:500]
            }
        )])
        
        return {"status": "synced", "record_id": record_id}
    
    except ClientResponseError as e:
        raise HTTPException(status_code=400, detail=f"PocketBase error: {e}")

@app.delete("/remove-record/{record_id}")
async def remove_from_index(record_id: str):
    """
    Remove record from vector index when deleted from PocketBase
    """
    index.delete(ids=[record_id])
    return {"status": "deleted", "record_id": record_id}

# Your existing endpoints
@app.get("/")
def read_root():
    """
    Root endpoint
    """
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    """
    Read item endpoint
    """
    return {"item_id": item_id, "q": q}