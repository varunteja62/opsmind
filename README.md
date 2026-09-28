# 🧠 OpsMind — AI Incident Response Agent That Learns From Every Failure

> **HackWithHyderabad 3.0** | Problem Statement: *AI Agents That Learn Using Hindsight*

[![Frontend](https://img.shields.io/badge/Frontend-React%20+%20Vite-61dafb?logo=react)](./frontend)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20+%20Python-009688?logo=fastapi)](./backend)
[![Memory](https://img.shields.io/badge/Memory-Hindsight%20Cloud-6c47ff?logo=data:image/svg+xml;base64,)](https://vectorize.io)

## What is OpsMind?

OpsMind is an AI-powered **incident response agent** for DevOps and SRE teams. When production failures occur, OpsMind:

1. **Analyzes** the incident using an LLM
2. **Recalls** past incidents from Hindsight memory bank
3. **Performs Differential Reasoning** — detects if the historical fix is already applied
4. **Recommends** targeted actions based on memory evidence
5. **Learns** from every resolution via Hindsight's `RETAIN` operation

### The Core Innovation: Memory-Aware Differential Reasoning

> **The Problem:** Teams repeat past mistakes — recommending a fix that's already been applied.
>
> **The Solution:** OpsMind compares *current environment state* vs *historical state* from Hindsight memory to detect and avoid redundant actions.

Example:

| Historical Incident | Current Incident | OpsMind Verdict |
|---|---|---|
| DB pool = 20 → Fixed to 50 ✅ | DB pool = **50** already | 🚫 "Fix already applied, look deeper" |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **Backend** | Python 3.11 + FastAPI + SQLAlchemy |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **Memory** | Hindsight Cloud (`api.hindsight.vectorize.io`) |
| **LLM** | Gemini / OpenAI / Built-in Heuristic |

---

## Project Structure

```
ops-mind/
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── main.py           # App entry point + CORS
│   │   ├── config.py         # Settings & environment
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic v2 request/response
│   │   ├── services/
│   │   │   ├── hindsight.py  # RETAIN / RECALL / REFLECT
│   │   │   ├── llm.py        # LLM provider (Gemini/OpenAI)
│   │   │   └── agent.py      # Differential reasoning engine
│   │   └── routes/           # REST API endpoints
│   ├── requirements.txt
│   └── .env.example          # Copy to .env (never commit .env)
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── pages/            # Dashboard, Incidents, Memory, Analytics
│   │   ├── components/       # Reusable UI components
│   │   └── services/         # API client layer
│   ├── vercel.json           # Vercel SPA routing config
│   └── vite.config.js
├── database/
│   └── schema.sql            # PostgreSQL schema
├── docs/
│   ├── architecture.md       # System design & data flow
│   └── demo-script.md        # Hackathon demo walkthrough
└── README.md
```

---

## Local Setup

### Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt

# Copy env template and fill in your secrets
cp .env.example .env
# Edit .env: add HINDSIGHT_API_KEY, LLM_API_KEY etc.

uvicorn app.main:app --reload --port 8000
```

### Seed Demo Data

```bash
cd backend
python app/database/seed_data.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: `http://localhost:5173`
API Docs: `http://localhost:8000/docs`

---

## Deployment

### Frontend → Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import GitHub repo
3. Set **Root Directory** to `frontend`
4. Add environment variable: `VITE_API_URL=https://your-backend.railway.app`
5. Deploy

### Backend → Railway / Render (Free)

1. Create a new service on [railway.app](https://railway.app)
2. Connect GitHub repo, set root directory to `backend`
3. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add all environment variables from `.env.example`

---

## Hindsight Memory Integration

OpsMind uses the official **Hindsight Cloud REST API**:

| Operation | Endpoint | When Called |
|---|---|---|
| `RETAIN` | `POST /v1/default/banks/{bank_id}/memories/retain` | After incident resolution |
| `RECALL` | `POST /v1/default/banks/{bank_id}/memories/recall` | When new incident is analyzed |
| `REFLECT` | Local synthesis over recalled memories | For dashboard AI insights |

Memory Bank ID: `opsmind-incidents`

---

## License

MIT — Built for HackWithHyderabad 3.0
