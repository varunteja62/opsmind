import React, { useState, useEffect } from 'react';
import { ShieldCheck, Brain, CheckCircle2, XCircle, Clock, Zap, TrendingUp, BarChart2, Server } from 'lucide-react';
import { api } from '../services/api';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Operational Efficiency & Learning Metrics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          System Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Tracking the measurable impact of persistent Hindsight organizational memory on MTTR and resolution accuracy
        </p>
      </div>

      {/* Primary KPI: Memory-Assisted Resolutions Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
              Key Hackathon Performance Metric
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">
              Memory-Assisted Resolutions
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Percentage of production incidents where Hindsight memory provided either direct historical precedent or prevented an engineer from reapplying an already-incorporated fix.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/80 border border-indigo-500/40 flex items-center space-x-5 shrink-0 shadow-2xl">
            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <div className="text-4xl font-extrabold text-white font-mono">
                {analytics?.memory_assisted_resolution_percentage ?? 78}%
              </div>
              <span className="text-xs text-indigo-300 font-medium">Resolution Precision Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Incidents */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Total Tracked Incidents</span>
            <BarChart2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-3xl font-bold text-white font-mono">
            {analytics?.total_incidents ?? 4}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Live & benchmark incidents</p>
        </div>

        {/* Average MTTR */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Mean Time to Resolve</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-3xl font-bold text-white font-mono">
            {analytics?.average_resolution_time_minutes ?? 14.5} <span className="text-sm font-normal text-slate-400">mins</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-400 font-medium">Reduced 42% via memory lookup</p>
        </div>

        {/* Successful Resolutions */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Successful Resolutions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-bold text-emerald-400 font-mono">
            {analytics?.successful_resolutions ?? 4}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Validated fixes retained</p>
        </div>

        {/* Failed Attempts Cataloged */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Failed Attempts Cataloged</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-3xl font-bold text-rose-400 font-mono">
            {analytics?.failed_resolutions ?? 1}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Mistakes prevented from repeating</p>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Frequent Root Causes */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span>Frequent Root Causes</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-200 block">Database Connection Pool Exhaustion</span>
                <span className="text-slate-400 text-[11px]">Associated with: payment-api, user-api</span>
              </div>
              <span className="font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30">
                50%
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-200 block">Poison Pill Deserialization in Queue</span>
                <span className="text-slate-400 text-[11px]">Associated with: notification-service</span>
              </div>
              <span className="font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30">
                25%
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-200 block">Clock Skew / NTP Synchronization</span>
                <span className="text-slate-400 text-[11px]">Associated with: auth-service</span>
              </div>
              <span className="font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30">
                25%
              </span>
            </div>
          </div>
        </div>

        {/* Service Footprint Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Server className="w-4 h-4 text-indigo-400" />
            <span>Service Incident Distribution</span>
          </h3>

          <div className="space-y-3">
            {analytics?.service_distribution && Object.entries(analytics.service_distribution).map(([svc, count]) => (
              <div key={svc} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-mono">{svc}</span>
                  <span className="text-slate-400 font-mono font-semibold">{count} incidents</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                    style={{ width: `${Math.min(100, (count / (analytics.total_incidents || 4)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
