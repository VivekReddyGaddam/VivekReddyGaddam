from __future__ import annotations

from typing import TYPE_CHECKING

import uuid

from sqlalchemy import Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.idea import Idea
    from app.models.message import Message


class Conversation(BaseModel):
    __tablename__ = "conversations"

    initiator_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    participant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    idea_id = mapped_column(ForeignKey("ideas.id"), nullable=True, index=True)
    is_muted_by_initiator: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_muted_by_participant: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_archived_by_initiator: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_archived_by_participant: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    initiator = relationship("User", foreign_keys=[initiator_id], back_populates="initiated_conversations")
    participant = relationship("User", foreign_keys=[participant_id], back_populates="participated_conversations")
    idea = relationship("Idea")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
