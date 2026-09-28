const API_BASE = '/api';

export const api = {
  // Incidents
  async getIncidents(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/incidents${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  async getIncident(id) {
    const res = await fetch(`${API_BASE}/incidents/${id}`);
    if (!res.ok) throw new Error('Failed to fetch incident');
    return res.json();
  },

  async createIncident(data) {
    const res = await fetch(`${API_BASE}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create incident');
    return res.json();
  },

  async resolveIncident(id, data) {
    const res = await fetch(`${API_BASE}/incidents/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to resolve incident');
    return res.json();
  },

  // AI Agent
  async analyzeIncident(incidentId) {
    const res = await fetch(`${API_BASE}/agent/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incident_id: incidentId })
    });
    if (!res.ok) throw new Error('Agent analysis failed');
    return res.json();
  },

  // Actions
  async approveAction(actionId) {
    const res = await fetch(`${API_BASE}/actions/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action_id: actionId, approved: true })
    });
    if (!res.ok) throw new Error('Failed to approve action');
    return res.json();
  },

  async rejectAction(actionId, notes = '') {
    const res = await fetch(`${API_BASE}/actions/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action_id: actionId, approved: false, notes })
    });
    if (!res.ok) throw new Error('Failed to reject action');
    return res.json();
  },

  // Hindsight Memory
  async getMemories(service = '') {
    const res = await fetch(`${API_BASE}/memory${service ? `?service=${service}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch memories');
    return res.json();
  },

  async searchMemory(query, service = '', symptoms = []) {
    const res = await fetch(`${API_BASE}/memory/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, service, symptoms, limit: 5 })
    });
    if (!res.ok) throw new Error('Memory search failed');
    return res.json();
  },

  async reflectMemory(topic, service = '') {
    const res = await fetch(`${API_BASE}/memory/reflect?topic=${encodeURIComponent(topic)}${service ? `&service=${encodeURIComponent(service)}` : ''}`);
    if (!res.ok) throw new Error('Memory reflection failed');
    return res.json();
  },

  async getHindsightStatus() {
    const res = await fetch(`${API_BASE}/memory/status`);
    if (!res.ok) return { status: 'offline' };
    return res.json();
  },

  // Analytics
  async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  }
};
