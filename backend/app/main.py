import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.session import engine, Base
from app.routes import incidents, agent, memory, actions, analytics

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("opsmind.main")

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="The AI Incident Response Agent That Learns From Every Failure (HackWithHyderabad 3.0)",
    version="1.0.0"
)

# Enable CORS for frontend dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(incidents.router)
app.include_router(agent.router)
app.include_router(memory.router)
app.include_router(actions.router)
app.include_router(analytics.router)

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "tagline": "Your organization's operational memory.",
        "hindsight_bank": settings.HINDSIGHT_BANK_ID,
        "docs_url": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
