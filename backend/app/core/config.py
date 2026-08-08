import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Quant AI Stock Platform"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+psycopg2://user:password@localhost:5432/stock_db")
    USE_MOCK_DATA: bool = False
    
    # Scoring Engine Weights (Today's Opportunity Score)
    WEIGHT_TODAY_TECHNICAL: float = 0.30
    WEIGHT_TODAY_MOMENTUM: float = 0.20
    WEIGHT_TODAY_VOLUME: float = 0.15
    WEIGHT_TODAY_MARKET_TREND: float = 0.15
    WEIGHT_TODAY_SECTOR: float = 0.10
    WEIGHT_TODAY_NEWS: float = 0.10

    # Scoring Engine Weights (Long-Term Quality Score)
    WEIGHT_LT_FUNDAMENTAL: float = 0.30
    WEIGHT_LT_GROWTH: float = 0.15
    WEIGHT_LT_PROFITABILITY: float = 0.15
    WEIGHT_LT_BALANCE_SHEET: float = 0.10
    WEIGHT_LT_CASH_FLOW: float = 0.10
    WEIGHT_LT_VALUATION: float = 0.10
    WEIGHT_LT_MANAGEMENT: float = 0.10

    # Daily Stock Direction Prediction Engine Config (Phase 1)
    PREDICTION_UP_THRESHOLD: float = 0.005 # +0.5% return
    PREDICTION_DOWN_THRESHOLD: float = -0.005 # -0.5% return
    PREDICTION_CUTOFF_TIME_IST: str = "08:30" # 08:30 AM IST
    TIMEZONE: str = "Asia/Kolkata"
    DEFAULT_MODEL_VERSION: str = "v1.0-baseline"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
