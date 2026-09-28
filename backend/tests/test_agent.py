import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import SessionLocal, Base, engine
from app.models.incident import Incident
from app.services.agent import incident_agent
from app.services.hindsight import hindsight_service
from app.schemas.memory import MemoryExperience

async def test_agent_differential_reasoning():
    print("Testing Agent Differential Reasoning...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Retain historical incident in Hindsight
    hist_exp = MemoryExperience(
        id="mem-hist-1024",
        incident_number="INC-1024",
        incident_title="Payment API returning 500",
        service="payment-api",
        environment="production",
        symptoms=["database timeout", "high connection pool usage"],
        error_type="HTTP 500",
        root_cause="Database connection pool exhaustion",
        action_taken="Increased database connection pool from 20 to 50",
        result="SUCCESS",
        resolution_time_minutes=12,
        confidence=0.95,
        context_config={"db_pool_size": 20}
    )
    await hindsight_service.retain(hist_exp)

    # 2. Create current incident with db_pool_size ALREADY = 50
    current_inc = Incident(
        incident_number="INC-CURRENT-TEST",
        title="Payment API returning 500 errors",
        description="Production payment requests failing with HTTP 500 after release v2.4.2.",
        service="payment-api",
        environment="production",
        severity="critical",
        status="active",
        error_message="HTTP 500: Database timeout",
        recent_deployment="v2.4.2",
        logs="Active pool 50/50. Average query duration 4800ms.",
        current_config={"db_pool_size": 50}
    )
    db.add(current_inc)
    db.commit()
    db.refresh(current_inc)

    # 3. Investigate
    investigation = await incident_agent.investigate_incident(current_inc, db)
    
    print("\n[OK] Agent Investigation Output:")
    print(f"  Incident ID: {investigation.incident_number}")
    print(f"  Memories Found: {len(investigation.memories_found)}")
    print(f"  Differential Reasoning Summary:\n  {investigation.reasoning.reasoning_explanation}\n")
    print(f"  Already Applied Solutions: {investigation.reasoning.already_applied_solutions}")
    print(f"  Novel Factors: {investigation.reasoning.novel_factors}")
    print("  Recommendations Generated:")
    for r in investigation.recommendations:
        print(f"    - [{r.risk.upper()}] {r.title}: {r.reason}")

    # Assertions
    assert investigation.reasoning.has_relevant_memory is True
    assert len(investigation.reasoning.already_applied_solutions) > 0
    # Must NOT recommend increasing pool to 50 because it's already 50!
    assert not any("increase database connection pool from 20 to 50" in r.title.lower() for r in investigation.recommendations)
    # Must recommend query latency inspection
    assert any("query" in r.title.lower() or "latency" in r.title.lower() for r in investigation.recommendations)

    print("\n[SUCCESS] Differential Reasoning test successfully verified! The agent correctly detected that the historical fix is already present in the current environment and avoided redundant actions.")
    db.close()

if __name__ == "__main__":
    asyncio.run(test_agent_differential_reasoning())
