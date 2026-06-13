from services.foundry_service import call_llm
import json


SYSTEM_PROMPT = """You are a business analyst specializing in scope management.
You detect scope creep, requirement volatility, and feature additions that threaten delivery.

Always respond with valid JSON only. No explanation, no markdown — just JSON."""

USER_PROMPT_TEMPLATE = """Analyze the following project data for scope creep indicators.

PROJECT UPDATES:
{project_updates}

MEETING NOTES:
{meeting_notes}

TASKS:
{tasks}

Return a JSON object with this exact structure:
{{
  "scope_changes": [
    "short description of scope change"
  ],
  "scope_change_count": 0
}}

Look for: new requirements, feature additions, changing acceptance criteria, 
phrases like "we also need", "can we add", "the client now wants".
Return 0-3 items maximum."""


async def run_scope_agent(context: dict) -> dict:
    prompt = USER_PROMPT_TEMPLATE.format(
        project_updates=context.get("project_updates", ""),
        meeting_notes=context.get("meeting_notes", ""),
        tasks=context.get("tasks", ""),
    )
    response = await call_llm(system=SYSTEM_PROMPT, user=prompt)
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        return {"scope_changes": [], "scope_change_count": 0}
