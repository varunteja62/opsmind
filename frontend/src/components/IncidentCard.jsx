import React from 'react';
import { AlertCircle, Clock, Server, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';

export default function IncidentCard({ incident, onSelect }) {
  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'investigating':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 animate-pulse';
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div 
      onClick={() => onSelect(incident)}
      className="glass-panel-interactive p-5 rounded-xl cursor-pointer relative overflow-hidden group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-semibold text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
            #{incident.incident_number}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded border capitalize ${getSeverityBadge(incident.severity)}`}>
            {incident.severity}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded border capitalize ${getStatusBadge(incident.status)}`}>
            {incident.status}
          </span>
        </div>

        <span className="text-xs text-slate-500 flex items-center space-x-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </span>
      </div>

      <h3 className="mt-3 text-base font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
        {incident.title}
      </h3>

      <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
        {incident.description}
      </p>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5 text-slate-300 font-mono">
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <span>{incident.service}</span>
          </span>
          {incident.error_message && (
            <span className="text-slate-500 truncate max-w-[150px]">
              {incident.error_message}
            </span>
          )}
        </div>

        <div className="flex items-center text-indigo-400 font-medium group-hover:translate-x-1 transition-transform">
          <span>Investigate</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </div>
      </div>
    </div>
  );
}
