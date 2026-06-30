import os
import uuid
import shutil
from sqlalchemy.orm import Session
from fastapi import UploadFile
from app.repositories.journal import JournalRepository
from app.schemas.journal import JournalCreate
from app.models.journal import Journal
from app.services.sarvam_stt import SarvamSTTService

class JournalService:
    @staticmethod
    def process_journal_entry(
        db: Session, 
        user_id: str, 
        title: str, 
        transcript: str = None, 
        audio_file: UploadFile = None,
        audio_url: str = None,
        detected_language: str = None,
        confidence_score: float = None
    ) -> Journal:
        # If a file is uploaded, save it to disk and generate url
        if audio_file:
            os.makedirs("backend/uploads", exist_ok=True)
            file_extension = os.path.splitext(audio_file.filename)[1] if audio_file.filename else ".mp3"
            if not file_extension:
                file_extension = ".mp3"
            filename = f"{uuid.uuid4().hex}{file_extension}"
            file_path = os.path.join("backend/uploads", filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(audio_file.file, buffer)
            
            audio_url = f"http://localhost:8000/uploads/{filename}"

            # Transcribe the file automatically if not pre-provided
            if not transcript:
                stt_res = SarvamSTTService.transcribe(file_path)
                transcript = stt_res.get("transcript", "")
                detected_language = stt_res.get("detected_language", "en")
                confidence_score = stt_res.get("confidence_score", 1.0)

        # Default fallback transcript if none parsed
        if not transcript:
            transcript = "Empty journal entry."
        
        if not title:
            title = "Voice Reflection"

        if not detected_language:
            detected_language = "en"

        # Simple keyword-based mood detection for mock
        mood = "neutral"
        lower_text = transcript.lower()
        if any(w in lower_text for w in ["anxious", "anxiety", "stressed", "overwhelmed", "worry"]):
            mood = "anxious"
        elif any(w in lower_text for w in ["sad", "depressed", "down", "lonely", "cry"]):
            mood = "sad"
        elif any(w in lower_text for w in ["happy", "great", "joy", "excited", "good", "calm"]):
            mood = "calm"
        else:
            mood = "reflective"

        journal_in = JournalCreate(
            title=title,
            audio_url=audio_url,
            transcript=transcript,
            detected_language=detected_language,
            confidence_score=confidence_score,
            mood=mood
        )

        return JournalRepository.create(db, journal_in=journal_in, user_id=user_id)
