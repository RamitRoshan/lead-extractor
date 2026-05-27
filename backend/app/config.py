import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    PORT: int = Field(default=8000)
    HOST: str = Field(default="127.0.0.1")
    PLAYWRIGHT_HEADLESS: bool = Field(default=True)
    
    SUPABASE_URL: str = Field(default="https://your-supabase-project.supabase.co")
    SUPABASE_KEY: str = Field(default="your-supabase-anon-key")
    
    # Database URL configuration
    DATABASE_URL: str = Field(default="")

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parents[1] / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def get_db_url(self) -> str:
        # If no database URL is provided, fallback to SQLite
        if not self.DATABASE_URL or self.DATABASE_URL == "postgresql://postgres:postgres@localhost:5432/postgres":
            # Let's create a local SQLite database in the workspace directory
            db_path = Path(__file__).resolve().parents[2] / "lead_extractor.db"
            return f"sqlite:///{db_path}"
        
        # Replace postgres:// with postgresql:// for SQLAlchemy compatibility if needed
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url

settings = Settings()
