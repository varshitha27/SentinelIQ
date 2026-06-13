from services.foundry_service import call_llm
import json


SYSTEM_PROMPT = """You are a delivery manager and resource planning expert.
You identify team capacity issues, skill gaps, and workload problems.

Always respond with valid JSON only. No explanation, no markdown — just JSON."""

USER_PROMPT_TEMPLATE = """Analyze the following project data for resource and capacity risks.

TASKS:
{tasks}

MEETING NOTES:
{meeting_notes}

PROJECT UPDATES:
{project_updates}

Return a JSON object with this exact structure:
{{
  "resource_risks": [
    "short description of resource issue"
  ]
}}

Look for: overloaded teams, missing skills, QA/dev shortages, vacation/absence mentions.
Return 0-3 items maximum."""


async def run_resource_agent(context: dict) -> dict:
    prompt = USER_PROMPT_TEMPLATE.format(
        tasks=context.get("tasks", ""),
        meeting_notes=context.get("meeting_notes", ""),
        project_updates=context.get("project_updates", ""),
    )
    response = await call_llm(system=SYSTEM_PROMPT, user=prompt)
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        return {"resource_risks": []}
