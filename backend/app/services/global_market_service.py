import asyncio
import time
from typing import Dict, Any, List, Optional
from datetime import date, timedelta
from pydantic import BaseModel
import yfinance as yf

# Global Benchmark Tickers
GLOBAL_TICKERS = {
    # US Markets
    "SP500": {"symbol": "^GSPC", "name": "S&P 500", "region": "US"},
    "NASDAQ": {"symbol": "^IXIC", "name": "Nasdaq Composite", "region": "US"},
    "DOW": {"symbol": "^DJI", "name": "Dow Jones Industrial", "region": "US"},
    "RUSSELL2000": {"symbol": "^RUT", "name": "Russell 2000", "region": "US"},
    "US_VIX": {"symbol": "^VIX", "name": "CBOE Volatility Index", "region": "US"},
    "US10Y_YIELD": {"symbol": "^TNX", "name": "US 10Y Treasury Yield", "region": "US"},

    # Asian Markets
    "NIKKEI": {"symbol": "^N225", "name": "Nikkei 225", "region": "ASIA"},
    "HANGSENG": {"symbol": "^HSI", "name": "Hang Seng Index", "region": "ASIA"},
    "SHANGHAI": {"symbol": "000001.SS", "name": "Shanghai Composite", "region": "ASIA"},
    "KOSPI": {"symbol": "^KS11", "name": "KOSPI Composite", "region": "ASIA"},

    # European Markets
    "FTSE": {"symbol": "^FTSE", "name": "FTSE 100 (UK)", "region": "EUROPE"},
    "DAX": {"symbol": "^GDAXI", "name": "DAX Performance (Germany)", "region": "EUROPE"},
    "CAC": {"symbol": "^FCHI", "name": "CAC 40 (France)", "region": "EUROPE"},

    # Indian Benchmarks
    "NIFTY50": {"symbol": "^NSEI", "name": "NIFTY 50", "region": "INDIA"},
    "NIFTYBANK": {"symbol": "^NSEBANK", "name": "NIFTY Bank", "region": "INDIA"},
    "NIFTYIT": {"symbol": "^CNXIT", "name": "NIFTY IT", "region": "INDIA"},
    "INDIAVIX": {"symbol": "^INDIAVIX", "name": "India VIX", "region": "INDIA"},

    # Commodities & Currencies
    "USDINR": {"symbol": "USDINR=X", "name": "USD / INR Exchange Rate", "region": "CURRENCIES"},
    "BRENT_CRUDE": {"symbol": "BZ=F", "name": "Brent Crude Oil", "region": "COMMODITIES"},
    "WTI_CRUDE": {"symbol": "CL=F", "name": "WTI Crude Oil", "region": "COMMODITIES"},
    "GOLD": {"symbol": "GC=F", "name": "Gold Futures", "region": "COMMODITIES"},
    "SILVER": {"symbol": "SI=F", "name": "Silver Futures", "region": "COMMODITIES"},
}

# Cache Store (120-second TTL)
CACHE_TTL = 120
_GLOBAL_CACHE: Dict[str, Any] = {}


class GlobalMarketItem(BaseModel):
    key: str
    symbol: str
    name: str
    region: str
    price: float
    change_1d: float
    percent_change_1d: float
    return_5d: Optional[float]
    volatility_20d: Optional[float]
    status: str # Bullish, Bearish, Neutral


class InterMarketSignals(BaseModel):
    us_overnight_sp500_return: float
    us_overnight_nasdaq_return: float
    us_vix_level: float
    us_10y_yield: float
    brent_crude_price: float
    brent_crude_1d_change: float
    usd_inr_rate: float
    usd_inr_1d_change: float
    indian_it_sector_signal: str # Positive, Negative, Neutral
    airline_fuel_impact_signal: str # Positive, Negative, Neutral
    fii_flow_yield_signal: str # Favorable, Unfavorable, Neutral
    global_risk_regime: str # Risk-On, Risk-Off, High Volatility, Neutral


class GlobalMarketReport(BaseModel):
    timestamp: str
    items: List[GlobalMarketItem]
    signals: InterMarketSignals


def _fetch_single_global_ticker(key: str, meta: Dict[str, str]) -> Optional[GlobalMarketItem]:
    sym = meta["symbol"]
    try:
        ticker = yf.Ticker(sym)
        hist = ticker.history(period="1mo")
        if hist.empty or len(hist) < 2:
            return None

        prices = hist["Close"].tolist()
        last_p = float(prices[-1])
        prev_p = float(prices[-2])
        change_1d = last_p - prev_p
        pct_1d = (change_1d / prev_p * 100.0) if prev_p else 0.0

        p_5d = float(prices[-5]) if len(prices) >= 5 else prev_p
        pct_5d = ((last_p - p_5d) / p_5d * 100.0) if p_5d else 0.0

        # Calculate 20d volatility if sufficient data
        vol_20d = float(hist["Close"].pct_change().std() * (252 ** 0.5) * 100.0) if len(prices) >= 10 else 0.0

        status = "Bullish" if pct_1d > 0.3 else ("Bearish" if pct_1d < -0.3 else "Neutral")

        return GlobalMarketItem(
            key=key,
            symbol=sym,
            name=meta["name"],
            region=meta["region"],
            price=round(last_p, 2),
            change_1d=round(change_1d, 2),
            percent_change_1d=round(pct_1d, 2),
            return_5d=round(pct_5d, 2),
            volatility_20d=round(vol_20d, 2),
            status=status
        )
    except Exception:
        return None


async def get_global_market_features(use_mock: bool = False) -> GlobalMarketReport:
    """
    Phase 2 Feature Engine:
    Fetches real-time / daily close indices for US, Asia, Europe, Commodities & Currencies.
    Calculates inter-market directional signals for Indian equity predictions.
    """
    now_ts = time.time()
    if "global_report" in _GLOBAL_CACHE and (now_ts - _GLOBAL_CACHE["time"]) < CACHE_TTL:
        return _GLOBAL_CACHE["global_report"]

    tasks = [
        asyncio.to_thread(_fetch_single_global_ticker, key, meta)
        for key, meta in GLOBAL_TICKERS.items()
    ]

    results = await asyncio.gather(*tasks)
    items: List[GlobalMarketItem] = [r for r in results if r is not None]

    # Map items into a lookup dict
    item_dict = {item.key: item for item in items}

    # Extract Key Signals
    sp500_ret = item_dict["SP500"].percent_change_1d if "SP500" in item_dict else 0.0
    nasdaq_ret = item_dict["NASDAQ"].percent_change_1d if "NASDAQ" in item_dict else 0.0
    us_vix = item_dict["US_VIX"].price if "US_VIX" in item_dict else 15.0
    us_10y = item_dict["US10Y_YIELD"].price if "US10Y_YIELD" in item_dict else 4.2
    crude_p = item_dict["BRENT_CRUDE"].price if "BRENT_CRUDE" in item_dict else 75.0
    crude_chg = item_dict["BRENT_CRUDE"].percent_change_1d if "BRENT_CRUDE" in item_dict else 0.0
    usdinr_p = item_dict["USDINR"].price if "USDINR" in item_dict else 83.5
    usdinr_chg = item_dict["USDINR"].percent_change_1d if "USDINR" in item_dict else 0.0

    # Sector Inter-Market Logic
    # 1. Indian IT Sector Signal (Nasdaq + USD/INR)
    if nasdaq_ret > 0.5 and usdinr_chg >= 0:
        it_signal = "Positive (Strong US Tech & Favorable Currency)"
    elif nasdaq_ret < -0.5:
        it_signal = "Negative (US Tech Selloff)"
    else:
        it_signal = "Neutral"

    # 2. Crude Oil Impact (Airlines, Paint, Refiners)
    if crude_chg > 2.0:
        crude_signal = "Negative for Airlines/Paint (Input Cost Spike), Positive for Oil Refiners"
    elif crude_chg < -2.0:
        crude_signal = "Positive for Airlines/Paint (Margin Expansion), Soft for Oil Exploration"
    else:
        crude_signal = "Neutral Input Costs"

    # 3. FII Capital Flows vs US 10Y Yield
    if us_10y > 4.5:
        fii_signal = "Unfavorable (High US Yields Drag Emerging Market FII Flows)"
    elif us_10y < 4.0:
        fii_signal = "Favorable (Easing US Yields Support FII Capital Inflows)"
    else:
        fii_signal = "Neutral Yield Environment"

    # 4. Global Market Regime
    if us_vix > 25.0:
        regime = "High Volatility / Risk-Off"
    elif sp500_ret > 0.3 and nasdaq_ret > 0.3:
        regime = "Risk-On (Bullish Global Sentiment)"
    elif sp500_ret < -0.5 and nasdaq_ret < -0.5:
        regime = "Risk-Off (Bearish Global Headwinds)"
    else:
        regime = "Neutral / Mixed Global Cues"

    signals = InterMarketSignals(
        us_overnight_sp500_return=sp500_ret,
        us_overnight_nasdaq_return=nasdaq_ret,
        us_vix_level=us_vix,
        us_10y_yield=us_10y,
        brent_crude_price=crude_p,
        brent_crude_1d_change=crude_chg,
        usd_inr_rate=usdinr_p,
        usd_inr_1d_change=usdinr_chg,
        indian_it_sector_signal=it_signal,
        airline_fuel_impact_signal=crude_signal,
        fii_flow_yield_signal=fii_signal,
        global_risk_regime=regime
    )

    report = GlobalMarketReport(
        timestamp=date.today().isoformat(),
        items=items,
        signals=signals
    )

    _GLOBAL_CACHE["global_report"] = report
    _GLOBAL_CACHE["time"] = now_ts

    return report
