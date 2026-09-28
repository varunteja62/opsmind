import React from 'react';
import { Brain, CheckCircle2, XCircle, ArrowUpRight, ShieldAlert, Sparkles } from 'lucide-react';

export default function MemorySearchCard({ memory }) {
  const isSuccess = memory.result?.toUpperCase() === 'SUCCESS';
  const relevancePct = Math.round((memory.relevance_score || 0.91) * 100);

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isSuccess 
        ? 'bg-slate-900/70 border-emerald-500/20 hover:border-emerald-500/40' 
        : 'bg-slate-900/70 border-rose-500/20 hover:border-rose-500/40'
    }`}>
      {/* Top Header: Incident ID, Service, Relevance */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
            #{memory.incident_number}
          </span>
          <span className="text-xs text-slate-300 font-medium font-mono">
            {memory.service}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-800 text-xs font-mono font-semibold text-slate-200">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>{relevancePct}% Relevance</span>
          </div>

          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-bold tracking-wider ${
            isSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
          }`}>
            {isSuccess ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            <span>{memory.result}</span>
          </span>
        </div>
      </div>

      {/* Root Cause */}
      <div className="mt-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Root Cause:
        </span>
        <p className="text-xs font-medium text-slate-200 mt-0.5">
          {memory.root_cause}
        </p>
      </div>

      {/* Previous Action Taken */}
      <div className="mt-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Action Taken:
        </span>
        <p className="text-xs text-slate-300 mt-0.5 bg-slate-950/60 p-2 rounded border border-slate-800 font-mono">
          {memory.action_taken}
        </p>
      </div>

      {/* Relevance Explanation */}
      {memory.relevance_explanation && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-start space-x-1.5 text-[11px] text-slate-400">
          <Brain className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
          <span className="italic leading-relaxed">{memory.relevance_explanation}</span>
        </div>
      )}
    </div>
  );
}
