"""
Orchestrator: runs agents sequentially and aggregates results.
Also collects a reasoning trace from each agent for transparency.
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

    reasoning_trace = []

    # Stage 1: Detection agents run concurrently
    risk_result, resource_result, scope_result, dependency_result = await asyncio.gather(
        run_risk_agent(project_context),
        run_resource_agent(project_context),
        run_scope_agent(project_context),
        run_dependency_agent(project_context),
    )

    reasoning_trace.append({
        "agent": "Risk Agent",
        "icon": "🔍",
        "description": "Scanned tasks and updates for delays, blockers, and critical path risks",
        "findings": risk_result,
        "status": "complete",
    })
    reasoning_trace.append({
        "agent": "Resource Agent",
        "icon": "👥",
        "description": "Analyzed team capacity, skill gaps, and workload distribution",
        "findings": resource_result,
        "status": "complete",
    })
    reasoning_trace.append({
        "agent": "Scope Agent",
        "icon": "📋",
        "description": "Detected scope creep indicators and requirement volatility",
        "findings": scope_result,
        "status": "complete",
    })
    reasoning_trace.append({
        "agent": "Dependency Agent",
        "icon": "🔗",
        "description": "Identified external blockers, vendor risks, and inter-team dependencies",
        "findings": dependency_result,
        "status": "complete",
    })

    # Stage 2: Health score (deterministic, no LLM)
    health_score = calculate_health_score(
        risks=risk_result.get("risks", []),
        resource_risks=resource_result.get("resource_risks", []),
        scope_changes=scope_result.get("scope_changes", []),
        dependencies=dependency_result.get("dependencies", []),
    )

    reasoning_trace.append({
        "agent": "Scoring Engine",
        "icon": "📊",
        "description": "Calculated deterministic health score from weighted risk factors",
        "findings": {
            "health_score": health_score,
            "formula": "100 - (delays×10) - (blockers×15) - (scope_changes×8) - (dependencies×10) - (resource_issues×12)",
        },
        "status": "complete",
    })

    # Combine all findings
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

    reasoning_trace.append({
        "agent": "Impact Agent",
        "icon": "⚡",
        "description": "Quantified delay probability and estimated delivery impact from combined findings",
        "findings": impact_result,
        "status": "complete",
    })

    # Stage 4: Recommendations
    recommendation_result = await run_recommendation_agent({
        **all_findings,
        "impact": impact_result,
    })

    reasoning_trace.append({
        "agent": "Recommendation Agent",
        "icon": "💡",
        "description": "Generated ranked mitigation actions prioritized by impact and effort",
        "findings": recommendation_result,
        "status": "complete",
    })

    # Stage 5: Executive summary
    executive_result = await run_executive_agent({
        **all_findings,
        "impact": impact_result,
        "recommendations": recommendation_result.get("recommendations", []),
    })

    reasoning_trace.append({
        "agent": "Executive Agent",
        "icon": "📄",
        "description": "Synthesized all findings into a VP-level executive briefing",
        "findings": executive_result,
        "status": "complete",
    })

    # Risk level from health score
    if health_score >= 80:
        risk_level = "Low"
    elif health_score >= 60:
        risk_level = "Medium"
    elif health_score >= 40:
        risk_level = "High"
    else:
        risk_level = "Critical"

    # Flatten all risks
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
        "reasoning_trace": reasoning_trace,
    }
