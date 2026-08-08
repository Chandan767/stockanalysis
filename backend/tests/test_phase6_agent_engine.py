import pytest
from app.agents.agent_engine import run_autonomous_agent_analysis, analyze_single_stock_insight


@pytest.mark.asyncio
async def test_phase6_autonomous_agent_analysis():
    report = await run_autonomous_agent_analysis(use_mock=False)

    assert report.execution_time is not None
    assert report.total_stocks_analyzed > 0
    assert report.market_verdict != ""
    assert isinstance(report.bullish_profit_candidates, list)
    assert isinstance(report.bearish_loss_risk_candidates, list)
    assert isinstance(report.neutral_candidates, list)

    if report.bullish_profit_candidates:
        candidate = report.bullish_profit_candidates[0]
        assert candidate.symbol != ""
        assert candidate.five_year_cagr is not None
        assert candidate.predicted_direction in ["UP", "DOWN", "NEUTRAL"]
        assert candidate.up_probability >= 0.0
        assert candidate.expected_return_pct is not None
