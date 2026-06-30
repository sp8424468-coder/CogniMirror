import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Journal(Base):
    __tablename__ = "journals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), default="Untitled Journal")
    audio_url = Column(Text, nullable=True)
    transcript = Column(Text, nullable=True)
    detected_language = Column(String(50), default="en")
    confidence_score = Column(Float, nullable=True)
    mood = Column(String(50), default="neutral")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="journals")
    insight = relationship("Insight", uselist=False, foreign_keys="[Insight.journal_id]", back_populates="journal", cascade="all, delete-orphan")
