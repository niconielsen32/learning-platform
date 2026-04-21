from datetime import date, datetime
from enum import StrEnum
from uuid import UUID, uuid4

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class XPSource(StrEnum):
    LESSON_COMPLETE = "lesson_complete"
    PERFECT_LESSON = "perfect_lesson"
    STREAK_BONUS = "streak_bonus"
    ACHIEVEMENT = "achievement"
    DAILY_QUEST = "daily_quest"


class XPEvent(Base):
    """Append-only ledger of every XP grant. Sum gives total XP."""

    __tablename__ = "xp_event"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), index=True)
    amount: Mapped[int] = mapped_column(Integer)
    source: Mapped[XPSource] = mapped_column(String(32))
    course_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("course.id", ondelete="SET NULL"), nullable=True, index=True
    )
    lesson_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("lesson.id", ondelete="SET NULL"), nullable=True
    )
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )


class StreakState(Base):
    """Current streak tracking per user."""

    __tablename__ = "streak_state"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"), primary_key=True
    )
    current_streak: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0)
    last_active_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    streak_freezes_available: Mapped[int] = mapped_column(Integer, default=2)


class HeartsState(Base):
    """Hearts (mistake budget) per user. Refill on a timer or with gems."""

    __tablename__ = "hearts_state"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"), primary_key=True
    )
    current_hearts: Mapped[int] = mapped_column(Integer, default=5)
    max_hearts: Mapped[int] = mapped_column(Integer, default=5)
    next_refill_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )


class Achievement(Base):
    """Catalog of achievements (seeded, not generated)."""

    __tablename__ = "achievement"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(String(400))
    icon_emoji: Mapped[str] = mapped_column(String(8), default="🏆")
    xp_reward: Mapped[int] = mapped_column(Integer, default=50)
    criteria: Mapped[dict] = mapped_column(JSONB)
    """e.g. {kind: 'streak', threshold: 7} or {kind: 'lessons_completed', threshold: 10}"""


class UserAchievement(Base):
    __tablename__ = "user_achievement"
    __table_args__ = (
        UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), index=True)
    achievement_id: Mapped[UUID] = mapped_column(
        ForeignKey("achievement.id", ondelete="CASCADE"), index=True
    )
    unlocked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
