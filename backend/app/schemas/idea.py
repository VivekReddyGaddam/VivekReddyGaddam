from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, HttpUrl, field_validator

ALLOWED_CATEGORIES = [
    "saas_business_software",
    "consumer_apps",
    "ecommerce",
    "healthcare_tech",
    "edtech",
    "fintech",
    "marketplace",
    "social_community",
    "hardware_iot",
    "web3_crypto",
    "gaming",
    "sustainability",
    "b2b_services",
    "creative_media",
    "other",
]

ALLOWED_SKILLS = [
    "frontend_dev",
    "backend_dev",
    "product_designer",
    "marketer",
    "sales",
    "data_analyst",
    "other",
]

ALLOWED_STAGE = ["idea_only", "initial_research", "mvp_built", "early_users", "revenue_generating"]
ALLOWED_COMMITMENT = ["part_time", "full_time", "flexible"]


class IdeaBase(BaseModel):
    title: str
    description: str
    category: str
    stage: str
    commitment_level: str
    skills_needed: Optional[List[str]] = None
    location: Optional[str] = None
    is_anonymous: bool = False
    featured_image_url: Optional[HttpUrl] = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in ALLOWED_CATEGORIES:
            raise ValueError("Invalid category")
        return v

    @field_validator("stage")
    @classmethod
    def validate_stage(cls, v: str) -> str:
        if v not in ALLOWED_STAGE:
            raise ValueError("Invalid stage")
        return v

    @field_validator("commitment_level")
    @classmethod
    def validate_commitment(cls, v: str) -> str:
        if v not in ALLOWED_COMMITMENT:
            raise ValueError("Invalid commitment level")
        return v

    @field_validator("skills_needed")
    @classmethod
    def validate_skills(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v:
            for skill in v:
                if skill not in ALLOWED_SKILLS:
                    raise ValueError("Invalid skill")
        return v


class IdeaCreate(IdeaBase):
    email: Optional[EmailStr] = None


class IdeaUpdate(IdeaBase):
    pass


class IdeaOut(IdeaBase):
    id: str
    user_id: str
    contact_email: Optional[EmailStr] = None
    upvote_count: int
    interested_count: int
    comment_count: int
    view_count: int
    is_completed: bool
    is_published: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class IdeaListItem(BaseModel):
    id: str
    title: str
    description: str
    category: str
    stage: str
    skills_needed: Optional[List[str]] = None
    commitment_level: Optional[str] = None
    is_anonymous: bool
    upvote_count: int
    interested_count: int
    comment_count: int
    created_at: datetime
    poster_name: Optional[str] = None
    poster_avatar_url: Optional[HttpUrl] = None

    class Config:
        from_attributes = True


class PaginatedIdeas(BaseModel):
    total: int
    page: int
    limit: int
    items: List[IdeaListItem]
