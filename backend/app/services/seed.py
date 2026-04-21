import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.users import hash_password
from app.models.user import User

log = structlog.get_logger()


async def ensure_demo_user(db: AsyncSession) -> None:
    """Create the demo user if it doesn't exist. Idempotent — safe to call on every boot."""
    settings = get_settings()
    existing = await db.scalar(select(User).where(User.username == settings.demo_username))
    if existing is not None:
        return
    db.add(
        User(
            username=settings.demo_username,
            hashed_password=hash_password(settings.demo_password),
            display_name="Demo Learner",
        )
    )
    await db.commit()
    log.info("demo_user_seeded", username=settings.demo_username)
