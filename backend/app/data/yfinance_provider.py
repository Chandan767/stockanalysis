import yfinance as yf
import asyncio
from typing import List, Optional
from datetime import date, datetime, timezone
import pandas as pd

from app.data.base import (
    MarketDataProvider,
    FundamentalDataProvider,
    NewsDataProvider,
    StockQuote,
    OHLCVData,
    CompanyFundamentalData,
    NewsArticle
)


def format_indian_symbol(symbol: str) -> str:
    """Appends .NS for NSE equities if no exchange suffix is provided, ignoring global indices."""
    clean_symbol = symbol.strip().upper()
    if clean_symbol.startswith("^") or "=X" in clean_symbol or "=F" in clean_symbol or ".SS" in clean_symbol:
        return clean_symbol
    if not (clean_symbol.endswith(".NS") or clean_symbol.endswith(".BO")):
        return f"{clean_symbol}.NS"
    return clean_symbol


def _fetch_sync_quote(symbol: str) -> StockQuote:
    ticker_symbol = format_indian_symbol(symbol)
    ticker = yf.Ticker(ticker_symbol)

    last_p, prev_p, high_52, low_52, cap, vol = 0.0, 0.0, 0.0, 0.0, 0.0, 0

    try:
        info = ticker.fast_info
        last_p = float(getattr(info, "last_price", 0.0) or getattr(info, "previous_close", 0.0) or 0.0)
        prev_p = float(getattr(info, "previous_close", last_p) or last_p)
        high_52 = float(getattr(info, "year_high", 0.0) or 0.0)
        low_52 = float(getattr(info, "year_low", 0.0) or 0.0)
        cap = float(getattr(info, "market_cap", 0.0) or 0.0)
        vol = int(getattr(info, "last_volume", 0) or 0)
    except Exception:
        pass

    change = last_p - prev_p
    pct_change = (change / prev_p * 100) if prev_p else 0.0

    return StockQuote(
        symbol=symbol.upper(),
        price=round(last_p, 2),
        change=round(change, 2),
        percent_change=round(pct_change, 2),
        high_52w=round(high_52, 2) if high_52 else None,
        low_52w=round(low_52, 2) if low_52 else None,
        market_cap=cap if cap else None,
        volume=vol,
        timestamp=datetime.now(timezone.utc)
    )


def _fetch_sync_history(symbol: str, start_date: date, end_date: date, interval: str = "1d", period: str = None) -> List[OHLCVData]:
    ticker_symbol = format_indian_symbol(symbol)
    records = []

    try:
        ticker = yf.Ticker(ticker_symbol)
        if period:
            df: pd.DataFrame = ticker.history(period=period, interval=interval)
        else:
            df: pd.DataFrame = yf.download(
                ticker_symbol,
                start=start_date.strftime("%Y-%m-%d"),
                end=end_date.strftime("%Y-%m-%d"),
                interval=interval,
                progress=False
            )

        if df.empty:
            return records

        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)

        for idx, row in df.iterrows():
            record_date = idx.date() if hasattr(idx, 'date') else idx
            records.append(
                OHLCVData(
                    date=record_date,
                    open=round(float(row['Open']), 2),
                    high=round(float(row['High']), 2),
                    low=round(float(row['Low']), 2),
                    close=round(float(row['Close']), 2),
                    adjusted_close=round(float(row.get('Adj Close', row['Close'])), 2),
                    volume=int(row['Volume'])
                )
            )
    except Exception:
        pass

    return records


def _fetch_sync_fundamentals(symbol: str) -> CompanyFundamentalData:
    ticker_symbol = format_indian_symbol(symbol)
    ticker = yf.Ticker(ticker_symbol)

    info = {}
    try:
        info = ticker.info or {}
    except Exception:
        info = {}

    cap = float(info.get("marketCap", 0.0) or 0.0)
    if not cap:
        try:
            cap = float(getattr(ticker.fast_info, "market_cap", 0.0) or 0.0)
        except Exception:
            cap = 0.0

    return CompanyFundamentalData(
        symbol=symbol.upper(),
        period_date=date.today(),
        market_cap=cap if cap > 0 else None,
        pe_ratio=float(info.get("trailingPE", 0.0) or 0.0) if info.get("trailingPE") else None,
        pb_ratio=float(info.get("priceToBook", 0.0) or 0.0) if info.get("priceToBook") else None,
        ev_to_ebitda=float(info.get("enterpriseToEbitda", 0.0) or 0.0) if info.get("enterpriseToEbitda") else None,
        peg_ratio=float(info.get("pegRatio", 0.0) or 0.0) if info.get("pegRatio") else None,
        roe=float(info.get("returnOnEquity", 0.0) or 0.0) * 100 if info.get("returnOnEquity") else None,
        roce=float(info.get("returnOnAssets", 0.0) or 0.0) * 100 if info.get("returnOnAssets") else None,
        debt_to_equity=float(info.get("debtToEquity", 0.0) or 0.0) / 100 if info.get("debtToEquity") else None,
        interest_coverage=None,
        revenue_growth_yoy=float(info.get("revenueGrowth", 0.0) or 0.0) * 100 if info.get("revenueGrowth") else None,
        profit_growth_yoy=float(info.get("earningsGrowth", 0.0) or 0.0) * 100 if info.get("earningsGrowth") else None,
        operating_margin=float(info.get("operatingMargins", 0.0) or 0.0) * 100 if info.get("operatingMargins") else None,
        net_margin=float(info.get("profitMargins", 0.0) or 0.0) * 100 if info.get("profitMargins") else None,
        free_cash_flow=float(info.get("freeCashflow", 0.0) or 0.0) if info.get("freeCashflow") else None,
        promoter_holding=float(info.get("heldPercentInsiders", 0.0) or 0.0) * 100 if info.get("heldPercentInsiders") else None,
        ii_holding=float(info.get("heldPercentInstitutions", 0.0) or 0.0) * 100 if info.get("heldPercentInstitutions") else None
    )


def _fetch_sync_news(symbol: str, limit: int) -> List[NewsArticle]:
    ticker_symbol = format_indian_symbol(symbol)
    ticker = yf.Ticker(ticker_symbol)
    news_items = []
    try:
        news_items = ticker.news or []
    except Exception:
        news_items = []

    articles = []
    for item in news_items[:limit]:
        title = item.get("title", "")
        publisher = item.get("publisher", "Market News")
        link = item.get("link", "")
        pub_time = item.get("providerPublishTime")

        published_at = (
            datetime.fromtimestamp(pub_time, tz=timezone.utc)
            if pub_time
            else datetime.now(timezone.utc)
        )

        if title:
            articles.append(
                NewsArticle(
                    symbol=symbol.upper(),
                    title=title,
                    summary=item.get("summary", title),
                    url=link,
                    source=publisher,
                    published_at=published_at
                )
            )
    return articles


class YFinanceMarketDataProvider(MarketDataProvider, FundamentalDataProvider, NewsDataProvider):
    """Async crash-proof Yahoo Finance adapter for Indian Stock Market data."""

    async def get_quote(self, symbol: str) -> StockQuote:
        return await asyncio.to_thread(_fetch_sync_quote, symbol)

    async def get_historical_prices(
        self, symbol: str, start_date: date, end_date: date, interval: str = "1d", period: str = None
    ) -> List[OHLCVData]:
        return await asyncio.to_thread(_fetch_sync_history, symbol, start_date, end_date, interval, period)

    async def get_fundamentals(self, symbol: str) -> CompanyFundamentalData:
        return await asyncio.to_thread(_fetch_sync_fundamentals, symbol)

    async def get_recent_news(self, symbol: str, limit: int = 10) -> List[NewsArticle]:
        return await asyncio.to_thread(_fetch_sync_news, symbol, limit)
