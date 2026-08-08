from fastapi import APIRouter, HTTPException, Query
from app.services.research_service import (
    scan_today_market,
    scan_long_term_market,
    get_full_stock_report
)

router = APIRouter(prefix="/research", tags=["Research Engine"])


@router.get("/today", summary="Today's Market Research Scanner")
async def research_today(use_mock: bool = Query(False)):
    """
    Scans Indian market equities to calculate Today's Opportunity Score,
    identifying bullish setups, momentum leaders, volume surges, and breakout candidates.
    """
    try:
        return await scan_today_market(use_mock=use_mock)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Today market scan failed: {str(e)}")


@router.get("/long-term", summary="Long-Term Stock Research Scanner")
async def research_long_term(use_mock: bool = Query(False)):
    """
    Scans equities to produce Long-Term Quality Scores based on growth,
    profitability (ROE/ROCE), debt ratios, cash flow, and valuation metrics.
    """
    try:
        return await scan_long_term_market(use_mock=use_mock)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Long-term market scan failed: {str(e)}")


@router.get("/{symbol}", summary="Complete Individual Stock Research Report")
async def research_stock(symbol: str, use_mock: bool = Query(False)):
    """
    Generates full individual stock research report containing Price, Technical Analysis,
    Fundamental Ratios, News Sentiment Analysis, and AI Structured Summary.
    """
    try:
        return await get_full_stock_report(symbol, use_mock=use_mock)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Research report generation failed for {symbol}: {str(e)}")
