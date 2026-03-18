"""Stub for whisper service - used when faster-whisper is not installed"""


def transcribe_audio(file_path: str) -> dict:
    """Stub transcription - returns dummy data until faster-whisper is installed"""
    return {
        "transcript": "faster-whisper is not installed. Run: pip install faster-whisper",
        "duration_seconds": 0.0,
        "language": "en",
    }
