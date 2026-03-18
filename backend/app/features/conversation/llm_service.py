import logging
from typing import Literal, TypedDict

import ollama

logger = logging.getLogger(__name__)

MODEL = "llama3.2"
MAX_HISTORY_MESSAGES = 10

SYSTEM_PROMPT = (
    "You are MindEase, an empathetic AI mental health companion for students. "
    "Listen carefully, ask thoughtful follow-up questions, and respond with warmth "
    "and support. Keep your responses concise, kind, and grounded. "
    "Never diagnose mental illness or replace professional help. "
    "If someone is in crisis, gently encourage them to reach out to a counsellor or helpline."
)


class HistoryMessage(TypedDict):
    role: Literal["user", "assistant"]
    content: str


def generate_response(
    user_message: str,
    conversation_history: list[HistoryMessage],
) -> str:
    truncated = conversation_history[-MAX_HISTORY_MESSAGES:]

    messages: list[dict[str, str]] = [
        {"role": "system", "content": SYSTEM_PROMPT},
        *[{"role": m["role"], "content": m["content"]} for m in truncated],
        {"role": "user", "content": user_message},
    ]

    logger.debug("Sending %d messages to %s", len(messages), MODEL)

    try:
        response = ollama.chat(model=MODEL, messages=messages)
        reply: str = response["message"]["content"]
        return reply.strip()
    except ollama.ResponseError as exc:
        logger.error("Ollama response error: %s", exc)
        raise RuntimeError(f"Ollama model error: {exc}") from exc
    except Exception as exc:
        error_str = str(exc).lower()
        if "connection" in error_str or "refused" in error_str or "connect" in error_str:
            raise RuntimeError(
                "Ollama is not running. Start it with: ollama serve"
            ) from exc
        logger.exception("Unexpected error calling Ollama")
        raise RuntimeError("AI service encountered an unexpected error.") from exc
