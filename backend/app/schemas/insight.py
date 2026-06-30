from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime

class InsightBase(BaseModel):
    summary: Optional[str] = None
    primary_emotion: Optional[str] = None
    emotion_score: Optional[float] = None
    stress_level: Optional[int] = None
    confidence_level: Optional[int] = None
    energy_level: Optional[int] = None
    topics: Optional[List[str]] = None
    cognitive_distortions: Optional[List[str]] = None
    action_items: Optional[List[str]] = None
    
    # Similarity Analysis
    similar_journal_id: Optional[str] = None
    similarity_explanation: Optional[str] = None
    behavioral_insight: Optional[str] = None
    previously_helpful_actions: Optional[List[str]] = None
    
    # compatibility fields
    emotion_details: Optional[Dict[str, float]] = None
    cognitive_patterns: Optional[List[str]] = None
    actionable_reflections: Optional[List[str]] = None

class InsightCreate(InsightBase):
    journal_id: str

class InsightResponse(InsightBase):
    id: str
    user_id: str
    journal_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_entries: int
    weekly_reflection: str
    mood_distribution: Dict[str, int]
    common_distortions: List[str]
