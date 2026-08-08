import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.data.base import OHLCVData


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
    volume_ratio: Optional[float] = None # Current volume vs 20-day avg volume
    trend_20_50: str = "Neutral" # Bullish if SMA 20 > SMA 50, else Bearish
    trend_50_200: str = "Neutral" # Golden Cross / Death Cross
    support_level: Optional[float] = None
    resistance_level: Optional[float] = None


def calculate_technical_indicators(
    symbol: str, ohlcv_list: List[OHLCVData]
) -> TechnicalIndicatorResults:
    """Calculates quantitative technical indicators from daily or intraday OHLCV series."""
    if not ohlcv_list or len(ohlcv_list) < 5:
        last_price = ohlcv_list[-1].close if ohlcv_list else 0.0
        return TechnicalIndicatorResults(symbol=symbol.upper(), last_price=last_price)

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
    last_p = float(latest['close'])

    sma20_val = float(latest['sma_20']) if not pd.isna(latest['sma_20']) else None
    sma50_val = float(latest['sma_50']) if not pd.isna(latest['sma_50']) else None
    sma200_val = float(latest['sma_200']) if not pd.isna(latest['sma_200']) else None

    # Trend classifications
    trend_20_50 = "Neutral"
    if sma20_val and sma50_val:
        trend_20_50 = "Bullish" if sma20_val > sma50_val else "Bearish"

    trend_50_200 = "Neutral"
    if sma50_val and sma200_val:
        trend_50_200 = "Bullish (Golden Cross)" if sma50_val > sma200_val else "Bearish (Death Cross)"

    return TechnicalIndicatorResults(
        symbol=symbol.upper(),
        last_price=round(last_p, 2),
        sma_20=round(sma20_val, 2) if sma20_val else None,
        sma_50=round(sma50_val, 2) if sma50_val else None,
        sma_100=round(float(latest['sma_100']), 2) if not pd.isna(latest['sma_100']) else None,
        sma_200=round(sma200_val, 2) if sma200_val else None,
        ema_12=round(float(latest['ema_12']), 2) if not pd.isna(latest['ema_12']) else None,
        ema_26=round(float(latest['ema_26']), 2) if not pd.isna(latest['ema_26']) else None,
        ema_50=round(float(latest['ema_50']), 2) if not pd.isna(latest['ema_50']) else None,
        rsi_14=round(float(latest['rsi_14']), 2) if not pd.isna(latest['rsi_14']) else None,
        macd=round(float(latest['macd']), 2) if not pd.isna(latest['macd']) else None,
        macd_signal=round(float(latest['macd_signal']), 2) if not pd.isna(latest['macd_signal']) else None,
        macd_hist=round(float(latest['macd_hist']), 2) if not pd.isna(latest['macd_hist']) else None,
        bb_upper=round(float(latest['bb_upper']), 2) if not pd.isna(latest['bb_upper']) else None,
        bb_middle=round(float(latest['bb_middle']), 2) if not pd.isna(latest['bb_middle']) else None,
        bb_lower=round(float(latest['bb_lower']), 2) if not pd.isna(latest['bb_lower']) else None,
        atr_14=round(float(latest['atr_14']), 2) if not pd.isna(latest['atr_14']) else None,
        volume_ratio=round(float(latest['volume_ratio']), 2) if not pd.isna(latest['volume_ratio']) else None,
        trend_20_50=trend_20_50,
        trend_50_200=trend_50_200,
        support_level=round(float(support), 2),
        resistance_level=round(float(resistance), 2)
    )
