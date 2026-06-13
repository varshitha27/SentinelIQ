"use client";

import type { AnalysisResult, Risk, Recommendation } from "@/types/analysis";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { ArrowLeft, AlertTriangle, CheckCircle, Clock, TrendingDown, Zap, FileText } from "lucide-react";
import clsx from "clsx";

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

export default function Dashboard({ result, onReset }: Props) {
  const {
    health_score,
    risk_level,
    predicted_delay_weeks,
    risks,
    recommendations,
    executive_summary,
  } = result;

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-sm text-[#64748b] hover:text-slate-300 transition"
        >
          <ArrowLeft size={16} />
          New Analysis
        </button>
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
          value={`${predicted_delay_weeks.toFixed(1)} weeks`}
          icon={<Clock size={18} />}
          color="text-amber-400"
        />
        <KpiCard
          label="Risks Detected"
          value={String(risks.length)}
          icon={<TrendingDown size={18} />}
          color="text-red-400"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risks */}
        <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-2xl p-6">
          <h3 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400" />
            Detected Risks
          </h3>
          <div className="space-y-3">
            {risks.length === 0 && (
              <p className="text-[#64748b] text-sm">No risks detected.</p>
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
          <span className="text-xs text-[#64748b] font-normal ml-1">
            VP-level briefing
          </span>
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed">{executive_summary}</p>
      </div>

      {/* Agent pipeline trace */}
      <AgentPipeline />
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

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
      <div>
        <p className="text-sm font-medium text-slate-200">{risk.name}</p>
        {risk.description && (
          <p className="text-xs text-[#64748b] mt-0.5">{risk.description}</p>
        )}
        {risk.category && (
          <p className="text-xs text-[#4a4d5e] mt-0.5">{risk.category}</p>
        )}
      </div>
    </div>
  );
}

function RecommendationCard({
  rec,
  index,
}: {
  rec: Recommendation;
  index: number;
}) {
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

function AgentPipeline() {
  const agents = [
    { name: "Risk Agent", icon: "🔍", desc: "Detects delays & blockers" },
    { name: "Resource Agent", icon: "👥", desc: "Capacity analysis" },
    { name: "Scope Agent", icon: "📋", desc: "Scope creep detection" },
    { name: "Dependency Agent", icon: "🔗", desc: "External blockers" },
    { name: "Impact Agent", icon: "📊", desc: "Delay prediction" },
    { name: "Recommendation Agent", icon: "⚡", desc: "Action planning" },
    { name: "Executive Agent", icon: "📄", desc: "VP briefing" },
  ];

  return (
    <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle size={16} className="text-emerald-400" />
        <h3 className="text-white font-semibold text-base">
          Multi-Agent Pipeline
        </h3>
        <span className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full ml-1">
          Complete
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {agents.map((agent, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2"
          >
            <span className="text-base">{agent.icon}</span>
            <div>
              <p className="text-xs font-medium text-slate-300">{agent.name}</p>
              <p className="text-[10px] text-[#64748b]">{agent.desc}</p>
            </div>
            <CheckCircle size={12} className="text-emerald-400 ml-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

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
