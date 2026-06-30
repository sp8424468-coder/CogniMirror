import os
import uuid
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.deps import get_db, get_current_user
from app.services.journal_service import JournalService
from app.services.insight_service import InsightService
from app.repositories.journal import JournalRepository
from app.schemas.journal import JournalResponse, JournalUpdate
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=JournalResponse, status_code=status.HTTP_201_CREATED)
def create_journal(
    title: Optional[str] = Form(None),
    transcript: Optional[str] = Form(None),
    audio_url: Optional[str] = Form(None),
    detected_language: Optional[str] = Form(None),
    confidence_score: Optional[float] = Form(None),
    conversation_context: Optional[str] = Form(None),
    audio_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Process transcript/audio using our JournalService
    journal = JournalService.process_journal_entry(
        db, 
        user_id=current_user.id, 
        title=title, 
        transcript=transcript, 
        audio_file=audio_file,
        audio_url=audio_url,
        detected_language=detected_language,
        confidence_score=confidence_score
    )
    
    # Automatically generate cognitive insights for this entry on creation (synchronously for the skeleton)
    InsightService.generate_insight_for_journal(db, user_id=current_user.id, journal=journal, conversation_context=conversation_context)
    
    return journal

from app.services.sarvam_stt import SarvamSTTService

@router.post("/upload")
async def upload_audio(
    request: Request,
    audio_file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    # Ensure uploads directory exists
    os.makedirs("backend/uploads", exist_ok=True)

    # Generate unique filename
    file_extension = os.path.splitext(audio_file.filename)[1] if audio_file.filename else ".mp3"
    if not file_extension:
        file_extension = ".mp3"
    filename = f"{uuid.uuid4().hex}{file_extension}"
    file_path = os.path.join("backend/uploads", filename)

    # Save to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(audio_file.file, buffer)

    # Transcribe audio using Sarvam STT
    stt_res = SarvamSTTService.transcribe(file_path)

    # Return dynamic URL along with STT details
    base_url = str(request.base_url)
    audio_url = f"{base_url}uploads/{filename}"
    
    return {
        "audio_url": audio_url,
        "transcript": stt_res.get("transcript", ""),
        "detected_language": stt_res.get("detected_language", "en"),
        "confidence_score": stt_res.get("confidence_score", 1.0),
    }

@router.get("/", response_model=List[JournalResponse])
def read_journals(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return JournalRepository.get_multi_by_user(db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/{journal_id}", response_model=JournalResponse)
def read_journal_by_id(
    journal_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    journal = JournalRepository.get_by_id(db, journal_id=journal_id)
    if not journal:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    if journal.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this journal")
    return journal

@router.put("/{journal_id}", response_model=JournalResponse)
def update_journal(
    journal_id: str,
    journal_in: JournalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    journal = JournalRepository.get_by_id(db, journal_id=journal_id)
    if not journal:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    if journal.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this journal")
    return JournalRepository.update(db, db_journal=journal, journal_in=journal_in)

@router.delete("/{journal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_journal(
    journal_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    journal = JournalRepository.get_by_id(db, journal_id=journal_id)
    if not journal:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    if journal.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this journal")
    JournalRepository.delete(db, journal_id=journal_id)
    return None
