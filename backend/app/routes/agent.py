from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.incident import Incident
from app.schemas.agent import AgentInvestigationResponse
from app.services.agent import incident_agent

router = APIRouter(prefix="/api/agent", tags=["Agent"])

class AnalyzeRequest(BaseModel):
    incident_id: int

@router.post("/analyze", response_model=AgentInvestigationResponse)
async def analyze_incident(payload: AnalyzeRequest, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == payload.incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = "investigating"
    db.commit()

    investigation = await incident_agent.investigate_incident(incident=incident, db=db)
    return investigation
