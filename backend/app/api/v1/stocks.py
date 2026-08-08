from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import date, timedelta

from app.services.research_service import TOP_INDIAN_STOCKS
from app.data.factory import get_market_data_provider

router = APIRouter(prefix="/stocks", tags=["Stocks Master"])


@router.get("", summary="List all supported Indian stocks")
async def list_stocks():
    return {
        "market": "NSE/BSE (India)",
        "total": len(TOP_INDIAN_STOCKS),
        "stocks": TOP_INDIAN_STOCKS
    }


@router.get("/{symbol}", summary="Get current price quote for a stock")
async def get_stock_quote(symbol: str, use_mock: bool = Query(False)):
    provider = get_market_data_provider(use_mock=use_mock)
    try:
        quote = await provider.get_quote(symbol)
        return quote
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Stock quote failed for {symbol}: {str(e)}")


@router.get("/{symbol}/history", summary="Get historical price series")
async def get_stock_history(
    symbol: str,
    days: int = Query(90, ge=5, le=365),
    use_mock: bool = Query(False)
):
    provider = get_market_data_provider(use_mock=use_mock)
    end_d = date.today()
    start_d = end_d - timedelta(days=days)
    try:
        history = await provider.get_historical_prices(symbol, start_d, end_d)
        return {
            "symbol": symbol.upper(),
            "count": len(history),
            "history": history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed fetching history: {str(e)}")
