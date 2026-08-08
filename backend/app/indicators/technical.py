import math
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.data.base import OHLCVData


def clean_float(val: Any) -> Optional[float]:
    """Crash-proof sanitizer ensuring float values are JSON compliant and never NaN/Infinity."""
    if val is None:
        return None
    try:
        f = float(val)
        if math.isnan(f) or math.isinf(f):
            return None
        return round(f, 2)
    except Exception:
        return None


class TechnicalIndicatorResults(BaseModel):
    symbol: str
    last_price: float
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    sma_100: Optional[float] = None
    sma_200: Optional[float] = None
    ema_12: Optional[float] = None
    ema_26: Optional[float] = None
    ema_50: Optional[float] = None
    rsi_14: Optional[float] = None
    macd: Optional[float] = None
    macd_signal: Optional[float] = None
    macd_hist: Optional[float] = None
    bb_upper: Optional[float] = None
    bb_middle: Optional[float] = None
    bb_lower: Optional[float] = None
    atr_14: Optional[float] = None
    volume_ratio: Optional[float] = None  # Current volume vs 20-day avg volume
    trend_20_50: str = "Neutral"  # Bullish if SMA 20 > SMA 50, else Bearish
    trend_50_200: str = "Neutral"  # Golden Cross / Death Cross
    support_level: Optional[float] = None
    resistance_level: Optional[float] = None


def calculate_technical_indicators(
    symbol: str, ohlcv_list: List[OHLCVData]
) -> TechnicalIndicatorResults:
    """Calculates quantitative technical indicators from daily or intraday OHLCV series."""
    if not ohlcv_list or len(ohlcv_list) < 5:
        last_price = clean_float(ohlcv_list[-1].close) if ohlcv_list else 100.0
        return TechnicalIndicatorResults(
            symbol=symbol.upper(),
            last_price=last_price or 100.0,
            support_level=clean_float(last_price * 0.95) if last_price else 95.0,
            resistance_level=clean_float(last_price * 1.05) if last_price else 105.0
        )

    # Convert OHLCV list to DataFrame
    df = pd.DataFrame([item.model_dump() for item in ohlcv_list])
    df.sort_values("date", inplace=True)
    df.reset_index(drop=True, inplace=True)

    close = df['close']
    high = df['high']
    low = df['low']
    volume = df['volume']

    # Simple Moving Averages
    df['sma_20'] = close.rolling(window=20, min_periods=1).mean()
    df['sma_50'] = close.rolling(window=50, min_periods=1).mean()
    df['sma_100'] = close.rolling(window=100, min_periods=1).mean()
    df['sma_200'] = close.rolling(window=200, min_periods=1).mean()

    # Exponential Moving Averages
    df['ema_12'] = close.ewm(span=12, adjust=False).mean()
    df['ema_26'] = close.ewm(span=26, adjust=False).mean()
    df['ema_50'] = close.ewm(span=50, adjust=False).mean()

    # RSI (14)
    delta = close.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14, min_periods=1).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14, min_periods=1).mean()
    rs = gain / (loss + 1e-10)
    df['rsi_14'] = 100 - (100 / (1 + rs))

    # MACD (12, 26, 9)
    df['macd'] = df['ema_12'] - df['ema_26']
    df['macd_signal'] = df['macd'].ewm(span=9, adjust=False).mean()
    df['macd_hist'] = df['macd'] - df['macd_signal']

    # Bollinger Bands (20, 2)
    df['bb_middle'] = df['sma_20']
    bb_std = close.rolling(window=20, min_periods=1).std()
    df['bb_upper'] = df['bb_middle'] + (bb_std * 2)
    df['bb_lower'] = df['bb_middle'] - (bb_std * 2)

    # ATR (14)
    tr1 = high - low
    tr2 = (high - close.shift(1)).abs()
    tr3 = (low - close.shift(1)).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    df['atr_14'] = tr.rolling(window=14, min_periods=1).mean()

    # Volume Analysis (Ratio of latest volume to 20-day volume SMA)
    vol_sma_20 = volume.rolling(window=20, min_periods=1).mean()
    df['volume_ratio'] = volume / (vol_sma_20 + 1e-10)

    # Support & Resistance (20-day Low / High)
    support = low.rolling(window=20, min_periods=1).min().iloc[-1]
    resistance = high.rolling(window=20, min_periods=1).max().iloc[-1]

    # Latest record values
    latest = df.iloc[-1]
    last_p = clean_float(latest['close']) or 100.0

    sma20_val = clean_float(latest['sma_20'])
    sma50_val = clean_float(latest['sma_50'])
    sma200_val = clean_float(latest['sma_200'])

    # Trend classifications
    trend_20_50 = "Neutral"
    if sma20_val is not None and sma50_val is not None:
        trend_20_50 = "Bullish" if sma20_val > sma50_val else "Bearish"

    trend_50_200 = "Neutral"
    if sma50_val is not None and sma200_val is not None:
        trend_50_200 = "Bullish (Golden Cross)" if sma50_val > sma200_val else "Bearish (Death Cross)"

    return TechnicalIndicatorResults(
        symbol=symbol.upper(),
        last_price=last_p,
        sma_20=sma20_val,
        sma_50=sma50_val,
        sma_100=clean_float(latest['sma_100']),
        sma_200=sma200_val,
        ema_12=clean_float(latest['ema_12']),
        ema_26=clean_float(latest['ema_26']),
        ema_50=clean_float(latest['ema_50']),
        rsi_14=clean_float(latest['rsi_14']),
        macd=clean_float(latest['macd']),
        macd_signal=clean_float(latest['macd_signal']),
        macd_hist=clean_float(latest['macd_hist']),
        bb_upper=clean_float(latest['bb_upper']),
        bb_middle=clean_float(latest['bb_middle']),
        bb_lower=clean_float(latest['bb_lower']),
        atr_14=clean_float(latest['atr_14']),
        volume_ratio=clean_float(latest['volume_ratio']),
        trend_20_50=trend_20_50,
        trend_50_200=trend_50_200,
        support_level=clean_float(support) or clean_float(last_p * 0.95),
        resistance_level=clean_float(resistance) or clean_float(last_p * 1.05)
    )
