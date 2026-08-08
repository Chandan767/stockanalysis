import asyncio
import time
from typing import List, Dict, Any, Optional
from datetime import date, timedelta
from pydantic import BaseModel

from app.data.factory import (
    get_market_data_provider,
    get_fundamental_data_provider,
    get_news_data_provider
)
from app.data.base import StockQuote, OHLCVData, CompanyFundamentalData, NewsArticle
from app.indicators.technical import calculate_technical_indicators, TechnicalIndicatorResults
from app.scoring.today_scoring import calculate_today_opportunity_score, TodayScoreResult
from app.scoring.long_term_scoring import calculate_long_term_quality_score, LongTermScoreResult
from app.services.sentiment_service import analyze_news_sentiment

# In-memory TTL Cache to deliver instant sub-millisecond responses for repeated market scans
CACHE_TTL_SECONDS = 120
_CACHE_STORE: Dict[str, Dict[str, Any]] = {}

TOP_INDIAN_STOCKS = [
    # Banking & Financial Services
    {"symbol": "SBIN", "name": "State Bank of India", "sector": "Banking & Financials"},
    {"symbol": "HDFCBANK", "name": "HDFC Bank Ltd.", "sector": "Banking & Financials"},
    {"symbol": "ICICIBANK", "name": "ICICI Bank Ltd.", "sector": "Banking & Financials"},
    {"symbol": "AXISBANK", "name": "Axis Bank Ltd.", "sector": "Banking & Financials"},
    {"symbol": "KOTAKBANK", "name": "Kotak Mahindra Bank Ltd.", "sector": "Banking & Financials"},
    {"symbol": "INDUSINDBK", "name": "IndusInd Bank Ltd.", "sector": "Banking & Financials"},
    {"symbol": "BAJFINANCE", "name": "Bajaj Finance Ltd.", "sector": "Banking & Financials"},
    {"symbol": "BAJAJFINSV", "name": "Bajaj Finserv Ltd.", "sector": "Banking & Financials"},
    {"symbol": "JIOFIN", "name": "Jio Financial Services Ltd.", "sector": "Banking & Financials"},
    {"symbol": "REC", "name": "REC Ltd.", "sector": "Banking & Financials"},
    {"symbol": "PFC", "name": "Power Finance Corp. Ltd.", "sector": "Banking & Financials"},
    {"symbol": "IRFC", "name": "Indian Railway Finance Corp. Ltd.", "sector": "Banking & Financials"},
    {"symbol": "SHRIRAMFIN", "name": "Shriram Finance Ltd.", "sector": "Banking & Financials"},
    {"symbol": "PAYTM", "name": "One97 Communications (Paytm)", "sector": "Banking & Financials"},

    # Information Technology
    {"symbol": "TCS", "name": "Tata Consultancy Services Ltd.", "sector": "Information Technology"},
    {"symbol": "INFY", "name": "Infosys Ltd.", "sector": "Information Technology"},
    {"symbol": "WIPRO", "name": "Wipro Ltd.", "sector": "Information Technology"},
    {"symbol": "HCLTECH", "name": "HCL Technologies Ltd.", "sector": "Information Technology"},
    {"symbol": "TECHM", "name": "Tech Mahindra Ltd.", "sector": "Information Technology"},
    {"symbol": "LTIM", "name": "LTIMindtree Ltd.", "sector": "Information Technology"},
    {"symbol": "PERSISTENT", "name": "Persistent Systems Ltd.", "sector": "Information Technology"},
    {"symbol": "COFORGE", "name": "Coforge Ltd.", "sector": "Information Technology"},

    # Energy, Oil, Power & Utilities
    {"symbol": "RELIANCE", "name": "Reliance Industries Ltd.", "sector": "Energy & Power"},
    {"symbol": "NTPC", "name": "NTPC Ltd.", "sector": "Energy & Power"},
    {"symbol": "ONGC", "name": "Oil and Natural Gas Corp. Ltd.", "sector": "Energy & Power"},
    {"symbol": "POWERGRID", "name": "Power Grid Corp. of India", "sector": "Energy & Power"},
    {"symbol": "BPCL", "name": "Bharat Petroleum Corp. Ltd.", "sector": "Energy & Power"},
    {"symbol": "IOC", "name": "Indian Oil Corp. Ltd.", "sector": "Energy & Power"},
    {"symbol": "GAIL", "name": "GAIL (India) Ltd.", "sector": "Energy & Power"},
    {"symbol": "COALINDIA", "name": "Coal India Ltd.", "sector": "Energy & Power"},
    {"symbol": "TATAPOWER", "name": "Tata Power Company Ltd.", "sector": "Energy & Power"},
    {"symbol": "ADANIGREEN", "name": "Adani Green Energy Ltd.", "sector": "Energy & Power"},
    {"symbol": "ADANIPOWER", "name": "Adani Power Ltd.", "sector": "Energy & Power"},

    # Automotive & Mobility
    {"symbol": "TATAMOTORS", "name": "Tata Motors Ltd.", "sector": "Automotive"},
    {"symbol": "MARUTI", "name": "Maruti Suzuki India Ltd.", "sector": "Automotive"},
    {"symbol": "M&M", "name": "Mahindra & Mahindra Ltd.", "sector": "Automotive"},
    {"symbol": "BAJAJ-AUTO", "name": "Bajaj Auto Ltd.", "sector": "Automotive"},
    {"symbol": "EICHERMOT", "name": "Eicher Motors Ltd.", "sector": "Automotive"},
    {"symbol": "HEROMOTOCO", "name": "Hero MotoCorp Ltd.", "sector": "Automotive"},
    {"symbol": "TVSMOTOR", "name": "TVS Motor Company Ltd.", "sector": "Automotive"},

    # Pharma & Healthcare
    {"symbol": "SUNPHARMA", "name": "Sun Pharmaceutical Industries", "sector": "Pharma & Healthcare"},
    {"symbol": "CIPLA", "name": "Cipla Ltd.", "sector": "Pharma & Healthcare"},
    {"symbol": "DRREDDY", "name": "Dr. Reddy's Laboratories", "sector": "Pharma & Healthcare"},
    {"symbol": "DIVISLAB", "name": "Divi's Laboratories Ltd.", "sector": "Pharma & Healthcare"},
    {"symbol": "APOLLOHOSP", "name": "Apollo Hospitals Enterprise", "sector": "Pharma & Healthcare"},
    {"symbol": "LUPIN", "name": "Lupin Ltd.", "sector": "Pharma & Healthcare"},
    {"symbol": "MANKIND", "name": "Mankind Pharma Ltd.", "sector": "Pharma & Healthcare"},

    # FMCG & Retail
    {"symbol": "ITC", "name": "ITC Ltd.", "sector": "FMCG"},
    {"symbol": "HINDUNILVR", "name": "Hindustan Unilever Ltd.", "sector": "FMCG"},
    {"symbol": "NESTLEIND", "name": "Nestle India Ltd.", "sector": "FMCG"},
    {"symbol": "BRITANNIA", "name": "Britannia Industries Ltd.", "sector": "FMCG"},
    {"symbol": "TATACONSUM", "name": "Tata Consumer Products", "sector": "FMCG"},
    {"symbol": "VBL", "name": "Varun Beverages Ltd.", "sector": "FMCG"},
    {"symbol": "DABUR", "name": "Dabur India Ltd.", "sector": "FMCG"},
    {"symbol": "TITAN", "name": "Titan Company Ltd.", "sector": "Consumer & Retail"},
    {"symbol": "TRENT", "name": "Trent Ltd.", "sector": "Consumer & Retail"},
    {"symbol": "DMART", "name": "Avenue Supermarts (DMart)", "sector": "Consumer & Retail"},
    {"symbol": "ZOMATO", "name": "Zomato Ltd.", "sector": "Consumer & Retail"},

    # Aerospace, Defense & Industrials
    {"symbol": "BEL", "name": "Bharat Electronics Ltd.", "sector": "Aerospace & Defense"},
    {"symbol": "HAL", "name": "Hindustan Aeronautics Ltd.", "sector": "Aerospace & Defense"},
    {"symbol": "BHEL", "name": "Bharat Heavy Electricals Ltd.", "sector": "Aerospace & Defense"},
    {"symbol": "SIEMENS", "name": "Siemens Ltd.", "sector": "Industrials"},
    {"symbol": "ABB", "name": "ABB India Ltd.", "sector": "Industrials"},
    {"symbol": "HAVELLS", "name": "Havells India Ltd.", "sector": "Industrials"},
    {"symbol": "POLYCAB", "name": "Polycab India Ltd.", "sector": "Industrials"},

    # Metals, Mining, Telecom & Infra
    {"symbol": "BHARTIARTL", "name": "Bharti Airtel Ltd.", "sector": "Telecom"},
    {"symbol": "TATASTEEL", "name": "Tata Steel Ltd.", "sector": "Metals & Mining"},
    {"symbol": "JSWSTEEL", "name": "JSW Steel Ltd.", "sector": "Metals & Mining"},
    {"symbol": "HINDALCO", "name": "Hindalco Industries Ltd.", "sector": "Metals & Mining"},
    {"symbol": "JINDALSTEL", "name": "Jindal Steel & Power Ltd.", "sector": "Metals & Mining"},
    {"symbol": "LT", "name": "Larsen & Toubro Ltd.", "sector": "Infrastructure"},
    {"symbol": "ADANIPORTS", "name": "Adani Ports & SEZ Ltd.", "sector": "Infrastructure"},
    {"symbol": "GRASIM", "name": "Grasim Industries Ltd.", "sector": "Infrastructure"},
    {"symbol": "ULTRACEMCO", "name": "UltraTech Cement Ltd.", "sector": "Infrastructure"},
    {"symbol": "AMBUJACEM", "name": "Ambuja Cements Ltd.", "sector": "Infrastructure"}
]


class NewsSentimentItem(BaseModel):
    title: str
    summary: Optional[str]
    url: Optional[str]
    source: Optional[str]
    published_at: str
    sentiment: str
    sentiment_score: float
    reason: str


class AISummaryReport(BaseModel):
    strengths: List[str]
    risks: List[str]
    technical_view: str
    fundamental_view: str
    news_view: str
    short_term_view: str
    long_term_view: str
    important_things_to_watch: List[str]


class FullStockResearchReport(BaseModel):
    symbol: str
    name: str
    quote: StockQuote
    today_score: TodayScoreResult
    long_term_score: LongTermScoreResult
    technical_analysis: TechnicalIndicatorResults
    fundamental_analysis: CompanyFundamentalData
    recent_news: List[NewsSentimentItem]
    ai_summary: AISummaryReport


async def scan_today_market(use_mock: bool = False):
    """Intraday opportunity scanner across equities."""
    market_provider = get_market_data_provider(use_mock=use_mock)
    end_d = date.today()
    start_d = end_d - timedelta(days=90)

    async def _evaluate_item(item: Dict[str, str]):
        sym = item["symbol"]
        try:
            history = await market_provider.get_historical_prices(sym, start_d, end_d)
            tech = calculate_technical_indicators(sym, history)
            score = calculate_today_opportunity_score(sym, tech)
            return score
        except Exception:
            return None

    tasks = [_evaluate_item(stock) for stock in TOP_INDIAN_STOCKS]
    results = await asyncio.gather(*tasks)

    valid_results = [r for r in results if r is not None]
    valid_results.sort(key=lambda x: x.today_opportunity_score, reverse=True)

    bullish = [r for r in valid_results if r.bias == "Bullish"]
    bearish = [r for r in valid_results if r.bias == "Bearish"]

    return {
        "scan_date": date.today().isoformat(),
        "total_scanned": len(valid_results),
        "bullish_candidates": bullish,
        "bearish_candidates": bearish,
        "all_ranked": valid_results
    }


async def scan_long_term_market(use_mock: bool = False):
    """5-year quality compounder scanner across equities."""
    fund_provider = get_fundamental_data_provider(use_mock=use_mock)

    async def _evaluate_item(item: Dict[str, str]):
        sym = item["symbol"]
        try:
            fund = await fund_provider.get_fundamentals(sym)
            score = calculate_long_term_quality_score(fund)
            return score
        except Exception:
            return None

    tasks = [_evaluate_item(stock) for stock in TOP_INDIAN_STOCKS]
    results = await asyncio.gather(*tasks)

    valid_results = [r for r in results if r is not None]
    valid_results.sort(key=lambda x: x.long_term_score, reverse=True)

    return {
        "scan_date": date.today().isoformat(),
        "total_scanned": len(valid_results),
        "top_quality_stocks": valid_results[:10],
        "all_ranked": valid_results
    }


async def get_today_stock_score(symbol: str, use_mock: bool = False) -> TodayScoreResult:
    """Fast lightweight calculation of Today's Opportunity Score using OHLCV price series."""
    market_provider = get_market_data_provider(use_mock=use_mock)
    end_d = date.today()
    start_d = end_d - timedelta(days=90)

    history = await market_provider.get_historical_prices(symbol, start_d, end_d)
    tech_results = calculate_technical_indicators(symbol, history)
    return calculate_today_opportunity_score(symbol, tech_results)


async def generate_ai_research_summary(
    symbol: str,
    quote: StockQuote,
    today_score: TodayScoreResult,
    lt_score: LongTermScoreResult,
    tech: TechnicalIndicatorResults,
    fund: CompanyFundamentalData,
    news_items: List[NewsSentimentItem]
) -> AISummaryReport:
    """Generates structured AI research analysis without hallucination."""
    strengths = []
    risks = []

    if tech.trend_20_50 == "Bullish":
        strengths.append("Short-term moving average alignment (SMA 20 > SMA 50) signals upward price momentum.")
    if fund.roe and fund.roe >= 20.0:
        strengths.append(f"High Return on Equity (ROE: {fund.roe}%) demonstrating capital allocation efficiency.")
    if fund.debt_to_equity is not None and fund.debt_to_equity <= 0.2:
        strengths.append(f"Conservative balance sheet with low Debt-to-Equity ratio ({fund.debt_to_equity}).")
    if today_score.unusual_volume:
        strengths.append("Unusual volume surge detected relative to the 20-day volume average.")

    if not strengths:
        strengths.append("Established market capitalization in NSE sector index.")

    if fund.pe_ratio and fund.pe_ratio > 35.0:
        risks.append(f"Elevated valuation multiple with P/E ratio at {fund.pe_ratio}.")
    if tech.rsi_14 and tech.rsi_14 > 70.0:
        risks.append(f"RSI oscillator at {tech.rsi_14} indicates near-term overbought technical conditions.")
    if today_score.bias == "Bearish":
        risks.append("Intraday score reflects weak technical momentum and selling pressure.")

    if not risks:
        risks.append("Broader macroeconomic market volatility and sector rotation risks.")

    tech_view = (
        f"Technical setup is {today_score.bias} with Today's Opportunity Score of {today_score.today_opportunity_score}/100. "
        f"RSI is at {tech.rsi_14 or 'N/A'}, MACD histogram is {tech.macd_hist or 'N/A'}. Support level at ₹{tech.support_level} and resistance at ₹{tech.resistance_level}."
    )

    fund_view = (
        f"Fundamental Quality Score is {lt_score.fundamental_quality_score}/100 and Long-Term Quality Score is {lt_score.long_term_score}/100 ({lt_score.classification}). "
        f"P/E ratio stands at {fund.pe_ratio or 'N/A'}, ROE at {fund.roe or 'N/A'}%, and Debt/Equity at {fund.debt_to_equity or 'N/A'}."
    )

    news_view = (
        f"Analyzed {len(news_items)} recent news headlines. Overall news sentiment leans "
        f"{news_items[0].sentiment if news_items else 'Neutral'}."
    )

    short_term_view = (
        f"{today_score.bias} bias with {today_score.confidence} confidence based on combined technical (30%) and volume (15%) indicators."
    )

    long_term_view = (
        f"Classified as '{lt_score.classification}' based on growth, balance sheet strength, and profitability metrics."
    )

    watch_items = [
        f"Price action around resistance level (₹{tech.resistance_level}).",
        "Upcoming quarterly financial results & revenue growth trajectory.",
        "Volume confirmation on daily price movement."
    ]

    return AISummaryReport(
        strengths=strengths,
        risks=risks,
        technical_view=tech_view,
        fundamental_view=fund_view,
        news_view=news_view,
        short_term_view=short_term_view,
        long_term_view=long_term_view,
        important_things_to_watch=watch_items
    )


async def get_full_stock_report(symbol: str, use_mock: bool = False) -> FullStockResearchReport:
    """Generates complete stock research report combining quotes, technicals, fundamentals, news, and scores."""
    cache_key = f"report_{symbol.upper()}_{use_mock}"
    now_ts = time.time()
    if cache_key in _CACHE_STORE and (now_ts - _CACHE_STORE[cache_key]["time"]) < CACHE_TTL_SECONDS:
        return _CACHE_STORE[cache_key]["data"]

    market_provider = get_market_data_provider(use_mock=use_mock)
    fund_provider = get_fundamental_data_provider(use_mock=use_mock)
    news_provider = get_news_data_provider(use_mock=use_mock)

    sym_clean = symbol.upper()
    stock_info = next(
        (s for s in TOP_INDIAN_STOCKS if s["symbol"] == sym_clean),
        {"symbol": sym_clean, "name": f"{sym_clean} (NSE/BSE Equities)"}
    )

    end_d = date.today()
    start_d = end_d - timedelta(days=90)

    # Fetch Data Concurrently
    quote_task = market_provider.get_quote(sym_clean)
    history_task = market_provider.get_historical_prices(sym_clean, start_d, end_d)
    fund_task = fund_provider.get_fundamentals(sym_clean)
    news_task = news_provider.get_recent_news(sym_clean, limit=5)

    quote, history, fundamentals, raw_news = await asyncio.gather(
        quote_task, history_task, fund_task, news_task
    )

    # Quantitative Calculations
    tech_results = calculate_technical_indicators(sym_clean, history)
    today_score = calculate_today_opportunity_score(sym_clean, tech_results)
    lt_score = calculate_long_term_quality_score(fundamentals)

    # News Sentiment
    processed_news = []
    for item in raw_news:
        sent, sent_score, reason = analyze_news_sentiment(item.title, item.summary or "")
        processed_news.append(
            NewsSentimentItem(
                title=item.title,
                summary=item.summary,
                url=item.url,
                source=item.source,
                published_at=item.published_at.isoformat(),
                sentiment=sent,
                sentiment_score=sent_score,
                reason=reason
            )
        )

    ai_summary = await generate_ai_research_summary(
        sym_clean, quote, today_score, lt_score, tech_results, fundamentals, processed_news
    )

    result = FullStockResearchReport(
        symbol=sym_clean,
        name=stock_info["name"],
        quote=quote,
        today_score=today_score,
        long_term_score=lt_score,
        technical_analysis=tech_results,
        fundamental_analysis=fundamentals,
        recent_news=processed_news,
        ai_summary=ai_summary
    )

    _CACHE_STORE[cache_key] = {"data": result, "time": now_ts}
    return result
