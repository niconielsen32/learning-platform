import json
from typing import TypeVar

import structlog
from openai import AsyncOpenAI
from pydantic import BaseModel, ValidationError
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.config import get_settings

log = structlog.get_logger()
settings = get_settings()

T = TypeVar("T", bound=BaseModel)


class LLMGenerationError(Exception):
    """Raised when the LLM returns content that can't be parsed into the target schema."""


_client = AsyncOpenAI(api_key=settings.openai_api_key)


@retry(
    retry=retry_if_exception_type(LLMGenerationError),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    reraise=True,
)
async def generate_structured(
    *,
    system: str,
    user: str,
    schema: type[T],
    max_tokens: int | None = None,
) -> T:
    """Call OpenAI in JSON mode and parse the response into `schema`. Retries on parse failure.

    Uses `response_format={"type": "json_object"}` rather than strict structured outputs
    because our schemas include free-form `dict` payloads (per-exercise-kind shape),
    which strict mode rejects. The system prompt already instructs the model to emit
    valid JSON matching the requested schema.
    """
    response = await _client.chat.completions.create(
        model=settings.openai_model,
        max_tokens=max_tokens or settings.openai_max_tokens,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    )
    raw = response.choices[0].message.content or ""

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        log.warning("llm_json_decode_failed", error=str(e), preview=raw[:200])
        raise LLMGenerationError(f"Invalid JSON from LLM: {e}") from e

    try:
        return schema.model_validate(data)
    except ValidationError as e:
        log.warning("llm_schema_validation_failed", error=str(e))
        raise LLMGenerationError(f"LLM output did not match schema: {e}") from e
