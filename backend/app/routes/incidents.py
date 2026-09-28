from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.incident import Incident, IncidentAction
from app.schemas.incident import IncidentCreate, IncidentResolve, IncidentOut
from app.schemas.memory import MemoryExperience
from app.services.hindsight import hindsight_service

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])

@router.post("", response_model=IncidentOut)
async def create_incident(payload: IncidentCreate, db: Session = Depends(get_db)):
    # Auto-generate incident number like INC-1025
    count = db.query(Incident).count()
    inc_num = f"INC-{1024 + count + 1}"

    incident = Incident(
        incident_number=inc_num,
        title=payload.title,
        description=payload.description,
        service=payload.service,
        environment=payload.environment,
        severity=payload.severity,
        status="active",
        error_message=payload.error_message,
        recent_deployment=payload.recent_deployment,
        logs=payload.logs,
        current_config=payload.current_config or {}
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident

@router.get("", response_model=List[IncidentOut])
def get_incidents(
    status: Optional[str] = None,
    service: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Incident)
    if status:
        query = query.filter(Incident.status == status)
    if service:
        query = query.filter(Incident.service == service)
    return query.order_by(Incident.created_at.desc()).all()

@router.get("/{incident_id}", response_model=IncidentOut)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.post("/{incident_id}/resolve", response_model=IncidentOut)
async def resolve_incident(incident_id: int, payload: IncidentResolve, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = "resolved"
    incident.root_cause = payload.root_cause
    incident.resolution = payload.resolution
    incident.outcome = payload.outcome.lower()
    incident.resolution_time_minutes = payload.resolution_time_minutes or 15

    # FLOW 8: LEARN INTO HINDSIGHT
    if payload.learn_into_hindsight:
        extracted = incident.extracted_entities or {}
        symptoms = extracted.get("symptoms", [])
        if not symptoms and incident.description:
            symptoms = [s.strip() for s in incident.description.split(".") if s.strip()][:2]

        exp = MemoryExperience(
            incident_number=incident.incident_number,
            incident_title=incident.title,
            service=incident.service,
            environment=incident.environment,
            symptoms=symptoms,
            error_type=extracted.get("error_type", incident.error_message or "Unknown"),
            root_cause=payload.root_cause,
            action_taken=payload.resolution,
            result=payload.outcome.upper(), # SUCCESS, FAILED
            resolution_time_minutes=payload.resolution_time_minutes or 15,
            confidence=0.95 if payload.outcome.lower() == "success" else 0.85,
            context_config=incident.current_config or {}
        )
        memory_id = await hindsight_service.retain(exp)
        incident.hindsight_memory_id = memory_id
        incident.learned_at = datetime.utcnow()

    db.commit()
    db.refresh(incident)
    return incident
