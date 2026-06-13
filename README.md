# SentinelIQ — AI Project Failure Prediction Agent

> Predict delivery risks before they become project failures.

Built for the **Microsoft Agents League Hackathon 2026** · Reasoning Agents Challenge

---

## The Problem

70% of software projects discover critical risks too late — after missed deadlines, budget overruns, and broken stakeholder trust. Project managers rely on gut feel and manual status reports instead of data-driven early warning systems.

## The Solution

SentinelIQ is an autonomous multi-agent AI system that analyzes project data — tasks, meeting notes, and status updates — and predicts delivery risks before they become incidents.

Ask it: *"Analyze Project Phoenix and tell me if we're likely to miss the release date."*

It responds with:
- **Project Health Score** (0–100)
- **Detected Risks** with severity levels
- **Predicted delay** in weeks
- **Ranked recommendations** for corrective action
- **Executive summary** ready for VP-level briefing
- **Full AI reasoning trace** — see exactly what each agent found

---

## Architecture

See [`docs/architecture.html`](docs/architecture.html) for the full visual diagram.

```
User (Project Manager)
        │  tasks.csv · meeting_notes.txt · project_updates.csv
        ▼
Next.js Dashboard (React + Tailwind)
        │  POST /api/analyze
        ▼
FastAPI Backend (Python)
        │
        ▼
Orchestrator Agent
        │
        ├─── Stage 1 (parallel) ──────────────────────────┐
        │    🔍 Risk Agent      👥 Resource Agent          │
        │    📋 Scope Agent     🔗 Dependency Agent        │
        └─────────────────────────────────────────────────┘
        │
        ▼
📊 Scoring Engine  (deterministic health score)
        │
        ▼
⚡ Impact Agent  (delay probability + estimated weeks)
        │
        ▼
💡 Recommendation Agent  (ranked mitigation actions)
        │
        ▼
📄 Executive Agent  (VP-level one-page summary)
        │
        ▼
Azure AI Foundry · GPT-4.1  (all agent reasoning)
```

---

## GitHub Copilot & AI-Assisted Development

SentinelIQ was built using AI-assisted development throughout the entire project lifecycle:

- **Agent prompt engineering** — Copilot and Kiro IDE accelerated the design of structured system prompts for each of the 7 agents, ensuring consistent JSON output and role-specific reasoning
- **FastAPI backend scaffolding** — API routes, Pydantic models, and async orchestration patterns were developed with AI assistance
- **React component development** — Dashboard, reasoning trace panel, and upload UI components built with AI-assisted coding
- **Multi-agent pipeline design** — The sequential + parallel orchestration pattern was refined through iterative AI-assisted development

This project demonstrates how AI-assisted development tools enable building production-quality multi-agent systems faster and more reliably.

---

## Microsoft AI Foundry Integration — Foundry IQ

SentinelIQ integrates **Foundry IQ** via Azure AI Foundry with GPT-4.1 as the core intelligence layer for all agent reasoning. Each of the 7 agents sends a structured system + user prompt and receives JSON-formatted analysis that feeds into the next stage of the pipeline — demonstrating real multi-step agentic reasoning over enterprise project data.

Every LLM call uses:
- `response_format: json_object` for reliable structured output
- `temperature: 0.2` for consistent, deterministic analysis
- Isolated system prompts per agent for separation of concerns

---

## Multi-Agent Workflow

| # | Agent | Role | Input | Output |
|---|-------|------|-------|--------|
| 1 | Risk Agent | Detects delays & blockers | Project data | `risks[]` |
| 2 | Resource Agent | Capacity analysis | Project data | `resource_risks[]` |
| 3 | Scope Agent | Scope creep detection | Project data | `scope_changes[]` |
| 4 | Dependency Agent | External blockers | Project data | `dependencies[]` |
| 5 | Scoring Engine | Health score | All findings | `health_score` |
| 6 | Impact Agent | Delay prediction | All findings + score | `delay_probability`, `estimated_delay_weeks` |
| 7 | Recommendation Agent | Action planning | All findings + impact | `recommendations[]` |
| 8 | Executive Agent | VP briefing | All findings + actions | `executive_summary` |

---

## Demo Scenarios

Three built-in scenarios let you demo the full range instantly — no file upload needed:

| Scenario | Health Score | Story |
|----------|-------------|-------|
| 🟢 Project Apollo | ~85 — Healthy | On track, good velocity, no blockers |
| 🟡 Project Phoenix | ~62 — At Risk | Vendor delay, QA overloaded, scope creep |
| 🔴 Project Titan | ~28 — Critical | DB failure, resignations, contract cancellation threat |

Click any scenario card → **Analyze Project** → see the full AI reasoning in seconds.

---

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 20+
- Azure AI Foundry resource with GPT-4.1 deployed

### Environment Variables

Create `backend/.env` from the example:

```bash
cp backend/.env.example backend/.env
```

| Variable | Where to find it |
|----------|-----------------|
| `AZURE_OPENAI_API_KEY` | Azure Portal → your AI Foundry resource → Keys and Endpoint → KEY 1 |
| `AZURE_OPENAI_ENDPOINT` | Azure Portal → your AI Foundry resource → Keys and Endpoint → Endpoint |
| `AZURE_OPENAI_DEPLOYMENT` | Azure AI Foundry → Models + endpoints → your deployment name |
| `AZURE_OPENAI_API_VERSION` | Use `2024-12-01-preview` |

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS, Recharts |
| Backend | Python, FastAPI, Pydantic, asyncio |
| AI | Azure AI Foundry, GPT-4.1 |
| Agent Orchestration | Custom async Python pipeline |

---

## Future Enhancements

- Jira / Azure DevOps live integration for real task data
- Microsoft Teams notifications for high-severity risk alerts
- Historical sprint trend analysis and burndown prediction
- GitHub commit frequency analysis as a velocity signal
- Multi-project portfolio health dashboard
