from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.orchestrator import run_analysis

router = APIRouter()


class AnalysisRequest(BaseModel):
    tasks: str
    meeting_notes: str
    project_updates: str
    project_name: str = "Project Phoenix"


class AnalysisResponse(BaseModel):
    health_score: int
    risk_level: str
    predicted_delay_weeks: float
    risks: list
    recommendations: list
    executive_summary: str


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_project(request: AnalysisRequest):
    try:
        result = await run_analysis(
            tasks=request.tasks,
            meeting_notes=request.meeting_notes,
            project_updates=request.project_updates,
            project_name=request.project_name,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
