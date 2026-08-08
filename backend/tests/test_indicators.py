import pytest
from datetime import date, timedelta
from app.data.yfinance_provider import YFinanceMarketDataProvider
from app.indicators.technical import calculate_technical_indicators


@pytest.mark.asyncio
async def test_technical_indicators():
    provider = YFinanceMarketDataProvider()
    end_d = date.today()
    start_d = end_d - timedelta(days=90)
    history = await provider.get_historical_prices("TCS", start_d, end_d)

    results = calculate_technical_indicators("TCS", history)

    assert results.symbol == "TCS"
    assert results.last_price > 0
    assert results.rsi_14 is not None
    assert results.trend_20_50 in ["Bullish", "Bearish", "Neutral"]
