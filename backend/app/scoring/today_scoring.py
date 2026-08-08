from pydantic import BaseModel
from typing import Optional
from app.indicators.technical import TechnicalIndicatorResults
from app.core.config import settings


class TodayScoreResult(BaseModel):
    symbol: str
    technical_score: float
    momentum_score: float
    volume_score: float
    market_trend_score: float
    sector_score: float
    news_score: float
    today_opportunity_score: float
    bias: str # Bullish, Bearish, Neutral
    confidence: str # High, Medium, Low
    breakout_candidate: bool = False
    unusual_volume: bool = False


def calculate_today_opportunity_score(
    symbol: str,
    tech: TechnicalIndicatorResults,
    market_trend_score: float = 65.0, # Default NIFTY regime score
    sector_score: float = 70.0,
    news_sentiment_score: float = 60.0
) -> TodayScoreResult:
    """Calculates Today's Opportunity Score based on measurable quantitative signals."""

    # 1. Technical Score (RSI optimal range 45-65, BB positioning, SMA alignment)
    tech_base = 50.0
    if tech.rsi_14:
        if 50 <= tech.rsi_14 <= 70:
            tech_base += 20.0
        elif 30 <= tech.rsi_14 < 50:
            tech_base += 10.0
        elif tech.rsi_14 > 75: # Oversold / Extreme Overbought check
            tech_base += 5.0

    if tech.trend_20_50 == "Bullish":
        tech_base += 15.0
    if tech.trend_50_200.startswith("Bullish"):
        tech_base += 15.0

    technical_score = min(100.0, max(0.0, tech_base))

    # 2. Momentum Score (MACD positive & expanding histogram)
    mom_base = 50.0
    if tech.macd_hist and tech.macd_hist > 0:
        mom_base += 25.0
    if tech.last_price and tech.sma_20 and tech.last_price > tech.sma_20:
        mom_base += 25.0

    momentum_score = min(100.0, max(0.0, mom_base))

    # 3. Volume Score (Surge relative to 20-day average)
    vol_base = 50.0
    unusual_vol = False
    if tech.volume_ratio:
        if tech.volume_ratio >= 2.0:
            vol_base += 45.0
            unusual_vol = True
        elif tech.volume_ratio >= 1.3:
            vol_base += 30.0
        elif tech.volume_ratio >= 1.0:
            vol_base += 15.0

    volume_score = min(100.0, max(0.0, vol_base))

    # Check Breakout Candidate condition (close near resistance with volume surge)
    breakout = False
    if tech.resistance_level and tech.last_price and tech.volume_ratio:
        if tech.last_price >= (tech.resistance_level * 0.98) and tech.volume_ratio >= 1.3:
            breakout = True

    # 4. Weighted Total Calculation
    total_score = (
        technical_score * settings.WEIGHT_TODAY_TECHNICAL +
        momentum_score * settings.WEIGHT_TODAY_MOMENTUM +
        volume_score * settings.WEIGHT_TODAY_VOLUME +
        market_trend_score * settings.WEIGHT_TODAY_MARKET_TREND +
        sector_score * settings.WEIGHT_TODAY_SECTOR +
        news_sentiment_score * settings.WEIGHT_TODAY_NEWS
    )
    final_score = round(total_score, 1)

    # Determine Bias & Confidence
    if final_score >= 75.0:
        bias = "Bullish"
        confidence = "High" if final_score >= 85.0 else "Medium"
    elif final_score <= 45.0:
        bias = "Bearish"
        confidence = "High" if final_score <= 35.0 else "Medium"
    else:
        bias = "Neutral"
        confidence = "Medium"

    return TodayScoreResult(
        symbol=symbol.upper(),
        technical_score=round(technical_score, 1),
        momentum_score=round(momentum_score, 1),
        volume_score=round(volume_score, 1),
        market_trend_score=round(market_trend_score, 1),
        sector_score=round(sector_score, 1),
        news_score=round(news_sentiment_score, 1),
        today_opportunity_score=final_score,
        bias=bias,
        confidence=confidence,
        breakout_candidate=breakout,
        unusual_volume=unusual_vol
    )
