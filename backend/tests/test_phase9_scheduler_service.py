import pytest
from app.services.scheduler_service import (
    start_prediction_scheduler,
    get_scheduler_status,
    execute_premarket_prediction_job
)


def test_scheduler_status_and_startup():
    start_prediction_scheduler()
    status = get_scheduler_status()

    assert status["is_running"] is True
    assert status["next_run_timestamp"] == "08:30 AM IST (Daily)"


@pytest.mark.asyncio
async def test_execute_premarket_prediction_job():
    res = await execute_premarket_prediction_job()

    assert res["status"] in ["success", "error"]
    if res["status"] == "success":
        assert res["total_stocks_evaluated"] > 0
