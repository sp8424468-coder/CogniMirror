from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class JournalBase(BaseModel):
    title: Optional[str] = "Untitled Journal"
    audio_url: Optional[str] = None
    transcript: Optional[str] = None
    detected_language: Optional[str] = "en"
    confidence_score: Optional[float] = None
    mood: Optional[str] = "neutral"

class JournalCreate(JournalBase):
    pass

class JournalUpdate(BaseModel):
    title: Optional[str] = None
    audio_url: Optional[str] = None
    transcript: Optional[str] = None
    detected_language: Optional[str] = None
    confidence_score: Optional[float] = None
    mood: Optional[str] = None

class JournalResponse(JournalBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
