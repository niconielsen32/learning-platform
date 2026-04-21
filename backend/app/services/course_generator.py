from datetime import datetime, timezone
from uuid import UUID

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.course import Course, CourseStatus, Exercise, Lesson, Unit
from app.prompts.curriculum import (
    COURSE_OUTLINE_SYSTEM,
    COURSE_OUTLINE_USER_TEMPLATE,
    LESSON_CONTENT_SYSTEM,
    LESSON_CONTENT_USER_TEMPLATE,
)
from app.schemas.course import GeneratedCourseOutline, GeneratedLessonContent
from app.services.llm import LLMGenerationError, generate_structured

log = structlog.get_logger()

DEFAULT_UNIT_COUNT = 5
DEFAULT_LESSON_COUNT = 4
DEFAULT_EXERCISE_COUNT = 8


async def generate_course_outline(
    db: AsyncSession,
    *,
    course_id: UUID,
    unit_count: int = DEFAULT_UNIT_COUNT,
    lesson_count: int = DEFAULT_LESSON_COUNT,
) -> Course:
    """Generate the course outline (units + lesson stubs) and persist it.

    Lesson exercises are generated lazily on first access — see `generate_lesson_content`.
    """
    course = await db.get(Course, course_id)
    if course is None:
        raise ValueError(f"Course {course_id} not found")

    course.status = CourseStatus.GENERATING
    await db.commit()

    try:
        outline = await generate_structured(
            system=COURSE_OUTLINE_SYSTEM,
            user=COURSE_OUTLINE_USER_TEMPLATE.format(
                topic=course.topic,
                difficulty=course.difficulty,
                language=course.language,
                unit_count=unit_count,
                lesson_count=lesson_count,
            ),
            schema=GeneratedCourseOutline,
        )
    except LLMGenerationError:
        course.status = CourseStatus.FAILED
        await db.commit()
        raise

    course.title = outline.title
    course.description = outline.description
    course.icon_emoji = outline.icon_emoji
    course.color_hex = outline.color_hex
    course.learning_outcomes = outline.learning_outcomes

    for u_idx, u in enumerate(outline.units):
        unit = Unit(
            course_id=course.id,
            position=u_idx,
            title=u.title,
            description=u.description,
            icon_emoji=u.icon_emoji,
        )
        db.add(unit)
        await db.flush()
        for l_idx, lesson in enumerate(u.lessons):
            db.add(
                Lesson(
                    unit_id=unit.id,
                    position=l_idx,
                    title=lesson.title,
                    objective=lesson.objective,
                    estimated_minutes=lesson.estimated_minutes,
                    xp_reward=15,
                    is_generated=False,
                )
            )

    course.status = CourseStatus.READY
    await db.commit()
    log.info(
        "course_outline_generated",
        course_id=str(course.id),
        units=len(outline.units),
    )
    await db.refresh(course)
    return course


async def generate_lesson_content(
    db: AsyncSession,
    *,
    lesson_id: UUID,
    exercise_count: int = DEFAULT_EXERCISE_COUNT,
) -> Lesson:
    """Generate exercises for a single lesson and persist them. Idempotent."""
    lesson = (
        await db.execute(
            select(Lesson)
            .where(Lesson.id == lesson_id)
            .options(selectinload(Lesson.exercises), selectinload(Lesson.unit).selectinload(Unit.course))
        )
    ).scalar_one_or_none()
    if lesson is None:
        raise ValueError(f"Lesson {lesson_id} not found")

    if lesson.is_generated and lesson.exercises:
        return lesson

    unit = lesson.unit
    course = unit.course

    content = await generate_structured(
        system=LESSON_CONTENT_SYSTEM,
        user=LESSON_CONTENT_USER_TEMPLATE.format(
            course_title=course.title,
            unit_title=unit.title,
            unit_description=unit.description,
            lesson_title=lesson.title,
            lesson_objective=lesson.objective,
            exercise_count=exercise_count,
        ),
        schema=GeneratedLessonContent,
    )

    lesson.teaching_notes = content.teaching_notes
    for idx, ex in enumerate(content.exercises):
        db.add(
            Exercise(
                lesson_id=lesson.id,
                position=idx,
                kind=ex.kind,
                prompt=ex.prompt,
                payload=ex.payload,
                explanation=ex.explanation,
                difficulty=ex.difficulty,
            )
        )
    lesson.is_generated = True
    lesson.generated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(lesson, ["exercises"])
    log.info("lesson_content_generated", lesson_id=str(lesson.id), exercises=len(content.exercises))
    return lesson
