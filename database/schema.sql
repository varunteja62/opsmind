-- OpsMind PostgreSQL Database Schema
-- HackWithHyderabad 3.0: AI Agents That Learn Using Hindsight

CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    incident_number VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    service VARCHAR(100) NOT NULL,
    environment VARCHAR(50) NOT NULL DEFAULT 'production',
    severity VARCHAR(50) NOT NULL DEFAULT 'medium',
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, investigating, resolved, closed
    error_message TEXT,
    recent_deployment VARCHAR(255),
    logs TEXT,
    current_config JSONB DEFAULT '{}'::jsonb,
    extracted_entities JSONB DEFAULT '{}'::jsonb,
    
    -- Resolution details
    root_cause TEXT,
    resolution TEXT,
    outcome VARCHAR(50), -- success, failed, partially_resolved
    resolution_time_minutes INT,
    hindsight_memory_id VARCHAR(128),
    learned_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incident_actions (
    id SERIAL PRIMARY KEY,
    incident_id INT REFERENCES incidents(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    risk_level VARCHAR(50) NOT NULL DEFAULT 'medium', -- low, medium, high, critical
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected, executed, failed
    relevance_source VARCHAR(100), -- memory_based, heuristic, manual
    simulated BOOLEAN DEFAULT TRUE,
    execution_result TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    executed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS memory_audit_logs (
    id SERIAL PRIMARY KEY,
    incident_id INT REFERENCES incidents(id) ON DELETE SET NULL,
    operation_type VARCHAR(50) NOT NULL, -- recall, retain, reflect
    query_text TEXT,
    matched_memories JSONB DEFAULT '[]'::jsonb,
    reasoning_summary TEXT,
    hindsight_bank_id VARCHAR(100),
    confidence_score FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_incidents_service ON incidents(service);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_actions_incident_id ON incident_actions(incident_id);
