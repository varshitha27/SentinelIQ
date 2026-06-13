from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.analysis import router as analysis_router
import os
import sys

# ── Startup validation ────────────────────────────────────────────────────────
REQUIRED_ENV_VARS = [
    "AZURE_OPENAI_API_KEY",
    "AZURE_OPENAI_ENDPOINT",
    "AZURE_OPENAI_DEPLOYMENT",
]

missing = [v for v in REQUIRED_ENV_VARS if not os.getenv(v)]
if missing:
    print(f"\n❌ Missing required environment variables: {', '.join(missing)}")
    print("   Copy backend/.env.example to backend/.env and fill in your Azure AI Foundry credentials.\n")
    sys.exit(1)

app = FastAPI(
    title="SentinelIQ API",
    description="AI Project Failure Prediction Agent",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router, prefix="/api")


@app.get("/")
def health_check():
    return {"status": "SentinelIQ is running"}
