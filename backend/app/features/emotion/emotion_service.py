import logging
from typing import TypedDict

from transformers import pipeline, Pipeline

logger = logging.getLogger(__name__)

MODEL_ID = "j-hartmann/emotion-english-distilroberta-base"

_pipeline: Pipeline | None = None


def get_pipeline() -> Pipeline:
    global _pipeline
    if _pipeline is None:
        logger.info("Loading emotion model '%s' — first request only.", MODEL_ID)
        _pipeline = pipeline(
            "text-classification",
            model=MODEL_ID,
            top_k=1,
        )
        logger.info("Emotion model loaded successfully.")
    return _pipeline


class EmotionResult(TypedDict):
    emotion: str
    confidence: float


def analyze_emotion(text: str) -> EmotionResult:
    pipe = get_pipeline()

    results = pipe(text[:512])

    top = results[0][0]  # type: ignore[index]

    return EmotionResult(
        emotion=top["label"].lower(),
        confidence=round(float(top["score"]), 4),
    )
