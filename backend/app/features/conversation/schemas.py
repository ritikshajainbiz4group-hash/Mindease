from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class TranscribeResponse(BaseModel):
    transcript: str = Field(..., description="Transcribed text from the audio")
    duration_seconds: float = Field(..., description="Duration of the audio in seconds")
    language: str = Field(..., description="Detected language of the audio")


class ConversationMessage(BaseModel):
    role: Literal["user", "assistant"] = Field(
        ..., description="Who sent this message"
    )
    content: str = Field(..., min_length=1, description="Message text")


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="The user's current message")
    conversation_id: str | None = Field(
        default=None,
        description="Existing conversation ID to continue; omit to start a new conversation",
    )


class ChatResponse(BaseModel):
    reply: str = Field(..., description="AI assistant reply")
    conversation_id: str = Field(..., description="Conversation ID (new or existing)")
    emotion: str | None = Field(default=None, description="Detected emotion in user message")
    confidence: float | None = Field(default=None, description="Emotion detection confidence")


class MessageOut(BaseModel):
    id: str
    role: Literal["user", "assistant"]
    content: str
    emotion: str | None
    confidence: float | None
    created_at: datetime = Field(..., description="Message timestamp")

    model_config = {"from_attributes": True}


class ConversationHistoryResponse(BaseModel):
    conversation_id: str
    messages: list[MessageOut]
