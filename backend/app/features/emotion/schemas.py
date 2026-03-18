from pydantic import BaseModel, Field


class EmotionRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=512,
        description="Text to analyze for emotion content",
    )


class EmotionResponse(BaseModel):
    emotion: str = Field(..., description="Detected emotion label (e.g. sadness, joy, anger)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model confidence score (0–1)")
