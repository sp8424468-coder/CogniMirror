import os
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

# Setup env file search path to resolve backend/.env from both root and subfolder CWDs
env_file_path = ".env"
if not os.path.exists(env_file_path) and os.path.exists("backend/.env"):
    env_file_path = "backend/.env"

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "CogniMirror"
    
    # JWT & Auth
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    JWT_SECRET: str = ""
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    
    # Sarvam AI STT
    SARVAM_API_KEY: str = ""
    
    # Gemini AI
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # Chroma RAG
    CHROMA_SIM_THRESHOLD: float = 1.0  # Cosine: ~0.4, L2: ~1.0
    CHROMA_DISTANCE_METRIC: str = "l2"  # "l2", "cosine", "ip"
    
    # Database
    # Default to sqlite locally for ease of compilation and verification
    DATABASE_URL: str = "sqlite:///./cognimirror.db"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.31.145:3000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str | List[str]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    import json
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        return [str(origin).strip() for origin in parsed if origin]
                except Exception:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        elif isinstance(v, list):
            return [str(origin).strip() for origin in v if origin]
        raise ValueError(f"Invalid CORS origins value: {v}")

    @model_validator(mode="after")
    def validate_and_resolve_secrets(self) -> "Settings":
        # Resolve SECRET_KEY using JWT_SECRET if SECRET_KEY is not defined
        if not self.SECRET_KEY and self.JWT_SECRET:
            self.SECRET_KEY = self.JWT_SECRET
        
        # If still empty, raise error to fail fast on startup
        if not self.SECRET_KEY:
            raise ValueError(
                "CRITICAL STARTUP ERROR: The SECRET_KEY environment variable is not configured. "
                "For security, the application cannot start. Please set SECRET_KEY or JWT_SECRET "
                "in your environment variables or .env file."
            )
        return self

    model_config = SettingsConfigDict(
        env_file=env_file_path,
        env_file_encoding="utf-8",
        case_sensitive=True
    )

settings = Settings()

