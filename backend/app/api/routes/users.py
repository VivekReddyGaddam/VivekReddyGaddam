from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_session, verify_active_user
from app.models.conversation import Conversation
from app.models.idea import Idea
from app.models.user import User
from app.schemas.user import DashboardResponse, DashboardStats, IdeaListItem, ConversationListItem, UserOut

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
async def read_current_user(current_user: Annotated[User, Depends(verify_active_user)]) -> UserOut:
    return UserOut.model_validate(current_user, from_attributes=True)


@router.get("/me/dashboard", response_model=DashboardResponse)
async def read_dashboard(
    current_user: Annotated[User, Depends(verify_active_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> DashboardResponse:
    ideas_result = await session.execute(
        select(Idea)
        .where(Idea.user_id == current_user.id, Idea.deleted_at.is_(None))
        .order_by(Idea.created_at.desc())
        .limit(5)
    )
    ideas = ideas_result.scalars().all()

    total_interested = sum(idea.interested_count for idea in ideas)

    conversations_result = await session.execute(
        select(Conversation)
        .options(selectinload(Conversation.initiator), selectinload(Conversation.participant))
        .where(
            Conversation.deleted_at.is_(None),
            or_(Conversation.initiator_id == current_user.id, Conversation.participant_id == current_user.id),
        )
        .order_by(Conversation.updated_at.desc())
        .limit(5)
    )
    conversations = conversations_result.scalars().all()

    active_conversations = await session.scalar(
        select(func.count())
        .select_from(Conversation)
        .where(
            Conversation.deleted_at.is_(None),
            or_(Conversation.initiator_id == current_user.id, Conversation.participant_id == current_user.id),
        )
    )

    idea_items = [
        IdeaListItem(
            id=str(idea.id),
            title=idea.title,
            upvote_count=idea.upvote_count,
            interested_count=idea.interested_count,
            comment_count=idea.comment_count,
        )
        for idea in ideas
    ]

    conversation_items: list[ConversationListItem] = []
    for conversation in conversations:
        partner = conversation.participant if conversation.initiator_id == current_user.id else conversation.initiator
        conversation_items.append(
            ConversationListItem(
                id=str(conversation.id),
                partner_name=partner.full_name if partner else "Interested collaborator",
                last_message_preview=None,
                updated_at=conversation.updated_at,
                updated_at_relative=None,
            )
        )

    dashboard = DashboardResponse(
        stats=DashboardStats(
            ideas_posted=len(ideas),
            interested_this_month=total_interested,
            active_conversations=active_conversations or 0,
        ),
        ideas=idea_items,
        conversations=conversation_items,
        collections=[],
    )
    return dashboard
