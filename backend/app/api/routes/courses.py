from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.users import current_user
from app.database import AsyncSessionLocal, get_db
from app.models.course import Course, CourseStatus, Unit
from app.models.progress import LessonProgress, UserCourse
from app.models.user import User
from app.schemas.course import CourseCreateRequest, CourseDetail, CourseRead, LessonRead, UnitRead
from app.services.course_generator import generate_course_outline

router = APIRouter(prefix="/courses", tags=["courses"])


async def _generate_in_background(course_id: UUID) -> None:
    async with AsyncSessionLocal() as session:
        try:
            await generate_course_outline(session, course_id=course_id)
        except Exception:
            pass  # already marked FAILED inside the generator


@router.post("", response_model=CourseRead, status_code=status.HTTP_201_CREATED)
async def create_course(
    body: CourseCreateRequest,
    background: BackgroundTasks,
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
) -> Course:
    course = Course(
        creator_id=user.id,
        topic=body.topic,
        title=body.topic,  # placeholder until LLM fills it in
        description=f"Generating curriculum for {body.topic}…",
        difficulty=body.difficulty,
        language=body.language,
        status=CourseStatus.GENERATING,
    )
    db.add(course)
    await db.commit()
    await db.refresh(course)

    db.add(UserCourse(user_id=user.id, course_id=course.id))
    await db.commit()

    background.add_task(_generate_in_background, course.id)
    return course


@router.get("", response_model=list[CourseRead])
async def list_my_courses(
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Course]:
    rows = await db.execute(
        select(Course)
        .join(UserCourse, UserCourse.course_id == Course.id)
        .where(UserCourse.user_id == user.id)
        .order_by(UserCourse.last_accessed_at.desc())
    )
    return list(rows.scalars().all())


@router.get("/public", response_model=list[CourseRead])
async def list_public_courses(db: AsyncSession = Depends(get_db)) -> list[Course]:
    rows = await db.execute(
        select(Course)
        .where(Course.is_public.is_(True), Course.status == CourseStatus.READY)
        .order_by(Course.created_at.desc())
        .limit(50)
    )
    return list(rows.scalars().all())


@router.get("/{course_id}", response_model=CourseDetail)
async def get_course(
    course_id: UUID,
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
) -> CourseDetail:
    course = (
        await db.execute(
            select(Course)
            .where(Course.id == course_id)
            .options(selectinload(Course.units).selectinload(Unit.lessons))
        )
    ).scalar_one_or_none()
    if course is None:
        raise HTTPException(404, "Course not found")

    progress_rows = await db.execute(
        select(LessonProgress).where(LessonProgress.user_id == user.id)
    )
    progress_by_lesson = {p.lesson_id: p for p in progress_rows.scalars().all()}

    units = []
    for u in course.units:
        lessons = []
        for ls in u.lessons:
            p = progress_by_lesson.get(ls.id)
            lessons.append(
                LessonRead(
                    id=ls.id,
                    position=ls.position,
                    title=ls.title,
                    objective=ls.objective,
                    estimated_minutes=ls.estimated_minutes,
                    xp_reward=ls.xp_reward,
                    is_generated=ls.is_generated,
                    completed=p.completed if p else False,
                    best_accuracy=p.best_accuracy if p else 0,
                )
            )
        units.append(
            UnitRead(
                id=u.id,
                position=u.position,
                title=u.title,
                description=u.description,
                icon_emoji=u.icon_emoji,
                lessons=lessons,
            )
        )

    return CourseDetail(
        id=course.id,
        creator_id=course.creator_id,
        topic=course.topic,
        title=course.title,
        description=course.description,
        difficulty=course.difficulty,
        language=course.language,
        status=course.status,
        icon_emoji=course.icon_emoji,
        color_hex=course.color_hex,
        learning_outcomes=course.learning_outcomes,
        is_public=course.is_public,
        created_at=course.created_at,
        units=units,
    )


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: UUID,
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    course = await db.get(Course, course_id)
    if course is None or course.creator_id != user.id:
        raise HTTPException(404, "Course not found")
    await db.delete(course)
    await db.commit()
