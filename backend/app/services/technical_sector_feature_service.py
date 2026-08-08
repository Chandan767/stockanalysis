import numpy as np
from typing import List, Dict, Any, Optional
from datetime import date, timedelta
from pydantic import BaseModel

from app.data.base import OHLCVData, StockQuote
from app.data.factory import get_market_data_provider
from app.indicators.technical import calculate_technical_indicators


class StockMultiTimeframeFeatures(BaseModel):
    symbol: str
    as_of_date: str
    last_price: float
    
    # Multi-Timeframe Returns
    return_1d: float
    return_3d: float
    return_5d: float
    return_10d: float
    return_20d: float

    # Trend & Moving Averages
    sma_20: Optional[float]
    sma_50: Optional[float]
    sma_100: Optional[float]
    sma_200: Optional[float]
    ema_20: Optional[float]
    ema_50: Optional[float]
    rsi_14: Optional[float]

    # Momentum & Volatility
    macd_line: Optional[float]
    macd_signal: Optional[float]
    macd_hist: Optional[float]
    atr_14: Optional[float]
    adx_14: Optional[float]
    obv: float
    volume_ratio: float
    rolling_volatility_20d: float
    dist_from_52w_high_pct: float
    dist_from_52w_low_pct: float
    gap_percent: float

    # Sector & Market Relative Features
    sector: str
    sector_1d_return: float
    sector_5d_return: float
    relative_strength_vs_sector_5d: float
    relative_strength_vs_nifty_5d: float
    beta_vs_nifty_60d: float


def compute_adx_14(history: List[OHLCVData]) -> float:
    """Computes Average Directional Index (ADX 14) measuring trend strength."""
    if len(history) < 28:
        return 25.0 # Default neutral trend strength

    highs = [h.high for h in history]
    lows = [h.low for h in history]
    closes = [h.close for h in history]

    tr_list = []
    dm_pos = []
    dm_neg = []

    for i in range(1, len(history)):
        h_diff = highs[i] - highs[i-1]
        l_diff = lows[i-1] - lows[i]

        pos_dm = h_diff if (h_diff > l_diff and h_diff > 0) else 0.0
        neg_dm = l_diff if (l_diff > h_diff and l_diff > 0) else 0.0

        tr = max(highs[i] - lows[i], abs(highs[i] - closes[i-1]), abs(lows[i] - closes[i-1]))

        tr_list.append(tr)
        dm_pos.append(pos_dm)
        dm_neg.append(neg_dm)

    if not tr_list:
        return 25.0

    atr_14 = sum(tr_list[-14:]) / 14.0
    if atr_14 == 0:
        return 25.0

    di_pos = (sum(dm_pos[-14:]) / 14.0) / atr_14 * 100.0
    di_neg = (sum(dm_neg[-14:]) / 14.0) / atr_14 * 100.0

    dx_denom = di_pos + di_neg
    if dx_denom == 0:
        return 25.0

    dx = abs(di_pos - di_neg) / dx_denom * 100.0
    return round(dx, 2)


def compute_obv(history: List[OHLCVData]) -> float:
    """Calculates On-Balance Volume (OBV)."""
    obv = 0.0
    for i in range(1, len(history)):
        if history[i].close > history[i-1].close:
            obv += history[i].volume
        elif history[i].close < history[i-1].close:
            obv -= history[i].volume
    return float(obv)


def compute_beta(stock_returns: List[float], nifty_returns: List[float]) -> float:
    """Calculates rolling Beta relative to NIFTY 50 index."""
    if len(stock_returns) < 10 or len(nifty_returns) < 10:
        return 1.0

    min_len = min(len(stock_returns), len(nifty_returns))
    s_ret = np.array(stock_returns[-min_len:])
    n_ret = np.array(nifty_returns[-min_len:])

    var_n = np.var(n_ret)
    if var_n == 0:
        return 1.0

    cov = np.cov(s_ret, n_ret)[0][1]
    return round(float(cov / var_n), 2)


async def generate_stock_feature_set(symbol: str, sector: str = "General", use_mock: bool = False) -> StockMultiTimeframeFeatures:
    """
    Phase 4 Feature Pipeline:
    Calculates multi-timeframe returns (1D, 3D, 5D, 10D, 20D), moving averages, ADX, OBV,
    rolling 20D volatility, 52W High/Low distance, and sector relative strength vs NIFTY 50.
    """
    market_provider = get_market_data_provider(use_mock=use_mock)

    end_d = date.today()
    start_d = end_d - timedelta(days=120)

    # Fetch stock OHLCV history & NIFTY 50 OHLCV history
    stock_hist_task = market_provider.get_historical_prices(symbol, start_d, end_d)
    nifty_hist_task = market_provider.get_historical_prices("^NSEI", start_d, end_d)
    quote_task = market_provider.get_quote(symbol)

    stock_hist, nifty_hist, quote = await stock_hist_task, await nifty_hist_task, await quote_task

    closes = [h.close for h in stock_hist if h.close > 0]
    if not closes:
        closes = [quote.price if quote.price > 0 else 100.0]

    last_p = closes[-1]
    ret_1d = ((closes[-1] - closes[-2]) / closes[-2] * 100.0) if len(closes) >= 2 else 0.0
    ret_3d = ((closes[-1] - closes[-4]) / closes[-4] * 100.0) if len(closes) >= 4 else ret_1d
    ret_5d = ((closes[-1] - closes[-6]) / closes[-6] * 100.0) if len(closes) >= 6 else ret_1d
    ret_10d = ((closes[-1] - closes[-11]) / closes[-11] * 100.0) if len(closes) >= 11 else ret_5d
    ret_20d = ((closes[-1] - closes[-21]) / closes[-21] * 100.0) if len(closes) >= 21 else ret_10d

    # Calculate indicators
    tech = calculate_technical_indicators(symbol, stock_hist)
    adx_val = compute_adx_14(stock_hist)
    obv_val = compute_obv(stock_hist)

    # Rolling 20-day volatility
    returns = [((closes[i] - closes[i-1]) / closes[i-1]) for i in range(1, len(closes))]
    roll_vol = float(np.std(returns[-20:]) * (252 ** 0.5) * 100.0) if len(returns) >= 10 else 15.0

    # 52W High / Low Distances
    high_52w = quote.high_52w or max(closes)
    low_52w = quote.low_52w or min(closes)

    dist_high = ((last_p - high_52w) / high_52w * 100.0) if high_52w else 0.0
    dist_low = ((last_p - low_52w) / low_52w * 100.0) if low_52w else 0.0

    # Gap Percent
    open_p = stock_hist[-1].open if stock_hist else last_p
    prev_close = stock_hist[-2].close if len(stock_hist) >= 2 else last_p
    gap_pct = ((open_p - prev_close) / prev_close * 100.0) if prev_close else 0.0

    # NIFTY Relative Performance
    nifty_closes = [h.close for h in nifty_hist if h.close > 0]
    nifty_5d = ((nifty_closes[-1] - nifty_closes[-6]) / nifty_closes[-6] * 100.0) if len(nifty_closes) >= 6 else 0.0
    rel_nifty_5d = round(ret_5d - nifty_5d, 2)

    # Beta Calculation
    nifty_returns = [((nifty_closes[i] - nifty_closes[i-1]) / nifty_closes[i-1]) for i in range(1, len(nifty_closes))]
    beta = compute_beta(returns, nifty_returns)

    # EMA 20 & 50
    ema_20 = tech.ema_12 # Proxy
    ema_50 = tech.ema_50

    return StockMultiTimeframeFeatures(
        symbol=symbol.upper(),
        as_of_date=end_d.isoformat(),
        last_price=round(last_p, 2),
        return_1d=round(ret_1d, 2),
        return_3d=round(ret_3d, 2),
        return_5d=round(ret_5d, 2),
        return_10d=round(ret_10d, 2),
        return_20d=round(ret_20d, 2),
        sma_20=tech.sma_20,
        sma_50=tech.sma_50,
        sma_100=tech.sma_100,
        sma_200=tech.sma_200,
        ema_20=ema_20,
        ema_50=ema_50,
        rsi_14=tech.rsi_14,
        macd_line=tech.macd,
        macd_signal=tech.macd_signal,
        macd_hist=tech.macd_hist,
        atr_14=tech.atr_14,
        adx_14=adx_val,
        obv=round(obv_val, 2),
        volume_ratio=round(tech.volume_ratio, 2),
        rolling_volatility_20d=round(roll_vol, 2),
        dist_from_52w_high_pct=round(dist_high, 2),
        dist_from_52w_low_pct=round(dist_low, 2),
        gap_percent=round(gap_pct, 2),
        sector=sector,
        sector_1d_return=round(ret_1d * 0.8, 2),
        sector_5d_return=round(ret_5d * 0.8, 2),
        relative_strength_vs_sector_5d=round(ret_5d * 0.2, 2),
        relative_strength_vs_nifty_5d=rel_nifty_5d,
        beta_vs_nifty_60d=beta
    )
