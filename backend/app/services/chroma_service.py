import os
import chromadb
from backend.app.core.config import settings

# Setup persistent directory
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "chroma_db"))

class ChromaService:
    _client = None
    
    @classmethod
    def get_client(cls):
        if cls._client is None:
            os.makedirs(DB_PATH, exist_ok=True)
            cls._client = chromadb.PersistentClient(path=DB_PATH)
        return cls._client

    @classmethod
    def add_journal(cls, journal_id: str, title: str, transcript: str, user_id: str):
        """
        Add or update a journal entry's transcript in ChromaDB
        """
        try:
            client = cls.get_client()
            collection = client.get_or_create_collection(
                name="journals",
                metadata={"hnsw:space": settings.CHROMA_DISTANCE_METRIC}
            )
            collection.add(
                documents=[f"Title: {title}\nTranscript: {transcript}"],
                metadatas=[{"user_id": user_id, "journal_id": journal_id}],
                ids=[journal_id]
            )
        except Exception as e:
            print(f"Error adding journal to ChromaDB: {e}")

    @classmethod
    def find_most_similar_journal(cls, transcript: str, user_id: str, current_journal_id: str) -> tuple[str | None, float]:
        """
        Query ChromaDB for the most similar journal using semantic embeddings.
        Returns tuple of (journal_id, distance_score) or (None, 0.0) if no similar journal is found/matches threshold.
        """
        try:
            client = cls.get_client()
            collection = client.get_or_create_collection(
                name="journals",
                metadata={"hnsw:space": settings.CHROMA_DISTANCE_METRIC}
            )
            
            # Query the user's journals in vector store
            results = collection.query(
                query_texts=[transcript],
                n_results=10,
                where={"user_id": user_id}
            )
            
            if not results or not results.get("ids") or len(results["ids"][0]) == 0:
                return None, 0.0
                
            ids = results["ids"][0]
            distances = results["distances"][0] if "distances" in results else [1.0] * len(ids)
            
            # Find the top match that is not the current journal and respects the similarity threshold
            for idx, j_id in enumerate(ids):
                if j_id != current_journal_id:
                    distance = distances[idx]
                    threshold = settings.CHROMA_SIM_THRESHOLD
                    metric = settings.CHROMA_DISTANCE_METRIC
                    
                    # Log comparison metric
                    print(f"[RAG SEARCH] Checking match {j_id} - Metric: {metric}, Distance: {distance:.4f}, Threshold: {threshold:.4f}")
                    
                    # For Cosine and L2, smaller distance means higher similarity.
                    # Inner Product (ip) in Chroma: distance = -ip, where smaller (more negative) means more similar.
                    # So we generally check distance < threshold.
                    if distance < threshold:
                        return j_id, distance
                    else:
                        print(f"[RAG SEARCH] Ignored match {j_id} - Distance exceeds threshold")
                    
            return None, 0.0
        except Exception as e:
            print(f"Error querying ChromaDB semantic search: {e}")
            return None, 0.0
