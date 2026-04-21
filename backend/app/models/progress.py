from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class UserCourse(Base):
    """Tracks which courses a user has enrolled in."""

    __tablename__ = "user_course"
    __table_args__ = (UniqueConstraint("user_id", "course_id", name="uq_user_course"),)

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), index=True)
    course_id: Mapped[UUID] = mapped_column(ForeignKey("course.id", ondelete="CASCADE"), index=True)
    enrolled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    last_accessed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    total_xp_earned: Mapped[int] = mapped_column(Integer, default=0)


class LessonProgress(Base):
    """Per-user, per-lesson progress and best score."""

    __tablename__ = "lesson_progress"
    __table_args__ = (UniqueConstraint("user_id", "lesson_id", name="uq_user_lesson"),)

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), index=True)
    lesson_id: Mapped[UUID] = mapped_column(
        ForeignKey("lesson.id", ondelete="CASCADE"), index=True
    )
    completed: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    times_completed: Mapped[int] = mapped_column(Integer, default=0)
    best_accuracy: Mapped[int] = mapped_column(Integer, default=0)  # 0-100
    last_attempted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )


class ExerciseAttempt(Base):
    """Each individual answer submission, for spaced-repetition and analytics."""

    __tablename__ = "exercise_attempt"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), index=True)
    exercise_id: Mapped[UUID] = mapped_column(
        ForeignKey("exercise.id", ondelete="CASCADE"), index=True
    )
    lesson_id: Mapped[UUID] = mapped_column(
        ForeignKey("lesson.id", ondelete="CASCADE"), index=True
    )
    is_correct: Mapped[bool] = mapped_column(Boolean)
    submitted_answer: Mapped[dict] = mapped_column(JSONB)
    time_taken_ms: Mapped[int] = mapped_column(Integer, default=0)
    attempted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
