from __future__ import annotations

from typing import List, Optional, TYPE_CHECKING

from sqlalchemy import Boolean, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.idea import Idea
    from app.models.comment import Comment
    from app.models.message import Message
    from app.models.conversation import Conversation
    from app.models.interested import Interested
    from app.models.bookmark import Bookmark


class UserAvailability:
    POST_IDEA = "post_idea"
    FIND_COFUNDER = "find_cofounder"
    FIND_TEAM = "find_team"
    OFFER_SKILLS = "offer_skills"
    INVEST = "invest"
    MENTOR = "mentor"


class User(BaseModel):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_private: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    skills: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    linkedin_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    portfolio_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    availability: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    profile_completion: Mapped[int] = mapped_column(default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    ideas = relationship("Idea", back_populates="user")
    comments = relationship("Comment", back_populates="user")
    messages = relationship("Message", back_populates="sender")
    initiated_conversations = relationship(
        "Conversation", foreign_keys="Conversation.initiator_id", back_populates="initiator"
    )
    participated_conversations = relationship(
        "Conversation", foreign_keys="Conversation.participant_id", back_populates="participant"
    )
