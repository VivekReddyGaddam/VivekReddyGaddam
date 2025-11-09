from __future__ import annotations

from typing import List, Optional, TYPE_CHECKING
import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.comment import Comment
    from app.models.upvote import Upvote
    from app.models.bookmark import Bookmark
    from app.models.interested import Interested


class IdeaStage:
    IDEA_ONLY = "idea_only"
    INITIAL_RESEARCH = "initial_research"
    MVP_BUILT = "mvp_built"
    EARLY_USERS = "early_users"
    REVENUE_GENERATING = "revenue_generating"


class CommitmentLevel:
    PART_TIME = "part_time"
    FULL_TIME = "full_time"
    FLEXIBLE = "flexible"


class Idea(BaseModel):
    __tablename__ = "ideas"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    stage: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    skills_needed: Mapped[Optional[List[str]]] = mapped_column(JSONB, nullable=True)
    commitment_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    featured_image_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    upvote_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    view_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    interested_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    comment_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_edited_at: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    stale_at: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    user = relationship("User", back_populates="ideas")
    comments = relationship("Comment", back_populates="idea", cascade="all, delete-orphan")
    upvotes = relationship("Upvote", back_populates="idea", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="idea", cascade="all, delete-orphan")
    interested_users = relationship("Interested", back_populates="idea", cascade="all, delete-orphan")
