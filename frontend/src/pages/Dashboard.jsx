import React, { useEffect, useState } from 'react';
import { 
  Activity, AlertTriangle, CheckCircle2, XCircle, Brain, 
  ArrowRight, ShieldCheck, Sparkles, Server, Zap, RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';
import IncidentCard from '../components/IncidentCard';

export default function Dashboard({ onNavigateToInvestigation, onSelectIncident }) {
  const [analytics, setAnalytics] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [reflection, setReflection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsData, incidentsData, reflectData] = await Promise.all([
        api.getAnalytics(),
        api.getIncidents(),
        api.reflectMemory('production service stability')
      ]);
      setAnalytics(analyticsData);
      setIncidents(incidentsData);
      setReflection(reflectData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeIncidents = incidents.filter(i => i.status === 'active' || i.status === 'investigating');
  const recentIncidents = incidents.slice(0, 4);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative glass-panel rounded-3xl p-8 overflow-hidden border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Incident Response Powered by Hindsight</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              The AI Incident Agent That Learns From Every Failure
            </h1>
            <p className="mt-3 text-slate-300 text-sm leading-relaxed">
              OpsMind retains every resolved incident, failed restart, and configuration tweak into an organizational memory bank. 
              When new incidents occur, it compares current state against historical experience to recommend precise, non-redundant remedies.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            {activeIncidents.length > 0 && (
              <button
                onClick={() => {
                  onSelectIncident(activeIncidents[0]);
                  onNavigateToInvestigation();
                }}
                className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/30 text-sm transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>Investigate Active #{activeIncidents[0].incident_number}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Active Incidents */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Active Incidents</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-white font-mono">
            {analytics?.active_incidents ?? 1}
          </div>
          <div className="mt-1 text-[11px] text-rose-400 font-medium">
            Requires engineering investigation
          </div>
        </div>

        {/* Resolved Incidents */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Resolved Incidents</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-white font-mono">
            {analytics?.resolved_incidents ?? 3}
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 font-medium">
            Learned & cataloged in Hindsight
          </div>
        </div>

        {/* Total Memories */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Hindsight Memories</span>
            <Brain className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-white font-mono">
            {analytics?.total_memories ?? 5}
          </div>
          <div className="mt-1 text-[11px] text-indigo-400 font-medium">
            Retain/Recall/Reflect enabled
          </div>
        </div>

        {/* Successful Resolutions */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Success Experiences</span>
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-white font-mono">
            {analytics?.successful_resolutions ?? 4}
          </div>
          <div className="mt-1 text-[11px] text-teal-400 font-medium">
            Validated resolution paths
          </div>
        </div>

        {/* Failed Resolutions */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Failed Experiences</span>
            <XCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-white font-mono">
            {analytics?.failed_resolutions ?? 1}
          </div>
          <div className="mt-1 text-[11px] text-amber-400 font-medium">
            Stored to avoid repeating mistakes
          </div>
        </div>
      </div>

      {/* Main Content Split: Recent Incidents vs AI Memory Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Incidents (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Server className="w-4 h-4 text-indigo-400" />
              <span>Production Incidents</span>
            </h2>
            <button
              onClick={() => onNavigateToInvestigation()}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
            >
              <span>View all incidents</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentIncidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                onSelect={(inc) => {
                  onSelectIncident(inc);
                  onNavigateToInvestigation();
                }}
              />
            ))}
          </div>
        </div>

        {/* AI Memory Insights & Hindsight Reflection (1 Column) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Brain className="w-4 h-4 text-indigo-400" />
            <span>AI Memory Insights</span>
          </h2>

          <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Hindsight Organizational Synthesis</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              {reflection?.insight || "OpsMind continuously analyzes previous incidents. Retained memories reveal that database pool exhaustion on Payment API is heavily correlated with post-deployment query latency rather than static configuration limits."}
            </p>

            {reflection?.successful_patterns?.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1.5">
                  Top Proven Remedies (Hindsight Recall):
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {reflection.successful_patterns.map((pat, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{pat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {reflection?.failed_patterns?.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block mb-1.5">
                  Known Ineffective Approaches:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {reflection.failed_patterns.map((pat, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                      <span>{pat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">Memory-Assisted Resolutions:</span>
              <span className="font-mono font-bold text-indigo-400">
                {analytics?.memory_assisted_resolution_percentage ?? 78}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
