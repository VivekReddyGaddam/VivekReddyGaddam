from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, HttpUrl


class UserBase(BaseModel):
    full_name: str
    bio: Optional[str] = None
    avatar_url: Optional[HttpUrl] = None
    is_private: bool = False
    skills: Optional[List[str]] = None
    location: Optional[str] = None
    linkedin_url: Optional[HttpUrl] = None
    portfolio_url: Optional[HttpUrl] = None
    availability: Optional[List[str]] = None


class UserCreate(UserBase):
    email: EmailStr
    password: str


class UserUpdate(UserBase):
    pass


class UserOut(UserBase):
    id: str
    email: EmailStr
    is_email_verified: bool
    profile_completion: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    ideas_posted: int = 0
    interested_this_month: int = 0
    active_conversations: int = 0


class IdeaListItem(BaseModel):
    id: str
    title: str
    upvote_count: int
    interested_count: int
    comment_count: int

    class Config:
        from_attributes = True


class ConversationListItem(BaseModel):
    id: str
    partner_name: str
    last_message_preview: str | None = None
    updated_at: datetime | None = None
    updated_at_relative: str | None = None


class CollectionListItem(BaseModel):
    name: str
    count: int = 0


class DashboardResponse(BaseModel):
    stats: DashboardStats
    ideas: list[IdeaListItem]
    conversations: list[ConversationListItem]
    collections: list[CollectionListItem]
