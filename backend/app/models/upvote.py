from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Upvote(BaseModel):
    __tablename__ = "upvotes"
    __table_args__ = (UniqueConstraint("idea_id", "user_id", name="uq_upvote_idea_user"),)

    idea_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ideas.id"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)

    idea = relationship("Idea", back_populates="upvotes")
    user = relationship("User")
