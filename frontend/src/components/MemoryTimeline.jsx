import React from 'react';
import { Calendar, CheckCircle2, XCircle, ArrowRight, Brain, Server, ShieldCheck } from 'lucide-react';

export default function MemoryTimeline({ memories = [] }) {
  if (!memories.length) {
    return (
      <div className="glass-panel p-8 text-center rounded-2xl text-slate-400">
        <Brain className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No historical memories recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative border-l-2 border-indigo-500/30 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8">
        {memories.map((mem, idx) => {
          const isSuccess = mem.result?.toUpperCase() === 'SUCCESS';
          return (
            <div key={mem.id || idx} className="relative group">
              {/* Timeline marker node */}
              <div className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-slate-950 transition-all ${
                isSuccess 
                  ? 'border-emerald-500 text-emerald-400 group-hover:scale-125 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.5)]' 
                  : 'border-rose-500 text-rose-400 group-hover:scale-125 group-hover:shadow-[0_0_12px_rgba(244,63,94,0.5)]'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isSuccess ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              </div>

              {/* Memory Card on timeline */}
              <div className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                      #{mem.incident_number}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      {mem.incident_title}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{mem.timestamp ? new Date(mem.timestamp).toLocaleDateString() : 'Historical'}</span>
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                      isSuccess ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {mem.result}
                    </span>
                  </div>
                </div>

                {/* Trajectory progression */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-slate-900 text-slate-300 font-mono flex items-center space-x-1 border border-slate-800">
                    <Server className="w-3 h-3 text-indigo-400" />
                    <span>{mem.service}</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                  <span className="px-2 py-1 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    <span className="text-slate-500">Root Cause:</span> {mem.root_cause}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                  <span className="px-2 py-1 rounded bg-slate-900 text-indigo-300 font-mono border border-indigo-500/30">
                    <span className="text-slate-500">Fix:</span> {mem.action_taken}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                  <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/30 flex items-center space-x-1">
                    <Brain className="w-3 h-3 text-indigo-400" />
                    <span>Stored in Hindsight</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
