"""
Azure AI Foundry service — wraps the Azure OpenAI client.
Uses azure-ai-inference SDK which works with both Azure AI Foundry
and Azure OpenAI endpoints.
"""
import os
from openai import AsyncAzureOpenAI
from dotenv import load_dotenv

load_dotenv()

_client: AsyncAzureOpenAI | None = None


def get_client() -> AsyncAzureOpenAI:
    global _client
    if _client is None:
        _client = AsyncAzureOpenAI(
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-12-01-preview"),
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        )
    return _client


async def call_llm(system: str, user: str) -> str:
    """
    Call GPT-4.1 via Azure AI Foundry and return the raw text response.
    Each agent passes its own system + user prompt.
    """
    client = get_client()
    model = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4.1")

    response = await client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.2,   # Low temp for consistent, structured output
        max_tokens=1500,
        response_format={"type": "json_object"},  # Force JSON output
    )

    return response.choices[0].message.content
