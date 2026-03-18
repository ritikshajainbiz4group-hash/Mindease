from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.auth.dependencies import get_current_user
from app.core.database import get_db
from app.features.analytics.analytics_service import get_emotion_stats, get_emotion_timeline
from app.features.analytics.schemas import EmotionStatsResponse, EmotionTimelineResponse
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get(
    "/emotions",
    response_model=EmotionStatsResponse,
    summary="Emotion analytics",
    description=(
        "Returns aggregated emotion statistics for the authenticated user "
        "across all conversation messages."
    ),
    status_code=status.HTTP_200_OK,
)
def get_emotion_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> EmotionStatsResponse:
    return get_emotion_stats(user_id=current_user.id, db=db)


@router.get(
    "/emotion-timeline",
    response_model=EmotionTimelineResponse,
    summary="Emotion timeline",
    description=(
        "Returns a chronological list of emotion entries (one per tagged user message) "
        "for the authenticated user, ordered by date ascending."
    ),
    status_code=status.HTTP_200_OK,
)
def get_emotion_timeline_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> EmotionTimelineResponse:
    return get_emotion_timeline(user_id=current_user.id, db=db)
