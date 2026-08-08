import pytest
from app.services.global_market_service import get_global_market_features


@pytest.mark.asyncio
async def test_global_market_features():
    report = await get_global_market_features(use_mock=False)

    assert report.timestamp is not None
    assert len(report.items) > 0

    # Verify key benchmark tickers exist in report items
    symbols = [item.symbol for item in report.items]
    assert any("^GSPC" in s or "^IXIC" in s or "^NSEI" in s for s in symbols)

    # Verify Inter-Market Signals
    signals = report.signals
    assert signals.global_risk_regime in [
        "Risk-On (Bullish Global Sentiment)",
        "Risk-Off (Bearish Global Headwinds)",
        "High Volatility / Risk-Off",
        "Neutral / Mixed Global Cues"
    ]
    assert signals.indian_it_sector_signal != ""
    assert signals.airline_fuel_impact_signal != ""
