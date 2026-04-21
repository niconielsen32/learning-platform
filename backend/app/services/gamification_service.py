from datetime import date, datetime, timedelta, timezone
from uuid import UUID

import structlog
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.course import Lesson
from app.models.gamification import HeartsState, StreakState, XPEvent, XPSource

log = structlog.get_logger()

PERFECT_BONUS = 5
STREAK_BONUS_AT = 7  # bonus XP every N-day streak milestone
HEART_REFILL_MINUTES = 30


async def total_xp(db: AsyncSession, user_id: UUID) -> int:
    val = await db.scalar(
        select(func.coalesce(func.sum(XPEvent.amount), 0)).where(XPEvent.user_id == user_id)
    )
    return int(val or 0)


async def award_lesson_xp(
    db: AsyncSession,
    *,
    user_id: UUID,
    lesson: Lesson,
    accuracy: int,
    is_first_completion: bool,
) -> tuple[int, int]:
    """Returns (xp_earned, new_total_xp)."""
    xp = lesson.xp_reward if is_first_completion else max(5, lesson.xp_reward // 3)
    db.add(
        XPEvent(
            user_id=user_id,
            amount=xp,
            source=XPSource.LESSON_COMPLETE,
            lesson_id=lesson.id,
        )
    )
    if accuracy == 100:
        db.add(
            XPEvent(
                user_id=user_id,
                amount=PERFECT_BONUS,
                source=XPSource.PERFECT_LESSON,
                lesson_id=lesson.id,
            )
        )
        xp += PERFECT_BONUS

    await db.flush()
    new_total = await total_xp(db, user_id)
    return xp, new_total


async def extend_streak_if_eligible(
    db: AsyncSession, *, user_id: UUID, today: date | None = None
) -> tuple[bool, int]:
    """Returns (extended_today, current_streak)."""
    today = today or datetime.now(timezone.utc).date()
    state = await db.scalar(select(StreakState).where(StreakState.user_id == user_id))
    if state is None:
        state = StreakState(user_id=user_id, current_streak=1, longest_streak=1, last_active_date=today)
        db.add(state)
        await db.flush()
        return True, 1

    if state.last_active_date == today:
        return False, state.current_streak

    if state.last_active_date == today - timedelta(days=1):
        state.current_streak += 1
    else:
        state.current_streak = 1
    state.longest_streak = max(state.longest_streak, state.current_streak)
    state.last_active_date = today

    if state.current_streak > 0 and state.current_streak % STREAK_BONUS_AT == 0:
        db.add(
            XPEvent(
                user_id=user_id,
                amount=20,
                source=XPSource.STREAK_BONUS,
            )
        )

    return True, state.current_streak


async def consume_heart(db: AsyncSession, *, user_id: UUID) -> int:
    """Decrement hearts on a wrong answer; return remaining hearts."""
    state = await db.scalar(select(HeartsState).where(HeartsState.user_id == user_id))
    if state is None:
        state = HeartsState(user_id=user_id)
        db.add(state)
        await db.flush()

    state.current_hearts = max(0, state.current_hearts - 1)
    if state.current_hearts < state.max_hearts and state.next_refill_at is None:
        state.next_refill_at = datetime.now(timezone.utc) + timedelta(minutes=HEART_REFILL_MINUTES)
    await db.flush()
    return state.current_hearts


async def refill_hearts_if_due(db: AsyncSession, *, user_id: UUID) -> HeartsState:
    state = await db.scalar(select(HeartsState).where(HeartsState.user_id == user_id))
    if state is None:
        state = HeartsState(user_id=user_id)
        db.add(state)
        await db.flush()
        return state

    now = datetime.now(timezone.utc)
    while (
        state.current_hearts < state.max_hearts
        and state.next_refill_at is not None
        and state.next_refill_at <= now
    ):
        state.current_hearts += 1
        if state.current_hearts < state.max_hearts:
            state.next_refill_at = state.next_refill_at + timedelta(minutes=HEART_REFILL_MINUTES)
        else:
            state.next_refill_at = None
    await db.flush()
    return state
