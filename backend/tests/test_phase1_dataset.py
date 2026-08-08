import pytest
from datetime import datetime, date, timezone, timedelta
from app.core.config import settings
from app.engine.timestamp_guard import classify_return_direction, TimestampGuard
from app.models.models import (
    Sector, Stock, FeatureSnapshot, DailyPrediction, PredictionEvaluation, GlobalMarketData, MacroEvent
)


def test_direction_label_classification():
    # Test UP (> +0.5%)
    assert classify_return_direction(0.012) == "UP" # +1.2%
    assert classify_return_direction(0.006) == "UP" # +0.6%

    # Test DOWN (< -0.5%)
    assert classify_return_direction(-0.015) == "DOWN" # -1.5%
    assert classify_return_direction(-0.008) == "DOWN" # -0.8%

    # Test NEUTRAL (between -0.5% and +0.5%)
    assert classify_return_direction(0.002) == "NEUTRAL" # +0.2%
    assert classify_return_direction(-0.003) == "NEUTRAL" # -0.3%
    assert classify_return_direction(0.000) == "NEUTRAL"


def test_timestamp_guard_leakage_rejection():
    cutoff_ts = datetime(2026, 8, 1, 8, 30, tzinfo=timezone.utc) # 08:30 IST prediction cutoff

    # Past data (valid)
    valid_news_time = datetime(2026, 8, 1, 7, 45, tzinfo=timezone.utc)
    assert TimestampGuard.is_timestamp_valid(valid_news_time, cutoff_ts) is True

    # Future data (data leakage -> MUST REJECT)
    future_news_time = datetime(2026, 8, 1, 9, 15, tzinfo=timezone.utc)
    assert TimestampGuard.is_timestamp_valid(future_news_time, cutoff_ts) is False


def test_timestamp_guard_feature_filter():
    cutoff_ts = datetime(2026, 8, 1, 8, 30, tzinfo=timezone.utc)

    features = {
        "overnight_us_return": {
            "val": 0.012,
            "source_timestamp": "2026-08-01T04:00:00+00:00"
        },
        "leaked_intraday_return": {
            "val": 0.025,
            "source_timestamp": "2026-08-01T10:30:00+00:00"
        }
    }

    is_valid, rejected = TimestampGuard.validate_features(features, cutoff_ts)
    assert is_valid is False
    assert "leaked_intraday_return" in rejected
    assert len(rejected) == 1


def test_models_import():
    # Verify ORM model definitions
    assert FeatureSnapshot.__tablename__ == "feature_snapshots"
    assert DailyPrediction.__tablename__ == "daily_predictions"
    assert PredictionEvaluation.__tablename__ == "prediction_evaluations"
    assert GlobalMarketData.__tablename__ == "global_market_data"
    assert MacroEvent.__tablename__ == "macro_events"
