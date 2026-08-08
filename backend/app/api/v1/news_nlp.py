from fastapi import APIRouter, HTTPException, Query
from app.data.factory import get_news_data_provider
from app.services.news_nlp_engine import compute_aggregate_company_news_features

router = APIRouter(prefix="/news", tags=["News Ingestion & NLP Engine"])


@router.get("/{symbol}/nlp", summary="Get Deduplicated & Structured News NLP Features for a Stock")
async def get_stock_news_nlp(symbol: str, limit: int = Query(10, ge=1, le=50)):
    """
    Phase 3 Structured News NLP Engine:
    Deduplicates multi-source news articles, extracts structured NLP attributes
    (sentiment, relevance, novelty, importance, event type), and calculates
    time-decayed 1h, 6h, 24h rolling news sentiment signals and article counts.
    """
    news_provider = get_news_data_provider()
    try:
        raw_news = await news_provider.get_recent_news(symbol, limit=limit)
        return compute_aggregate_company_news_features(symbol, raw_news)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed processing news NLP for {symbol}: {str(e)}")
