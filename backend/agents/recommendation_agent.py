from services.foundry_service import call_llm
import json


SYSTEM_PROMPT = """You are a senior delivery consultant and agile coach.
Given project risks and impact analysis, you generate concrete, actionable recommendations.

Always respond with valid JSON only. No explanation, no markdown — just JSON."""

USER_PROMPT_TEMPLATE = """Generate ranked mitigation recommendations for the following project situation.

HEALTH SCORE: {health_score}/100
DELAY PROBABILITY: {delay_probability}%
ESTIMATED DELAY: {estimated_delay_weeks} weeks

RISKS:
{risks}

RESOURCE ISSUES:
{resource_risks}

SCOPE CHANGES:
{scope_changes}

DEPENDENCIES:
{dependencies}

Return a JSON object with this exact structure:
{{
  "recommendations": [
    {{
      "action": "short imperative action",
      "rationale": "why this will help",
      "priority": "Immediate | Short-term | Strategic",
      "effort": "Low | Medium | High"
    }}
  ]
}}

Provide 3-5 recommendations, ranked by priority (most urgent first).
Be specific and actionable — no vague advice."""


async def run_recommendation_agent(findings: dict) -> dict:
    impact = findings.get("impact", {})
    prompt = USER_PROMPT_TEMPLATE.format(
        health_score=findings.get("health_score", 100),
        delay_probability=impact.get("delay_probability", 0),
        estimated_delay_weeks=impact.get("estimated_delay_weeks", 0.0),
        risks=json.dumps(findings.get("risks", []), indent=2),
        resource_risks=json.dumps(findings.get("resource_risks", []), indent=2),
        scope_changes=json.dumps(findings.get("scope_changes", []), indent=2),
        dependencies=json.dumps(findings.get("dependencies", []), indent=2),
    )
    response = await call_llm(system=SYSTEM_PROMPT, user=prompt)
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        return {"recommendations": []}
