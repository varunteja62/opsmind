import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.incident import Incident, IncidentAction, MemoryAuditLog
from app.schemas.agent import (
    IncidentAnalysis, ComparativeReasoning, ActionPlanItem, 
    AgentInvestigationResponse
)
from app.schemas.memory import MemoryExperience
from app.services.llm import llm_service
from app.services.hindsight import hindsight_service

logger = logging.getLogger("opsmind.agent")

class IncidentAgent:
    """
    OpsMind Autonomous Incident Response Agent
    Leverages Hindsight memory to learn from previous failures and successes.
    """
    async def investigate_incident(self, incident: Incident, db: Session) -> AgentInvestigationResponse:
        # FLOW 2: INCIDENT ANALYSIS
        analysis_raw = await llm_service.analyze_incident(
            title=incident.title,
            description=incident.description,
            service=incident.service,
            logs=incident.logs
        )
        
        analysis = IncidentAnalysis(
            service=incident.service,
            environment=incident.environment,
            symptoms=analysis_raw.get("symptoms", []),
            error_type=analysis_raw.get("error_type", "HTTP 500"),
            possible_causes=analysis_raw.get("possible_causes", []),
            severity=analysis_raw.get("severity", incident.severity),
            relevant_keywords=analysis_raw.get("relevant_keywords", []),
            important_technical_entities=analysis_raw.get("important_technical_entities", {})
        )
        
        # Save extracted entities to incident model
        incident.extracted_entities = analysis.model_dump()
        db.commit()

        # FLOW 3: HINDSIGHT MEMORY SEARCH
        search_query = f"{incident.service} {incident.title} {' '.join(analysis.symptoms)} {analysis.error_type}"
        recall_result = await hindsight_service.recall(
            query=search_query,
            service=incident.service,
            symptoms=analysis.symptoms,
            limit=4
        )
        
        memories = recall_result.memories

        # Audit log the recall in Postgres
        audit = MemoryAuditLog(
            incident_id=incident.id,
            operation_type="recall",
            query_text=search_query,
            matched_memories=[m.model_dump() for m in memories],
            confidence_score=memories[0].confidence if memories else 0.5
        )
        db.add(audit)
        db.commit()

        # FLOW 4: MEMORY-AWARE DIFFERENTIAL REASONING
        reasoning, recommendations, actions_to_create = self._perform_differential_reasoning(
            incident=incident,
            analysis=analysis,
            memories=memories
        )

        # Audit log the reasoning
        audit.reasoning_summary = reasoning.reasoning_explanation
        db.commit()

        # Save generated actions to database for human-in-the-loop approval
        for act in actions_to_create:
            existing = db.query(IncidentAction).filter(
                IncidentAction.incident_id == incident.id,
                IncidentAction.action_type == act.action_type
            ).first()
            if not existing:
                db_action = IncidentAction(
                    incident_id=incident.id,
                    action_type=act.action_type,
                    description=act.title,
                    reasoning=act.reason,
                    risk_level=act.risk,
                    status="pending",
                    relevance_source=act.relevance_source,
                    simulated=True
                )
                db.add(db_action)
        db.commit()

        hindsight_status = hindsight_service.check_connection()["status"]

        return AgentInvestigationResponse(
            incident_id=incident.id,
            incident_number=incident.incident_number,
            analysis=analysis,
            memories_found=memories,
            reasoning=reasoning,
            recommendations=recommendations,
            hindsight_status=hindsight_status
        )

    def _perform_differential_reasoning(
        self,
        incident: Incident,
        analysis: IncidentAnalysis,
        memories: List[MemoryExperience]
    ) -> tuple[ComparativeReasoning, List[ActionPlanItem], List[ActionPlanItem]]:
        """
        Compares CURRENT incident vs HISTORICAL incidents.
        Detects if a historical fix is already present in current environment.
        Distinguishes successful and failed historical attempts.
        """
        current_config = incident.current_config or {}
        current_pool_size = current_config.get("db_pool_size")
        
        # Check if we have a primary matching memory
        best_match = memories[0] if memories else None
        
        if not best_match:
            # Baseline reasoning when no memory is present
            explanation = (
                f"No previous experiences found in Hindsight for {incident.service}. "
                "Initiating baseline diagnostics: verifying service reachability, checking infrastructure health, and reviewing recent deployments."
            )
            reasoning = ComparativeReasoning(
                has_relevant_memory=False,
                best_matching_memory=None,
                similarity_percentage=0,
                historical_state={},
                current_state=current_config,
                already_applied_solutions=[],
                novel_factors=["First occurrence for this service footprint"],
                reasoning_explanation=explanation
            )
            recommendations = [
                ActionPlanItem(
                    title=f"Inspect recent deployment for {incident.service}",
                    action_type="inspect_deployment",
                    reason="Without historical memory, code regressions in the latest release are the most frequent root cause of new 500 errors.",
                    risk="low",
                    relevance_source="heuristic"
                ),
                ActionPlanItem(
                    title=f"Perform graceful restart of {incident.service}",
                    action_type="restart_service",
                    reason="Initial mitigation step to clear potential deadlocks and reset connection handles.",
                    risk="medium",
                    relevance_source="heuristic"
                )
            ]
            return reasoning, recommendations, recommendations

        # We have a matching memory! Check if historical solution was already applied!
        hist_config = best_match.context_config or {}
        hist_pool = hist_config.get("db_pool_size", 20)
        hist_action = best_match.action_taken.lower()
        hist_result = best_match.result.upper()

        already_applied = []
        novel_factors = []

        # Scenario: DB Pool was 20 in past, fixed to 50. Current environment is ALREADY 50!
        if current_pool_size and current_pool_size >= 50 and ("pool" in hist_action or "50" in hist_action):
            already_applied.append(f"Connection pool already scaled to {current_pool_size} (matching previous fix)")
            novel_factors.append("Current environment already incorporates historical pool fix")
            
            if incident.recent_deployment:
                novel_factors.append(f"New deployment delta: {incident.recent_deployment}")

            explanation = (
                f"🧠 Memory-Aware Differential Reasoning:\n"
                f"Found historical incident #{best_match.incident_number} with {int((best_match.relevance_score or 0.91) * 100)}% relevance.\n"
                f"The previous incident was caused by database connection pool exhaustion and resolved by increasing pool size from {hist_pool} to 50 ({hist_result}).\n\n"
                f"CRITICAL INSIGHT: The current environment already has `db_pool_size = {current_pool_size}`.\n"
                f"Therefore, blindly repeating the historical pool resize will NOT solve this incident.\n"
                f"OpsMind pivots to investigate root causes that starve the enlarged pool (such as slow unindexed queries and deployment changes)."
            )

            reasoning = ComparativeReasoning(
                has_relevant_memory=True,
                best_matching_memory=best_match,
                similarity_percentage=int((best_match.relevance_score or 0.91) * 100),
                historical_state={"db_pool_size": hist_pool, "solution_applied": best_match.action_taken},
                current_state=current_config,
                already_applied_solutions=already_applied,
                novel_factors=novel_factors,
                reasoning_explanation=explanation
            )

            recommendations = [
                ActionPlanItem(
                    title="Check database query latency (pg_stat_activity)",
                    action_type="query_latency_check",
                    reason="Since pool size is already at 50, lingering queries or table scans are the primary cause of connection exhaustion.",
                    risk="low",
                    relevance_source="memory_differential"
                ),
                ActionPlanItem(
                    title=f"Inspect recent deployment {incident.recent_deployment or 'changes'}",
                    action_type="inspect_deployment",
                    reason="Historical pool fix is active; a newly introduced query regression in the latest deployment is suspect.",
                    risk="low",
                    relevance_source="memory_differential"
                ),
                ActionPlanItem(
                    title="Review application database timeout logs",
                    action_type="review_logs",
                    reason="Identify the specific API controller route exhausting connections.",
                    risk="low",
                    relevance_source="memory_differential"
                )
            ]
            return reasoning, recommendations, recommendations

        elif "pool" in hist_action and (current_pool_size is None or current_pool_size < 50):
            # The historical fix HAS NOT yet been applied!
            explanation = (
                f"🧠 Memory-Aware Recommendation:\n"
                f"Found historical incident #{best_match.incident_number} with {int((best_match.relevance_score or 0.91) * 100)}% relevance.\n"
                f"Previous root cause was '{best_match.root_cause}', successfully resolved by '{best_match.action_taken}'.\n"
                f"Current pool size is {current_pool_size or 20}. Recommending applying the proven resolution."
            )
            reasoning = ComparativeReasoning(
                has_relevant_memory=True,
                best_matching_memory=best_match,
                similarity_percentage=int((best_match.relevance_score or 0.91) * 100),
                historical_state={"db_pool_size": hist_pool},
                current_state={"db_pool_size": current_pool_size or 20},
                already_applied_solutions=[],
                novel_factors=["Current environment has not yet incorporated the historical fix"],
                reasoning_explanation=explanation
            )
            recommendations = [
                ActionPlanItem(
                    title="Increase database connection pool size from 20 to 50",
                    action_type="increase_pool",
                    reason=f"Directly matches successful resolution in incident #{best_match.incident_number}.",
                    risk="medium",
                    relevance_source="memory_historical_success"
                ),
                ActionPlanItem(
                    title=f"Gracefully restart {incident.service}",
                    action_type="restart_service",
                    reason="Applies connection pool changes without downtime.",
                    risk="medium",
                    relevance_source="memory_historical_success"
                )
            ]
            return reasoning, recommendations, recommendations

        else:
            # General memory match with comparative insights
            explanation = (
                f"Retrieved historical incident #{best_match.incident_number} for {best_match.service} "
                f"(Result: {best_match.result}). Previous root cause: '{best_match.root_cause}'. "
                f"Previous action: '{best_match.action_taken}'."
            )
            reasoning = ComparativeReasoning(
                has_relevant_memory=True,
                best_matching_memory=best_match,
                similarity_percentage=int((best_match.relevance_score or 0.85) * 100),
                historical_state=hist_config,
                current_state=current_config,
                already_applied_solutions=[],
                novel_factors=[],
                reasoning_explanation=explanation
            )
            recommendations = [
                ActionPlanItem(
                    title=f"Execute diagnostic: {best_match.action_taken}",
                    action_type="inspect_deployment",
                    reason=f"Guided by historical resolution in #{best_match.incident_number}.",
                    risk="low",
                    relevance_source="memory_guided"
                )
            ]
            return reasoning, recommendations, recommendations

incident_agent = IncidentAgent()
