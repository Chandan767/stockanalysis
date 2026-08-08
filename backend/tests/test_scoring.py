import pytest
from datetime import date, timedelta
from app.data.yfinance_provider import YFinanceMarketDataProvider
from app.indicators.technical import calculate_technical_indicators
from app.scoring.today_scoring import calculate_today_opportunity_score
from app.scoring.long_term_scoring import calculate_long_term_quality_score


@pytest.mark.asyncio
async def test_today_opportunity_score():
    provider = YFinanceMarketDataProvider()
    end_d = date.today()
    start_d = end_d - timedelta(days=90)
    history = await provider.get_historical_prices("TCS", start_d, end_d)
    tech = calculate_technical_indicators("TCS", history)

    score = calculate_today_opportunity_score("TCS", tech)

    assert score.symbol == "TCS"
    assert 0 <= score.today_opportunity_score <= 100
    assert score.bias in ["Bullish", "Bearish", "Neutral"]


@pytest.mark.asyncio
async def test_long_term_quality_score():
    provider = YFinanceMarketDataProvider()
    fundamentals = await provider.get_fundamentals("TCS")

    score = calculate_long_term_quality_score(fundamentals)

    assert score.symbol == "TCS"
    assert 0 <= score.long_term_score <= 100
    assert score.classification in [
        "Strong Long-Term Candidate",
        "Watchlist Candidate",
        "Avoid / High Risk"
    ]
