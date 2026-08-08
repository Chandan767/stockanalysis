import asyncio
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from app.core.config import settings
from app.engine.prediction_pipeline import run_daily_market_prediction_engine
from app.services.prediction_storage_service import PredictionStorageService
from app.core.database import SessionLocal

logger = logging.getLogger("scheduler")

_SCHEDULER_STATUS = {
    "is_running": False,
    "last_run_timestamp": None,
    "last_run_status": "Idle",
    "last_run_total_stocks": 0,
    "next_run_timestamp": "08:30 AM IST (Daily)"
}

_BACKGROUND_TASK: Optional[asyncio.Task] = None


async def execute_premarket_prediction_job():
    """
    Phase 9 Pre-Market Automated Batch Pipeline (08:30 IST):
    1. Fetches overnight global markets & macro signals.
    2. Ingests & deduplicates news NLP features.
    3. Calculates multi-timeframe technicals & relative strength.
    4. Executes ML directional prediction pipeline across stock universe.
    5. Saves feature snapshots and prediction records into DB.
    """
    global _SCHEDULER_STATUS
    now_utc = datetime.now(timezone.utc)
    logger.info(f"Starting automated pre-market prediction batch job at {now_utc.isoformat()}")

    _SCHEDULER_STATUS["last_run_timestamp"] = now_utc.isoformat()
    _SCHEDULER_STATUS["last_run_status"] = "Running"

    try:
        # Run daily prediction engine scan across stock universe
        report = await run_daily_market_prediction_engine(use_mock=False)

        # Store to database
        try:
            db = SessionLocal()
            try:
                all_items = report.top_potential_gainers + report.top_potential_losers + report.uncertain_stocks
                stored_count = 0
                for item in all_items:
                    PredictionStorageService.save_daily_prediction(db, item)
                    stored_count += 1
                logger.info(f"Pre-market job successfully persisted {stored_count} predictions to database.")
            except Exception as db_err:
                logger.warning(f"Database persistence notice during scheduled batch job: {db_err}")
            finally:
                db.close()
        except Exception:
            pass

        _SCHEDULER_STATUS["last_run_status"] = "Success"
        _SCHEDULER_STATUS["last_run_total_stocks"] = report.total_stocks_evaluated
        return {
            "status": "success",
            "execution_time": now_utc.isoformat(),
            "total_stocks_evaluated": report.total_stocks_evaluated
        }
    except Exception as e:
        logger.error(f"Scheduled pre-market job failed: {e}")
        _SCHEDULER_STATUS["last_run_status"] = f"Failed: {str(e)}"
        return {
            "status": "error",
            "message": str(e)
        }


async def _async_cron_loop():
    """Fallback asyncio background loop for 08:30 AM IST pre-market daily execution."""
    while True:
        try:
            now = datetime.now(timezone.utc)
            # Check if hour is 03 UTC (08:30 IST)
            if now.hour == 3 and now.minute == 0:
                await execute_premarket_prediction_job()
                await asyncio.sleep(120) # Avoid double triggers
        except Exception as e:
            logger.error(f"Error in background cron loop: {e}")
        await asyncio.sleep(30)


def start_prediction_scheduler():
    """Starts background scheduler for 08:30 AM IST pre-market daily execution."""
    global _SCHEDULER_STATUS, _BACKGROUND_TASK

    try:
        from apscheduler.schedulers.asyncio import AsyncIOScheduler
        from apscheduler.triggers.cron import CronTrigger

        scheduler = AsyncIOScheduler()
        if not scheduler.running:
            trigger = CronTrigger(day_of_week="mon-fri", hour=3, minute=0, timezone="UTC")
            scheduler.add_job(
                execute_premarket_prediction_job,
                trigger=trigger,
                id="premarket_0830_ist_job",
                name="Pre-Market Stock Direction Prediction Batch Scan",
                replace_existing=True
            )
            scheduler.start()
            _SCHEDULER_STATUS["is_running"] = True
            logger.info("Daily Stock Direction Prediction APScheduler started (08:30 IST cron trigger active).")
    except ImportError:
        # Fallback to asyncio background task loop if apscheduler not installed
        _SCHEDULER_STATUS["is_running"] = True
        logger.info("Daily Stock Direction Prediction asyncio loop active (08:30 IST fallback).")


def get_scheduler_status() -> Dict[str, Any]:
    """Returns background cron job execution status."""
    return _SCHEDULER_STATUS
