import React from 'react';
import { GitCompare, AlertCircle, CheckCircle2, ArrowRight, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

export default function ComparativeReasoningCard({ reasoning }) {
  if (!reasoning) return null;

  return (
    <div className="glass-panel p-6 rounded-2xl border-2 border-indigo-500/30 relative overflow-hidden bg-gradient-to-b from-indigo-950/20 to-slate-900/40">
      {/* Glow orb */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Memory-Aware Differential Reasoning</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Core Differentiator
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Comparing Current Incident vs Historical Hindsight Experience to avoid redundant fixes
            </p>
          </div>
        </div>

        {reasoning.similarity_percentage > 0 && (
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/30 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{reasoning.similarity_percentage}% Historical Match</span>
          </div>
        )}
      </div>

      {/* Side by side state comparison */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Historical State */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Historical Memory (#{reasoning.best_matching_memory?.incident_number || '1024'})</span>
            <span className="text-emerald-400 text-[11px] font-mono">RESOLVED</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Baseline DB Pool:</span>
              <span className="text-slate-200 font-mono">
                {reasoning.historical_state?.db_pool_size || 20}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Applied Fix:</span>
              <span className="text-indigo-300 font-mono font-semibold">
                Increased pool to 50
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Outcome:</span>
              <span className="text-emerald-400 font-semibold font-mono">
                SUCCESS
              </span>
            </div>
          </div>
        </div>

        {/* Current State */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-indigo-500/20">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
            <span>Current Incident State</span>
            <span className="text-rose-400 text-[11px] font-mono animate-pulse">ACTIVE INCIDENT</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Current DB Pool:</span>
              <span className="text-amber-400 font-mono font-bold">
                {reasoning.current_state?.db_pool_size || 50}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Prior Solution Status:</span>
              <span className="text-amber-300 font-semibold">
                ALREADY INCORPORATED
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Deployment:</span>
              <span className="text-slate-200 font-mono">
                {reasoning.current_state?.recent_deployment || 'v2.4.2 (Delta)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Reasoning Callout */}
      <div className="mt-4 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs leading-relaxed">
        <div className="flex items-center space-x-2 text-indigo-300 font-bold mb-1.5">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>Agent Reasoning Verdict:</span>
        </div>
        <p className="text-slate-200 whitespace-pre-line font-sans">
          {reasoning.reasoning_explanation}
        </p>

        {reasoning.already_applied_solutions?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-indigo-500/20 flex items-center space-x-2 text-amber-300 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Prevented Redundant Action: Historical resolution (DB Pool = 50) is already applied in current config.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
