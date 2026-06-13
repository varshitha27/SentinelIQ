from services.foundry_service import call_llm
import json


SYSTEM_PROMPT = """You are a technical program manager specializing in dependency management.
You identify external blockers, vendor risks, and inter-team dependencies that threaten delivery.

Always respond with valid JSON only. No explanation, no markdown — just JSON."""

USER_PROMPT_TEMPLATE = """Analyze the following project data for dependency risks.

PROJECT UPDATES:
{project_updates}

MEETING NOTES:
{meeting_notes}

TASKS:
{tasks}

Return a JSON object with this exact structure:
{{
  "dependencies": [
    "short description of blocking dependency"
  ]
}}

Look for: vendor delays, waiting on another team, API blockers, 
third-party integrations, external approvals, licensing.
Return 0-3 items maximum."""


async def run_dependency_agent(context: dict) -> dict:
    prompt = USER_PROMPT_TEMPLATE.format(
        project_updates=context.get("project_updates", ""),
        meeting_notes=context.get("meeting_notes", ""),
        tasks=context.get("tasks", ""),
    )
    response = await call_llm(system=SYSTEM_PROMPT, user=prompt)
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        print(f"[DependencyAgent] Failed to parse JSON response: {response[:200]}")
        return {"dependencies": []}
