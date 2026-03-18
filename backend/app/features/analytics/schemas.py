from pydantic import BaseModel, Field


class EmotionCounts(BaseModel):
    joy: int = Field(default=0, ge=0)
    sadness: int = Field(default=0, ge=0)
    anger: int = Field(default=0, ge=0)
    fear: int = Field(default=0, ge=0)
    surprise: int = Field(default=0, ge=0)
    disgust: int = Field(default=0, ge=0)
    neutral: int = Field(default=0, ge=0)


class EmotionStatsResponse(BaseModel):
    total_messages: int = Field(..., ge=0, description="Total user messages that have an emotion tag")
    top_emotion: str | None = Field(
        default=None, description="Most frequently detected emotion, or null if no data"
    )
    emotion_counts: EmotionCounts = Field(
        default_factory=EmotionCounts,
        description="Count of each emotion across all user messages",
    )


class EmotionTimelineItem(BaseModel):
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    emotion: str = Field(..., description="Detected emotion label for that entry")


class EmotionTimelineResponse(BaseModel):
    timeline: list[EmotionTimelineItem] = Field(
        default_factory=list,
        description="Chronologically ordered list of per-message emotion entries",
    )
