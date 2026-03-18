from pydantic import BaseModel


class BaseResponse(BaseModel):
    """Base response model for all API responses."""

    success: bool = True
    message: str = "OK"


class ErrorResponse(BaseModel):
    """Standard error response payload."""

    success: bool = False
    detail: str
    code: str | None = None
