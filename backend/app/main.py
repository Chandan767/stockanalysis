from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

from app.api.v1.health import router as health_router
from app.api.v1.stocks import router as stocks_router
from app.api.v1.research import router as research_router
from app.api.v1.market import router as market_router
from app.api.v1.agent import router as agent_router
from app.api.v1.global_market import router as global_market_router
from app.api.v1.news_nlp import router as news_nlp_router
from app.api.v1.technical_features import router as technical_features_router
from app.api.v1.predictions import router as predictions_router

app = FastAPI(
    title=settings.APP_NAME,
    description="Production-Ready AI Stock Research & Analysis Platform for Indian Markets (NSE/BSE)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.core.database import engine
from app.models.models import Base

# Register API Routers
app.include_router(health_router, prefix="/api/v1")
app.include_router(stocks_router, prefix="/api/v1")
app.include_router(technical_features_router, prefix="/api/v1")
app.include_router(predictions_router, prefix="/api/v1")
app.include_router(research_router, prefix="/api/v1")
app.include_router(market_router, prefix="/api/v1")
app.include_router(global_market_router, prefix="/api/v1")
app.include_router(news_nlp_router, prefix="/api/v1")
app.include_router(agent_router, prefix="/api/v1")


from app.services.scheduler_service import start_prediction_scheduler

@app.on_event("startup")
def on_startup():
    import threading
    def init_db():
        try:
            Base.metadata.create_all(bind=engine)
        except Exception as e:
            print(f"Database table initialization notice: {e}")
    threading.Thread(target=init_db, daemon=True).start()
    try:
        start_prediction_scheduler()
    except Exception as e:
        print(f"Scheduler startup notice: {e}")


@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "docs": "/docs",
        "health": "/api/v1/health",
        "stocks": "/api/v1/stocks",
        "research_today": "/api/v1/research/today",
        "research_long_term": "/api/v1/research/long-term",
        "market_overview": "/api/v1/market/overview"
    }
