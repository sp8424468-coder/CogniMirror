from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.models.insight import Insight
from backend.app.schemas.insight import InsightCreate

class InsightRepository:
    @staticmethod
    def get_by_id(db: Session, insight_id: str) -> Optional[Insight]:
        return db.query(Insight).filter(Insight.id == insight_id).first()

    @staticmethod
    def get_by_journal_id(db: Session, journal_id: str) -> Optional[Insight]:
        return db.query(Insight).filter(Insight.journal_id == journal_id).first()

    @staticmethod
    def get_multi_by_user(db: Session, user_id: str, limit: int = 50) -> List[Insight]:
        return (
            db.query(Insight)
            .filter(Insight.user_id == user_id)
            .order_by(Insight.created_at.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def create(db: Session, insight_in: InsightCreate, user_id: str) -> Insight:
        db_insight = Insight(
            user_id=user_id,
            journal_id=insight_in.journal_id,
            summary=insight_in.summary,
            primary_emotion=insight_in.primary_emotion,
            emotion_score=insight_in.emotion_score,
            stress_level=insight_in.stress_level,
            confidence_level=insight_in.confidence_level,
            energy_level=insight_in.energy_level,
            topics=insight_in.topics,
            cognitive_distortions=insight_in.cognitive_distortions,
            action_items=insight_in.action_items,
            similar_journal_id=insight_in.similar_journal_id,
            similarity_explanation=insight_in.similarity_explanation,
            behavioral_insight=insight_in.behavioral_insight,
            previously_helpful_actions=insight_in.previously_helpful_actions,
            emotion_details=insight_in.emotion_details,
            cognitive_patterns=insight_in.cognitive_patterns,
            actionable_reflections=insight_in.actionable_reflections,
        )
        db.add(db_insight)
        db.commit()
        db.refresh(db_insight)
        return db_insight
