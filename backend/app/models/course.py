from datetime import datetime
from enum import StrEnum
from uuid import UUID, uuid4

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CourseStatus(StrEnum):
    DRAFT = "draft"
    GENERATING = "generating"
    READY = "ready"
    FAILED = "failed"


class ExerciseKind(StrEnum):
    MULTIPLE_CHOICE = "multiple_choice"
    FILL_BLANK = "fill_blank"
    TRUE_FALSE = "true_false"
    MATCH_PAIRS = "match_pairs"
    ORDERING = "ordering"
    TYPE_ANSWER = "type_answer"
    SELECT_IMAGE = "select_image"
    LISTENING = "listening"


class Course(Base):
    __tablename__ = "course"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    creator_id: Mapped[UUID] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"))
    topic: Mapped[str] = mapped_column(String(200))
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    difficulty: Mapped[str] = mapped_column(String(20), default="beginner")
    language: Mapped[str] = mapped_column(String(10), default="en")
    status: Mapped[CourseStatus] = mapped_column(
        String(20), default=CourseStatus.DRAFT, index=True
    )
    icon_emoji: Mapped[str] = mapped_column(String(8), default="📚")
    color_hex: Mapped[str] = mapped_column(String(7), default="#58CC02")
    learning_outcomes: Mapped[list[str]] = mapped_column(JSONB, default=list)
    is_public: Mapped[bool] = mapped_column(default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    units: Mapped[list["Unit"]] = relationship(
        back_populates="course",
        cascade="all, delete-orphan",
        order_by="Unit.position",
    )


class Unit(Base):
    __tablename__ = "unit"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    course_id: Mapped[UUID] = mapped_column(
        ForeignKey("course.id", ondelete="CASCADE"), index=True
    )
    position: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    icon_emoji: Mapped[str] = mapped_column(String(8), default="🎯")

    course: Mapped[Course] = relationship(back_populates="units")
    lessons: Mapped[list["Lesson"]] = relationship(
        back_populates="unit",
        cascade="all, delete-orphan",
        order_by="Lesson.position",
    )


class Lesson(Base):
    __tablename__ = "lesson"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    unit_id: Mapped[UUID] = mapped_column(
        ForeignKey("unit.id", ondelete="CASCADE"), index=True
    )
    position: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(200))
    objective: Mapped[str] = mapped_column(Text)
    teaching_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=5)
    xp_reward: Mapped[int] = mapped_column(Integer, default=15)
    is_generated: Mapped[bool] = mapped_column(default=False, index=True)
    generated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    unit: Mapped[Unit] = relationship(back_populates="lessons")
    exercises: Mapped[list["Exercise"]] = relationship(
        back_populates="lesson",
        cascade="all, delete-orphan",
        order_by="Exercise.position",
    )


class Exercise(Base):
    """An individual question. `payload` schema depends on `kind`."""

    __tablename__ = "exercise"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    lesson_id: Mapped[UUID] = mapped_column(
        ForeignKey("lesson.id", ondelete="CASCADE"), index=True
    )
    position: Mapped[int] = mapped_column(Integer)
    kind: Mapped[ExerciseKind] = mapped_column(String(32))
    prompt: Mapped[str] = mapped_column(Text)
    payload: Mapped[dict] = mapped_column(JSONB)
    """
    Shape per kind:
      multiple_choice: {options: [str], correct_index: int, explanation: str}
      fill_blank:     {sentence: str (with ___), answers: [str], case_sensitive: bool}
      true_false:     {answer: bool, explanation: str}
      match_pairs:    {pairs: [{left: str, right: str}]}
      ordering:       {items: [str], correct_order: [int]}
      type_answer:    {answers: [str], hint: str|null}
      select_image:   {options: [{label: str, image_url: str}], correct_index: int}
      listening:      {audio_text: str, answers: [str]}
    """
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    difficulty: Mapped[int] = mapped_column(Integer, default=1)  # 1-5
