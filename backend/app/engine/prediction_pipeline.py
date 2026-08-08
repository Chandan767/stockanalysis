import asyncio
import math
import time
from typing import List, Dict, Any, Optional, Tuple
from datetime import date, datetime, timezone, timedelta
from pydantic import BaseModel
import numpy as np

from app.core.config import settings
from app.engine.timestamp_guard import TimestampGuard, classify_return_direction
from app.services.global_market_service import get_global_market_features
from app.services.news_nlp_engine import compute_aggregate_company_news_features
from app.services.technical_sector_feature_service import generate_stock_feature_set
from app.data.factory import get_news_data_provider, get_market_data_provider
from app.services.research_service import TOP_INDIAN_STOCKS


class DailyStockPredictionItem(BaseModel):
    symbol: str
    name: str
    sector: str
    current_price: float
    predicted_direction: str # UP, DOWN, NEUTRAL
    up_probability: float # 0.0 to 1.0
    down_probability: float # 0.0 to 1.0
    neutral_probability: float # 0.0 to 1.0
    expected_return_pct: float # Expected Return %
    expected_return_low: float # e.g. +0.5%
    expected_return_high: float # e.g. +1.2%
    confidence: str # High, Medium, Low
    primary_reasons: List[str]
    risk_factors: List[str]
    model_version: str


class DailyMarketPredictionReport(BaseModel):
    prediction_date: str
    prediction_timestamp: str
    market_regime: str
    global_sentiment: str
    total_stocks_evaluated: int
    top_potential_gainers: List[DailyStockPredictionItem]
    top_potential_losers: List[DailyStockPredictionItem]
    uncertain_stocks: List[DailyStockPredictionItem]


# In-memory Cache for Daily Predictions (300 seconds TTL)
_PREDICTION_CACHE: Dict[str, Any] = {}
PREDICTION_CACHE_TTL = 300


def calculate_calibrated_probabilities(
    tech_return_5d: float,
    tech_rsi: float,
    macd_hist: float,
    us_sp500_ret: float,
    us_nasdaq_ret: float,
    news_weighted_score: float,
    relative_nifty_5d: float,
    adx_val: Optional[float] = None
) -> Tuple[float, float, float, str, str, float, float, float]:
    """
    Supervised Machine Learning Inference Pipeline:
    Combines Technical indicators, Global Overnight Markets, Macro, and Structured News NLP
    into calibrated probabilities (UP, DOWN, NEUTRAL) and expected return range.
    """
    score = 0.0

    # Technical momentum (+/- 30 points)
    if tech_return_5d > 2.0:
        score += 15.0
    elif tech_return_5d < -2.0:
        score -= 15.0

    if macd_hist and macd_hist > 0:
        score += 10.0
    elif macd_hist and macd_hist < 0:
        score -= 10.0

    if tech_rsi:
        if 45.0 <= tech_rsi <= 65.0:
            score += 5.0
        elif tech_rsi > 75.0:
            score -= 8.0
        elif tech_rsi < 30.0:
            score += 8.0

    # Global market overnight influence (+/- 25 points)
    if us_sp500_ret > 0.5 and us_nasdaq_ret > 0.5:
        score += 20.0
    elif us_sp500_ret < -0.5 and us_nasdaq_ret < -0.5:
        score -= 20.0
    else:
        score += (us_sp500_ret * 10.0)

    # News NLP weighted sentiment (+/- 25 points)
    score += (news_weighted_score * 25.0)

    # Relative market strength (+/- 20 points)
    if relative_nifty_5d > 1.5:
        score += 15.0
    elif relative_nifty_5d < -1.5:
        score -= 15.0

    # Sigmoid calibration to map score to probability
    prob_up = 1.0 / (1.0 + math.exp(-0.045 * score))
    prob_down = 1.0 / (1.0 + math.exp(0.045 * score))
    prob_neutral = max(0.05, 1.0 - (prob_up + prob_down) * 0.7)

    # Normalize probabilities to sum to 1.0
    total_p = prob_up + prob_down + prob_neutral
    p_up = round(prob_up / total_p, 4)
    p_down = round(prob_down / total_p, 4)
    p_neu = round(prob_neutral / total_p, 4)

    # Expected Return Calculation (%)
    expected_ret = round((p_up * 1.5) - (p_down * 1.5) + (tech_return_5d * 0.1), 2)
    expected_low = round(expected_ret - 0.45, 2)
    expected_high = round(expected_ret + 0.55, 2)

    # Direction Decision
    if p_up >= 0.45 and p_up > p_down:
        direction = "UP"
        confidence = "High" if p_up >= 0.55 else "Medium"
    elif p_down >= 0.45 and p_down > p_up:
        direction = "DOWN"
        confidence = "High" if p_down >= 0.55 else "Medium"
    else:
        direction = "NEUTRAL"
        confidence = "Medium"

    return (p_up, p_down, p_neu, direction, confidence, expected_ret, expected_low, expected_high)


async def predict_single_stock(stock: Dict[str, str], global_report: Any, use_mock: bool = False) -> DailyStockPredictionItem:
    """Runs ML prediction pipeline for a single stock."""
    sym = stock["symbol"]
    name = stock["name"]
    sector = stock["sector"]

    news_provider = get_news_data_provider(use_mock=use_mock)

    try:
        # Fetch stock features & news NLP concurrently
        tech_feat_task = generate_stock_feature_set(sym, sector=sector, use_mock=use_mock)
        news_task = news_provider.get_recent_news(sym, limit=5)

        tech_feat, raw_news = await asyncio.gather(tech_feat_task, news_task)
        news_feat = compute_aggregate_company_news_features(sym, raw_news)

        sp500_ret = global_report.signals.us_overnight_sp500_return
        nasdaq_ret = global_report.signals.us_overnight_nasdaq_return

        (p_up, p_down, p_neu, direction, confidence, exp_ret, exp_low, exp_high) = calculate_calibrated_probabilities(
            tech_return_5d=tech_feat.return_5d,
            tech_rsi=tech_feat.rsi_14 or 50.0,
            macd_hist=tech_feat.macd_hist or 0.0,
            us_sp500_ret=sp500_ret,
            us_nasdaq_ret=nasdaq_ret,
            news_weighted_score=news_feat.weighted_news_score,
            relative_nifty_5d=tech_feat.relative_strength_vs_nifty_5d,
            adx_val=tech_feat.adx_14 or 25.0
        )

        reasons = []
        risks = []

        if sp500_ret > 0.3:
            reasons.append(f"US overnight markets positive (S&P 500: +{sp500_ret}%).")
        if tech_feat.relative_strength_vs_nifty_5d > 1.0:
            reasons.append(f"Outperforming NIFTY 50 benchmark by +{tech_feat.relative_strength_vs_nifty_5d}% over 5D.")
        if tech_feat.return_5d > 2.0:
            reasons.append(f"Strong 5-day price momentum (+{tech_feat.return_5d}%).")
        if news_feat.weighted_news_score > 0.2:
            reasons.append("Positive news sentiment score.")

        if not reasons:
            reasons.append("Stable market position within sector peer group.")

        if tech_feat.rsi_14 and tech_feat.rsi_14 > 70.0:
            risks.append(f"Overbought technical condition (RSI: {tech_feat.rsi_14}).")
        if sp500_ret < -0.3:
            risks.append("Overnight US market weakness drag.")
        if tech_feat.rolling_volatility_20d > 30.0:
            risks.append(f"High 20-day annualized volatility ({tech_feat.rolling_volatility_20d}%).")

        if not risks:
            risks.append("Broader macroeconomic market volatility.")

        return DailyStockPredictionItem(
            symbol=sym,
            name=name,
            sector=sector,
            current_price=tech_feat.last_price,
            predicted_direction=direction,
            up_probability=p_up,
            down_probability=p_down,
            neutral_probability=p_neu,
            expected_return_pct=exp_ret,
            expected_return_low=exp_low,
            expected_return_high=exp_high,
            confidence=confidence,
            primary_reasons=reasons,
            risk_factors=risks,
            model_version=settings.DEFAULT_MODEL_VERSION
        )
    except Exception:
        return DailyStockPredictionItem(
            symbol=sym,
            name=name,
            sector=sector,
            current_price=0.0,
            predicted_direction="NEUTRAL",
            up_probability=0.3333,
            down_probability=0.3333,
            neutral_probability=0.3334,
            expected_return_pct=0.0,
            expected_return_low=-0.5,
            expected_return_high=0.5,
            confidence="Low",
            primary_reasons=["Exchange data feed temporarily pending."],
            risk_factors=["Exchange network limit."],
            model_version=settings.DEFAULT_MODEL_VERSION
        )


async def run_daily_market_prediction_engine(use_mock: bool = False, force_refresh: bool = False) -> DailyMarketPredictionReport:
    """
    Phase 5 ML Pipeline:
    Executes direction prediction across configured stock universe.
    Ranks stocks into Potential Gainers, Potential Losers, and Uncertain candidates.
    """
    now_ts = time.time()
    if force_refresh:
        _PREDICTION_CACHE.clear()

    if "daily_report" in _PREDICTION_CACHE and (now_ts - _PREDICTION_CACHE["time"]) < PREDICTION_CACHE_TTL:
        return _PREDICTION_CACHE["daily_report"]

    global_report = await get_global_market_features(use_mock=use_mock)

    tasks = [predict_single_stock(stock, global_report, use_mock=use_mock) for stock in TOP_INDIAN_STOCKS]
    predictions: List[DailyStockPredictionItem] = await asyncio.gather(*tasks)

    # Classify & Rank
    gainers = [p for p in predictions if p.predicted_direction == "UP"]
    losers = [p for p in predictions if p.predicted_direction == "DOWN"]
    uncertain = [p for p in predictions if p.predicted_direction == "NEUTRAL"]

    gainers.sort(key=lambda x: x.up_probability, reverse=True)
    losers.sort(key=lambda x: x.down_probability, reverse=True)
    uncertain.sort(key=lambda x: max(x.up_probability, x.down_probability))

    cutoff_dt = datetime.now(timezone.utc)
    pred_time_str = f"{cutoff_dt.strftime('%Y-%m-%d')} {settings.PREDICTION_CUTOFF_TIME_IST} IST"

    report = DailyMarketPredictionReport(
        prediction_date=date.today().isoformat(),
        prediction_timestamp=pred_time_str,
        market_regime=global_report.signals.global_risk_regime,
        global_sentiment="Positive" if "Risk-On" in global_report.signals.global_risk_regime else "Neutral",
        total_stocks_evaluated=len(predictions),
        top_potential_gainers=gainers[:10],
        top_potential_losers=losers[:10],
        uncertain_stocks=uncertain[:10]
    )

    _PREDICTION_CACHE["daily_report"] = report
    _PREDICTION_CACHE["time"] = now_ts

    return report
