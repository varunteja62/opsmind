import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Server, AlertTriangle, ShieldCheck, X, Loader2, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import IncidentCard from '../components/IncidentCard';

export default function IncidentsPage({ onSelectIncident, onNavigateToInvestigation }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New incident form state (defaults to the Demo Scenario!)
  const [newTitle, setNewTitle] = useState('Payment API returning 500 errors');
  const [newDesc, setNewDesc] = useState('Production payment requests are failing with HTTP 500 errors. Database timeout messages are appearing in the application logs.');
  const [newService, setNewService] = useState('payment-api');
  const [newEnv, setNewEnv] = useState('production');
  const [newSeverity, setNewSeverity] = useState('critical');
  const [newError, setNewError] = useState('HTTP 500: Connection pool starvation');
  const [newDeployment, setNewDeployment] = useState('v2.4.2 (deployed 15 mins ago)');
  const [newLogs, setNewLogs] = useState('[ERROR] ConnectionPoolTimeout: 50 active connections held for >4000ms.');
  const [newPoolSize, setNewPoolSize] = useState(50);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const data = await api.getIncidents();
      setIncidents(data);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await api.createIncident({
        title: newTitle,
        description: newDesc,
        service: newService,
        environment: newEnv,
        severity: newSeverity,
        error_message: newError,
        recent_deployment: newDeployment,
        logs: newLogs,
        current_config: { db_pool_size: parseInt(newPoolSize, 10) }
      });
      setShowCreateModal(false);
      setIncidents([created, ...incidents]);
      onSelectIncident(created);
      onNavigateToInvestigation();
    } catch (err) {
      alert('Error creating incident: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch = inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inc.incident_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inc.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;
    const matchesService = serviceFilter === 'all' || inc.service === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  });

  const uniqueServices = Array.from(new Set(incidents.map(i => i.service)));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>Production Incidents</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {incidents.length} Recorded
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Active and resolved system outages managed by OpsMind's Hindsight agent
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Incident</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, #ID, or service..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Service Filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Services</option>
            {uniqueServices.map((svc) => (
              <option key={svc} value={svc}>{svc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Incident Cards Grid */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading incidents...</p>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="glass-panel text-center py-16 rounded-2xl text-slate-400">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-60" />
          <p className="text-sm font-semibold text-slate-300">No matching incidents found</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or report a new incident.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIncidents.map((incident) => (
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
      )}

      {/* CREATE INCIDENT MODAL (Flow 1) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="glass-panel w-full max-w-xl rounded-2xl p-6 border border-slate-800 shadow-2xl relative my-8">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Report Production Incident</h3>
                <p className="text-xs text-slate-400">OpsMind will analyze symptoms and search Hindsight memory</p>
              </div>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-4 text-sm">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">
                  Incident Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">
                    Service <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">
                    Environment
                  </label>
                  <select
                    value={newEnv}
                    onChange={(e) => setNewEnv(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">
                    Severity
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">
                  Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">
                    Error Message / Code
                  </label>
                  <input
                    type="text"
                    value={newError}
                    onChange={(e) => setNewError(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">
                    Recent Deployment / Version
                  </label>
                  <input
                    type="text"
                    value={newDeployment}
                    onChange={(e) => setNewDeployment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Current Configuration Setting: db_pool_size (Key for Differential Reasoning Demo) */}
              <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-indigo-300">
                    Current Environment Configuration (db_pool_size)
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    Pool = {newPoolSize}
                  </span>
                </div>
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={newPoolSize}
                  onChange={(e) => setNewPoolSize(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Tip for Demo: Setting this to 50 allows OpsMind to detect that the historical fix (INC-1024) is already active, triggering differential reasoning!
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">
                  Application Logs (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newLogs}
                  onChange={(e) => setNewLogs(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Submit & Trigger AI Agent</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
