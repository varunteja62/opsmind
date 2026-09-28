from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.schemas.memory import (
    MemoryExperience, MemoryRecallRequest, MemoryRecallResult,
    MemoryRetainRequest, MemoryReflectResponse
)
from app.services.hindsight import hindsight_service

router = APIRouter(prefix="/api/memory", tags=["Hindsight Memory"])

@router.get("/status")
def get_hindsight_status():
    return hindsight_service.check_connection()

@router.get("", response_model=List[MemoryExperience])
def list_all_memories(service: Optional[str] = None):
    memories = hindsight_service.get_all_memories()
    if service:
        memories = [m for m in memories if m.service.lower() == service.lower()]
    return memories

@router.post("/search", response_model=MemoryRecallResult)
async def search_memories(payload: MemoryRecallRequest):
    result = await hindsight_service.recall(
        query=payload.query,
        service=payload.service,
        symptoms=payload.symptoms,
        limit=payload.limit
    )
    return result

@router.post("/store")
async def store_memory(payload: MemoryRetainRequest):
    memory_id = await hindsight_service.retain(payload.experience)
    return {"status": "retained", "memory_id": memory_id, "bank_id": payload.bank_id}

@router.get("/reflect", response_model=MemoryReflectResponse)
async def reflect_memory(topic: str = Query(..., example="database pool exhaustion"), service: Optional[str] = None):
    result = await hindsight_service.reflect(topic=topic, service=service)
    return result

@router.get("/{memory_id}", response_model=MemoryExperience)
def get_memory(memory_id: str):
    memories = hindsight_service.get_all_memories()
    for m in memories:
        if m.id == memory_id or m.incident_number == memory_id:
            return m
    raise HTTPException(status_code=404, detail="Memory not found in Hindsight bank")
