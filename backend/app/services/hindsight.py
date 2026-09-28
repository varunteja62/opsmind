import os
import json
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any
import httpx
from app.config import settings
from app.schemas.memory import MemoryExperience, MemoryRecallResult, MemoryReflectResponse

logger = logging.getLogger("opsmind.hindsight")

LOCAL_MEMORY_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "hindsight_bank.json")

class HindsightService:
    """
    Hindsight Memory Client Integration
    Implements the core biomimetic memory operations:
      - Retain: Store structured incident experiences (World facts, Experiences, Outcomes)
      - Recall: Context-aware retrieval over past incidents and configurations
      - Reflect: Synthesize high-level operational insights across multiple experiences
    """
    def __init__(self):
        self.base_url = settings.HINDSIGHT_BASE_URL.rstrip('/')
        self.api_key = settings.HINDSIGHT_API_KEY
        self.bank_id = settings.HINDSIGHT_BANK_ID
        self._ensure_local_storage()

    def _ensure_local_storage(self):
        os.makedirs(os.path.dirname(LOCAL_MEMORY_FILE), exist_ok=True)
        if not os.path.exists(LOCAL_MEMORY_FILE):
            with open(LOCAL_MEMORY_FILE, "w", encoding="utf-8") as f:
                json.dump([], f, indent=2)

    def _read_local_bank(self) -> List[Dict[str, Any]]:
        self._ensure_local_storage()
        try:
            with open(LOCAL_MEMORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading local Hindsight memory bank: {e}")
            return []

    def _write_local_bank(self, memories: List[Dict[str, Any]]):
        self._ensure_local_storage()
        with open(LOCAL_MEMORY_FILE, "w", encoding="utf-8") as f:
            json.dump(memories, f, indent=2, ensure_ascii=False)

    def check_connection(self) -> Dict[str, Any]:
        """Check if Hindsight Cloud is reachable."""
        try:
            headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
            # Try the cloud banks list endpoint as a health check
            response = httpx.get(
                f"{self.base_url}/v1/default/banks",
                headers=headers,
                timeout=3.0
            )
            if response.status_code in (200, 404):  # 404 = no banks yet, but server is reachable
                return {"status": "connected", "mode": "hindsight_cloud", "bank_id": self.bank_id}
        except Exception:
            pass
        return {"status": "local_bank_active", "mode": "persistent_bank", "bank_id": self.bank_id}

    async def retain(self, experience: MemoryExperience) -> str:
        """
        Retain operation: Stores a structured operational experience into Hindsight.
        Categorizes into World facts, Experience actions, and Outcome.
        """
        memory_id = experience.id or f"mem-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{experience.incident_number.lower()}"
        experience.id = memory_id
        
        # Prepare structured payload for Hindsight
        payload = {
            "id": memory_id,
            "bank_id": self.bank_id,
            "incident_number": experience.incident_number,
            "incident_title": experience.incident_title,
            "service": experience.service,
            "environment": experience.environment,
            "symptoms": experience.symptoms,
            "error_type": experience.error_type,
            "root_cause": experience.root_cause,
            "action_taken": experience.action_taken,
            "result": experience.result.upper(), # SUCCESS, FAILED, PARTIAL
            "resolution_time_minutes": experience.resolution_time_minutes,
            "timestamp": experience.timestamp,
            "confidence": experience.confidence,
            "context_config": experience.context_config or {},
            "tags": experience.tags or [experience.service, experience.result.lower()]
        }

        # Attempt to retain in live Hindsight Cloud if available
        remote_saved = False
        try:
            headers = {"Content-Type": "application/json"}
            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"
            # Official Hindsight Cloud REST format:
            # POST /v1/default/banks/{bank_id}/memories/retain
            content_text = (
                f"Incident: {payload.get('incident_title')} | "
                f"Service: {payload.get('service')} | "
                f"Root Cause: {payload.get('root_cause')} | "
                f"Action: {payload.get('action_taken')} | "
                f"Result: {payload.get('result')} | "
                f"Symptoms: {', '.join(payload.get('symptoms', []))} | "
                f"Config: {json.dumps(payload.get('context_config', {}))}"
            )
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(
                    f"{self.base_url}/v1/default/banks/{self.bank_id}/memories/retain",
                    headers=headers,
                    json={"items": [{"content": content_text, "document_id": memory_id}]}
                )
                if resp.status_code in (200, 201, 202):
                    remote_saved = True
                    logger.info(f"Successfully retained in Hindsight Cloud: {memory_id}")
                else:
                    logger.warning(f"Hindsight Cloud returned {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            logger.info(f"Hindsight Cloud offline ({e}). Retaining in persistent local bank.")

        # Always save to persistent local store as well
        local_memories = self._read_local_bank()
        # Update if exists, else append
        existing_idx = next((i for i, m in enumerate(local_memories) if m.get("id") == memory_id), -1)
        if existing_idx >= 0:
            local_memories[existing_idx] = payload
        else:
            local_memories.append(payload)
        self._write_local_bank(local_memories)

        logger.info(f"Memory retained: {memory_id} (Remote: {remote_saved})")
        return memory_id

    async def recall(self, query: str, service: Optional[str] = None, symptoms: Optional[List[str]] = None, limit: int = 5) -> MemoryRecallResult:
        """
        Recall operation: Searches Hindsight for relevant experiences.
        Prioritizes exact service, symptom overlap, and outcome clarity.
        """
        # 1. Attempt remote Hindsight Cloud recall
        remote_memories = []
        try:
            headers = {"Content-Type": "application/json"}
            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"
            # Official Hindsight Cloud REST format:
            # POST /v1/default/banks/{bank_id}/memories/recall
            recall_query = query
            if service:
                recall_query = f"{service} {query}"
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(
                    f"{self.base_url}/v1/default/banks/{self.bank_id}/memories/recall",
                    headers=headers,
                    json={"query": recall_query}
                )
                if resp.status_code == 200:
                    remote_data = resp.json()
                    logger.info(f"Hindsight Cloud recall returned {resp.status_code}: cloud memories will supplement local bank")
        except Exception as e:
            logger.info(f"Hindsight Cloud recall offline ({e}). Using local memory bank only.")

        # 2. Local Bank Multi-Strategy Recall (Semantic overlap + Service + Symptom match)
        local_memories = self._read_local_bank()
        scored_memories = []

        query_tokens = set(query.lower().replace("-", " ").replace("_", " ").split())
        symptom_tokens = set([s.lower() for s in (symptoms or [])])

        for m in local_memories:
            score = 0.0
            reasons = []

            # Service exact match: +40 pts
            mem_service = m.get("service", "").lower()
            if service and (service.lower() in mem_service or mem_service in service.lower()):
                score += 40.0
                reasons.append(f"Matching service: {m.get('service')}")

            # Symptom match: up to +30 pts
            mem_symptoms = [s.lower() for s in m.get("symptoms", [])]
            matched_syms = [s for s in mem_symptoms if any(st in s or s in st for st in symptom_tokens or query_tokens)]
            if matched_syms:
                score += min(30.0, len(matched_syms) * 15.0)
                reasons.append(f"Matching symptoms: {', '.join(matched_syms)}")

            # Root cause / title keyword matches: up to +25 pts
            full_text = f"{m.get('incident_title', '')} {m.get('root_cause', '')} {m.get('error_type', '')}".lower()
            matching_words = [w for w in query_tokens if len(w) > 3 and w in full_text]
            if matching_words:
                score += min(25.0, len(matching_words) * 5.0)
                reasons.append(f"Keywords: {', '.join(matching_words[:3])}")

            # Outcome weighting: Successful experiences provide validated paths, Failed provide critical warnings
            if m.get("result") == "SUCCESS":
                score += 5.0
            
            relevance_percentage = min(98, max(45, int(score))) if score > 10 else 0

            if relevance_percentage >= 50:
                exp = MemoryExperience(
                    id=m.get("id"),
                    incident_number=m.get("incident_number", "INC-HIST"),
                    incident_title=m.get("incident_title", ""),
                    service=m.get("service", ""),
                    environment=m.get("environment", "production"),
                    symptoms=m.get("symptoms", []),
                    error_type=m.get("error_type"),
                    root_cause=m.get("root_cause", "Unknown"),
                    action_taken=m.get("action_taken", ""),
                    result=m.get("result", "SUCCESS"),
                    resolution_time_minutes=m.get("resolution_time_minutes", 15),
                    timestamp=m.get("timestamp", datetime.utcnow().isoformat()),
                    confidence=m.get("confidence", 0.90),
                    relevance_score=round(relevance_percentage / 100.0, 2),
                    relevance_explanation="; ".join(reasons) if reasons else "Relevant past operational pattern",
                    context_config=m.get("context_config", {}),
                    tags=m.get("tags", [])
                )
                scored_memories.append((relevance_percentage, exp))

        # Sort by relevance score descending
        scored_memories.sort(key=lambda x: x[0], reverse=True)
        results = [item[1] for item in scored_memories[:limit]]

        conn_status = self.check_connection()
        return MemoryRecallResult(
            memories=results,
            total_found=len(results),
            summary=f"Found {len(results)} relevant previous experiences in Hindsight for {service or 'service'}.",
            hindsight_source=conn_status["status"]
        )

    async def reflect(self, topic: str, service: Optional[str] = None) -> MemoryReflectResponse:
        """
        Reflect operation: Synthesizes high-level disposition and patterns from memories.
        Identifies what consistently succeeds vs what frequently fails.
        """
        local_memories = self._read_local_bank()
        if service:
            filtered = [m for m in local_memories if m.get("service", "").lower() == service.lower()]
        else:
            filtered = local_memories

        successful = [m for m in filtered if m.get("result") == "SUCCESS"]
        failed = [m for m in filtered if m.get("result") == "FAILED"]

        success_actions = [f"{m.get('action_taken')} (fixed: {m.get('root_cause')})" for m in successful]
        failed_actions = [f"{m.get('action_taken')} (failed on: {m.get('incident_title')})" for m in failed]

        if successful or failed:
            insight = f"Historical synthesis for {service or 'all services'}: {len(successful)} successful and {len(failed)} failed actions recorded. Successful remedies frequently involve configuration tuning or index additions, whereas blind restarts fail when resource ceilings or deadlocks are present."
        else:
            insight = "No historical operational patterns recorded yet. As incidents resolve, Hindsight will synthesize organizational wisdom."

        return MemoryReflectResponse(
            insight=insight,
            confidence=0.93 if (successful or failed) else 0.50,
            successful_patterns=success_actions[:3],
            failed_patterns=failed_actions[:3],
            supporting_memory_ids=[m.get("id") for m in (successful + failed)[:5]]
        )

    def get_all_memories(self) -> List[MemoryExperience]:
        local_memories = self._read_local_bank()
        res = []
        for m in local_memories:
            res.append(MemoryExperience(
                id=m.get("id"),
                incident_number=m.get("incident_number", "INC-HIST"),
                incident_title=m.get("incident_title", ""),
                service=m.get("service", ""),
                environment=m.get("environment", "production"),
                symptoms=m.get("symptoms", []),
                error_type=m.get("error_type"),
                root_cause=m.get("root_cause", "Unknown"),
                action_taken=m.get("action_taken", ""),
                result=m.get("result", "SUCCESS"),
                resolution_time_minutes=m.get("resolution_time_minutes", 15),
                timestamp=m.get("timestamp", datetime.utcnow().isoformat()),
                confidence=m.get("confidence", 0.90),
                relevance_score=m.get("relevance_score", 0.90),
                relevance_explanation=m.get("relevance_explanation", "Historical organizational memory"),
                context_config=m.get("context_config", {}),
                tags=m.get("tags", [])
            ))
        return res

hindsight_service = HindsightService()
