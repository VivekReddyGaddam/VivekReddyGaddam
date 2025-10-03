import os
from dataclasses import dataclass
from typing import List


@dataclass
class Settings:
    app_name: str = "StoryForge AI Backend"
    cors_origins: List[str] = None
    rate_limit_per_minute: int = 10
    max_session_words: int = 1000

    def __post_init__(self) -> None:
        cors_env = os.environ.get("CORS_ORIGINS", "http://localhost:5173, http://127.0.0.1:5173")
        self.cors_origins = [o.strip() for o in cors_env.split(",") if o.strip()]
        self.rate_limit_per_minute = int(os.environ.get("RATE_LIMIT_PER_MIN", str(self.rate_limit_per_minute)))
        self.max_session_words = int(os.environ.get("MAX_SESSION_WORDS", str(self.max_session_words)))


settings = Settings()
