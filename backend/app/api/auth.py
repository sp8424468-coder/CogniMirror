from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.api.deps import get_db, get_current_user
from backend.app.services.auth_service import AuthService
from backend.app.schemas.user import UserCreate, UserResponse, Token, LoginRequest
from backend.app.models.user import User
from pydantic import BaseModel

router = APIRouter()

class GoogleAuthRequest(BaseModel):
    credential: str  # Google token or credential
    email: str
    full_name: str

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    return AuthService.register_user(db, user_in=user_in)

@router.post("/login", response_model=Token)
def login(login_in: LoginRequest, db: Session = Depends(get_db)):
    return AuthService.authenticate_user(db, login_in=login_in)

@router.post("/google", response_model=Token)
def google_login(auth_in: GoogleAuthRequest, db: Session = Depends(get_db)):
    # Mocking Google login: We look up or create the user based on the email provided
    # in the google credential wrapper.
    from backend.app.repositories.user import UserRepository
    from backend.app.schemas.user import UserUpdate
    import uuid

    user = UserRepository.get_by_email(db, email=auth_in.email)
    if not user:
        # Create new Google Auth user with a random secure password
        user_in = UserCreate(
            email=auth_in.email,
            password=str(uuid.uuid4()), # random password
            full_name=auth_in.full_name
        )
        user = UserRepository.create(db, user_in=user_in, provider="google")
    
    from backend.app.core.security import create_access_token
    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token, token_type="bearer")

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
