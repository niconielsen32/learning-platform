from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.users import current_user
from app.database import get_db
from app.models.course import Exercise, Lesson
from app.models.progress import ExerciseAttempt, LessonProgress
from app.models.user import User
from app.schemas.course import (
    ExerciseRead,
    ExerciseResult,
    ExerciseSubmission,
    LessonCompletionResult,
    LessonDetail,
)
from app.services.course_generator import generate_lesson_content
from app.services.gamification_service import (
    award_lesson_xp,
    extend_streak_if_eligible,
)
from app.services.grading import grade

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.get("/{lesson_id}", response_model=LessonDetail)
async def get_lesson(
    lesson_id: UUID,
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
) -> LessonDetail:
    lesson = (
        await db.execute(
            select(Lesson)
            .where(Lesson.id == lesson_id)
            .options(selectinload(Lesson.exercises))
        )
    ).scalar_one_or_none()
    if lesson is None:
        raise HTTPException(404, "Lesson not found")

    if not lesson.is_generated:
        lesson = await generate_lesson_content(db, lesson_id=lesson_id)

    progress = (
        await db.execute(
            select(LessonProgress).where(
                LessonProgress.user_id == user.id, LessonProgress.lesson_id == lesson.id
            )
        )
    ).scalar_one_or_none()

    return LessonDetail(
        id=lesson.id,
        position=lesson.position,
        title=lesson.title,
        objective=lesson.objective,
        teaching_notes=lesson.teaching_notes,
        estimated_minutes=lesson.estimated_minutes,
        xp_reward=lesson.xp_reward,
        is_generated=lesson.is_generated,
        completed=progress.completed if progress else False,
        best_accuracy=progress.best_accuracy if progress else 0,
        exercises=[
            ExerciseRead(
                id=ex.id,
                position=ex.position,
                kind=ex.kind,
                prompt=ex.prompt,
                payload=_strip_answers(ex),
                difficulty=ex.difficulty,
            )
            for ex in lesson.exercises
        ],
    )


def _strip_answers(ex: Exercise) -> dict:
    """Remove answer keys from payload before sending to client."""
    p = dict(ex.payload)
    for key in ("correct_index", "correct_order", "answer", "answers", "explanation"):
        p.pop(key, None)
    if ex.kind == "match_pairs":
        # Keep pairs but client will shuffle the right side
        return p
    return p


@router.post("/exercises/{exercise_id}/submit", response_model=ExerciseResult)
async def submit_exercise(
    exercise_id: UUID,
    body: ExerciseSubmission,
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
) -> ExerciseResult:
    exercise = await db.get(Exercise, exercise_id)
    if exercise is None:
        raise HTTPException(404, "Exercise not found")

    is_correct, correct_payload = grade(exercise, body.answer)
    db.add(
        ExerciseAttempt(
            user_id=user.id,
            exercise_id=exercise.id,
            lesson_id=exercise.lesson_id,
            is_correct=is_correct,
            submitted_answer=body.answer,
            time_taken_ms=body.time_taken_ms,
        )
    )
    await db.commit()

    return ExerciseResult(
        is_correct=is_correct,
        correct_answer=correct_payload,
        explanation=exercise.explanation or exercise.payload.get("explanation"),
    )


@router.post("/{lesson_id}/complete", response_model=LessonCompletionResult)
async def complete_lesson(
    lesson_id: UUID,
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
) -> LessonCompletionResult:
    lesson = (
        await db.execute(
            select(Lesson).where(Lesson.id == lesson_id).options(selectinload(Lesson.exercises))
        )
    ).scalar_one_or_none()
    if lesson is None:
        raise HTTPException(404, "Lesson not found")

    exercise_ids = [e.id for e in lesson.exercises]
    if not exercise_ids:
        raise HTTPException(400, "Lesson has no exercises")

    # Use the most recent attempt per exercise to compute accuracy
    attempts = (
        await db.execute(
            select(ExerciseAttempt)
            .where(
                ExerciseAttempt.user_id == user.id,
                ExerciseAttempt.exercise_id.in_(exercise_ids),
            )
            .order_by(ExerciseAttempt.attempted_at.desc())
        )
    ).scalars().all()

    latest_per_exercise: dict[UUID, ExerciseAttempt] = {}
    for a in attempts:
        latest_per_exercise.setdefault(a.exercise_id, a)
    if len(latest_per_exercise) < len(exercise_ids):
        raise HTTPException(400, "Submit all exercises before completing the lesson")

    correct = sum(1 for a in latest_per_exercise.values() if a.is_correct)
    accuracy = round(100 * correct / len(exercise_ids))

    progress = (
        await db.execute(
            select(LessonProgress).where(
                LessonProgress.user_id == user.id, LessonProgress.lesson_id == lesson.id
            )
        )
    ).scalar_one_or_none()
    is_first_completion = progress is None or not progress.completed
    if progress is None:
        progress = LessonProgress(user_id=user.id, lesson_id=lesson.id)
        db.add(progress)
    progress.completed = True
    progress.times_completed += 1
    progress.best_accuracy = max(progress.best_accuracy, accuracy)
    progress.last_attempted_at = datetime.now(timezone.utc)
    progress.completed_at = progress.completed_at or datetime.now(timezone.utc)

    xp_earned, new_total = await award_lesson_xp(
        db,
        user_id=user.id,
        lesson=lesson,
        accuracy=accuracy,
        is_first_completion=is_first_completion,
    )
    streak_extended, current_streak = await extend_streak_if_eligible(db, user_id=user.id)

    await db.commit()

    return LessonCompletionResult(
        lesson_id=lesson.id,
        accuracy=accuracy,
        xp_earned=xp_earned,
        new_total_xp=new_total,
        streak_extended=streak_extended,
        current_streak=current_streak,
        achievements_unlocked=[],
    )
