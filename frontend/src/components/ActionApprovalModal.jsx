import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, XCircle, Terminal, Loader2, X } from 'lucide-react';
import { api } from '../services/api';

export default function ActionApprovalModal({ action, isOpen, onClose, onActionUpdated }) {
  const [loading, setLoading] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen || !action) return null;

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await api.approveAction(action.id);
      setResult(res);
      if (onActionUpdated) onActionUpdated(res);
    } catch (err) {
      alert('Error executing action: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const res = await api.rejectAction(action.id, rejectNote);
      setResult(res);
      if (onActionUpdated) onActionUpdated(res);
    } catch (err) {
      alert('Error rejecting action: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-slate-800 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Human-in-the-Loop Approval</h3>
            <p className="text-xs text-slate-400">Guarded execution of automated incident remedies</p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          {/* Action Title */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-slate-400">Proposed Action</span>
              <span className={`text-xs px-2 py-0.5 rounded font-mono font-semibold uppercase border ${getRiskColor(action.risk_level)}`}>
                Risk: {action.risk_level}
              </span>
            </div>
            <p className="mt-1 font-semibold text-slate-100 text-base">
              {action.description}
            </p>
          </div>

          {/* Reasoning */}
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400">AI Justification & Memory Basis</span>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              {action.reasoning}
            </p>
          </div>

          {/* Execution Result */}
          {result && (
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 mb-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>Simulation Execution Log:</span>
              </div>
              <pre className="text-xs font-mono text-emerald-300 whitespace-pre-wrap">
                {result.execution_result}
              </pre>
            </div>
          )}

          {/* Reject Note Input */}
          {showRejectInput && !result && (
            <div className="mt-2">
              <label className="text-xs text-slate-400 block mb-1">Reason for Rejection (Optional):</label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="e.g. Action unnecessary, traffic currently too high..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                rows={2}
              />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
          {result ? (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Close
            </button>
          ) : (
            <>
              {!showRejectInput ? (
                <button
                  type="button"
                  onClick={() => setShowRejectInput(true)}
                  disabled={loading}
                  className="px-4 py-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Reject Action
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={loading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Confirm Rejection
                </button>
              )}

              <button
                type="button"
                onClick={handleApprove}
                disabled={loading}
                className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                <span>Approve & Execute</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
