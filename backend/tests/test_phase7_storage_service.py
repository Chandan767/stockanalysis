import pytest
from datetime import date, datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.models import Base
from app.engine.prediction_pipeline import DailyStockPredictionItem
from app.services.prediction_storage_service import PredictionStorageService

# In-memory SQLite engine for Phase 7 storage testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_prediction_storage_and_evaluation():
    db = TestingSessionLocal()
    try:
        cutoff = datetime.now(timezone.utc)
        feat_dict = {"return_5d": 3.5, "rsi_14": 58.0}
        
        snapshot = PredictionStorageService.save_feature_snapshot(db, "TCS", feat_dict, cutoff)
        assert snapshot.id is not None
        assert snapshot.stock_id is not None

        pred_item = DailyStockPredictionItem(
            symbol="TCS",
            name="Tata Consultancy Services Ltd.",
            sector="Information Technology",
            current_price=2365.60,
            predicted_direction="UP",
            up_probability=0.72,
            down_probability=0.05,
            neutral_probability=0.23,
            expected_return_pct=1.50,
            expected_return_low=1.05,
            expected_return_high=1.95,
            confidence="High",
            primary_reasons=["Strong momentum"],
            risk_factors=["RSI overbought"],
            model_version="v1.0-baseline"
        )

        pred_rec = PredictionStorageService.save_daily_prediction(db, pred_item, snapshot_id=snapshot.id)
        assert pred_rec.id is not None
        assert pred_rec.prediction == "UP"

        # Test Post-Market Evaluation (Open: 2365.60 -> Close: 2400.00 => Return +1.45% => UP)
        eval_rec = PredictionStorageService.evaluate_post_market_prediction(db, pred_rec.id, 2365.60, 2400.00)
        assert eval_rec.prediction_correct is True
        assert eval_rec.actual_direction == "UP"

        history = PredictionStorageService.get_stock_prediction_history(db, "TCS")
        assert len(history) == 1
        assert history[0].prediction == "UP"
    finally:
        db.close()
