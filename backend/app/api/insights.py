from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db, get_current_user
from app.services.insight_service import InsightService
from app.repositories.insight import InsightRepository
from app.schemas.insight import InsightResponse, DashboardStats
from app.models.user import User

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return InsightService.get_dashboard_stats(db, user_id=current_user.id)

@router.get("/journal/{journal_id}", response_model=InsightResponse)
def get_insight_by_journal(
    journal_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    insight = InsightRepository.get_by_journal_id(db, journal_id=journal_id)
    if not insight:
        raise HTTPException(status_code=404, detail="Cognitive insight for this journal does not exist yet")
    if insight.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this insight")
    return insight

@router.get("/", response_model=List[InsightResponse])
def get_user_insights(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return InsightRepository.get_multi_by_user(db, user_id=current_user.id, limit=limit)
