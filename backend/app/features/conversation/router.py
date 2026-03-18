import asyncio
import logging
import os
import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.core.auth.dependencies import get_current_user
from app.core.database import get_db
from app.features.conversation.conversation_service import (
    create_conversation,
    get_conversation,
    get_conversation_history,
    save_message,
)
from app.features.conversation.llm_service import generate_response
from app.features.conversation.schemas import (
    ChatRequest,
    ChatResponse,
    ConversationHistoryResponse,
    MessageOut,
    TranscribeResponse,
)
try:
    from app.features.conversation.whisper_service import transcribe_audio as run_transcription
except ImportError:
    from app.features.conversation.whisper_service_stub import transcribe_audio as run_transcription
try:
    from app.features.emotion.emotion_service import analyze_emotion
except ImportError:
    from app.features.emotion.emotion_service_stub import analyze_emotion
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/conversation", tags=["conversation"])

ALLOWED_AUDIO_TYPES = {
    "audio/m4a",
    "audio/mp4",
    "audio/mpeg",
    "audio/wav",
    "audio/webm",
    "audio/ogg",
    "audio/x-m4a",
}

MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB


@router.post(
    "/transcribe",
    response_model=TranscribeResponse,
    summary="Transcribe audio",
    description="Upload an audio recording and receive a local Whisper speech-to-text transcript.",
    status_code=status.HTTP_200_OK,
)
async def transcribe_audio_endpoint(
    audio: UploadFile = File(..., description="Audio file to transcribe"),
    current_user: User = Depends(get_current_user),
) -> TranscribeResponse:
    content_type = audio.content_type or ""
    if content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"Unsupported audio format '{content_type}'. "
                "Accepted: m4a, mp4, mp3, wav, webm, ogg."
            ),
        )

    audio_bytes = await audio.read()

    if len(audio_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded audio file is empty.",
        )

    if len(audio_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Audio file exceeds the 25 MB limit.",
        )

    suffix = Path(audio.filename or "recording.m4a").suffix or ".m4a"
    tmp_path: str | None = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        result = await asyncio.get_event_loop().run_in_executor(
            None, run_transcription, tmp_path
        )
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)

    return TranscribeResponse(
        transcript=result["transcript"],
        duration_seconds=result["duration_seconds"],
        language=result["language"],
    )


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Chat with MindEase AI",
    description=(
        "Send a message to the local Llama model. "
        "Emotion is analysed, message and AI reply are persisted, "
        "and DB history is used as LLM context."
    ),
    status_code=status.HTTP_200_OK,
)
async def chat_endpoint(
    body: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ChatResponse:
    loop = asyncio.get_event_loop()

    # 1. Emotion analysis — non-blocking; failure must not kill the chat
    emotion_data = None
    try:
        emotion_data = await loop.run_in_executor(None, analyze_emotion, body.message)
    except Exception:
        logger.warning("Emotion analysis failed for message; continuing without it.")

    # 2. Resolve or create conversation
    if body.conversation_id:
        conv = get_conversation(db, body.conversation_id)
        if not conv or conv.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found.",
            )
    else:
        conv = create_conversation(db, current_user.id)

    # 3. Persist user message with emotion metadata
    save_message(
        db,
        conversation_id=conv.id,
        role="user",
        content=body.message,
        emotion=emotion_data["emotion"] if emotion_data else None,
        confidence=emotion_data["confidence"] if emotion_data else None,
    )

    # 4. Build LLM context from DB (last 10 messages before the current one)
    history_rows = get_conversation_history(db, conv.id, limit=21)
    llm_history = [
        {"role": row.role, "content": row.content}
        for row in history_rows[:-1]  # exclude just-saved user message
    ][-10:]

    # 5. Generate AI reply
    try:
        reply = await loop.run_in_executor(
            None, generate_response, body.message, llm_history
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    # 6. Persist assistant reply
    save_message(db, conversation_id=conv.id, role="assistant", content=reply)

    return ChatResponse(
        reply=reply,
        conversation_id=conv.id,
        emotion=emotion_data["emotion"] if emotion_data else None,
        confidence=emotion_data["confidence"] if emotion_data else None,
    )


@router.get(
    "/{conversation_id}",
    response_model=ConversationHistoryResponse,
    summary="Get conversation history",
    description="Fetch all messages for a conversation in chronological order.",
    status_code=status.HTTP_200_OK,
)
async def get_history_endpoint(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConversationHistoryResponse:
    conv = get_conversation(db, conversation_id)
    if not conv or conv.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )

    rows = get_conversation_history(db, conversation_id, limit=100)

    return ConversationHistoryResponse(
        conversation_id=conversation_id,
        messages=[MessageOut.model_validate(row) for row in rows],
    )
