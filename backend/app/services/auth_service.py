from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate, LoginRequest, Token
from app.core.security import verify_password, create_access_token
from app.models.user import User

class AuthService:
    @staticmethod
    def register_user(db: Session, user_in: UserCreate) -> User:
        db_user = UserRepository.get_by_email(db, email=user_in.email)
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists."
            )
        return UserRepository.create(db, user_in=user_in)

    @staticmethod
    def authenticate_user(db: Session, login_in: LoginRequest) -> Token:
        db_user = UserRepository.get_by_email(db, email=login_in.email)
        if not db_user or not verify_password(login_in.password, db_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(subject=db_user.id)
        return Token(access_token=access_token, token_type="bearer")
