from services.foundry_service import call_llm
import json


SYSTEM_PROMPT = """You are a chief of staff preparing a briefing for a VP of Engineering.
Write clearly, concisely, and with urgency when warranted.
Avoid jargon. Use plain business language.

Always respond with valid JSON only. No explanation, no markdown — just JSON."""

USER_PROMPT_TEMPLATE = """Create an executive summary for the following project analysis.

PROJECT: {project_name}
HEALTH SCORE: {health_score}/100
RISK LEVEL: {risk_level}
DELAY PROBABILITY: {delay_probability}%
ESTIMATED DELAY: {estimated_delay_weeks} weeks

KEY RISKS:
{risks}

TOP RECOMMENDATIONS:
{recommendations}

Return a JSON object with this exact structure:
{{
  "summary": "3-4 sentence executive summary written for a VP. Include the health score, top risk, predicted outcome, and the single most important action to take."
}}

Be direct. A VP wants facts and actions, not background."""


async def run_executive_agent(findings: dict) -> dict:
    impact = findings.get("impact", {})
    project_context = findings.get("project_context", {})
    
    # Risk level from health score
    health_score = findings.get("health_score", 100)
    if health_score >= 80:
        risk_level = "Low"
    elif health_score >= 60:
        risk_level = "Medium"
    elif health_score >= 40:
        risk_level = "High"
    else:
        risk_level = "Critical"

    # Top 3 risks for summary
    all_risks = findings.get("risks", [])
    top_risks = all_risks[:3] if len(all_risks) >= 3 else all_risks
    
    # Top 2 recommendations
    recs = findings.get("recommendations", [])
    top_recs = recs[:2] if len(recs) >= 2 else recs

    prompt = USER_PROMPT_TEMPLATE.format(
        project_name=project_context.get("project_name", "the project"),
        health_score=health_score,
        risk_level=risk_level,
        delay_probability=impact.get("delay_probability", 0),
        estimated_delay_weeks=impact.get("estimated_delay_weeks", 0.0),
        risks=json.dumps(top_risks, indent=2),
        recommendations=json.dumps(top_recs, indent=2),
    )
    response = await call_llm(system=SYSTEM_PROMPT, user=prompt)
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        return {"summary": "Analysis complete. Please review the detailed risk report."}
