import logging
from typing import TypedDict

from faster_whisper import WhisperModel

logger = logging.getLogger(__name__)

_model: WhisperModel | None = None

WHISPER_MODEL_SIZE = "base"
WHISPER_DEVICE = "cpu"
WHISPER_COMPUTE_TYPE = "int8"


def get_model() -> WhisperModel:
    global _model
    if _model is None:
        logger.info(
            "Loading Whisper model '%s' on %s (%s) — first request only.",
            WHISPER_MODEL_SIZE,
            WHISPER_DEVICE,
            WHISPER_COMPUTE_TYPE,
        )
        _model = WhisperModel(
            WHISPER_MODEL_SIZE,
            device=WHISPER_DEVICE,
            compute_type=WHISPER_COMPUTE_TYPE,
        )
        logger.info("Whisper model loaded successfully.")
    return _model


class TranscribeResult(TypedDict):
    transcript: str
    language: str
    duration_seconds: float


def transcribe_audio(file_path: str) -> TranscribeResult:
    model = get_model()

    segments, info = model.transcribe(
        file_path,
        beam_size=5,
        vad_filter=True,
    )

    transcript = " ".join(segment.text.strip() for segment in segments).strip()

    return TranscribeResult(
        transcript=transcript,
        language=info.language,
        duration_seconds=round(info.duration, 2),
    )
