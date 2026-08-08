import pytest
from app.engine.prediction_pipeline import calculate_calibrated_probabilities, run_daily_market_prediction_engine


def test_calibrated_probabilities_calculation():
    (p_up, p_down, p_neu, direction, confidence, exp_ret, exp_low, exp_high) = calculate_calibrated_probabilities(
        tech_return_5d=4.5,
        tech_rsi=58.0,
        macd_hist=12.5,
        us_sp500_ret=0.8,
        us_nasdaq_ret=1.2,
        news_weighted_score=0.45,
        relative_nifty_5d=3.2,
        adx_val=35.0
    )

    # Probabilities must sum to 1.0
    assert abs((p_up + p_down + p_neu) - 1.0) < 0.01
    assert p_up > p_down # Bullish signals should yield higher UP probability
    assert direction in ["UP", "DOWN", "NEUTRAL"]
    assert confidence in ["High", "Medium", "Low"]
    assert exp_low < exp_ret < exp_high


@pytest.mark.asyncio
async def test_run_daily_market_prediction_engine():
    report = await run_daily_market_prediction_engine(use_mock=False)

    assert report.prediction_date is not None
    assert report.total_stocks_evaluated > 0
    assert report.market_regime != ""
    assert isinstance(report.top_potential_gainers, list)
    assert isinstance(report.top_potential_losers, list)
    assert isinstance(report.uncertain_stocks, list)

    if report.top_potential_gainers:
        top = report.top_potential_gainers[0]
        assert top.predicted_direction == "UP"
        assert top.up_probability > 0.5
