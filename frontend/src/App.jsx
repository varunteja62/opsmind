import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import IncidentsPage from './pages/IncidentsPage';
import InvestigationPage from './pages/InvestigationPage';
import MemoryPage from './pages/MemoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedIncident, setSelectedIncident] = useState(null);

  useEffect(() => {
    // Automatically pre-load the active demo incident if available
    api.getIncidents()
      .then(incidents => {
        const active = incidents.find(i => i.status === 'active' || i.status === 'investigating') || incidents[0];
        if (active) setSelectedIncident(active);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            onNavigateToInvestigation={() => setActiveTab('investigation')}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentsPage
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            onNavigateToInvestigation={() => setActiveTab('investigation')}
          />
        )}

        {activeTab === 'investigation' && (
          <InvestigationPage
            incident={selectedIncident}
            onIncidentUpdated={(updated) => setSelectedIncident(updated)}
          />
        )}

        {activeTab === 'memory' && (
          <MemoryPage />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsPage />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>OPSMIND • HackWithHyderabad 3.0</span>
          <span>"The AI Incident Response Agent That Learns From Every Failure"</span>
          <span className="text-indigo-400">Powered by Hindsight Memory Architecture</span>
        </div>
      </footer>
    </div>
  );
}
