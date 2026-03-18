import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config.settings import settings
from app.features.auth.router import router as auth_router
from app.features.category.router import router as category_router
from app.features.conversation.router import router as conversation_router
from app.features.analytics.router import router as analytics_router
from app.features.emotion.router import router as emotion_router

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    description="AI Mental Health API — calm, secure, scalable.",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

API_PREFIX = f"/api/{settings.API_VERSION}"
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(category_router, prefix=API_PREFIX)
app.include_router(conversation_router, prefix=API_PREFIX)
app.include_router(emotion_router, prefix=API_PREFIX)
app.include_router(analytics_router, prefix=API_PREFIX)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Return a consistent JSON error payload for all HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "detail": exc.detail, "code": str(exc.status_code)},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Return field-level validation errors in a consistent format."""
    errors = [
        {"field": " -> ".join(str(loc) for loc in err["loc"]), "message": err["msg"]}
        for err in exc.errors()
    ]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"success": False, "detail": "Validation error", "errors": errors},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all handler — logs the error and returns a generic 500 response."""
    logger.exception("Unhandled exception on %s %s", request.method, request.url)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"success": False, "detail": "An unexpected error occurred", "code": "500"},
    )


@app.get("/health", tags=["health"], summary="Health check")
async def health_check() -> JSONResponse:
    return JSONResponse({"status": "ok", "app": settings.APP_NAME})
