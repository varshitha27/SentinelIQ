# SentinelIQ — AI Project Failure Prediction Agent

> Predict delivery risks before they become project failures.

## Problem Statement

70% of projects discover risks too late. By the time a project manager realizes the release is in danger, it's already too late to course-correct without significant cost. SentinelIQ changes that.

## Solution

SentinelIQ is an autonomous multi-agent AI system that analyzes project data — tasks, meeting notes, and status updates — and predicts delivery risks before they become incidents. It generates a health score, identifies specific risks, estimates delay probability, and recommends corrective actions.

## Architecture

```
Frontend (Next.js + Tailwind)
        |
FastAPI Backend
        |
Orchestrator Agent
        |
 ┌──────┬──────────┬───────────┬──────────────┐
Risk  Resource  Scope  Dependency  (parallel)
        |
Impact Agent
        |
Recommendation Agent
        |
Executive Summary Agent
```

## Microsoft AI Foundry Integration

SentinelIQ leverages **Azure AI Foundry** with GPT-4.1 to perform multi-agent project risk reasoning and executive decision support. Each agent sends a structured prompt to GPT-4.1 and receives JSON-formatted analysis that feeds into the next stage of the pipeline.

## Multi-Agent Workflow

1. **Risk Agent** — Detects delays, blockers, and dependencies
2. **Resource Agent** — Identifies team capacity issues
3. **Scope Agent** — Spots scope creep indicators
4. **Dependency Agent** — Flags external blockers and vendor risks
5. **Impact Agent** — Predicts delay likelihood and estimated weeks
6. **Recommendation Agent** — Generates ranked mitigation actions
7. **Executive Summary Agent** — Produces a VP-ready one-page summary

## Demo

Upload three files:
- `tasks.csv` — task list with statuses and due dates
- `meeting_notes.txt` — raw meeting notes
- `project_updates.csv` — daily project status updates

Click **Analyze Project** and get a full risk report in seconds.

## Setup Instructions

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt
cp .env.example .env       # add your Azure AI Foundry key
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Future Enhancements

- Jira / Azure DevOps integration for live task data
- Microsoft Teams notifications for high-severity risks
- Historical trend analysis across multiple sprints
- Slack integration for daily health score reports
