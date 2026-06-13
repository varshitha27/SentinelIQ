"""
Orchestrator: runs agents sequentially and aggregates results.
Each agent is independently callable but the orchestrator
wires them together into a pipeline.
"""
import asyncio
from agents.risk_agent import run_risk_agent
from agents.resource_agent import run_resource_agent
from agents.scope_agent import run_scope_agent
from agents.dependency_agent import run_dependency_agent
from agents.impact_agent import run_impact_agent
from agents.recommendation_agent import run_recommendation_agent
from agents.executive_agent import run_executive_agent
from services.scoring_service import calculate_health_score


async def run_analysis(
    tasks: str,
    meeting_notes: str,
    project_updates: str,
    project_name: str,
) -> dict:
    project_context = {
        "tasks": tasks,
        "meeting_notes": meeting_notes,
        "project_updates": project_updates,
        "project_name": project_name,
    }

    # Stage 1: Run detection agents (can run concurrently)
    risk_result, resource_result, scope_result, dependency_result = await asyncio.gather(
        run_risk_agent(project_context),
        run_resource_agent(project_context),
        run_scope_agent(project_context),
        run_dependency_agent(project_context),
    )

    # Stage 2: Calculate health score from structured findings
    health_score = calculate_health_score(
        risks=risk_result.get("risks", []),
        resource_risks=resource_result.get("resource_risks", []),
        scope_changes=scope_result.get("scope_changes", []),
        dependencies=dependency_result.get("dependencies", []),
    )

    # Combine all findings for downstream agents
    all_findings = {
        "risks": risk_result.get("risks", []),
        "resource_risks": resource_result.get("resource_risks", []),
        "scope_changes": scope_result.get("scope_changes", []),
        "dependencies": dependency_result.get("dependencies", []),
        "health_score": health_score,
        "project_context": project_context,
    }

    # Stage 3: Impact analysis
    impact_result = await run_impact_agent(all_findings)

    # Stage 4: Recommendations
    recommendation_result = await run_recommendation_agent({
        **all_findings,
        "impact": impact_result,
    })

    # Stage 5: Executive summary
    executive_result = await run_executive_agent({
        **all_findings,
        "impact": impact_result,
        "recommendations": recommendation_result.get("recommendations", []),
    })

    # Determine risk level from health score
    if health_score >= 80:
        risk_level = "Low"
    elif health_score >= 60:
        risk_level = "Medium"
    elif health_score >= 40:
        risk_level = "High"
    else:
        risk_level = "Critical"

    # Flatten all risks for the response
    all_risks = (
        risk_result.get("risks", [])
        + [{"name": r, "severity": "Medium", "category": "Resource"} for r in resource_result.get("resource_risks", [])]
        + [{"name": s, "severity": "Medium", "category": "Scope"} for s in scope_result.get("scope_changes", [])]
        + [{"name": d, "severity": "High", "category": "Dependency"} for d in dependency_result.get("dependencies", [])]
    )

    return {
        "health_score": health_score,
        "risk_level": risk_level,
        "predicted_delay_weeks": impact_result.get("estimated_delay_weeks", 0.0),
        "risks": all_risks,
        "recommendations": recommendation_result.get("recommendations", []),
        "executive_summary": executive_result.get("summary", ""),
    }
