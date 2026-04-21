from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.course import CourseStatus, ExerciseKind


# ─── LLM-facing generation schemas ──────────────────────────────


class GeneratedExercise(BaseModel):
    """Schema the LLM is asked to produce per exercise."""

    kind: ExerciseKind
    prompt: str
    payload: dict
    explanation: str | None = None
    difficulty: int = Field(default=1, ge=1, le=5)


class GeneratedLessonOutline(BaseModel):
    title: str
    objective: str
    estimated_minutes: int = Field(default=5, ge=1, le=30)


class GeneratedUnitOutline(BaseModel):
    title: str
    description: str
    icon_emoji: str = "🎯"
    lessons: list[GeneratedLessonOutline]


class GeneratedCourseOutline(BaseModel):
    title: str
    description: str
    icon_emoji: str = "📚"
    color_hex: str = "#58CC02"
    learning_outcomes: list[str]
    units: list[GeneratedUnitOutline]


class GeneratedLessonContent(BaseModel):
    teaching_notes: str
    exercises: list[GeneratedExercise]


# ─── API response schemas ──────────────────────────────────────


class CourseCreateRequest(BaseModel):
    topic: str = Field(min_length=2, max_length=200)
    difficulty: str = "beginner"
    language: str = "en"


class ExerciseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    position: int
    kind: ExerciseKind
    prompt: str
    payload: dict
    difficulty: int


class LessonRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    position: int
    title: str
    objective: str
    estimated_minutes: int
    xp_reward: int
    is_generated: bool
    completed: bool = False
    best_accuracy: int = 0


class LessonDetail(LessonRead):
    teaching_notes: str | None
    exercises: list[ExerciseRead]


class UnitRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    position: int
    title: str
    description: str
    icon_emoji: str
    lessons: list[LessonRead]


class CourseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    creator_id: UUID
    topic: str
    title: str
    description: str
    difficulty: str
    language: str
    status: CourseStatus
    icon_emoji: str
    color_hex: str
    learning_outcomes: list[str]
    is_public: bool
    created_at: datetime


class CourseDetail(CourseRead):
    units: list[UnitRead]


# ─── Exercise submission ───────────────────────────────────────


class ExerciseSubmission(BaseModel):
    answer: dict
    time_taken_ms: int = 0


class ExerciseResult(BaseModel):
    is_correct: bool
    correct_answer: dict
    explanation: str | None = None


class LessonCompletionResult(BaseModel):
    lesson_id: UUID
    accuracy: int
    xp_earned: int
    new_total_xp: int
    streak_extended: bool
    current_streak: int
    achievements_unlocked: list[str]
