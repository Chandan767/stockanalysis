from fastapi import APIRouter, HTTPException, Query
from app.services.technical_sector_feature_service import generate_stock_feature_set

router = APIRouter(prefix="/stocks", tags=["Multi-Timeframe Features"])


@router.get("/{symbol}/features", summary="Get Multi-Timeframe Technical, Volatility & Sector Relative Features for a Stock")
async def get_stock_features(symbol: str, sector: str = Query("General"), use_mock: bool = Query(False)):
    """
    Phase 4 Multi-Timeframe Feature Pipeline:
    Calculates 1D, 3D, 5D, 10D, 20D returns, moving averages (SMA/EMA), RSI, MACD, ATR, ADX, OBV,
    rolling 20D volatility, distance to 52-week High/Low, and relative strength vs NIFTY 50 & Beta.
    """
    try:
        return await generate_stock_feature_set(symbol, sector=sector, use_mock=use_mock)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed generating features for {symbol}: {str(e)}")
