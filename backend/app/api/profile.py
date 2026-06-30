from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.api.deps import get_db, get_current_user
from backend.app.repositories.user import UserRepository
from backend.app.schemas.user import UserResponse, UserUpdate
from backend.app.models.user import User

router = APIRouter()

@router.get("/", response_model=UserResponse)
def read_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/", response_model=UserResponse)
def update_profile(
    profile_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check if updating email to one that already exists
    if profile_in.email and profile_in.email != current_user.email:
        existing_user = UserRepository.get_by_email(db, email=profile_in.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email is already in use by another user.")
            
    updated_user = UserRepository.update(db, db_user=current_user, user_in=profile_in)
    return updated_user
