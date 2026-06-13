from services.foundry_service import call_llm
import json


SYSTEM_PROMPT = """You are a quantitative delivery analyst.
Given a set of project risks, you estimate the probability and magnitude of delivery impact.

Always respond with valid JSON only. No explanation, no markdown — just JSON."""

USER_PROMPT_TEMPLATE = """Based on the following project risks and health score, estimate delivery impact.

HEALTH SCORE: {health_score}/100

IDENTIFIED RISKS:
{risks}

RESOURCE ISSUES:
{resource_risks}

SCOPE CHANGES:
{scope_changes}

DEPENDENCIES:
{dependencies}

Return a JSON object with this exact structure:
{{
  "delay_probability": 0,
  "estimated_delay_weeks": 0.0,
  "delivery_confidence": "High | Medium | Low",
  "primary_risk_driver": "what is the single biggest risk"
}}

- delay_probability: integer 0-100 (percentage chance of missing release date)
- estimated_delay_weeks: float (expected delay if risks materialize)
- delivery_confidence: overall confidence in on-time delivery"""


async def run_impact_agent(findings: dict) -> dict:
    risks_text = json.dumps(findings.get("risks", []), indent=2)
    resource_text = json.dumps(findings.get("resource_risks", []), indent=2)
    scope_text = json.dumps(findings.get("scope_changes", []), indent=2)
    dep_text = json.dumps(findings.get("dependencies", []), indent=2)

    prompt = USER_PROMPT_TEMPLATE.format(
        health_score=findings.get("health_score", 100),
        risks=risks_text,
        resource_risks=resource_text,
        scope_changes=scope_text,
        dependencies=dep_text,
    )
    response = await call_llm(system=SYSTEM_PROMPT, user=prompt)
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        print(f"[ImpactAgent] Failed to parse JSON response: {response[:200]}")
        return {
            "delay_probability": 0,
            "estimated_delay_weeks": 0.0,
            "delivery_confidence": "Medium",
            "primary_risk_driver": "Unknown",
        }
