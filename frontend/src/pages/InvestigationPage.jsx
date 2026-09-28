import React, { useState, useEffect } from 'react';
import { 
  Brain, Sparkles, AlertTriangle, ShieldCheck, Terminal, 
  CheckCircle2, XCircle, ArrowRight, Loader2, GitCompare, 
  Server, Cpu, Play, Check, RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';
import MemorySearchCard from '../components/MemorySearchCard';
import ComparativeReasoningCard from '../components/ComparativeReasoningCard';
import ActionApprovalModal from '../components/ActionApprovalModal';
import ResolutionModal from '../components/ResolutionModal';

export default function InvestigationPage({ incident, onIncidentUpdated }) {
  const [currentIncident, setCurrentIncident] = useState(incident);
  const [investigation, setInvestigation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeActionModal, setActiveActionModal] = useState(null);
  const [showResolveModal, setShowResolveModal] = useState(false);

  useEffect(() => {
    setCurrentIncident(incident);
    if (incident) {
      runInvestigation(incident.id);
    }
  }, [incident]);

  const runInvestigation = async (incidentId) => {
    setLoading(true);
    try {
      const data = await api.analyzeIncident(incidentId);
      setInvestigation(data);
      // Reload incident to get newly generated actions
      const updatedInc = await api.getIncident(incidentId);
      setCurrentIncident(updatedInc);
      if (onIncidentUpdated) onIncidentUpdated(updatedInc);
    } catch (err) {
      console.error('Investigation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionUpdated = async () => {
    if (currentIncident) {
      const updated = await api.getIncident(currentIncident.id);
      setCurrentIncident(updated);
      if (onIncidentUpdated) onIncidentUpdated(updated);
    }
  };

  if (!currentIncident) {
    return (
      <div className="glass-panel text-center py-20 rounded-2xl max-w-xl mx-auto my-12 p-8">
        <Brain className="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-60" />
        <h2 className="text-xl font-bold text-white">No Incident Selected</h2>
        <p className="text-xs text-slate-400 mt-2">
          Select an active incident from the Incidents tab or Dashboard to launch the AI Investigation workbench.
        </p>
      </div>
    );
  }

  const isResolved = currentIncident.status === 'resolved';

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Incident Intake Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/30">
                #{currentIncident.incident_number}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg font-mono font-medium bg-slate-900 border border-slate-800 text-slate-300">
                Service: <strong className="text-white">{currentIncident.service}</strong>
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg font-mono font-medium bg-slate-900 border border-slate-800 text-slate-300">
                Env: <strong className="text-white">{currentIncident.environment}</strong>
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider ${
                currentIncident.severity === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}>
                {currentIncident.severity}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-lg font-bold capitalize ${
                isResolved ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse'
              }`}>
                {currentIncident.status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
              {currentIncident.title}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {currentIncident.description}
            </p>

            {/* Config & Deployment Tags */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              {currentIncident.recent_deployment && (
                <span className="px-2.5 py-1 rounded-md bg-slate-900/90 text-slate-300 border border-slate-800 font-mono">
                  Deployment: <span className="text-indigo-400 font-semibold">{currentIncident.recent_deployment}</span>
                </span>
              )}
              {currentIncident.current_config?.db_pool_size && (
                <span className="px-2.5 py-1 rounded-md bg-slate-900/90 text-slate-300 border border-slate-800 font-mono">
                  Current Config: <span className="text-amber-400 font-bold">db_pool_size = {currentIncident.current_config.db_pool_size}</span>
                </span>
              )}
              {currentIncident.error_message && (
                <span className="px-2.5 py-1 rounded-md bg-slate-900/90 text-rose-300 border border-rose-500/20 font-mono">
                  {currentIncident.error_message}
                </span>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => runInvestigation(currentIncident.id)}
              disabled={loading}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Re-analyze</span>
            </button>

            {!isResolved ? (
              <button
                onClick={() => setShowResolveModal(true)}
                className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/25 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Resolve & Learn into Hindsight</span>
              </button>
            ) : (
              <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Learned in Hindsight (#{currentIncident.hindsight_memory_id || 'mem-1024'})</span>
              </div>
            )}
          </div>
        </div>

        {/* Application Logs Section */}
        {currentIncident.logs && (
          <div className="mt-5 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="text-[11px] text-slate-500 mb-1 flex items-center space-x-1.5 uppercase font-semibold tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Captured Log Trace</span>
            </div>
            <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap">
              {currentIncident.logs}
            </pre>
          </div>
        )}
      </div>

      {loading && !investigation ? (
        <div className="glass-panel text-center py-20 rounded-3xl border border-indigo-500/20">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">OpsMind AI Agent Investigating...</h3>
          <p className="text-xs text-slate-400 mt-1">Extracting symptoms, querying Hindsight memory bank, and performing differential reasoning.</p>
        </div>
      ) : investigation ? (
        <div className="space-y-8">
          {/* 2. FLOW 2: Incident Analysis */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Cpu className="w-4 h-4" />
              <span>Step 1: Automated LLM Incident Analysis</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Detected Error Signature</span>
                <span className="font-mono text-sm font-bold text-rose-400">{investigation.analysis.error_type}</span>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Observed Symptoms</span>
                <ul className="space-y-1 text-slate-200">
                  {investigation.analysis.symptoms.map((s, idx) => (
                    <li key={idx} className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Identified Potential Causes</span>
                <ul className="space-y-1 text-slate-200">
                  {investigation.analysis.possible_causes.map((c, idx) => (
                    <li key={idx} className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 3. FLOW 3: Hindsight Memory Search */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Brain className="w-4 h-4" />
                <span>Step 2: Hindsight Memory Search</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Found {investigation.memories_found.length} relevant historical experiences
              </span>
            </div>

            {investigation.memories_found.length === 0 ? (
              <div className="glass-panel p-6 rounded-xl text-center text-slate-400 text-xs">
                No matching historical memories found for {currentIncident.service}. This incident will become the baseline experience once resolved.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {investigation.memories_found.map((mem) => (
                  <MemorySearchCard key={mem.id || mem.incident_number} memory={mem} />
                ))}
              </div>
            )}
          </div>

          {/* 4. FLOW 4: Memory-Aware Differential Reasoning (CORE DIFFERENTIATOR) */}
          <ComparativeReasoningCard reasoning={investigation.reasoning} />

          {/* 5. FLOW 5 & 6: Recommended Actions with Human in the Loop */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Step 3: Recommended Actions (Human-in-the-Loop Approval)</span>
              </div>
              <span className="text-[11px] text-slate-400">Guarded execution required</span>
            </div>

            <div className="space-y-3">
              {(currentIncident.actions && currentIncident.actions.length > 0
                ? currentIncident.actions
                : investigation.recommendations.map((r, idx) => ({
                    id: idx + 1,
                    action_type: r.action_type,
                    description: r.title,
                    reasoning: r.reason,
                    risk_level: r.risk,
                    status: 'pending'
                  }))
              ).map((act) => {
                const isExecuted = act.status === 'executed';
                const isRejected = act.status === 'rejected';

                return (
                  <div 
                    key={act.id}
                    className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="max-w-2xl">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                          act.risk_level === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}>
                          Risk: {act.risk_level}
                        </span>
                        <h4 className="text-sm font-bold text-white">{act.description}</h4>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed mt-1">
                        <span className="text-slate-500 font-semibold uppercase text-[10px]">Why Recommended:</span> {act.reasoning}
                      </p>

                      {act.execution_result && (
                        <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400">
                          {act.execution_result}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {isExecuted ? (
                        <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Executed Successfully</span>
                        </span>
                      ) : isRejected ? (
                        <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold">
                          <XCircle className="w-4 h-4" />
                          <span>Action Rejected</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => setActiveActionModal(act)}
                          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Review & Approve</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {/* Action Approval Modal */}
      <ActionApprovalModal
        action={activeActionModal}
        isOpen={!!activeActionModal}
        onClose={() => setActiveActionModal(null)}
        onActionUpdated={handleActionUpdated}
      />

      {/* Resolution Modal */}
      <ResolutionModal
        incident={currentIncident}
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        onResolved={async (resolvedInc) => {
          setCurrentIncident(resolvedInc);
          if (onIncidentUpdated) onIncidentUpdated(resolvedInc);
        }}
      />
    </div>
  );
}
