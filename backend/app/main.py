from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.database import (
    check_database_health,
    close_database,
    initialize_database,
    is_database_error,
)
from app.routes.documents import router as documents_router


logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        initialize_database()
    except Exception as error:
        logger.warning(
            "MongoDB initialization failed: %s",
            type(error).__name__,
        )
    yield
    close_database()


app = FastAPI(
    title="Document Search System API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(documents_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/database")
def database_health_check() -> dict[str, str]:
    try:
        return check_database_health()
    except Exception as error:
        if not is_database_error(error):
            raise
        raise HTTPException(
            status_code=503,
            detail="Database is unavailable",
        ) from error
