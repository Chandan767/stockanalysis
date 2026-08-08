from app.data.base import MarketDataProvider, FundamentalDataProvider, NewsDataProvider
from app.data.yfinance_provider import YFinanceMarketDataProvider


def get_market_data_provider(use_mock: bool = False) -> MarketDataProvider:
    """Returns 100% real live market data provider for NSE/BSE equities."""
    return YFinanceMarketDataProvider()


def get_fundamental_data_provider(use_mock: bool = False) -> FundamentalDataProvider:
    """Returns 100% real company fundamentals provider for Indian equities."""
    return YFinanceMarketDataProvider()


def get_news_data_provider(use_mock: bool = False) -> NewsDataProvider:
    """Returns 100% real market news provider for Indian equities."""
    return YFinanceMarketDataProvider()
