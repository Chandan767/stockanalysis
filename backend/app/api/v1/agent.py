from fastapi import APIRouter, HTTPException, Query
from app.agents.agent_engine import run_autonomous_agent_analysis

router = APIRouter(prefix="/agent", tags=["AI Autonomous Research Agent"])


@router.get("/analyze", summary="Run Autonomous AI Agent Analysis across 5-year histories")
@router.post("/analyze", summary="Trigger Autonomous AI Agent Analysis")
async def trigger_agent_analysis(use_mock: bool = Query(False)):
    """
    Executes Autonomous AI Agent scanning 5-year price histories, 5Y CAGR trajectories,
    multi-year drawdowns, web news sentiment, and quantitative probability scoring.
    Classifies equities into High-Probability Profit Setups vs High-Risk Loss Candidates.
    """
    try:
        return await run_autonomous_agent_analysis(use_mock=use_mock)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent analysis failed: {str(e)}")
