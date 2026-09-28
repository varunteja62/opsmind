import os
import sys
from datetime import datetime, timedelta

# Ensure parent path is in pythonpath
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database.session import SessionLocal, engine, Base
from app.models.incident import Incident, IncidentAction, MemoryAuditLog
from app.schemas.memory import MemoryExperience
from app.services.hindsight import hindsight_service
import asyncio

async def seed_all():
    print("[*] Initializing OpsMind database schema and Hindsight memories...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing demo data if needed to guarantee fresh benchmark state
    db.query(IncidentAction).delete()
    db.query(MemoryAuditLog).delete()
    db.query(Incident).delete()
    db.commit()

    # Benchmark Memories to Retain in Hindsight
    benchmark_memories = [
        MemoryExperience(
            id="mem-1024-dbpool",
            incident_number="INC-1024",
            incident_title="Payment API returning 500 errors",
            service="payment-api",
            environment="production",
            symptoms=["HTTP 500", "database timeout", "high connection count"],
            error_type="HTTP 500",
            root_cause="Database connection pool exhaustion",
            action_taken="Increased database connection pool from 20 to 50",
            result="SUCCESS",
            resolution_time_minutes=12,
            confidence=0.94,
            relevance_score=0.91,
            relevance_explanation="Matches service (payment-api), symptoms (database timeout), and HTTP 500 error pattern",
            context_config={"db_pool_size": 20, "max_connections": 20},
            tags=["payment-api", "postgres", "pool-exhaustion", "success"]
        ),
        MemoryExperience(
            id="mem-1018-auth-ntp",
            incident_number="INC-1018",
            incident_title="Authentication Service high latency & token rejection",
            service="auth-service",
            environment="production",
            symptoms=["401 Unauthorized", "JWT validation timeout", "high latency"],
            error_type="HTTP 401",
            root_cause="Clock skew between auth nodes and Redis session store",
            action_taken="Synchronized chrony NTP daemon and set token skew tolerance to 60s",
            result="SUCCESS",
            resolution_time_minutes=18,
            confidence=0.92,
            relevance_score=0.88,
            relevance_explanation="Matches auth-service and token verification latency",
            context_config={"clock_tolerance_sec": 0},
            tags=["auth-service", "jwt", "ntp", "success"]
        ),
        MemoryExperience(
            id="mem-1012-notif-restart-fail",
            incident_number="INC-1012",
            incident_title="Notification Service queue backlog spike",
            service="notification-service",
            environment="production",
            symptoms=["Kafka consumer lag > 50,000", "Worker CPU 100%"],
            error_type="QueueBacklog",
            root_cause="Corrupted poison-pill message in payment notification topic",
            action_taken="Restarted notification-service pods",
            result="FAILED",
            resolution_time_minutes=35,
            confidence=0.89,
            relevance_score=0.82,
            relevance_explanation="FAILED experience: Blind restart caused crashloop because poison pill remained in queue head",
            context_config={"consumer_threads": 4},
            tags=["notification-service", "kafka", "restart-failed", "failed"]
        ),
        MemoryExperience(
            id="mem-1013-notif-dlq-success",
            incident_number="INC-1013",
            incident_title="Notification Service queue unblocked",
            service="notification-service",
            environment="production",
            symptoms=["Kafka consumer lag > 50,000", "Worker crashloop"],
            error_type="QueueBacklog",
            root_cause="Poison pill payload deserialization crash",
            action_taken="Rerouted poison pill to Dead-Letter-Queue (DLQ) and updated deserializer schema",
            result="SUCCESS",
            resolution_time_minutes=14,
            confidence=0.96,
            relevance_score=0.89,
            relevance_explanation="SUCCESSFUL experience: DLQ reroute permanently cleared blockage without message loss",
            context_config={"dlq_enabled": False},
            tags=["notification-service", "kafka", "dlq", "success"]
        ),
        MemoryExperience(
            id="mem-1008-order-redis",
            incident_number="INC-1008",
            incident_title="Order Service Redis connection drops",
            service="order-service",
            environment="production",
            symptoms=["RedisConnectionError", "Cart checkout timeout"],
            error_type="RedisConnectionError",
            root_cause="Redis client connection leak on unhandled checkout exceptions",
            action_taken="Added try-finally client connection release and enabled connection pooling in redis-py",
            result="SUCCESS",
            resolution_time_minutes=22,
            confidence=0.91,
            relevance_score=0.84,
            relevance_explanation="Resolved Redis connection leak across order workers",
            context_config={"redis_pool": False},
            tags=["order-service", "redis", "leak", "success"]
        )
    ]

    # Retain all into Hindsight Memory Bank
    print("[*] Retaining benchmark experiences into Hindsight Memory Bank...")
    for mem in benchmark_memories:
        await hindsight_service.retain(mem)
        print(f"  + Retained [{mem.result}] {mem.incident_number}: {mem.incident_title}")

    # Seed Database Incidents
    print("[*] Seeding Incidents table in Database...")
    incidents_data = [
        Incident(
            incident_number="INC-1024",
            title="Payment API returning 500 errors",
            description="Production payment requests are failing with HTTP 500 errors. Database timeout messages are appearing in the application logs.",
            service="payment-api",
            environment="production",
            severity="critical",
            status="resolved",
            error_message="HTTP 500: Database connection pool exhausted",
            recent_deployment="v2.3.9",
            logs="[ERROR] ConnectionPoolTimeout: Timeout after 30s waiting for connection. Active=20, Max=20.",
            current_config={"db_pool_size": 20},
            extracted_entities={"service": "payment-api", "error_type": "HTTP 500", "symptoms": ["database timeout", "high database connection usage"]},
            root_cause="Database connection pool exhaustion",
            resolution="Increased database connection pool from 20 to 50",
            outcome="success",
            resolution_time_minutes=12,
            hindsight_memory_id="mem-1024-dbpool",
            learned_at=datetime.utcnow() - timedelta(days=2),
            created_at=datetime.utcnow() - timedelta(days=2)
        ),
        Incident(
            incident_number="INC-1018",
            title="Authentication Service High Latency",
            description="Users intermittently experiencing 401 Unauthorized errors and 2.5s login latency.",
            service="auth-service",
            environment="production",
            severity="medium",
            status="resolved",
            error_message="HTTP 401: Token validation signature expired",
            recent_deployment="v1.12.0",
            logs="[WARN] ClockSkewException: Token iat timestamp is 45s in future compared to host time.",
            current_config={"clock_tolerance_sec": 0},
            extracted_entities={"service": "auth-service", "error_type": "HTTP 401", "symptoms": ["401 Unauthorized", "JWT validation timeout"]},
            root_cause="Clock skew between auth nodes and Redis session store",
            resolution="Synchronized chrony NTP daemon and set token skew tolerance to 60s",
            outcome="success",
            resolution_time_minutes=18,
            hindsight_memory_id="mem-1018-auth-ntp",
            learned_at=datetime.utcnow() - timedelta(days=5),
            created_at=datetime.utcnow() - timedelta(days=5)
        ),
        Incident(
            incident_number="INC-1025",
            title="Notification Service Queue Spike",
            description="Consumer lag in notification queue is exceeding threshold. Notification delivery delayed by >20 mins.",
            service="notification-service",
            environment="production",
            severity="medium",
            status="resolved",
            error_message="QueueBacklog: Consumer lag critical",
            recent_deployment="v3.1.0",
            logs="[ERROR] DeserializationError: Invalid payload format in partition 3 offset 92104.",
            current_config={"consumer_threads": 4},
            extracted_entities={"service": "notification-service", "error_type": "QueueBacklog", "symptoms": ["Kafka consumer lag > 50,000"]},
            root_cause="Poison pill payload deserialization crash",
            resolution="Rerouted poison pill to Dead-Letter-Queue (DLQ) and updated deserializer schema",
            outcome="success",
            resolution_time_minutes=14,
            hindsight_memory_id="mem-1013-notif-dlq-success",
            learned_at=datetime.utcnow() - timedelta(days=1),
            created_at=datetime.utcnow() - timedelta(days=1)
        ),
        # ACTIVE INCIDENT FOR THE LIVE DEMO!
        Incident(
            incident_number="INC-1026",
            title="Payment API returning 500 errors (Post-Deployment v2.4.2)",
            description="Production payment requests are failing with HTTP 500 errors. Database timeout messages are appearing in the application logs following release of v2.4.2.",
            service="payment-api",
            environment="production",
            severity="critical",
            status="active",
            error_message="HTTP 500: Connection pool starvation",
            recent_deployment="v2.4.2 (deployed 25 mins ago)",
            logs="[ERROR] ConnectionPoolStarvation: Active connections 50/50. Average query duration 4,800ms.",
            current_config={"db_pool_size": 50, "max_connections": 50}, # NOTE: Already 50! Demonstrates differential reasoning!
            extracted_entities={"service": "payment-api", "error_type": "HTTP 500", "symptoms": ["database timeout", "connection pool starvation"]},
            created_at=datetime.utcnow() - timedelta(minutes=25)
        )
    ]

    db.add_all(incidents_data)
    db.commit()

    print("[SUCCESS] OpsMind database and Hindsight memory bank successfully seeded with realistic demo data!")
    db.close()

if __name__ == "__main__":
    asyncio.run(seed_all())
