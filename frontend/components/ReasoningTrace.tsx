"use client";

import { useState } from "react";
import type { TraceStep } from "@/types/analysis";
import { ChevronDown, ChevronRight, Brain, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

interface Props {
  trace: TraceStep[];
}

export default function ReasoningTrace({ trace }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-2xl overflow-hidden">
      {/* Header — click to collapse entire panel */}
      <button
        onClick={() => setPanelOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#1f2235] transition"
      >
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-indigo-400" />
          <h3 className="text-white font-semibold text-base">
            AI Reasoning Trace
          </h3>
          <span className="text-xs text-indigo-300 bg-indigo-950/40 border border-indigo-800/40 px-2 py-0.5 rounded-full ml-1">
            {trace.length} agents
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#64748b]">
            {panelOpen ? "collapse" : "expand"}
          </span>
          {panelOpen ? (
            <ChevronDown size={16} className="text-[#64748b]" />
          ) : (
            <ChevronRight size={16} className="text-[#64748b]" />
          )}
        </div>
      </button>

      {panelOpen && (
        <div className="px-6 pb-6 space-y-2">
          {/* Pipeline flow indicator */}
          <div className="flex items-center gap-1 mb-4 flex-wrap">
            {trace.map((step, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="text-xs text-[#64748b] bg-[#0f1117] border border-[#2a2d3e] px-2 py-0.5 rounded">
                  {step.icon} {step.agent}
                </span>
                {i < trace.length - 1 && (
                  <span className="text-[#4a4d5e] text-xs">→</span>
                )}
              </div>
            ))}
          </div>

          {/* Individual agent steps */}
          {trace.map((step, i) => (
            <TraceStepCard
              key={i}
              step={step}
              index={i}
              isExpanded={expanded === i}
              onToggle={() => setExpanded(expanded === i ? null : i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TraceStepCard({
  step,
  index,
  isExpanded,
  onToggle,
}: {
  step: TraceStep;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const findingsSummary = summarizeFindings(step.findings);

  return (
    <div className="border border-[#2a2d3e] rounded-xl overflow-hidden">
      {/* Step header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 bg-[#0f1117] hover:bg-[#141722] transition text-left"
      >
        {/* Step number */}
        <div className="w-6 h-6 rounded-full bg-indigo-900/60 border border-indigo-700/40 flex items-center justify-center shrink-0">
          <span className="text-indigo-300 text-[10px] font-bold">{index + 1}</span>
        </div>

        {/* Icon + name */}
        <span className="text-base shrink-0">{step.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-200">{step.agent}</p>
            <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
          </div>
          <p className="text-xs text-[#64748b] truncate">{step.description}</p>
        </div>

        {/* Summary pill */}
        {findingsSummary && (
          <span className="text-xs text-slate-400 bg-[#1a1d2e] border border-[#2a2d3e] px-2 py-0.5 rounded shrink-0 hidden sm:block">
            {findingsSummary}
          </span>
        )}

        {/* Expand chevron */}
        {isExpanded ? (
          <ChevronDown size={14} className="text-[#64748b] shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-[#64748b] shrink-0" />
        )}
      </button>

      {/* Expanded findings */}
      {isExpanded && (
        <div className="px-4 py-3 border-t border-[#2a2d3e] bg-[#0a0d14]">
          <p className="text-xs text-[#64748b] font-medium mb-2 uppercase tracking-wide">
            Raw Agent Output
          </p>
          <pre className="text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed font-mono bg-[#0f1117] border border-[#2a2d3e] rounded-lg p-3">
            {JSON.stringify(step.findings, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function summarizeFindings(findings: Record<string, unknown>): string {
  // Risk agent
  if (Array.isArray(findings.risks)) {
    return `${findings.risks.length} risk${findings.risks.length !== 1 ? "s" : ""} found`;
  }
  // Resource agent
  if (Array.isArray(findings.resource_risks)) {
    return `${findings.resource_risks.length} resource issue${findings.resource_risks.length !== 1 ? "s" : ""}`;
  }
  // Scope agent
  if (Array.isArray(findings.scope_changes)) {
    return `${findings.scope_changes.length} scope change${findings.scope_changes.length !== 1 ? "s" : ""}`;
  }
  // Dependency agent
  if (Array.isArray(findings.dependencies)) {
    return `${findings.dependencies.length} dependency blocker${findings.dependencies.length !== 1 ? "s" : ""}`;
  }
  // Scoring engine
  if (typeof findings.health_score === "number") {
    return `Score: ${findings.health_score}/100`;
  }
  // Impact agent
  if (typeof findings.delay_probability === "number") {
    return `${findings.delay_probability}% delay probability`;
  }
  // Recommendation agent
  if (Array.isArray(findings.recommendations)) {
    return `${findings.recommendations.length} action${findings.recommendations.length !== 1 ? "s" : ""} generated`;
  }
  // Executive agent
  if (typeof findings.summary === "string") {
    return "Summary ready";
  }
  return "";
}
