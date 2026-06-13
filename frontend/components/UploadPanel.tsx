"use client";

import { useState, useRef } from "react";
import type { AnalysisResult } from "@/types/analysis";
import { Upload, FileText, AlertCircle, Loader2 } from "lucide-react";
import clsx from "clsx";

interface Props {
  onResult: (result: AnalysisResult, projectName: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

// ── Sample datasets (must be declared before SCENARIOS) ──────────────────────

// 🟢 Project Apollo — Healthy (~85)
const APOLLO_TASKS = `task,status,due_date,owner
User Authentication,Completed,2026-06-05,Backend Team
Database Schema,Completed,2026-06-04,Backend Team
API Endpoints,In Progress,2026-06-14,Backend Team
Frontend Components,In Progress,2026-06-13,Frontend Team
Unit Tests,In Progress,2026-06-15,QA Team
Integration Tests,Not Started,2026-06-17,QA Team
CI/CD Pipeline,Completed,2026-06-06,DevOps
Staging Deployment,In Progress,2026-06-16,DevOps`;

const APOLLO_NOTES = `Sprint Review Meeting - June 10, 2026
Attendees: PM, Backend Lead, QA Lead, Frontend Lead

Team velocity is on track. Completed 18 of 20 story points this sprint.
Backend APIs are 80% complete, ahead of schedule by 2 days.
QA team confirmed sufficient capacity for the upcoming test cycle.
No blockers reported across any team.
Frontend lead confirmed all UI components will be ready by end of week.
DevOps confirmed staging environment is stable and deployment pipeline is green.
Product owner satisfied with current scope - no new requirements this sprint.
Team morale is high. Release date looks achievable.`;

const APOLLO_UPDATES = `date,update
2026-06-01,Sprint started smoothly - all team members present and tasks assigned
2026-06-02,Backend team completed database schema ahead of schedule
2026-06-03,Authentication module delivered and passed code review
2026-06-04,CI/CD pipeline configured and all builds passing
2026-06-05,Frontend components 60% complete - on track
2026-06-06,QA team prepared test cases - ready for testing phase
2026-06-07,No blockers - team velocity nominal at 18 story points`;

// 🟡 Project Phoenix — At Risk (~62)
const PHOENIX_TASKS = `task,status,due_date,owner
Authentication,Delayed,2026-06-10,Backend Team
Payments Integration,Blocked,2026-06-12,Backend Team
Reporting Module,Blocked,2026-06-08,Frontend Team
API Gateway Setup,In Progress,2026-06-14,DevOps
QA Regression Testing,Not Started,2026-06-15,QA Team
Performance Testing,Not Started,2026-06-16,QA Team
Security Audit,Delayed,2026-06-11,Security Team
User Dashboard,In Progress,2026-06-13,Frontend Team`;

const PHOENIX_NOTES = `Sprint Planning Meeting - June 3, 2026
Attendees: PM, Backend Lead, QA Lead, Product Owner

Backend team mentioned the vendor API (payment gateway) has been delayed.
Vendor confirmed a 12-day delay in delivering the final API documentation.
QA lead reported team is at 135% capacity - cannot absorb additional test cycles.
Product owner requested a new reporting feature mid-sprint.
Security team flagged that the audit timeline conflicts with the release date.
Backend lead raised concerns about the authentication module - third-party SSO provider
is requiring additional compliance documentation before granting API access.
Team agreed to escalate vendor dependency to program level.`;

const PHOENIX_UPDATES = `date,update
2026-06-01,Backend API delayed - vendor cited compliance review taking 2 additional weeks
2026-06-02,QA resources flagged as unavailable for week of June 14 due to parallel project
2026-06-03,Requirements changed - product owner added new reporting dashboard to scope
2026-06-04,Authentication blocked - SSO vendor requested additional security documentation
2026-06-05,Payment integration blocked pending vendor API delivery
2026-06-06,Performance testing environment not yet provisioned by DevOps
2026-06-07,Security audit scheduled - conflicts with planned release date`;

// 🔴 Project Titan — Critical (~28)
const TITAN_TASKS = `task,status,due_date,owner
Core Architecture,Blocked,2026-05-28,Backend Team
Database Migration,Failed,2026-05-30,Backend Team
Authentication System,Blocked,2026-05-29,Backend Team
Payment Gateway,Blocked,2026-06-01,Backend Team
Frontend App,Not Started,2026-06-10,Frontend Team
API Integration,Blocked,2026-06-02,Backend Team
QA Environment,Not Started,2026-06-12,QA Team
Security Review,Blocked,2026-06-03,Security Team
Load Testing,Not Started,2026-06-14,QA Team
Production Deployment,Not Started,2026-06-15,DevOps`;

const TITAN_NOTES = `Emergency Project Review - June 8, 2026
Attendees: CTO, PM, Backend Lead, QA Lead, Product Owner, Security Lead

CRITICAL: Database migration failed and corrupted 3 tables in staging environment.
Backend team is 3 weeks behind schedule with no clear recovery plan.
Two senior backend engineers resigned last week - team now has critical skill gap.
Third-party payment vendor terminated contract due to compliance issues.
Product owner has added 14 new requirements in the past 2 weeks.
QA environment has not been provisioned - QA team is completely idle.
Security audit revealed 4 critical vulnerabilities in the authentication module.
Infrastructure costs are 240% over budget due to misconfiguration.
Client has threatened to cancel contract if release date slips further.
CTO requested immediate escalation to executive team.
No contingency plan exists for any of the identified blockers.`;

const TITAN_UPDATES = `date,update
2026-06-01,Database migration failed - data corruption detected in staging environment
2026-06-02,Two senior engineers resigned - backend team lost 40% of capacity overnight
2026-06-03,Payment vendor terminated contract - no alternative vendor identified yet
2026-06-04,14 new requirements added by product owner - scope increased by 60%
2026-06-05,QA environment still not provisioned - QA team blocked for 2 weeks
2026-06-06,Security audit failed - 4 critical vulnerabilities found in auth module
2026-06-07,Infrastructure costs at 240% of budget - DevOps misconfiguration identified
2026-06-08,Client issued formal warning - contract cancellation threatened if delay exceeds 1 week`;

// ── Scenario definitions ─────────────────────────────────────────────────────

const SCENARIOS = [
  {
    id: "apollo" as const,
    name: "Project Apollo",
    label: "Healthy",
    expectedScore: "~85",
    color: "emerald" as const,
    emoji: "🟢",
    description: "On track. Good velocity, no blockers.",
    tasks: APOLLO_TASKS,
    meeting_notes: APOLLO_NOTES,
    project_updates: APOLLO_UPDATES,
  },
  {
    id: "phoenix" as const,
    name: "Project Phoenix",
    label: "At Risk",
    expectedScore: "~62",
    color: "amber" as const,
    emoji: "🟡",
    description: "Vendor delays, QA capacity issues, scope creep.",
    tasks: PHOENIX_TASKS,
    meeting_notes: PHOENIX_NOTES,
    project_updates: PHOENIX_UPDATES,
  },
  {
    id: "titan" as const,
    name: "Project Titan",
    label: "Critical",
    expectedScore: "~28",
    color: "red" as const,
    emoji: "🔴",
    description: "DB failure, resignations, contract cancellation threat.",
    tasks: TITAN_TASKS,
    meeting_notes: TITAN_NOTES,
    project_updates: TITAN_UPDATES,
  },
];

type ScenarioId = "apollo" | "phoenix" | "titan";

// ── Component ────────────────────────────────────────────────────────────────

export default function UploadPanel({ onResult, loading, setLoading }: Props) {
  const [projectName, setProjectName] = useState("Project Phoenix");
  const [tasks, setTasks] = useState("");
  const [meetingNotes, setMeetingNotes] = useState("");
  const [projectUpdates, setProjectUpdates] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<ScenarioId | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const tasksRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLInputElement>(null);
  const updatesRef = useRef<HTMLInputElement>(null);

  const readFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });

  const handleFile = async (file: File, setter: (v: string) => void) => {
    const content = await readFile(file);
    setter(content);
    setActiveScenario(null);
  };

  const loadScenario = (id: ScenarioId) => {
    const s = SCENARIOS.find((s) => s.id === id)!;
    setProjectName(s.name);
    setTasks(s.tasks);
    setMeetingNotes(s.meeting_notes);
    setProjectUpdates(s.project_updates);
    setActiveScenario(id);
    setError(null);
  };

  const LOADING_STEPS = [
    "🔍 Risk Agent scanning for delays and blockers…",
    "👥 Resource Agent checking team capacity…",
    "📋 Scope Agent detecting requirement changes…",
    "🔗 Dependency Agent mapping external blockers…",
    "📊 Scoring Engine calculating health score…",
    "⚡ Impact Agent predicting delay probability…",
    "💡 Recommendation Agent generating actions…",
    "📄 Executive Agent writing VP briefing…",
  ];

  const handleSubmit = async () => {
    if (!tasks || !meetingNotes || !projectUpdates) {
      setError("Please load a scenario or upload files before analyzing.");
      return;
    }
    setError(null);
    setLoading(true);
    setLoadingStep(0);

    // Animate through agent steps while waiting for the real API
    const stepInterval = setInterval(() => {
      setLoadingStep((s) => (s < LOADING_STEPS.length - 1 ? s + 1 : s));
    }, 1800);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: projectName,
          tasks,
          meeting_notes: meetingNotes,
          project_updates: projectUpdates,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Analysis failed");
      }
      const data: AnalysisResult = await res.json();
      onResult(data, projectName);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unexpected error";
      setError(message);
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const colorMap = {
    emerald: {
      card: "border-emerald-700/50 bg-emerald-950/20",
      badge: "bg-emerald-900/50 text-emerald-300 border-emerald-700/40",
      score: "text-emerald-400",
    },
    amber: {
      card: "border-amber-700/50 bg-amber-950/20",
      badge: "bg-amber-900/50 text-amber-300 border-amber-700/40",
      score: "text-amber-400",
    },
    red: {
      card: "border-red-700/50 bg-red-950/20",
      badge: "bg-red-900/50 text-red-300 border-red-700/40",
      score: "text-red-400",
    },
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-3">
          Predict Project Failure Before It Happens
        </h2>
        <p className="text-[#64748b] text-base">
          Upload your project data and SentinelIQ&apos;s multi-agent AI will
          analyze risks, predict delays, and recommend actions.
        </p>
      </div>

      <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-2xl p-8 space-y-6">

        {/* Scenario picker */}
        <div>
          <p className="text-xs text-[#64748b] font-medium mb-3 uppercase tracking-wide">
            Demo Scenarios — pick one to load instantly
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SCENARIOS.map((s) => {
              const styles = colorMap[s.color];
              const isActive = activeScenario === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => loadScenario(s.id)}
                  className={clsx(
                    "text-left p-4 rounded-xl border-2 transition",
                    isActive
                      ? styles.card + " ring-2 ring-offset-1 ring-offset-[#1a1d2e] ring-indigo-500"
                      : "border-[#2a2d3e] bg-[#0f1117] hover:border-[#3a3d4e]"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base">{s.emoji}</span>
                    <span
                      className={clsx(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                        styles.badge
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white">{s.name}</p>
                  <p className={clsx("text-lg font-bold mt-0.5", styles.score)}>
                    {s.expectedScore}
                  </p>
                  <p className="text-[11px] text-[#64748b] mt-1 leading-tight">
                    {s.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#2a2d3e]" />
          <span className="text-xs text-[#4a4d5e]">or upload your own files</span>
          <div className="flex-1 h-px bg-[#2a2d3e]" />
        </div>

        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Project Name
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-2.5 text-white placeholder-[#64748b] focus:outline-none focus:border-indigo-500 transition"
            placeholder="e.g. Project Phoenix"
          />
        </div>

        {/* File uploads */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FileUploadCard
            label="Tasks CSV"
            hint="task, status, due_date"
            inputRef={tasksRef}
            value={tasks}
            onChange={(f) => handleFile(f, setTasks)}
            icon={<FileText size={20} />}
          />
          <FileUploadCard
            label="Meeting Notes"
            hint=".txt file"
            inputRef={notesRef}
            value={meetingNotes}
            onChange={(f) => handleFile(f, setMeetingNotes)}
            icon={<FileText size={20} />}
          />
          <FileUploadCard
            label="Project Updates CSV"
            hint="date, update"
            inputRef={updatesRef}
            value={projectUpdates}
            onChange={(f) => handleFile(f, setProjectUpdates)}
            icon={<FileText size={20} />}
          />
        </div>

        {/* Download links */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-[#4a4d5e]">Download samples:</span>
          {[
            { href: "/sample-data/phoenix/tasks.csv", label: "tasks.csv" },
            { href: "/sample-data/phoenix/meeting_notes.txt", label: "meeting_notes.txt" },
            { href: "/sample-data/phoenix/project_updates.csv", label: "project_updates.csv" },
          ].map((f) => (
            <a
              key={f.href}
              href={f.href}
              download={f.label}
              className="text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-950/30 border border-indigo-800/40 px-3 py-1.5 rounded-lg transition"
            >
              ⬇ {f.label}
            </a>
          ))}
        </div>

        {/* Status indicator */}
        {(tasks || meetingNotes || projectUpdates) && (
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {activeScenario
              ? `${SCENARIOS.find((s) => s.id === activeScenario)?.name} loaded and ready`
              : "Custom files loaded — ready to analyze"}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 text-red-400 bg-red-950/30 border border-red-800/50 rounded-lg px-4 py-3 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Analyze button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={clsx(
            "w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white transition",
            loading
              ? "bg-indigo-700 cursor-not-allowed opacity-70"
              : "bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98]"
          )}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Analyzing with AI agents…
            </>
          ) : (
            <>
              <Upload size={18} />
              Analyze Project
            </>
          )}
        </button>

        {loading && (
          <div className="bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-3">
            <p className="text-xs text-indigo-300 font-medium animate-pulse">
              {LOADING_STEPS[loadingStep]}
            </p>
            <div className="mt-2 h-1 bg-[#2a2d3e] rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── File upload card ─────────────────────────────────────────────────────────

function FileUploadCard({
  label,
  hint,
  inputRef,
  value,
  onChange,
  icon,
}: {
  label: string;
  hint: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (f: File) => void;
  icon: React.ReactNode;
}) {
  const hasFile = value.length > 0;
  return (
    <div
      onClick={() => inputRef.current?.click()}
      className={clsx(
        "relative cursor-pointer rounded-xl border-2 border-dashed p-4 flex flex-col items-center gap-2 transition",
        hasFile
          ? "border-indigo-500 bg-indigo-950/20"
          : "border-[#2a2d3e] hover:border-[#3a3d4e] bg-[#0f1117]"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".csv,.txt,.md"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(f);
        }}
      />
      <div
        className={clsx(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          hasFile ? "bg-indigo-500/20 text-indigo-400" : "bg-[#1a1d2e] text-[#64748b]"
        )}
      >
        {icon}
      </div>
      <div className="text-center">
        <p className={clsx("text-sm font-medium", hasFile ? "text-indigo-300" : "text-slate-300")}>
          {hasFile ? "✓ Loaded" : label}
        </p>
        <p className="text-xs text-[#64748b] mt-0.5">{hint}</p>
      </div>
    </div>
  );
}
