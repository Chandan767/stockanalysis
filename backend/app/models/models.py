from sqlalchemy import (
    Column, Integer, String, Numeric, BigInteger, Date, DateTime, Boolean, ForeignKey, Text, UniqueConstraint, Index, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Sector(Base):
    __tablename__ = "sectors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    stocks = relationship("Stock", back_populates="sector")


class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    isin = Column(String(20), nullable=True)
    exchange = Column(String(10), nullable=False, default="NSE")
    sector_id = Column(Integer, ForeignKey("sectors.id", ondelete="SET NULL"), nullable=True)
    industry = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    sector = relationship("Sector", back_populates="stocks")
    price_history = relationship("PriceHistory", back_populates="stock", cascade="all, delete-orphan")
    fundamentals = relationship("Fundamental", back_populates="stock", cascade="all, delete-orphan")
    scores = relationship("StockScore", back_populates="stock", cascade="all, delete-orphan")
    news = relationship("News", back_populates="stock", cascade="all, delete-orphan")
    watchlists = relationship("Watchlist", back_populates="stock", cascade="all, delete-orphan")
    predictions = relationship("DailyPrediction", back_populates="stock", cascade="all, delete-orphan")
    snapshots = relationship("FeatureSnapshot", back_populates="stock", cascade="all, delete-orphan")


class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    open = Column(Numeric(12, 2), nullable=False)
    high = Column(Numeric(12, 2), nullable=False)
    low = Column(Numeric(12, 2), nullable=False)
    close = Column(Numeric(12, 2), nullable=False)
    adjusted_close = Column(Numeric(12, 2), nullable=True)
    volume = Column(BigInteger, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    stock = relationship("Stock", back_populates="price_history")

    __table_args__ = (
        UniqueConstraint("stock_id", "date", name="unique_stock_date"),
        Index("idx_price_history_stock_date", "stock_id", date.desc()),
    )


class Fundamental(Base):
    __tablename__ = "fundamentals"

    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    period_date = Column(Date, nullable=False)
    market_cap = Column(Numeric(18, 2), nullable=True)
    pe_ratio = Column(Numeric(8, 2), nullable=True)
    pb_ratio = Column(Numeric(8, 2), nullable=True)
    ev_to_ebitda = Column(Numeric(8, 2), nullable=True)
    peg_ratio = Column(Numeric(8, 2), nullable=True)
    roe = Column(Numeric(6, 2), nullable=True)
    roce = Column(Numeric(6, 2), nullable=True)
    debt_to_equity = Column(Numeric(6, 2), nullable=True)
    interest_coverage = Column(Numeric(8, 2), nullable=True)
    revenue_growth_yoy = Column(Numeric(6, 2), nullable=True)
    profit_growth_yoy = Column(Numeric(6, 2), nullable=True)
    eps_growth_yoy = Column(Numeric(6, 2), nullable=True)
    operating_margin = Column(Numeric(6, 2), nullable=True)
    net_margin = Column(Numeric(6, 2), nullable=True)
    free_cash_flow = Column(Numeric(18, 2), nullable=True)
    promoter_holding = Column(Numeric(5, 2), nullable=True)
    ii_holding = Column(Numeric(5, 2), nullable=True)
    dii_holding = Column(Numeric(5, 2), nullable=True)
    public_holding = Column(Numeric(5, 2), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    stock = relationship("Stock", back_populates="fundamentals")

    __table_args__ = (
        UniqueConstraint("stock_id", "period_date", name="unique_stock_fundamental_period"),
    )


class StockScore(Base):
    __tablename__ = "stock_scores"

    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    score_date = Column(Date, nullable=False)
    today_opportunity_score = Column(Numeric(5, 2), nullable=True)
    technical_score = Column(Numeric(5, 2), nullable=True)
    momentum_score = Column(Numeric(5, 2), nullable=True)
    volume_score = Column(Numeric(5, 2), nullable=True)
    sector_score = Column(Numeric(5, 2), nullable=True)
    news_score = Column(Numeric(5, 2), nullable=True)
    long_term_quality_score = Column(Numeric(5, 2), nullable=True)
    fundamental_quality_score = Column(Numeric(5, 2), nullable=True)
    growth_score = Column(Numeric(5, 2), nullable=True)
    profitability_score = Column(Numeric(5, 2), nullable=True)
    balance_sheet_score = Column(Numeric(5, 2), nullable=True)
    cash_flow_score = Column(Numeric(5, 2), nullable=True)
    valuation_score = Column(Numeric(5, 2), nullable=True)
    bias = Column(String(20), nullable=True)
    confidence = Column(String(20), nullable=True)
    classification = Column(String(50), nullable=True)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())

    stock = relationship("Stock", back_populates="scores")

    __table_args__ = (
        UniqueConstraint("stock_id", "score_date", name="unique_stock_score_date"),
        Index("idx_scores_today", "score_date", today_opportunity_score.desc()),
        Index("idx_scores_long_term", "score_date", long_term_quality_score.desc()),
    )


class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    summary = Column(Text, nullable=True)
    url = Column(Text, nullable=True)
    source = Column(String(100), nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=False)
    sentiment = Column(String(20), nullable=True)
    sentiment_score = Column(Numeric(4, 3), nullable=True)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    stock = relationship("Stock", back_populates="news")


class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String(100), default="default_user")
    stock_id = Column(Integer, ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    stock = relationship("Stock", back_populates="watchlists")

    __table_args__ = (
        UniqueConstraint("user_name", "stock_id", name="unique_user_watchlist_stock"),
    )


# ============================================================================
# DAILY STOCK DIRECTION PREDICTION ENGINE MODELS (PHASE 1)
# ============================================================================

class FeatureSnapshot(Base):
    __tablename__ = "feature_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    as_of_timestamp = Column(DateTime(timezone=True), nullable=False)
    features_json = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    stock = relationship("Stock", back_populates="snapshots")
    predictions = relationship("DailyPrediction", back_populates="snapshot")

    __table_args__ = (
        Index("idx_feature_snapshots_stock_time", "stock_id", as_of_timestamp.desc()),
    )


class DailyPrediction(Base):
    __tablename__ = "daily_predictions"

    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    prediction_date = Column(Date, nullable=False)
    prediction_timestamp = Column(DateTime(timezone=True), nullable=False)
    prediction = Column(String(10), nullable=False) # UP, DOWN, NEUTRAL
    up_probability = Column(Numeric(5, 4), nullable=False)
    down_probability = Column(Numeric(5, 4), nullable=False)
    neutral_probability = Column(Numeric(5, 4), nullable=False)
    expected_return = Column(Numeric(6, 4), nullable=True)
    expected_return_low = Column(Numeric(6, 4), nullable=True)
    expected_return_high = Column(Numeric(6, 4), nullable=True)
    confidence = Column(String(20), nullable=False) # High, Medium, Low
    market_regime = Column(String(50), nullable=True)
    model_version = Column(String(50), nullable=False, default="v1.0-baseline")
    feature_snapshot_id = Column(Integer, ForeignKey("feature_snapshots.id", ondelete="SET NULL"), nullable=True)
    prediction_reason = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    stock = relationship("Stock", back_populates="predictions")
    snapshot = relationship("FeatureSnapshot", back_populates="predictions")
    evaluation = relationship("PredictionEvaluation", back_populates="prediction_record", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("stock_id", "prediction_date", name="unique_stock_prediction_date"),
        Index("idx_daily_predictions_date", "prediction_date", up_probability.desc()),
    )


class PredictionEvaluation(Base):
    __tablename__ = "prediction_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("daily_predictions.id", ondelete="CASCADE"), unique=True, nullable=False)
    actual_date = Column(Date, nullable=False)
    actual_open = Column(Numeric(12, 2), nullable=True)
    actual_close = Column(Numeric(12, 2), nullable=True)
    actual_return = Column(Numeric(8, 4), nullable=True)
    actual_direction = Column(String(10), nullable=True) # UP, DOWN, NEUTRAL
    prediction_correct = Column(Boolean, nullable=True)
    prediction_error = Column(Numeric(8, 4), nullable=True)
    evaluated_at = Column(DateTime(timezone=True), server_default=func.now())

    prediction_record = relationship("DailyPrediction", back_populates="evaluation")


class GlobalMarketData(Base):
    __tablename__ = "global_market_data"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(30), nullable=False)
    name = Column(String(100), nullable=False)
    region = Column(String(30), nullable=False) # US, ASIA, EUROPE, INDIA, COMMODITIES, CURRENCIES
    date = Column(Date, nullable=False)
    close = Column(Numeric(14, 4), nullable=False)
    prev_close = Column(Numeric(14, 4), nullable=True)
    return_1d = Column(Numeric(8, 4), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("symbol", "date", name="unique_global_symbol_date"),
    )


class MacroEvent(Base):
    __tablename__ = "macro_events"

    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)
    impact_rating = Column(String(20), nullable=True)
    event_date = Column(Date, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
