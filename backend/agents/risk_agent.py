from services.foundry_service import call_llm
import json


SYSTEM_PROMPT = """You are a senior project risk analyst with 15 years of experience 
in software delivery. Your job is to identify concrete risks from project data.

Always respond with valid JSON only. No explanation, no markdown — just JSON."""

USER_PROMPT_TEMPLATE = """Analyze the following project data and identify risks.

PROJECT UPDATES:
{project_updates}

TASKS:
{tasks}

MEETING NOTES:
{meeting_notes}

Return a JSON object with this exact structure:
{{
  "risks": [
    {{
      "name": "short risk name",
      "description": "what is happening",
      "severity": "High | Medium | Low",
      "category": "Delay | Blocker | Dependency"
    }}
  ]
}}

Focus on: task delays, blocked items, missed deadlines, and critical path risks.
Identify between 2-5 risks maximum."""


async def run_risk_agent(context: dict) -> dict:
    prompt = USER_PROMPT_TEMPLATE.format(
        project_updates=context.get("project_updates", ""),
        tasks=context.get("tasks", ""),
        meeting_notes=context.get("meeting_notes", ""),
    )
    response = await call_llm(system=SYSTEM_PROMPT, user=prompt)
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        print(f"[RiskAgent] Failed to parse JSON response: {response[:200]}")
        return {"risks": []}
