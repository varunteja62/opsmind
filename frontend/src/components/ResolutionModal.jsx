import React, { useState } from 'react';
import { CheckCircle2, Brain, Loader2, X, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function ResolutionModal({ incident, isOpen, onClose, onResolved }) {
  const [rootCause, setRootCause] = useState('');
  const [resolution, setResolution] = useState('');
  const [outcome, setOutcome] = useState('success');
  const [resolutionTime, setResolutionTime] = useState(15);
  const [learnHindsight, setLearnHindsight] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !incident) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rootCause.trim() || !resolution.trim()) {
      alert('Please fill in both root cause and resolution details.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resolveIncident(incident.id, {
        root_cause: rootCause,
        resolution: resolution,
        outcome: outcome,
        resolution_time_minutes: parseInt(resolutionTime, 10),
        learn_into_hindsight: learnHindsight
      });
      if (onResolved) onResolved(res);
      onClose();
    } catch (err) {
      alert('Error resolving incident: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-xl rounded-2xl p-6 border border-slate-800 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Resolve Incident #{incident.incident_number}</h3>
            <p className="text-xs text-slate-400">Capture operational resolution & retain memory into Hindsight</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Root Cause */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
              Root Cause <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="e.g. Unindexed composite foreign key in transaction validator"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Resolution */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
              Resolution Applied <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="e.g. Applied database migration 042 adding index on transactions(user_id, status) and restarted workers"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Outcome & Resolution Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                Outcome
              </label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="success">Success (Fix Verified)</option>
                <option value="failed">Failed (Attempt Ineffective)</option>
                <option value="partially_resolved">Partially Resolved</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                Resolution Time (Minutes)
              </label>
              <input
                type="number"
                min="1"
                value={resolutionTime}
                onChange={(e) => setResolutionTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Hindsight Retain Toggle */}
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Retain Experience in Hindsight</span>
                <span className="text-[11px] text-slate-400">Stores resolution into organization's persistent memory bank for future incidents</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={learnHindsight}
              onChange={(e) => setLearnHindsight(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          {/* Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-emerald-600/25 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Complete Resolution & Learn</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
