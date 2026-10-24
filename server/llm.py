"""The only file that talks to the AI provider.

Uses the OpenAI-compatible API format, which Gemini, OpenAI, Groq, OpenRouter,
Mistral, Ollama and others all support. To switch providers, change the LLM_
settings in server/.env. No code changes needed.
"""

import json
import os

from openai import OpenAI, OpenAIError, RateLimitError


class LLMError(Exception):
    def __init__(self, message, status_code=502):
        super().__init__(message)
        self.status_code = status_code


def ask_json(instructions, content):
    """Send one request and return the reply parsed as JSON."""
    if not os.getenv("LLM_API_KEY"):
        raise LLMError("LLM_API_KEY is not set in server/.env", status_code=500)

    client = OpenAI(
        api_key=os.getenv("LLM_API_KEY"),
        base_url=os.getenv("LLM_BASE_URL") or None,
    )
    try:
        response = client.chat.completions.create(
            model=os.getenv("LLM_MODEL"),
            messages=[
                {"role": "system", "content": instructions},
                {"role": "user", "content": content},
            ],
        )
    except RateLimitError:
        raise LLMError("AI request limit reached. Wait a minute and try again.", status_code=429)
    except OpenAIError as err:
        raise LLMError(f"AI request failed: {err}")

    return _parse_json(response.choices[0].message.content or "")


def _parse_json(text):
    # Models sometimes wrap JSON in ```json fences or add a sentence around it.
    start, end = text.find("{"), text.rfind("}")
    try:
        return json.loads(text[start : end + 1])
    except ValueError:
        raise LLMError("The AI returned an unexpected format. Try again.")
