from __future__ import annotations

import uuid

from sqlalchemy import Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Interested(BaseModel):
    __tablename__ = "interested"
    __table_args__ = (UniqueConstraint("idea_id", "user_id", name="uq_interested_idea_user"),)

    idea_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ideas.id"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    has_connected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    idea = relationship("Idea", back_populates="interested_users")
    user = relationship("User")
