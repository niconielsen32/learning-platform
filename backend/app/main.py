from contextlib import asynccontextmanager
from pathlib import Path

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app import models  # noqa: F401 — register all SQLAlchemy models on Base.metadata
from app.api.routes import auth, courses, gamification, lessons, users
from app.config import get_settings
from app.database import AsyncSessionLocal, Base, engine
from app.services.seed import ensure_demo_user

structlog.configure(
    processors=[
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ]
)
log = structlog.get_logger()

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as db:
        await ensure_demo_user(db)
    log.info("startup", model=settings.openai_model, static=str(STATIC_DIR), static_exists=STATIC_DIR.exists())
    yield
    log.info("shutdown")


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Learning Platform API",
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/api/docs",
        openapi_url="/api/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # All API routes live under /api so the SPA can own /
    app.include_router(auth.router, prefix="/api")
    app.include_router(users.router, prefix="/api")
    app.include_router(courses.router, prefix="/api")
    app.include_router(lessons.router, prefix="/api")
    app.include_router(gamification.router, prefix="/api")

    @app.get("/api/health", tags=["meta"])
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    # Serve the built React SPA at /
    if STATIC_DIR.exists():
        assets_dir = STATIC_DIR / "assets"
        if assets_dir.exists():
            app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

        @app.get("/{full_path:path}", include_in_schema=False)
        async def spa(full_path: str) -> FileResponse:
            # Serve real files (favicon, etc.) if present; otherwise fall back
            # to index.html so React Router can handle client-side routing.
            target = STATIC_DIR / full_path
            if full_path and target.is_file():
                return FileResponse(target)
            return FileResponse(STATIC_DIR / "index.html")

    return app


app = create_app()
