from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=80, pattern=r"^[a-zA-Z0-9_.-]+$")
    password: str = Field(min_length=6, max_length=128)
    display_name: str | None = Field(default=None, max_length=80)


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    username: str
    display_name: str | None = None
    avatar_url: str | None = None


class UserStats(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_xp: int
    current_streak: int
    longest_streak: int
    hearts: int
    max_hearts: int
    lessons_completed: int
    achievements_unlocked: int
