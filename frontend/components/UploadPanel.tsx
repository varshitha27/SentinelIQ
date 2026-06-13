"use client";

import { useState, useRef } from "react";
import type { AnalysisResult } from "@/types/analysis";
import { Upload, FileText, AlertCircle, Loader2 } from "lucide-react";
import clsx from "clsx";

interface Props {
  onResult: (result: AnalysisResult) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

export default function UploadPanel({ onResult, loading, setLoading }: Props) {
  const [projectName, setProjectName] = useState("Project Phoenix");
  const [tasks, setTasks] = useState("");
  const [meetingNotes, setMeetingNotes] = useState("");
  const [projectUpdates, setProjectUpdates] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  const handleFile = async (
    file: File,
    setter: (v: string) => void
  ) => {
    const content = await readFile(file);
    setter(content);
  };

  const loadSampleData = () => {
    setTasks(SAMPLE_TASKS);
    setMeetingNotes(SAMPLE_MEETING_NOTES);
    setProjectUpdates(SAMPLE_UPDATES);
  };

  const handleSubmit = async () => {
    if (!tasks || !meetingNotes || !projectUpdates) {
      setError("Please provide all three data sources before analyzing.");
      return;
    }
    setError(null);
    setLoading(true);
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
      onResult(data);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unexpected error";
      setError(message);
    } finally {
      setLoading(false);
    }
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

      {/* Card */}
      <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-2xl p-8 space-y-6">
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

        {/* Sample data link */}
        <div className="text-center">
          <button
            onClick={loadSampleData}
            className="text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition"
          >
            Use sample data (Project Phoenix demo)
          </button>
        </div>

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
          <p className="text-center text-xs text-[#64748b]">
            Running Risk → Impact → Recommendation → Executive agents…
          </p>
        )}
      </div>
    </div>
  );
}

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

// ── Sample data ──────────────────────────────────────────────────────────────

const SAMPLE_TASKS = `task,status,due_date,owner
Authentication,Delayed,2026-06-10,Backend Team
Payments Integration,Blocked,2026-06-12,Backend Team
Reporting Module,Blocked,2026-06-08,Frontend Team
API Gateway Setup,In Progress,2026-06-14,DevOps
QA Regression Testing,Not Started,2026-06-15,QA Team
Performance Testing,Not Started,2026-06-16,QA Team
Security Audit,Delayed,2026-06-11,Security Team
User Dashboard,In Progress,2026-06-13,Frontend Team`;

const SAMPLE_MEETING_NOTES = `Sprint Planning Meeting - June 3, 2026
Attendees: PM, Backend Lead, QA Lead, Product Owner

Backend team mentioned the vendor API (payment gateway) has been delayed.
Vendor confirmed a 12-day delay in delivering the final API documentation.
QA lead reported team is at 135% capacity - cannot absorb additional test cycles.
Product owner requested a new reporting feature mid-sprint.
Security team flagged that the audit timeline conflicts with the release date.
Backend lead raised concerns about the authentication module - third-party SSO provider 
is requiring additional compliance documentation before granting API access.
Team agreed to escalate vendor dependency to program level.`;

const SAMPLE_UPDATES = `date,update
2026-06-01,Backend API delayed - vendor cited compliance review taking 2 additional weeks
2026-06-02,QA resources flagged as unavailable for week of June 14 due to parallel project
2026-06-03,Requirements changed - product owner added new reporting dashboard to scope
2026-06-04,Authentication blocked - SSO vendor requested additional security documentation
2026-06-05,Payment integration blocked pending vendor API delivery
2026-06-06,Performance testing environment not yet provisioned by DevOps
2026-06-07,Security audit scheduled - conflicts with planned release date`;
