from __future__ import annotations

import re
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from jose import JWTError, jwt

from app.api.deps import get_session
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, get_password_hash, verify_password
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    AuthTokens,
    AuthenticatedUser,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    Token,
)

router = APIRouter(prefix="/auth", tags=["auth"])

PASSWORD_PATTERN = re.compile(r"^(?=.*[A-Z])(?=.*\d).{8,}$")


def validate_password(password: str) -> None:
    if not PASSWORD_PATTERN.match(password):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 8 characters and include an uppercase letter and number.",
        )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register_user(payload: RegisterRequest, session: Annotated[AsyncSession, Depends(get_session)]) -> AuthResponse:
    if not payload.agree_to_terms:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Terms must be accepted")

    validate_password(payload.password)

    existing_user = await session.scalar(select(User).where(User.email == payload.email.lower()))
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    password_hash = get_password_hash(payload.password)
    user = User(
        email=payload.email.lower(),
        password_hash=password_hash,
        full_name=payload.full_name,
    )
    session.add(user)
    await session.flush()
    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    return AuthResponse(
        user=AuthenticatedUser.model_validate(user, from_attributes=True),
        tokens=AuthTokens(access_token=access_token, refresh_token=refresh_token),
    )


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest, session: Annotated[AsyncSession, Depends(get_session)]) -> AuthResponse:
    user = await session.scalar(select(User).where(User.email == payload.email.lower(), User.deleted_at.is_(None)))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is inactive")

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    return AuthResponse(
        user=AuthenticatedUser.model_validate(user, from_attributes=True),
        tokens=AuthTokens(access_token=access_token, refresh_token=refresh_token),
    )


@router.post("/refresh", response_model=AuthTokens)
async def refresh(payload: RefreshRequest, session: Annotated[AsyncSession, Depends(get_session)]) -> AuthTokens:
    try:
        decoded = jwt.decode(payload.refresh_token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token") from exc

    if decoded.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user_id = decoded.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user = await session.get(User, user_id)
    if not user or not user.is_active or user.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    return AuthTokens(access_token=access_token, refresh_token=refresh_token)
