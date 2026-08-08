from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from typing import List

from app.engine.prediction_pipeline import run_daily_market_prediction_engine, predict_single_stock
from app.services.global_market_service import get_global_market_features
from app.services.research_service import TOP_INDIAN_STOCKS
from app.services.prediction_storage_service import PredictionStorageService
from app.services.backtest_service import run_stock_walkforward_backtest
from app.services.scheduler_service import execute_premarket_prediction_job, get_scheduler_status
from app.core.database import get_db

router = APIRouter(prefix="/predict", tags=["Daily Stock Direction Prediction Engine"])


@router.get("/daily", summary="Get Daily AI Market Predictions (Potential Gainers, Losers, Uncertain)")
async def get_daily_predictions(use_mock: bool = Query(False)):
    """
    Phase 5 & 7 Daily Stock Direction Prediction Engine:
    Scans full Indian equity universe using Global Markets, Macro, Technicals, and News NLP.
    Ranks stocks into Potential Gainers (UP), Potential Losers (DOWN), and Uncertain (NEUTRAL).
    """
    try:
        return await run_daily_market_prediction_engine(use_mock=use_mock)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Daily prediction engine failed: {str(e)}")


@router.post("/trigger-job", summary="Manually Trigger Pre-Market 08:30 IST Prediction Batch Job")
async def trigger_premarket_job():
    """
    Phase 9 Batch Automation:
    Manually triggers full pre-market 08:30 IST prediction scan, DB persistence, and cache warming.
    """
    try:
        return await execute_premarket_prediction_job()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Manual batch job trigger failed: {str(e)}")


@router.get("/job-status", summary="Get Pre-Market Background Scheduler Status")
@router.get("/status", summary="Get Pre-Market Background Scheduler Status")
async def fetch_job_status():
    """
    Phase 9 Scheduler Status:
    Returns status and last execution timestamp of automated 08:30 IST pre-market cron job.
    """
    return get_scheduler_status()


@router.post("/store", summary="Persist Current Day Predictions to Database")
async def store_daily_predictions(use_mock: bool = Query(False), db: Session = Depends(get_db)):
    """
    Phase 7 Database Persistence Engine:
    Stores daily stock predictions into database daily_predictions table for tracking and audit.
    """
    try:
        report = await run_daily_market_prediction_engine(use_mock=use_mock)
        all_items = report.top_potential_gainers + report.top_potential_losers + report.uncertain_stocks
        stored_records = []
        for item in all_items:
            rec = PredictionStorageService.save_daily_prediction(db, item)
            stored_records.append(rec.id)
        return {
            "status": "success",
            "message": f"Successfully persisted {len(stored_records)} daily prediction records to database.",
            "prediction_date": report.prediction_date
        }
    except Exception as e:
        return {
            "status": "pending_db",
            "message": f"Daily predictions generated in-memory. Database connection notice: {str(e)}"
        }


@router.get("/backtest/{symbol}", summary="Get Historical Walk-Forward Model Backtest for a Stock")
async def get_stock_backtest(symbol: str, days: int = Query(30, ge=5, le=180), use_mock: bool = Query(False)):
    """
    Phase 8 Model Backtesting Engine:
    Runs walk-forward backtest simulation over historical daily sessions.
    Evaluates directional accuracy %, win rate %, strategy cumulative return vs NIFTY 50, and Sharpe ratio.
    """
    try:
        return await run_stock_walkforward_backtest(symbol, days=days, use_mock=use_mock)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backtest simulation failed for {symbol}: {str(e)}")


@router.get("/history/{symbol}", summary="Get Historical Predictions and Performance Audit for a Stock")
async def get_prediction_history(symbol: str, limit: int = Query(30, ge=1, le=100), db: Session = Depends(get_db)):
    """
    Phase 7 Audit Trail:
    Retrieves historical prediction records saved in the database for a specific stock.
    """
    try:
        history = PredictionStorageService.get_stock_prediction_history(db, symbol, limit=limit)
        return {
            "symbol": symbol.upper(),
            "total_records": len(history),
            "records": [
                {
                    "id": h.id,
                    "prediction_date": h.prediction_date.isoformat() if h.prediction_date else None,
                    "predicted_direction": h.prediction,
                    "up_probability": float(h.up_probability),
                    "down_probability": float(h.down_probability),
                    "neutral_probability": float(h.neutral_probability),
                    "expected_return_pct": float(h.expected_return or 0.0),
                    "confidence": h.confidence,
                    "model_version": h.model_version
                }
                for h in history
            ]
        }
    except Exception as e:
        return {
            "symbol": symbol.upper(),
            "total_records": 0,
            "records": [],
            "notice": f"Historical database audit notice: {str(e)}"
        }


@router.get("/{symbol}", summary="Get Machine Learning Directional Prediction for a Specific Stock")
async def get_single_stock_prediction(symbol: str, use_mock: bool = Query(False)):
    """
    Returns ML directional prediction (UP, DOWN, NEUTRAL), calibrated probabilities,
    expected return range, confidence rating, and primary drivers for a single stock.
    """
    sym_clean = symbol.upper()
    if sym_clean in ["JOB-STATUS", "JOB_STATUS", "STATUS"]:
        return get_scheduler_status()
    if sym_clean in ["TRIGGER-JOB", "TRIGGER_JOB"]:
        return await execute_premarket_prediction_job()

    stock_info = next(
        (s for s in TOP_INDIAN_STOCKS if s["symbol"] == sym_clean),
        {"symbol": sym_clean, "name": f"{sym_clean} Ltd.", "sector": "General"}
    )
    try:
        global_report = await get_global_market_features(use_mock=use_mock)
        return await predict_single_stock(stock_info, global_report, use_mock=use_mock)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stock prediction failed for {symbol}: {str(e)}")
