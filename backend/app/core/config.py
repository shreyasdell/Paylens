from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "PayLens API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str = "postgresql://paylens:paylens@localhost:5432/paylens"
    
    # ChromaDB
    CHROMADB_HOST: str = "localhost"
    CHROMADB_PORT: int = 8001
    CHROMADB_PERSIST_DIRECTORY: str = "./data/chromadb"
    
    # Ollama
    OLLAMA_BASE_URL: str = "http://10.88.0.7:11434"
    OLLAMA_MODEL: str = "phi3:latest"
    
    # LangChain
    LANGCHAIN_TRACING_V2: bool = False
    LANGCHAIN_API_KEY: Optional[str] = None
    LANGCHAIN_PROJECT: str = "paylens"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Confidence Thresholds
    HIGH_CONFIDENCE_THRESHOLD: float = 90.0
    MEDIUM_CONFIDENCE_THRESHOLD: float = 70.0
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 50
    MAX_PAGE_SIZE: int = 200
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
