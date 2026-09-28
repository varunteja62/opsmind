import React, { useState, useEffect } from 'react';
import { 
  Database, Brain, Filter, Search, Sparkles, CheckCircle2, 
  XCircle, Clock, Server, GitFork, ArrowRight, Share2, Layers 
} from 'lucide-react';
import { api } from '../services/api';
import MemoryTimeline from '../components/MemoryTimeline';

export default function MemoryPage() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceFilter, setServiceFilter] = useState('all');
  const [outcomeFilter, setOutcomeFilter] = useState('all');
  const [activeView, setActiveView] = useState('cards'); // 'cards', 'timeline', 'graph'
  const [selectedMemory, setSelectedMemory] = useState(null);

  useEffect(() => {
    loadMemories();
  }, [serviceFilter]);

  const loadMemories = async () => {
    setLoading(true);
    try {
      const data = await api.getMemories(serviceFilter === 'all' ? '' : serviceFilter);
      setMemories(data);
      if (data.length > 0 && !selectedMemory) {
        setSelectedMemory(data[0]);
      }
    } catch (err) {
      console.error('Error fetching memories:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMemories = memories.filter((m) => {
    if (outcomeFilter === 'all') return true;
    return m.result?.toLowerCase() === outcomeFilter.toLowerCase();
  });

  const uniqueServices = Array.from(new Set(memories.map(m => m.service)));

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Brain className="w-4 h-4" />
            <span>Persistent Biomimetic Memory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Organizational Memory Bank
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Preserving institutional engineering wisdom: retained experiences, root causes, and resolution outcomes
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveView('cards')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'cards' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Experience Cards
          </button>
          <button
            onClick={() => setActiveView('timeline')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'timeline' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Visual Timeline
          </button>
          <button
            onClick={() => setActiveView('graph')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'graph' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Memory Graph
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <Database className="w-4 h-4 text-indigo-400" />
          <span>Hindsight Bank: <strong className="text-slate-200 font-mono">opsmind-incidents</strong></span>
          <span className="hidden sm:inline">•</span>
          <span className="text-slate-200 font-mono font-semibold">{filteredMemories.length} Experiences Retained</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Service Filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Services</option>
            {uniqueServices.map((svc) => (
              <option key={svc} value={svc}>{svc}</option>
            ))}
          </select>

          {/* Outcome Filter */}
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Outcomes</option>
            <option value="success">Success Only</option>
            <option value="failed">Failed Only</option>
          </select>
        </div>
      </div>

      {/* Main View Area */}
      {activeView === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMemories.map((mem) => {
            const isSuccess = mem.result?.toUpperCase() === 'SUCCESS';
            return (
              <div 
                key={mem.id}
                onClick={() => setSelectedMemory(mem)}
                className={`glass-panel-interactive p-5 rounded-2xl cursor-pointer border relative overflow-hidden ${
                  selectedMemory?.id === mem.id ? 'ring-2 ring-indigo-500 border-transparent' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                      #{mem.incident_number}
                    </span>
                    <span className="text-xs font-mono text-slate-300 font-medium">{mem.service}</span>
                  </div>

                  <span className={`flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded border ${
                    isSuccess ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    {isSuccess ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span>{mem.result}</span>
                  </span>
                </div>

                <h3 className="mt-3 text-sm font-semibold text-slate-100">
                  {mem.incident_title}
                </h3>

                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Root Cause:</span>
                    <p className="text-slate-300 font-medium">{mem.root_cause}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Resolution Action:</span>
                    <p className="text-indigo-300 font-mono bg-slate-950/70 p-2 rounded border border-slate-800/80">
                      {mem.action_taken}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Confidence: {Math.round((mem.confidence || 0.9) * 100)}%</span>
                  <span>{mem.resolution_time_minutes ? `${mem.resolution_time_minutes}m to resolve` : 'Resolved'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeView === 'timeline' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span>Experience Trajectory & Learning Timeline</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Visualizes how previous incidents shaped modern resolution recommendations
            </p>
          </div>
          <MemoryTimeline memories={filteredMemories} />
        </div>
      )}

      {activeView === 'graph' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-indigo-400" />
                <span>Service & Resolution Knowledge Graph</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Visualizing relationships between Services, Root Causes, Actions, and Outcomes
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-mono">
              <span className="flex items-center space-x-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Success Edge</span>
              </span>
              <span className="flex items-center space-x-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span>Failed Edge</span>
              </span>
            </div>
          </div>

          {/* Interactive Knowledge Graph Node Visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredMemories.map((mem) => {
              const isSuccess = mem.result?.toUpperCase() === 'SUCCESS';
              return (
                <div key={mem.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  {/* Service Node */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <span className="flex items-center space-x-2 font-mono font-bold text-indigo-400">
                      <Server className="w-4 h-4 text-indigo-400" />
                      <span>{mem.service}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">#{mem.incident_number}</span>
                  </div>

                  <div className="flex justify-center text-slate-600">↓</div>

                  {/* Root Cause Node */}
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Root Cause:</span>
                    <span className="text-slate-200 font-medium">{mem.root_cause}</span>
                  </div>

                  <div className="flex justify-center text-slate-600">↓</div>

                  {/* Action Node */}
                  <div className={`p-2.5 rounded-xl text-xs border ${
                    isSuccess ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                  }`}>
                    <span className="text-[10px] uppercase font-semibold block mb-0.5 opacity-80">Action → Outcome:</span>
                    <span className="font-mono">{mem.action_taken}</span>
                    <span className={`mt-1 block font-bold text-[10px] uppercase ${isSuccess ? 'text-emerald-400' : 'text-rose-400'}`}>
                      Result: {mem.result}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
