import pytest
from app.agents.agent_engine import run_autonomous_agent_analysis


@pytest.mark.asyncio
async def test_autonomous_agent_analysis_live():
    report = await run_autonomous_agent_analysis(use_mock=False)

    assert report.total_stocks_analyzed > 0
    assert len(report.bullish_profit_candidates) + len(report.bearish_loss_risk_candidates) + len(report.neutral_candidates) == report.total_stocks_analyzed
    
    first_candidate = (
        report.bullish_profit_candidates[0]
        if report.bullish_profit_candidates
        else (report.neutral_candidates[0] if report.neutral_candidates else report.bearish_loss_risk_candidates[0])
    )
    assert first_candidate.symbol != ""
    assert first_candidate.probability_score > 0
    assert len(first_candidate.strengths) > 0
