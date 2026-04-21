from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.users import current_user
from app.database import get_db
from app.models.gamification import HeartsState, XPEvent
from app.models.user import User
from app.services.gamification_service import refill_hearts_if_due

router = APIRouter(prefix="/gamification", tags=["gamification"])


class HeartsResponse(BaseModel):
    current: int
    max: int
    next_refill_at: datetime | None
    seconds_to_next_refill: int | None


@router.get("/hearts", response_model=HeartsResponse)
async def get_hearts(
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
) -> HeartsResponse:
    state = await refill_hearts_if_due(db, user_id=user.id)
    await db.commit()
    seconds = None
    if state.next_refill_at is not None:
        delta = (state.next_refill_at - datetime.now(timezone.utc)).total_seconds()
        seconds = max(0, int(delta))
    return HeartsResponse(
        current=state.current_hearts,
        max=state.max_hearts,
        next_refill_at=state.next_refill_at,
        seconds_to_next_refill=seconds,
    )


class LeaderboardEntry(BaseModel):
    user_id: UUID
    display_name: str | None
    avatar_url: str | None
    weekly_xp: int


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
async def weekly_leaderboard(
    db: AsyncSession = Depends(get_db),
    limit: int = 30,
) -> list[LeaderboardEntry]:
    week_start = datetime.now(timezone.utc) - timedelta(days=7)
    rows = await db.execute(
        select(
            User.id,
            User.display_name,
            User.avatar_url,
            func.coalesce(func.sum(XPEvent.amount), 0).label("weekly_xp"),
        )
        .join(XPEvent, XPEvent.user_id == User.id)
        .where(XPEvent.occurred_at >= week_start)
        .group_by(User.id)
        .order_by(desc("weekly_xp"))
        .limit(limit)
    )
    return [
        LeaderboardEntry(
            user_id=r.id,
            display_name=r.display_name,
            avatar_url=r.avatar_url,
            weekly_xp=int(r.weekly_xp),
        )
        for r in rows
    ]
