from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.models.journal import Journal
from backend.app.schemas.journal import JournalCreate, JournalUpdate

class JournalRepository:
    @staticmethod
    def get_by_id(db: Session, journal_id: str) -> Optional[Journal]:
        return db.query(Journal).filter(Journal.id == journal_id).first()

    @staticmethod
    def get_multi_by_user(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[Journal]:
        return (
            db.query(Journal)
            .filter(Journal.user_id == user_id)
            .order_by(Journal.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def create(db: Session, journal_in: JournalCreate, user_id: str) -> Journal:
        db_journal = Journal(
            user_id=user_id,
            title=journal_in.title,
            audio_url=journal_in.audio_url,
            transcript=journal_in.transcript,
            detected_language=journal_in.detected_language,
            mood=journal_in.mood,
        )
        db.add(db_journal)
        db.commit()
        db.refresh(db_journal)
        return db_journal

    @staticmethod
    def update(db: Session, db_journal: Journal, journal_in: JournalUpdate) -> Journal:
        update_data = journal_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_journal, key, value)
        db.add(db_journal)
        db.commit()
        db.refresh(db_journal)
        return db_journal

    @staticmethod
    def delete(db: Session, journal_id: str) -> bool:
        db_journal = db.query(Journal).filter(Journal.id == journal_id).first()
        if db_journal:
            db.delete(db_journal)
            db.commit()
            return True
        return False
