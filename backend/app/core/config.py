from __future__ import annotations

from functools import lru_cache
from typing import List, Optional

from pydantic import AnyHttpUrl, EmailStr, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "IdeaConnect API"
    environment: str = Field(default="development", validation_alias="ENVIRONMENT")
    api_prefix: str = "/api/v1"
    secret_key: str = Field(default="change-me", validation_alias="SECRET_KEY")
    access_token_expire_minutes: int = 30
    refresh_token_expire_minutes: int = 60 * 24 * 30  # 30 days
    algorithm: str = "HS256"

    backend_cors_origins: List[AnyHttpUrl] | str = Field(default="*")

    # Database
    database_url: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/ideaconnect",
        validation_alias="DATABASE_URL",
    )
    sqlalchemy_echo: bool = False

    # Redis
    redis_url: str = Field(default="redis://redis:6379/0", validation_alias="REDIS_URL")

    # Email
    email_sender: EmailStr = Field(default="no-reply@ideaconnect.com", validation_alias="EMAIL_SENDER")
    sendgrid_api_key: Optional[str] = Field(default=None, validation_alias="SENDGRID_API_KEY")

    # AWS / S3
    aws_access_key_id: Optional[str] = Field(default=None, validation_alias="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: Optional[str] = Field(default=None, validation_alias="AWS_SECRET_ACCESS_KEY")
    aws_region: str = Field(default="us-east-1", validation_alias="AWS_REGION")
    s3_bucket: Optional[str] = Field(default=None, validation_alias="S3_BUCKET")

    # Elasticsearch
    elasticsearch_url: Optional[str] = Field(default=None, validation_alias="ELASTICSEARCH_URL")

    rate_limit_per_minute: int = Field(default=100, validation_alias="RATE_LIMIT_PER_MINUTE")

    class Config:
        case_sensitive = True

    @property
    def cors_origin_list(self) -> List[str]:
        if isinstance(self.backend_cors_origins, str):
            return [origin.strip() for origin in self.backend_cors_origins.split(",") if origin.strip()]
        return self.backend_cors_origins


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
