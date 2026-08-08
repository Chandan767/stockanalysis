import pytest
from app.services.backtest_service import run_stock_walkforward_backtest


@pytest.mark.asyncio
async def test_phase8_walkforward_backtest():
    report = await run_stock_walkforward_backtest("TCS", days=15, use_mock=False)

    assert report.symbol == "TCS"
    assert report.total_evaluations > 0
    assert 0.0 <= report.overall_accuracy_pct <= 100.0
    assert report.simulated_strategy_return_pct is not None
    assert report.benchmark_nifty_return_pct is not None
    assert isinstance(report.daily_history, list)
    assert len(report.daily_history) == report.total_evaluations

    if report.daily_history:
        step = report.daily_history[0]
        assert step.symbol == "TCS"
        assert step.predicted_direction in ["UP", "DOWN", "NEUTRAL"]
        assert step.actual_direction in ["UP", "DOWN", "NEUTRAL"]
        assert isinstance(step.is_correct, bool)
