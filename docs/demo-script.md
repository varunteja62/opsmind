# OpsMind Demo Script & Judge Presentation Walkthrough
## HackWithHyderabad 3.0: AI Agents That Learn Using Hindsight

---

### Elevator Pitch (30 seconds)
> *"Hello judges! We are presenting **OPSMIND: The AI Incident Response Agent That Learns From Every Failure**.
> In modern software organizations, engineering teams waste hundreds of hours repeatedly troubleshooting the same outages, repeating past failed fixes, and starting from scratch.
> OpsMind uses **Hindsight's Biomimetic Memory Architecture** to give software organizations persistent operational memory. It doesn't just answer questions—it remembers previous incidents, learns which fixes worked and failed, and performs differential reasoning to avoid repeating mistakes."*

---

### The 5-Step Demo Scenario Walkthrough

#### Step 1: Open Dashboard & Show Organizational Memory
1. Open the OpsMind dashboard at `http://localhost:5173`.
2. Point out:
   - **Active Incidents**: 1 critical outage on `payment-api`.
   - **Hindsight Memory Bank Status**: Live status badge in top right (`opsmind-incidents`).
   - **Memory-Assisted Resolutions KPI**: 78% of resolutions guided by institutional memory.
   - **AI Memory Insights**: Live synthesis showing proven fixes vs failed restart attempts.

#### Step 2: Open Incident #1026 (`payment-api` 500 errors)
1. Click **"Investigate Active #INC-1026"**.
2. Notice the details:
   - Symptoms: Database timeout, HTTP 500.
   - Deployment: `v2.4.2 (deployed 25 mins ago)`.
   - Current Configuration: `db_pool_size = 50`.
3. Highlight **Flow 2: Incident Analysis**:
   - The LLM extracted the technical entities, symptoms, and potential causes.

#### Step 3: Reveal Hindsight Memory Recall & The Core Differentiator
1. Scroll down to **Step 2: Hindsight Memory Search**:
   - OpsMind retrieved **Incident #1024** (91% relevance match).
   - Historical Incident #1024 was caused by DB pool exhaustion and resolved by increasing pool from 20 to 50 (Result: SUCCESS).
2. **THE SHOWSTOPPER MOMENT — Step 3: Comparative Differential Reasoning**:
   - Look at the side-by-side card comparing **Historical State (Pool=20)** vs **Current State (Pool=50)**.
   - Read the agent verdict:
     > *"The current environment already incorporates the historical pool fix (`db_pool_size = 50`). Blindly repeating the pool resize will NOT solve this outage. OpsMind pivots to investigate root causes that starve the enlarged pool (query latency and deployment changes)."*
   - Emphasize to the judges: **"A generic ChatGPT wrapper would have blindly told us to increase the pool to 50. OpsMind reasons over memory and knows the fix is already applied!"**

#### Step 4: Human-in-the-Loop Action Approval
1. Point to **Step 3: Recommended Actions**:
   - Action 1: *Check database query latency on pg_stat_activity*.
   - Action 2: *Inspect recent deployment v2.4.2*.
2. Click **"Review & Approve"** on Action 1.
3. Review the risk and reasoning in the modal, then click **"Approve & Execute"**.
4. Show the simulated execution output:
   - Identifies active unindexed queries on the transactions table taking >4,500ms.

#### Step 5: Incident Resolution & Learning into Hindsight (Flow 8)
1. Click **"Resolve & Learn into Hindsight"**.
2. Fill in:
   - Root Cause: `Missing composite index on transactions table introduced in v2.4.2`.
   - Resolution: `Applied migration adding index and restarted worker pool`.
   - Outcome: `Success`.
3. Check the **"Retain Experience in Hindsight"** checkbox and click **"Complete Resolution & Learn"**.
4. Navigate to the **Memory Bank** tab:
   - Show the newly retained memory card.
   - Click **"Visual Timeline"** to show the evolving chronological trajectory of incidents.
   - Click **"Memory Graph"** to show the relationship network between services, causes, and solutions.
5. Navigate to **Analytics**:
   - Show that the resolution time and memory metrics updated dynamically!

---

### Conclusion (Closing Statement)
> *"OpsMind demonstrates that AI agents shouldn't be stateless prompt machines. With Hindsight, an incident resolved today makes the agent smarter for every engineer tomorrow."*
