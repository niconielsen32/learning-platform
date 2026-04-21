from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.users import current_user
from app.database import get_db
from app.models.gamification import HeartsState, StreakState, UserAchievement, XPEvent
from app.models.progress import LessonProgress
from app.models.user import User
from app.schemas.user import UserRead, UserStats

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
async def me(user: User = Depends(current_user)) -> User:
    return user


@router.get("/me/stats", response_model=UserStats)
async def my_stats(
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
) -> UserStats:
    total_xp = (
        await db.scalar(select(func.coalesce(func.sum(XPEvent.amount), 0)).where(XPEvent.user_id == user.id))
    ) or 0
    streak = await db.scalar(select(StreakState).where(StreakState.user_id == user.id))
    hearts = await db.scalar(select(HeartsState).where(HeartsState.user_id == user.id))
    lessons_completed = (
        await db.scalar(
            select(func.count(LessonProgress.id)).where(
                LessonProgress.user_id == user.id, LessonProgress.completed.is_(True)
            )
        )
    ) or 0
    achievements_unlocked = (
        await db.scalar(
            select(func.count(UserAchievement.id)).where(UserAchievement.user_id == user.id)
        )
    ) or 0

    return UserStats(
        total_xp=int(total_xp),
        current_streak=streak.current_streak if streak else 0,
        longest_streak=streak.longest_streak if streak else 0,
        hearts=hearts.current_hearts if hearts else 5,
        max_hearts=hearts.max_hearts if hearts else 5,
        lessons_completed=int(lessons_completed),
        achievements_unlocked=int(achievements_unlocked),
    )
