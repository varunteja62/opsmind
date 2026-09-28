from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class IncidentBase(BaseModel):
    title: str = Field(..., example="Payment API returning 500 errors")
    description: str = Field(..., example="Production payment requests are failing with HTTP 500 errors. Database timeout messages are appearing in the application logs.")
    service: str = Field(..., example="payment-api")
    environment: str = Field("production", example="production")
    severity: str = Field("medium", example="critical")
    error_message: Optional[str] = Field(None, example="HTTP 500: Database connection pool exhausted")
    recent_deployment: Optional[str] = Field(None, example="v2.4.1 (deployed 15 mins ago)")
    logs: Optional[str] = Field(None, example="[ERROR] ConnectionPoolTimeout: Timeout after 30s waiting for connection")
    current_config: Optional[Dict[str, Any]] = Field(default_factory=dict, example={"db_pool_size": 50, "timeout_seconds": 30})

class IncidentCreate(IncidentBase):
    pass

class IncidentResolve(BaseModel):
    root_cause: str = Field(..., example="Database connection pool exhaustion due to slow unindexed query")
    resolution: str = Field(..., example="Added missing index on transaction_id and increased pool to 80")
    outcome: str = Field(..., example="success") # success, failed, partially_resolved
    resolution_time_minutes: Optional[int] = Field(15, example=15)
    learn_into_hindsight: bool = Field(True, description="Whether to retain this new experience in Hindsight")

class IncidentActionOut(BaseModel):
    id: int
    incident_id: int
    action_type: str
    description: str
    reasoning: str
    risk_level: str
    status: str
    relevance_source: Optional[str] = None
    simulated: bool = True
    execution_result: Optional[str] = None
    created_at: datetime
    executed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class IncidentOut(IncidentBase):
    id: int
    incident_number: str
    status: str
    root_cause: Optional[str] = None
    resolution: Optional[str] = None
    outcome: Optional[str] = None
    resolution_time_minutes: Optional[int] = None
    hindsight_memory_id: Optional[str] = None
    learned_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    actions: List[IncidentActionOut] = []

    class Config:
        from_attributes = True
