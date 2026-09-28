from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class MemoryExperience(BaseModel):
    id: Optional[str] = None
    incident_number: str = Field(..., example="INC-1024")
    incident_title: str = Field(..., example="Payment API returning 500")
    service: str = Field(..., example="payment-api")
    environment: str = Field("production")
    symptoms: List[str] = Field(default_factory=list, example=["HTTP 500", "database timeout"])
    error_type: Optional[str] = Field(None, example="HTTP 500")
    root_cause: str = Field(..., example="Database connection pool exhaustion")
    action_taken: str = Field(..., example="Increased connection pool from 20 to 50")
    result: str = Field(..., example="SUCCESS") # SUCCESS, FAILED, PARTIAL
    resolution_time_minutes: Optional[int] = Field(12)
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    confidence: float = Field(0.92, example=0.92)
    relevance_score: Optional[float] = Field(None, example=0.91)
    relevance_explanation: Optional[str] = Field(None, example="Matches service (Payment API) and symptoms (database timeout)")
    context_config: Optional[Dict[str, Any]] = Field(default_factory=dict, example={"db_pool_size": 20})
    tags: List[str] = Field(default_factory=list)

class MemoryRetainRequest(BaseModel):
    bank_id: Optional[str] = "opsmind-incidents"
    experience: MemoryExperience

class MemoryRecallRequest(BaseModel):
    bank_id: Optional[str] = "opsmind-incidents"
    service: Optional[str] = None
    query: str = Field(..., example="Payment API returning 500 database timeout")
    symptoms: Optional[List[str]] = None
    limit: int = 5

class MemoryRecallResult(BaseModel):
    memories: List[MemoryExperience]
    total_found: int
    summary: str
    hindsight_source: str = "connected" # connected or local_bank

class MemoryReflectRequest(BaseModel):
    bank_id: Optional[str] = "opsmind-incidents"
    service: Optional[str] = None
    topic: str = Field(..., example="What works best for Payment API database timeouts?")

class MemoryReflectResponse(BaseModel):
    insight: str
    confidence: float
    successful_patterns: List[str]
    failed_patterns: List[str]
    supporting_memory_ids: List[str]
