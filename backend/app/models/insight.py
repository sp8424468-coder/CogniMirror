import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON, Integer, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.app.core.database import Base

class Insight(Base):
    __tablename__ = "insights"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    journal_id = Column(String(36), ForeignKey("journals.id", ondelete="CASCADE"), unique=True, nullable=False)
    summary = Column(Text, nullable=True)
    
    # Cognitive Metrics
    primary_emotion = Column(String(100), nullable=True)
    emotion_score = Column(Float, nullable=True)
    stress_level = Column(Integer, nullable=True)
    confidence_level = Column(Integer, nullable=True)
    energy_level = Column(Integer, nullable=True)
    topics = Column(JSON, nullable=True)
    cognitive_distortions = Column(JSON, nullable=True)
    action_items = Column(JSON, nullable=True)
    
    # Mood Similarity Analysis
    similar_journal_id = Column(String(36), ForeignKey("journals.id", ondelete="SET NULL"), nullable=True)
    similarity_explanation = Column(Text, nullable=True)
    behavioral_insight = Column(Text, nullable=True)
    previously_helpful_actions = Column(JSON, nullable=True)
    
    # Store dynamic dict/list data (retained for backward compatibility)
    emotion_details = Column(JSON, nullable=True)          # e.g., {"joy": 0.5, "anxiety": 0.2}
    cognitive_patterns = Column(JSON, nullable=True)       # e.g., ["catastrophizing", "all-or-nothing"]
    actionable_reflections = Column(JSON, nullable=True)   # e.g., ["Try mapping the worst outcome..."]
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="insights")
    journal = relationship("Journal", foreign_keys=[journal_id], back_populates="insight")
    similar_journal = relationship("Journal", foreign_keys=[similar_journal_id])
