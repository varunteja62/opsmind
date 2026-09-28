import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "OpsMind"
    APP_ENV: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    
    # Database
    DATABASE_URL: str = "sqlite:///./opsmind.db"
    
    # Hindsight Memory
    HINDSIGHT_BASE_URL: str = "http://localhost:8888"
    HINDSIGHT_API_KEY: str = ""
    HINDSIGHT_BANK_ID: str = "opsmind-incidents"
    
    # LLM
    LLM_PROVIDER: str = "gemini" # gemini, openai, heuristic
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gemini-1.5-flash"
    
    # Simulation
    SIMULATION_MODE: bool = True

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
