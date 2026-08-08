from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from datetime import date, datetime
from pydantic import BaseModel


class StockQuote(BaseModel):
    symbol: str
    price: float
    change: float
    percent_change: float
    high_52w: Optional[float] = None
    low_52w: Optional[float] = None
    market_cap: Optional[float] = None
    volume: int
    timestamp: datetime


class OHLCVData(BaseModel):
    date: date
    open: float
    high: float
    low: float
    close: float
    adjusted_close: Optional[float] = None
    volume: int


class CompanyFundamentalData(BaseModel):
    symbol: str
    period_date: date
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    ev_to_ebitda: Optional[float] = None
    peg_ratio: Optional[float] = None
    roe: Optional[float] = None
    roce: Optional[float] = None
    debt_to_equity: Optional[float] = None
    interest_coverage: Optional[float] = None
    revenue_growth_yoy: Optional[float] = None
    profit_growth_yoy: Optional[float] = None
    eps_growth_yoy: Optional[float] = None
    operating_margin: Optional[float] = None
    net_margin: Optional[float] = None
    free_cash_flow: Optional[float] = None
    promoter_holding: Optional[float] = None
    ii_holding: Optional[float] = None
    dii_holding: Optional[float] = None
    public_holding: Optional[float] = None


class NewsArticle(BaseModel):
    symbol: str
    title: str
    summary: Optional[str] = None
    url: Optional[str] = None
    source: Optional[str] = None
    published_at: datetime


class MarketDataProvider(ABC):
    @abstractmethod
    async def get_quote(self, symbol: str) -> StockQuote:
        """Fetch current stock quote."""
        pass

    @abstractmethod
    async def get_historical_prices(
        self, symbol: str, start_date: date, end_date: date, interval: str = "1d", period: Optional[str] = None
    ) -> List[OHLCVData]:
        """Fetch historical daily or intraday OHLCV price series."""
        pass


class FundamentalDataProvider(ABC):
    @abstractmethod
    async def get_fundamentals(self, symbol: str) -> CompanyFundamentalData:
        """Fetch fundamental company metrics and balance sheet data."""
        pass


class NewsDataProvider(ABC):
    @abstractmethod
    async def get_recent_news(self, symbol: str, limit: int = 10) -> List[NewsArticle]:
        """Fetch recent company and market news articles."""
        pass
