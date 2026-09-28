import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.schemas.memory import MemoryExperience
from app.services.hindsight import hindsight_service

async def test_retain_and_recall():
    print("Testing Hindsight Memory Retain...")
    test_exp = MemoryExperience(
        id="test-mem-001",
        incident_number="INC-TEST-01",
        incident_title="Test Payment DB pool exhaustion",
        service="payment-api",
        environment="production",
        symptoms=["HTTP 500", "database timeout"],
        error_type="HTTP 500",
        root_cause="Test pool exhaustion",
        action_taken="Increased pool from 20 to 50",
        result="SUCCESS",
        resolution_time_minutes=10,
        confidence=0.95,
        context_config={"db_pool_size": 20}
    )
    
    mem_id = await hindsight_service.retain(test_exp)
    assert mem_id == "test-mem-001"
    print(f"[OK] Retained memory successfully with ID: {mem_id}")

    print("\nTesting Hindsight Memory Recall...")
    recall_result = await hindsight_service.recall(
        query="Payment API database timeout 500",
        service="payment-api",
        symptoms=["database timeout"]
    )
    assert recall_result.total_found > 0
    top_memory = recall_result.memories[0]
    print(f"[OK] Found {recall_result.total_found} memories. Top match: {top_memory.incident_number} (Relevance: {top_memory.relevance_score})")
    assert top_memory.service == "payment-api"

    print("\nTesting Hindsight Memory Reflect...")
    reflect_result = await hindsight_service.reflect(
        topic="database pool timeouts",
        service="payment-api"
    )
    print(f"[OK] Reflection insight: {reflect_result.insight}")
    print(f"[OK] Successful patterns: {reflect_result.successful_patterns}")
    
    print("\n[SUCCESS] All Hindsight memory unit tests passed successfully!")

if __name__ == "__main__":
    asyncio.run(test_retain_and_recall())
