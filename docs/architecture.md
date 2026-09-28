# OpsMind System Architecture
## HackWithHyderabad 3.0: AI Agents That Learn Using Hindsight

### 1. High-Level Concept
OpsMind addresses a critical flaw in enterprise DevOps: **teams repeatedly troubleshoot the same incidents from scratch, forgetting past failed attempts and ignoring already-applied resolutions.**

By combining **FastAPI**, **React/Tailwind**, **PostgreSQL**, and **Hindsight's Biomimetic Memory Architecture (`Retain`, `Recall`, `Reflect`)**, OpsMind creates an autonomous, human-in-the-loop operational memory.

```
+-------------------------------------------------------------------------+
|                              REACT FRONTEND                             |
|  - Real-Time Incident Triage         - Memory-Aware Reasoning Diffs     |
|  - Hindsight Memory Bank Cards       - Human-in-the-Loop Action Guards  |
|  - Interactive Experience Timeline   - Resolution Precision Analytics   |
+------------------------------------+------------------------------------+
                                     | REST (FastAPI)
                                     v
+-------------------------------------------------------------------------+
|                             FASTAPI BACKEND                             |
|                                                                         |
|  +-----------------------+     +-------------------------------------+  |
|  |   LLM Analysis Layer  |     |      Hindsight Memory Client        |  |
|  | (Symptoms & Entities) |     |  - bank_id: `opsmind-incidents`     |  |
|  +-----------+-----------+     |  - Recall: multi-strategy search    |  |
|              |                 |  - Retain: structured experiences   |  |
|              +--------+--------+  - Reflect: cross-incident insights |  |
|                       |        +------------------+------------------+  |
|                       v                           |                     |
|  +--------------------------------------------+   |                     |
|  |   Differential Reasoning Engine            |<--+                     |
|  |   - Compares Current State vs Historical   |                         |
|  |   - Detects ALREADY APPLIED solutions!     |                         |
|  |   - Avoids repeating failed actions        |                         |
|  +--------------------+-----------------------+                         |
|                       |                                                 |
|                       v                                                 |
|  +--------------------------------------------+                         |
|  |   Human-in-the-Loop Action Sandbox         |                         |
|  |   - Guarded simulation of restarts & pool  |                         |
|  +--------------------------------------------+                         |
+-----------------------+----------------------------------+--------------+
                        |                                  |
                        v                                  v
+----------------------------------+   +----------------------------------+
|           POSTGRESQL             |   |        HINDSIGHT MEMORY          |
|  - Incidents table               |   |  - World (Facts & Configs)       |
|  - Incident Actions audit log    |   |  - Experience (Action histories) |
|  - Memory Audit Logs             |   |  - Opinion (Confidence scores)   |
+----------------------------------+   +----------------------------------+
```

---

### 2. The Core Differentiator: Memory-Aware Differential Reasoning

Most RAG systems simply find the nearest vector match and regurgitate the previous solution. In DevOps, this is dangerous:
- **Scenario**: Incident #1024 was caused by DB pool exhaustion and resolved by increasing pool size from 20 to 50.
- **Current Incident**: Incident #1026 has the same symptoms (HTTP 500, DB timeout), but the current environment **already has DB pool = 50**.
- **Naive Agent behavior**: Recommends increasing pool to 50 (redundant, useless).
- **OpsMind Hindsight behavior**:
  1. Recalls Incident #1024 with 91% relevance.
  2. Compares `current_config.db_pool_size (50)` vs `historical_fix (50)`.
  3. Detects that the historical fix is already incorporated in the environment.
  4. Formulates a differential reasoning verdict:
     > *"The previous solution has already been applied in the current environment, so repeating it will not solve the incident. OpsMind pivots to investigate root causes that starve the enlarged pool (such as slow unindexed queries and deployment delta v2.4.2)."*
  5. Generates targeted diagnostic recommendations (inspect query latency on `pg_stat_activity`, diff commit `v2.4.2`).

---

### 3. Hindsight Memory Operations Implemented

| Operation | OpsMind Implementation |
| :--- | :--- |
| **`Retain`** | Triggered upon incident resolution. Ingests structured incident footprint (service, symptoms, root cause, action taken, outcome `SUCCESS` or `FAILED`, resolution time, and configuration context). |
| **`Recall`** | Triggered during incident intake. Searches Hindsight memory bank by combining exact service matching, symptom overlap, error signatures, and outcome scoring. |
| **`Reflect`** | Generates organization-wide synthesis. Distinguishes what actions consistently succeed vs which actions frequently fail (e.g., blind service restarts failing on queue poison pills). |
