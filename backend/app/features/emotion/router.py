import asyncio

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth.dependencies import get_current_user
try:
    from app.features.emotion.emotion_service import analyze_emotion
except ImportError:
    from app.features.emotion.emotion_service_stub import analyze_emotion
from app.features.emotion.schemas import EmotionRequest, EmotionResponse
from app.models.user import User

router = APIRouter(prefix="/emotion", tags=["emotion"])


@router.post(
    "/analyze",
    response_model=EmotionResponse,
    summary="Analyze emotion",
    description=(
        "Analyze the emotional content of a text string using a local "
        "DistilRoBERTa model (j-hartmann/emotion-english-distilroberta-base). "
        "Returns the top emotion label and confidence score."
    ),
    status_code=status.HTTP_200_OK,
)
async def analyze_emotion_endpoint(
    body: EmotionRequest,
    current_user: User = Depends(get_current_user),
) -> EmotionResponse:
    try:
        result = await asyncio.get_event_loop().run_in_executor(
            None, analyze_emotion, body.text
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Emotion analysis service error: {exc}",
        ) from exc

    return EmotionResponse(
        emotion=result["emotion"],
        confidence=result["confidence"],
    )
