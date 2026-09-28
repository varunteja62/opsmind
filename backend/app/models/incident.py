from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_number = Column(String(64), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    service = Column(String(100), nullable=False, index=True)
    environment = Column(String(50), default="production")
    severity = Column(String(50), default="medium", index=True)
    status = Column(String(50), default="active", index=True) # active, investigating, resolved, closed
    
    error_message = Column(Text, nullable=True)
    recent_deployment = Column(String(255), nullable=True)
    logs = Column(Text, nullable=True)
    current_config = Column(JSON, default=dict)
    extracted_entities = Column(JSON, default=dict)
    
    # Resolution details
    root_cause = Column(Text, nullable=True)
    resolution = Column(Text, nullable=True)
    outcome = Column(String(50), nullable=True) # success, failed, partially_resolved
    resolution_time_minutes = Column(Integer, nullable=True)
    hindsight_memory_id = Column(String(128), nullable=True)
    learned_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    actions = relationship("IncidentAction", back_populates="incident", cascade="all, delete-orphan")
    memory_audits = relationship("MemoryAuditLog", back_populates="incident")


class IncidentAction(Base):
    __tablename__ = "incident_actions"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    action_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    reasoning = Column(Text, nullable=False)
    risk_level = Column(String(50), default="medium") # low, medium, high, critical
    status = Column(String(50), default="pending") # pending, approved, rejected, executed, failed
    relevance_source = Column(String(100), default="memory_based") # memory_based, heuristic, manual
    simulated = Column(Boolean, default=True)
    execution_result = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    executed_at = Column(DateTime, nullable=True)

    incident = relationship("Incident", back_populates="actions")


class MemoryAuditLog(Base):
    __tablename__ = "memory_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="SET NULL"), nullable=True)
    operation_type = Column(String(50), nullable=False) # recall, retain, reflect
    query_text = Column(Text, nullable=True)
    matched_memories = Column(JSON, default=list)
    reasoning_summary = Column(Text, nullable=True)
    hindsight_bank_id = Column(String(100), default="opsmind-incidents")
    confidence_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="memory_audits")
