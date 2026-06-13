export interface Risk {
  name: string;
  description?: string;
  severity: "High" | "Medium" | "Low";
  category?: string;
}

export interface Recommendation {
  action: string;
  rationale: string;
  priority: "Immediate" | "Short-term" | "Strategic";
  effort: "Low" | "Medium" | "High";
}

export interface TraceStep {
  agent: string;
  icon: string;
  description: string;
  findings: Record<string, unknown>;
  status: string;
}

export interface AnalysisResult {
  health_score: number;
  risk_level: "Low" | "Medium" | "High" | "Critical";
  predicted_delay_weeks: number;
  risks: Risk[];
  recommendations: Recommendation[];
  executive_summary: string;
  reasoning_trace: TraceStep[];
}
