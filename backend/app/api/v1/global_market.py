from fastapi import APIRouter, HTTPException, Query
from app.services.global_market_service import get_global_market_features

router = APIRouter(prefix="/market", tags=["Global Market & Macro Features"])


@router.get("/global", summary="Fetch Global Markets, Macro Features & Inter-Market Signals")
async def fetch_global_markets(use_mock: bool = Query(False)):
    """
    Phase 2 Global Market Feature Service:
    Returns S&P 500, Nasdaq, Dow, Nikkei, Hang Seng, FTSE, DAX, India VIX, Brent Crude, USD/INR,
    and sector inter-market signals (IT, Energy, FII Yield impact).
    """
    try:
        return await get_global_market_features(use_mock=use_mock)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed fetching global market features: {str(e)}")
