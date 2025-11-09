from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class ActivityLog(BaseModel):
    __tablename__ = "activity_log"

    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    idea_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("ideas.id"), nullable=True, index=True)
    action_type: Mapped[str] = mapped_column(String(100), nullable=False)
    metadata: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    user = relationship("User")
    idea = relationship("Idea")
