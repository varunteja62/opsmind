from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.memory import MemoryExperience

class IncidentAnalysis(BaseModel):
    service: str = Field(..., example="payment-api")
    environment: str = Field("production")
    symptoms: List[str] = Field(default_factory=list)
    error_type: Optional[str] = Field(None, example="HTTP 500")
    possible_causes: List[str] = Field(default_factory=list)
    severity: str = Field("critical")
    relevant_keywords: List[str] = Field(default_factory=list)
    important_technical_entities: Dict[str, Any] = Field(default_factory=dict)

class ComparativeReasoning(BaseModel):
    has_relevant_memory: bool = True
    best_matching_memory: Optional[MemoryExperience] = None
    similarity_percentage: int = Field(91, example=91)
    
    # Differential reasoning fields
    historical_state: Dict[str, Any] = Field(default_factory=dict)
    current_state: Dict[str, Any] = Field(default_factory=dict)
    already_applied_solutions: List[str] = Field(default_factory=list)
    novel_factors: List[str] = Field(default_factory=list)
    
    reasoning_explanation: str = Field(
        ...,
        example="The previous incident was caused by database connection pool exhaustion and resolved by increasing pool size from 20 to 50. However, the current environment already has DB pool = 50. Therefore, repeating that fix is ineffective."
    )

class ActionPlanItem(BaseModel):
    title: str = Field(..., example="Investigate database query latency")
    action_type: str = Field(..., example="query_latency_check")
    reason: str = Field(..., example="Since pool size is already 50, slow queries are the most probable cause of pool starvation.")
    risk: str = Field("low", example="low") # low, medium, high
    command_simulation: Optional[str] = Field(None, example="SELECT pid, query, state, age(clock_timestamp(), query_start) FROM pg_stat_activity WHERE state != 'idle';")
    relevance_source: str = "memory_differential"

class AgentInvestigationResponse(BaseModel):
    incident_id: int
    incident_number: str
    analysis: IncidentAnalysis
    memories_found: List[MemoryExperience]
    reasoning: ComparativeReasoning
    recommendations: List[ActionPlanItem]
    hindsight_status: str = "operational"

class ActionApprovalRequest(BaseModel):
    action_id: int
    approved: bool
    notes: Optional[str] = None

class ActionApprovalResponse(BaseModel):
    action_id: int
    status: str # executed, rejected
    execution_result: str
    simulated: bool = True
