import json
from typing import List, Dict, Any, Optional
from datetime import date, datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select, and_

from app.models.models import Stock, DailyPrediction, FeatureSnapshot, PredictionEvaluation
from app.engine.prediction_pipeline import DailyStockPredictionItem
from app.engine.timestamp_guard import classify_return_direction


class PredictionStorageService:
    """
    Phase 7 Database Persistence Service:
    Saves daily prediction outputs and immutable feature snapshots at pre-market cutoff (08:30 IST).
    Evaluates prediction accuracy post-market (15:30 IST).
    """

    @staticmethod
    def _get_or_create_stock(db: Session, symbol: str, name: str = "", sector: str = "General") -> Stock:
        """Retrieves or creates Stock DB entity."""
        sym_clean = symbol.upper()
        stock = db.execute(select(Stock).where(Stock.symbol == sym_clean)).scalar_one_or_none()
        if not stock:
            stock = Stock(
                symbol=sym_clean,
                name=name or f"{sym_clean} Ltd.",
                industry=sector or "General"
            )
            db.add(stock)
            db.commit()
            db.refresh(stock)
        return stock

    @classmethod
    def save_feature_snapshot(
        cls,
        db: Session,
        symbol: str,
        features_dict: Dict[str, Any],
        cutoff_timestamp: datetime
    ) -> FeatureSnapshot:
        """Saves immutable pre-market feature snapshot."""
        stock = cls._get_or_create_stock(db, symbol)
        snapshot = FeatureSnapshot(
            stock_id=stock.id,
            as_of_timestamp=cutoff_timestamp,
            features_json=features_dict
        )
        db.add(snapshot)
        db.commit()
        db.refresh(snapshot)
        return snapshot

    @classmethod
    def save_daily_prediction(
        cls,
        db: Session,
        pred_item: DailyStockPredictionItem,
        snapshot_id: Optional[int] = None,
        prediction_date: Optional[date] = None
    ) -> DailyPrediction:
        """Saves daily stock directional prediction record."""
        if prediction_date is None:
            prediction_date = date.today()

        stock = cls._get_or_create_stock(db, pred_item.symbol, pred_item.name, pred_item.sector)

        existing = db.execute(
            select(DailyPrediction).where(
                and_(
                    DailyPrediction.stock_id == stock.id,
                    DailyPrediction.prediction_date == prediction_date
                )
            )
        ).scalar_one_or_none()

        if existing:
            existing.prediction = pred_item.predicted_direction
            existing.up_probability = pred_item.up_probability
            existing.down_probability = pred_item.down_probability
            existing.neutral_probability = pred_item.neutral_probability
            existing.expected_return = pred_item.expected_return_pct
            existing.expected_return_low = pred_item.expected_return_low
            existing.expected_return_high = pred_item.expected_return_high
            existing.confidence = pred_item.confidence
            existing.model_version = pred_item.model_version
            existing.feature_snapshot_id = snapshot_id
            existing.prediction_reason = {
                "reasons": pred_item.primary_reasons,
                "risks": pred_item.risk_factors
            }
            db.commit()
            db.refresh(existing)
            return existing

        now_ts = datetime.now(timezone.utc)
        prediction = DailyPrediction(
            stock_id=stock.id,
            prediction_date=prediction_date,
            prediction_timestamp=now_ts,
            prediction=pred_item.predicted_direction,
            up_probability=pred_item.up_probability,
            down_probability=pred_item.down_probability,
            neutral_probability=pred_item.neutral_probability,
            expected_return=pred_item.expected_return_pct,
            expected_return_low=pred_item.expected_return_low,
            expected_return_high=pred_item.expected_return_high,
            confidence=pred_item.confidence,
            model_version=pred_item.model_version,
            feature_snapshot_id=snapshot_id,
            prediction_reason={
                "reasons": pred_item.primary_reasons,
                "risks": pred_item.risk_factors
            }
        )
        db.add(prediction)
        db.commit()
        db.refresh(prediction)
        return prediction

    @staticmethod
    def evaluate_post_market_prediction(
        db: Session,
        prediction_id: int,
        actual_open_price: float,
        actual_close_price: float
    ) -> PredictionEvaluation:
        """Evaluates prediction accuracy after market close."""
        pred = db.execute(
            select(DailyPrediction).where(DailyPrediction.id == prediction_id)
        ).scalar_one_or_none()

        if not pred:
            raise ValueError(f"Prediction ID {prediction_id} not found.")

        actual_ret = ((actual_close_price - actual_open_price) / actual_open_price) if actual_open_price else 0.0
        actual_dir = classify_return_direction(actual_ret)

        is_correct = (actual_dir == pred.prediction)
        return_err = round(actual_ret * 100.0 - float(pred.expected_return or 0.0), 4)

        eval_record = db.execute(
            select(PredictionEvaluation).where(PredictionEvaluation.prediction_id == prediction_id)
        ).scalar_one_or_none()

        if eval_record:
            eval_record.actual_open = actual_open_price
            eval_record.actual_close = actual_close_price
            eval_record.actual_return = actual_ret
            eval_record.actual_direction = actual_dir
            eval_record.prediction_correct = is_correct
            eval_record.prediction_error = return_err
            db.commit()
            db.refresh(eval_record)
            return eval_record

        eval_record = PredictionEvaluation(
            prediction_id=prediction_id,
            actual_date=pred.prediction_date,
            actual_open=actual_open_price,
            actual_close=actual_close_price,
            actual_return=actual_ret,
            actual_direction=actual_dir,
            prediction_correct=is_correct,
            prediction_error=return_err
        )
        db.add(eval_record)
        db.commit()
        db.refresh(eval_record)
        return eval_record

    @staticmethod
    def get_stock_prediction_history(db: Session, symbol: str, limit: int = 30) -> List[DailyPrediction]:
        """Fetches historical prediction records for a stock."""
        stock = db.execute(select(Stock).where(Stock.symbol == symbol.upper())).scalar_one_or_none()
        if not stock:
            return []

        return db.execute(
            select(DailyPrediction)
            .where(DailyPrediction.stock_id == stock.id)
            .order_by(DailyPrediction.prediction_date.desc())
            .limit(limit)
        ).scalars().all()
