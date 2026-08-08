import pytest
from datetime import date, timedelta
from app.data.yfinance_provider import YFinanceMarketDataProvider
from app.data.factory import get_market_data_provider, get_fundamental_data_provider, get_news_data_provider


@pytest.mark.asyncio
async def test_live_quote():
    provider = get_market_data_provider()
    quote = await provider.get_quote("TCS")

    assert quote.symbol == "TCS"
    assert quote.price > 0
    assert quote.timestamp is not None


@pytest.mark.asyncio
async def test_live_history():
    provider = get_market_data_provider()
    end_d = date.today()
    start_d = end_d - timedelta(days=30)
    history = await provider.get_historical_prices("TCS", start_d, end_d)

    assert len(history) > 0
    assert history[0].close > 0


@pytest.mark.asyncio
async def test_live_fundamentals():
    provider = get_fundamental_data_provider()
    fundamentals = await provider.get_fundamentals("TCS")

    assert fundamentals.symbol == "TCS"
    assert fundamentals.market_cap is not None
    assert fundamentals.market_cap > 0


@pytest.mark.asyncio
async def test_live_news():
    provider = get_news_data_provider()
    news = await provider.get_recent_news("TCS", limit=5)

    assert isinstance(news, list)
