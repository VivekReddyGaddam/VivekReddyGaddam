from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, constr


PasswordStr = constr(min_length=8)


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str | None = None
    exp: datetime | None = None
    type: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: PasswordStr = Field(..., description="Password must include uppercase and numeric characters")
    full_name: constr(min_length=1, max_length=255)
    agree_to_terms: bool = Field(default=False)


class RefreshRequest(BaseModel):
    refresh_token: str


class AuthenticatedUser(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    is_email_verified: bool

    class Config:
        from_attributes = True


class AuthTokens(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthResponse(BaseModel):
    user: AuthenticatedUser
    tokens: AuthTokens
