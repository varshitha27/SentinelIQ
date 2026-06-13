"use client";

import { useState } from "react";
import UploadPanel from "@/components/UploadPanel";
import Dashboard from "@/components/Dashboard";
import type { AnalysisResult } from "@/types/analysis";

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <main className="min-h-screen bg-[#0f1117]">
      {/* Header */}
      <header className="border-b border-[#2a2d3e] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg leading-none">
                SentinelIQ
              </h1>
              <p className="text-[#64748b] text-xs mt-0.5">
                AI Project Failure Prediction
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748b] bg-[#1a1d2e] px-3 py-1 rounded-full border border-[#2a2d3e]">
              Powered by Azure AI Foundry
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {!result ? (
          <UploadPanel
            onResult={setResult}
            loading={loading}
            setLoading={setLoading}
          />
        ) : (
          <Dashboard
            result={result}
            onReset={() => setResult(null)}
          />
        )}
      </div>
    </main>
  );
}
