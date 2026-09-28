import React, { useEffect, useState } from 'react';
import { Brain, AlertTriangle, ShieldCheck, Activity, Database, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function Navbar({ activeTab, setActiveTab }) {
  const [hindsightStatus, setHindsightStatus] = useState({ status: 'checking' });

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const data = await api.getHindsightStatus();
      setHindsightStatus(data);
    } catch {
      setHindsightStatus({ status: 'offline' });
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'investigation', label: 'AI Investigation', icon: Sparkles },
    { id: 'memory', label: 'Memory Bank', icon: Database },
    { id: 'analytics', label: 'Analytics', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  OPS<span className="text-indigo-400">MIND</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  Hindsight v20/20
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Your organization's operational memory
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Hindsight Status Badge */}
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                hindsightStatus.status === 'connected' ? 'bg-emerald-400' : 'bg-indigo-400'
              }`} />
              <span className="text-slate-300 font-mono hidden lg:inline">Hindsight Bank:</span>
              <span className="font-semibold text-indigo-400 font-mono">
                {hindsightStatus.status === 'connected' ? 'Cloud Connected' : 'Local Bank Active'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
