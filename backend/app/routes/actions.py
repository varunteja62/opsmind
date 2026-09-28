from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.incident import IncidentAction, Incident
from app.schemas.agent import ActionApprovalRequest, ActionApprovalResponse
from app.services.actions import action_executor

router = APIRouter(prefix="/api/actions", tags=["Actions"])

@router.post("/approve", response_model=ActionApprovalResponse)
async def approve_action(payload: ActionApprovalRequest, db: Session = Depends(get_db)):
    action = db.query(IncidentAction).filter(IncidentAction.id == payload.action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")

    incident = db.query(Incident).filter(Incident.id == action.incident_id).first()
    service_name = incident.service if incident else "service"

    # Execute simulation
    sim_result = await action_executor.execute_action(
        action_type=action.action_type,
        service=service_name,
        details={"incident_id": action.incident_id}
    )

    action.status = "executed"
    action.execution_result = sim_result["output"]
    action.executed_at = datetime.utcnow()
    db.commit()

    return ActionApprovalResponse(
        action_id=action.id,
        status="executed",
        execution_result=sim_result["output"],
        simulated=True
    )

@router.post("/reject", response_model=ActionApprovalResponse)
def reject_action(payload: ActionApprovalRequest, db: Session = Depends(get_db)):
    action = db.query(IncidentAction).filter(IncidentAction.id == payload.action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")

    action.status = "rejected"
    action.execution_result = f"Rejected by engineer. Note: {payload.notes or 'Action not appropriate for current environment.'}"
    action.executed_at = datetime.utcnow()
    db.commit()

    return ActionApprovalResponse(
        action_id=action.id,
        status="rejected",
        execution_result=action.execution_result,
        simulated=True
    )
