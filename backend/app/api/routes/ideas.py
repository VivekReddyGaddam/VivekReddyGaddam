from __future__ import annotations

import secrets
import string
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_optional_user, get_session
from app.core.security import get_password_hash
from app.models.idea import Idea
from app.models.user import User
from app.schemas.idea import IdeaCreate, IdeaListItem, IdeaOut, PaginatedIdeas

router = APIRouter(prefix="/ideas", tags=["ideas"])


def _generate_secure_placeholder_password(length: int = 20) -> str:
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return "".join(secrets.choice(alphabet) for _ in range(length))


async def _get_or_create_user_for_submission(
    session: AsyncSession,
    email: str,
) -> User:
    existing_user = await session.scalar(select(User).where(User.email == email))
    if existing_user:
        return existing_user

    temporary_password = _generate_secure_placeholder_password()
    placeholder_user = User(
        email=email,
        full_name="Anonymous Ideator",
        password_hash=get_password_hash(temporary_password),
        is_email_verified=False,
        is_private=True,
    )
    session.add(placeholder_user)
    await session.flush()
    return placeholder_user


@router.post("", response_model=IdeaOut, status_code=status.HTTP_201_CREATED)
async def create_idea(
    payload: IdeaCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[Optional[User], Depends(get_optional_user)],
) -> IdeaOut:
    title = payload.title.strip()
    description = payload.description.strip()

    if len(title) == 0 or len(title) > 120:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Title must be 1-120 characters")
    if len(description) < 20 or len(description) > 2000:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Description must be between 20 and 2000 characters"
        )

    if payload.skills_needed:
        skills = list(dict.fromkeys(payload.skills_needed))
    else:
        skills = None

    if current_user:
        user = current_user
    else:
        if not payload.email:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email required for anonymous posting")
        user = await _get_or_create_user_for_submission(session, payload.email.lower())

    idea = Idea(
        user_id=user.id,
        title=title,
        description=description,
        category=payload.category,
        stage=payload.stage,
        commitment_level=payload.commitment_level,
        skills_needed=skills,
        location=payload.location,
        is_anonymous=payload.is_anonymous,
        featured_image_url=payload.featured_image_url,
        contact_email=payload.email.lower() if payload.email else (user.email if user else None),
    )

    session.add(idea)
    await session.flush()

    return IdeaOut.model_validate(idea, from_attributes=True)


SORT_OPTIONS = {
    "newest": Idea.created_at.desc(),
    "oldest": Idea.created_at.asc(),
    "most_upvotes": Idea.upvote_count.desc(),
    "most_comments": Idea.comment_count.desc(),
    "most_interested": Idea.interested_count.desc(),
}


@router.get("", response_model=PaginatedIdeas)
async def list_ideas(
    session: Annotated[AsyncSession, Depends(get_session)],
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=50),
    category: Optional[str] = Query(default=None),
    stage: Optional[str] = Query(default=None),
    skills: Optional[list[str]] = Query(default=None),
    commitment_level: Optional[str] = Query(default=None),
    location: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    sort: str = Query(default="newest"),
) -> PaginatedIdeas:
    filters = [Idea.is_published.is_(True), Idea.deleted_at.is_(None)]

    if category:
        filters.append(Idea.category == category)
    if stage:
        filters.append(Idea.stage == stage)
    if commitment_level:
        filters.append(Idea.commitment_level == commitment_level)
    if location:
        filters.append(Idea.location.ilike(f"%{location}%"))
    if skills:
        for skill in skills:
            filters.append(Idea.skills_needed.contains([skill]))
    if search:
        search_term = f"%{search}%"
        filters.append(or_(Idea.title.ilike(search_term), Idea.description.ilike(search_term)))

    sort_clause = SORT_OPTIONS.get(sort, SORT_OPTIONS["newest"])

    base_query = select(Idea).where(and_(*filters))
    total = await session.scalar(select(func.count()).select_from(base_query.subquery()))

    offset = (page - 1) * limit
    ideas_query = base_query.options(selectinload(Idea.user)).order_by(sort_clause).offset(offset).limit(limit)
    idea_result = await session.execute(ideas_query)
    ideas = idea_result.scalars().all()

    items: list[IdeaListItem] = []
    for idea in ideas:
        poster_name = "Anonymous" if idea.is_anonymous else idea.user.full_name if idea.user else None
        poster_avatar = idea.user.avatar_url if idea.user else None
        items.append(
            IdeaListItem(
                id=str(idea.id),
                title=idea.title,
                description=idea.description[:100] + ("..." if len(idea.description) > 100 else ""),
                category=idea.category,
                stage=idea.stage,
                skills_needed=idea.skills_needed,
                commitment_level=idea.commitment_level,
                is_anonymous=idea.is_anonymous,
                upvote_count=idea.upvote_count,
                interested_count=idea.interested_count,
                comment_count=idea.comment_count,
                created_at=idea.created_at,
                poster_name=poster_name,
                poster_avatar_url=poster_avatar,
            )
        )

    return PaginatedIdeas(total=total or 0, page=page, limit=limit, items=items)


@router.get("/{idea_id}", response_model=IdeaOut)
async def get_idea_detail(
    idea_id: str,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> IdeaOut:
    idea = await session.get(Idea, idea_id)
    if not idea or idea.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Idea not found")
    if not idea.is_published:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Idea is not published")

    idea.view_count += 1
    await session.flush()
    return IdeaOut.model_validate(idea, from_attributes=True)
