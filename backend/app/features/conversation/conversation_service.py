from sqlalchemy.orm import Session

from app.features.conversation.models import Conversation, ConversationMessage


def create_conversation(db: Session, user_id: str) -> Conversation:
    conv = Conversation(user_id=user_id)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


def get_conversation(db: Session, conversation_id: str) -> Conversation | None:
    return (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id)
        .first()
    )


def save_message(
    db: Session,
    conversation_id: str,
    role: str,
    content: str,
    emotion: str | None = None,
    confidence: float | None = None,
) -> ConversationMessage:
    msg = ConversationMessage(
        conversation_id=conversation_id,
        role=role,
        content=content,
        emotion=emotion,
        confidence=confidence,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def get_conversation_history(
    db: Session,
    conversation_id: str,
    limit: int = 20,
) -> list[ConversationMessage]:
    return (
        db.query(ConversationMessage)
        .filter(ConversationMessage.conversation_id == conversation_id)
        .order_by(ConversationMessage.created_at.asc())
        .limit(limit)
        .all()
    )
