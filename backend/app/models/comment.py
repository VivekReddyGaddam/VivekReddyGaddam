from __future__ import annotations

from typing import Optional, TYPE_CHECKING
import uuid

from sqlalchemy import ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.idea import Idea
    from app.models.user import User


class Comment(BaseModel):
    __tablename__ = "comments"

    idea_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ideas.id"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    parent_comment_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("comments.id"), nullable=True, index=True
    )

    idea = relationship("Idea", back_populates="comments")
    user = relationship("User", back_populates="comments")
    replies = relationship("Comment")
