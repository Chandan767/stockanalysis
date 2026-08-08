import pytest
from app.services.technical_sector_feature_service import generate_stock_feature_set, compute_adx_14, compute_beta
from app.data.base import OHLCVData
from datetime import date


def test_adx_and_beta_computation():
    dummy_history = [
        OHLCVData(
            date=date(2026, 1, i + 1),
            open=100.0 + i,
            high=105.0 + i,
            low=98.0 + i,
            close=102.0 + i,
            volume=10000 + (i * 500)
        )
        for i in range(30)
    ]

    adx = compute_adx_14(dummy_history)
    assert 0.0 <= adx <= 100.0

    s_ret = [0.01, 0.02, -0.01, 0.015, 0.005, 0.01]
    n_ret = [0.008, 0.015, -0.005, 0.012, 0.004, 0.008]
    beta = compute_beta(s_ret, n_ret)
    assert beta > 0.0


@pytest.mark.asyncio
async def test_generate_stock_feature_set():
    features = await generate_stock_feature_set("TCS", sector="Information Technology", use_mock=False)

    assert features.symbol == "TCS"
    assert features.last_price > 0
    assert features.return_1d is not None
    assert features.return_5d is not None
    assert features.adx_14 is not None
    assert features.dist_from_52w_high_pct <= 0.0
    assert features.dist_from_52w_low_pct >= 0.0
    assert features.beta_vs_nifty_60d is not None
