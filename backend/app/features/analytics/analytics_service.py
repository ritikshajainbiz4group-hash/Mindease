from sqlalchemy import func
from sqlalchemy.orm import Session

from app.features.analytics.schemas import (
    EmotionCounts,
    EmotionStatsResponse,
    EmotionTimelineItem,
    EmotionTimelineResponse,
)
from app.features.conversation.models import Conversation, ConversationMessage

_KNOWN_EMOTIONS = {"joy", "sadness", "anger", "fear", "surprise", "disgust", "neutral"}


def get_emotion_stats(user_id: str, db: Session) -> EmotionStatsResponse:
    rows = (
        db.query(
            ConversationMessage.emotion,
            func.count(ConversationMessage.id).label("cnt"),
        )
        .join(Conversation, ConversationMessage.conversation_id == Conversation.id)
        .filter(
            Conversation.user_id == user_id,
            ConversationMessage.role == "user",
            ConversationMessage.emotion.isnot(None),
        )
        .group_by(ConversationMessage.emotion)
        .all()
    )

    counts: dict[str, int] = {e: 0 for e in _KNOWN_EMOTIONS}
    total = 0
    top_emotion: str | None = None
    top_count = 0

    for emotion, cnt in rows:
        total += cnt
        if emotion in counts:
            counts[emotion] = cnt
        if cnt > top_count:
            top_count = cnt
            top_emotion = emotion

    return EmotionStatsResponse(
        total_messages=total,
        top_emotion=top_emotion,
        emotion_counts=EmotionCounts(**counts),
    )


def get_emotion_timeline(user_id: str, db: Session) -> EmotionTimelineResponse:
    rows = (
        db.query(
            func.date(ConversationMessage.created_at).label("day"),
            ConversationMessage.emotion,
        )
        .join(Conversation, ConversationMessage.conversation_id == Conversation.id)
        .filter(
            Conversation.user_id == user_id,
            ConversationMessage.role == "user",
            ConversationMessage.emotion.isnot(None),
        )
        .order_by(func.date(ConversationMessage.created_at).asc())
        .all()
    )

    return EmotionTimelineResponse(
        timeline=[
            EmotionTimelineItem(date=str(row.day), emotion=row.emotion)
            for row in rows
        ]
    )
