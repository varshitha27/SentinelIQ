"use client";

import type { AnalysisResult, Risk, Recommendation } from "@/types/analysis";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { ArrowLeft, AlertTriangle, Clock, TrendingDown, Zap, FileText } from "lucide-react";
import ReasoningTrace from "@/components/ReasoningTrace";
import clsx from "clsx";

interface Props {
  result: AnalysisResult;
  projectName: string;
  onReset: () => void;
}

export default function Dashboard({ result, projectName, onReset }: Props) {
  const {
    health_score,
    risk_level,
    predicted_delay_weeks,
    risks,
    recommendations,
    executive_summary,
    reasoning_trace,
  } = result;

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-sm text-[#64748b] hover:text-slate-300 transition"
          >
            <ArrowLeft size={16} />
            New Analysis
          </button>
          <div>
            <h2 className="text-white font-bold text-xl leading-tight">{projectName}</h2>
            <p className="text-[#64748b] text-xs">Risk Analysis Report</p>
          </div>
        </div>
        <span className="text-xs text-[#64748b] bg-[#1a1d2e] px-3 py-1 rounded-full border border-[#2a2d3e]">
          Powered by Azure AI Foundry · GPT-4.1
        </span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <HealthScoreCard score={health_score} />
        <KpiCard
          label="Risk Level"
          value={risk_level}
          icon={<AlertTriangle size={18} />}
          color={riskColor(risk_level)}
        />
        <KpiCard
          label="Predicted Delay"
          value={predicted_delay_weeks > 0 ? `${predicted_delay_weeks.toFixed(1)} weeks` : "On track"}
          icon={<Clock size={18} />}
          color={predicted_delay_weeks > 0 ? "text-amber-400" : "text-emerald-400"}
        />
        <KpiCard
          label="Risks Detected"
          value={String(risks.length)}
          icon={<TrendingDown size={18} />}
          color={risks.length > 5 ? "text-red-400" : risks.length > 2 ? "text-amber-400" : "text-emerald-400"}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risks */}
        <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-2xl p-6">
          <h3 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400" />
            Detected Risks
            <span className="text-xs text-[#64748b] font-normal ml-auto">{risks.length} found</span>
          </h3>
          <div className="space-y-3">
            {risks.length === 0 && (
              <p className="text-[#64748b] text-sm">No significant risks detected.</p>
            )}
            {risks.map((risk, i) => (
              <RiskCard key={i} risk={risk} />
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-2xl p-6">
          <h3 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
            <Zap size={16} className="text-indigo-400" />
            Recommended Actions
            <span className="text-xs text-[#64748b] font-normal ml-auto">{recommendations.length} actions</span>
          </h3>
          <div className="space-y-3">
            {recommendations.length === 0 && (
              <p className="text-[#64748b] text-sm">No recommendations generated.</p>
            )}
            {recommendations.map((rec, i) => (
              <RecommendationCard key={i} rec={rec} index={i + 1} />
            ))}
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-2xl p-6">
        <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
          <FileText size={16} className="text-emerald-400" />
          Executive Summary
          <span className="text-xs text-[#64748b] font-normal ml-1">VP-level briefing</span>
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed">{executive_summary}</p>
      </div>

      {/* Reasoning Trace */}
      {reasoning_trace && reasoning_trace.length > 0 && (
        <ReasoningTrace trace={reasoning_trace} />
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function HealthScoreCard({ score }: { score: number }) {
  const data = [{ value: score, fill: scoreColor(score) }];
  return (
    <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-2xl p-5 flex flex-col items-center justify-center">
      <p className="text-xs text-[#64748b] font-medium mb-1">Health Score</p>
      <div className="relative w-28 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" background={{ fill: "#2a2d3e" }} cornerRadius={8} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{score}</span>
          <span className="text-[10px] text-[#64748b]">/ 100</span>
        </div>
      </div>
      <p className={clsx("text-xs font-semibold mt-1", scoreLabel(score).color)}>
        {scoreLabel(score).text}
      </p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-2xl p-5 flex flex-col justify-between">
      <div className={clsx("mb-3", color)}>{icon}</div>
      <div>
        <p className={clsx("text-2xl font-bold", color)}>{value}</p>
        <p className="text-xs text-[#64748b] mt-1">{label}</p>
      </div>
    </div>
  );
}

function RiskCard({ risk }: { risk: Risk }) {
  const severityStyles = {
    High: "bg-red-950/40 border-red-800/40 text-red-400",
    Medium: "bg-amber-950/40 border-amber-800/40 text-amber-400",
    Low: "bg-slate-800/40 border-slate-700/40 text-slate-400",
  };
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0f1117] border border-[#2a2d3e]">
      <span
        className={clsx(
          "text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 mt-0.5",
          severityStyles[risk.severity] || severityStyles.Medium
        )}
      >
        {risk.severity}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-200">{risk.name}</p>
        {risk.description && (
          <p className="text-xs text-[#64748b] mt-0.5">{risk.description}</p>
        )}
        {risk.category && (
          <span className="text-[10px] text-[#4a4d5e] bg-[#1a1d2e] border border-[#2a2d3e] px-1.5 py-0.5 rounded mt-1 inline-block">
            {risk.category}
          </span>
        )}
      </div>
    </div>
  );
}

function RecommendationCard({ rec, index }: { rec: Recommendation; index: number }) {
  const priorityStyles = {
    Immediate: "text-red-400 bg-red-950/30 border-red-800/40",
    "Short-term": "text-amber-400 bg-amber-950/30 border-amber-800/40",
    Strategic: "text-indigo-400 bg-indigo-950/30 border-indigo-800/40",
  };
  return (
    <div className="p-3 rounded-xl bg-[#0f1117] border border-[#2a2d3e]">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-indigo-900/60 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-indigo-300 text-xs font-bold">{index}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200">{rec.action}</p>
          <p className="text-xs text-[#64748b] mt-1">{rec.rationale}</p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={clsx(
                "text-xs px-2 py-0.5 rounded-full border font-medium",
                priorityStyles[rec.priority] || priorityStyles["Short-term"]
              )}
            >
              {rec.priority}
            </span>
            <span className="text-xs text-[#64748b]">Effort: {rec.effort}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function riskColor(level: string) {
  switch (level) {
    case "Critical": return "text-red-500";
    case "High": return "text-red-400";
    case "Medium": return "text-amber-400";
    default: return "text-emerald-400";
  }
}

function scoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#ef4444";
  return "#dc2626";
}

function scoreLabel(score: number): { text: string; color: string } {
  if (score >= 80) return { text: "Healthy", color: "text-emerald-400" };
  if (score >= 60) return { text: "At Risk", color: "text-amber-400" };
  if (score >= 40) return { text: "High Risk", color: "text-red-400" };
  return { text: "Critical", color: "text-red-500" };
}
