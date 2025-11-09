from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Bookmark(BaseModel):
    __tablename__ = "bookmarks"
    __table_args__ = (UniqueConstraint("user_id", "idea_id", name="uq_bookmark_user_idea"),)

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    idea_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ideas.id"), nullable=False, index=True)
    collection_name: Mapped[str | None] = mapped_column(String(255), nullable=True)

    user = relationship("User")
    idea = relationship("Idea", back_populates="bookmarks")
