import yfinance as yf
import asyncio
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
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


def _fetch_google_rss_news(query: str, limit: int = 5) -> List[NewsArticle]:
    """Fetches real live news articles from Google News RSS feed for Indian stock queries."""
    articles = []
    try:
        encoded_query = urllib.parse.quote(f"{query} stock news india")
        url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-IN&gl=IN&ceid=IN:en"
        
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            xml_data = resp.read()
            root = ET.fromstring(xml_data)

            items = root.findall('.//item')
            for item in items[:limit]:
                title_elem = item.find('title')
                link_elem = item.find('link')
                pub_elem = item.find('pubDate')
                source_elem = item.find('source')

                title = title_elem.text if title_elem is not None else ""
                link = link_elem.text if link_elem is not None else ""
                source = source_elem.text if source_elem is not None else "Financial News"
                
                # Title clean up (remove publisher suffix if present e.g. "- Economic Times")
                clean_title = title.split(" - ")[0] if " - " in title else title
                
                if clean_title:
                    articles.append(
                        NewsArticle(
                            symbol=query.upper(),
                            title=clean_title,
                            summary=f"Latest news coverage regarding {query} from {source}.",
                            url=link,
                            source=source,
                            published_at=datetime.now(timezone.utc)
                        )
                    )
    except Exception as e:
        print(f"Google RSS fetch error for {query}: {e}")
    return articles


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


def _fetch_sync_history(
    symbol: str, start_date: date, end_date: date, interval: str = "1d", period: str = None
) -> List[OHLCVData]:
    ticker_symbol = format_indian_symbol(symbol)
    ticker = yf.Ticker(ticker_symbol)

    df = pd.DataFrame()
    try:
        if period:
            df = ticker.history(period=period, interval=interval)
        else:
            df = ticker.history(start=start_date, end=end_date, interval=interval)
    except Exception:
        df = pd.DataFrame()

    results = []
    if not df.empty:
        for idx, row in df.iterrows():
            d_val = idx.date() if isinstance(idx, pd.Timestamp) else date.today()
            results.append(
                OHLCVData(
                    symbol=symbol.upper(),
                    date=d_val,
                    open=round(float(row.get("Open", 0.0)), 2),
                    high=round(float(row.get("High", 0.0)), 2),
                    low=round(float(row.get("Low", 0.0)), 2),
                    close=round(float(row.get("Close", 0.0)), 2),
                    adjusted_close=round(float(row.get("Close", 0.0)), 2),
                    volume=int(row.get("Volume", 0))
                )
            )
    return results


def _fetch_sync_fundamentals(symbol: str) -> CompanyFundamentalData:
    ticker_symbol = format_indian_symbol(symbol)
    ticker = yf.Ticker(ticker_symbol)

    info = {}
    try:
        info = ticker.info or {}
    except Exception:
        info = {}

    pe = info.get("trailingPE") or info.get("forwardPE")
    pb = info.get("priceToBook")
    roe = info.get("returnOnEquity")
    if roe:
        roe = roe * 100.0  # Decimal to percentage

    debt_to_eq = info.get("debtToEquity")
    if debt_to_eq and debt_to_eq > 10.0:
        debt_to_eq = debt_to_eq / 100.0  # Standardize ratio

    rev_growth = info.get("revenueGrowth")
    if rev_growth:
        rev_growth = rev_growth * 100.0

    profit_margin = info.get("profitMargins")
    if profit_margin:
        profit_margin = profit_margin * 100.0

    return CompanyFundamentalData(
        symbol=symbol.upper(),
        period_date=date.today(),
        pe_ratio=round(pe, 2) if pe else None,
        pb_ratio=round(pb, 2) if pb else None,
        roe=round(roe, 2) if roe else None,
        debt_to_equity=round(debt_to_eq, 2) if debt_to_eq else None,
        revenue_growth_yoy=round(rev_growth, 2) if rev_growth else None,
        profit_margin=round(profit_margin, 2) if profit_margin else None,
        free_cash_flow=info.get("freeCashflow")
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
    for item in news_items:
        title = item.get("title", "") or (item.get("content", {}).get("title", "") if isinstance(item.get("content"), dict) else "")
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

    # If Yahoo Finance returns fewer than requested articles, supplement with Live Google RSS Indian News
    if len(articles) < limit:
        stock_name_query = "State Bank of India SBI" if symbol.upper() in ["SBIN", "SBI"] else f"{symbol} Indian stock"
        rss_articles = _fetch_google_rss_news(stock_name_query, limit=limit - len(articles))
        articles.extend(rss_articles)

    return articles[:limit]


class YFinanceMarketDataProvider(MarketDataProvider, FundamentalDataProvider, NewsDataProvider):
    """Async crash-proof Yahoo Finance & RSS adapter for Indian Stock Market data."""

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
