import pytest
from datetime import datetime, timezone, timedelta
from app.data.base import NewsArticle
from app.services.news_nlp_engine import (
    deduplicate_news_articles,
    classify_event_type,
    calculate_article_importance,
    compute_aggregate_company_news_features
)


def test_news_deduplication():
    now_ts = datetime.now(timezone.utc)
    articles = [
        NewsArticle(
            symbol="TCS",
            title="Tata Consultancy Services reports strong Q1 financial results with 14% net profit growth",
            summary="TCS Q1 results show strong digital revenue expansion.",
            url="http://news1.com",
            source="Economic Times",
            published_at=now_ts
        ),
        NewsArticle(
            symbol="TCS",
            title="Tata Consultancy Services reports strong Q1 financial results with 14% net profit growth!",
            summary="Duplicated wire release from moneycontrol.",
            url="http://news2.com",
            source="Moneycontrol",
            published_at=now_ts - timedelta(minutes=15)
        ),
        NewsArticle(
            symbol="TCS",
            title="RBI issues new digital banking framework for Indian IT service providers",
            summary="Unrelated regulatory announcement.",
            url="http://news3.com",
            source="Livemint",
            published_at=now_ts - timedelta(hours=2)
        )
    ]

    deduped = deduplicate_news_articles(articles)
    assert len(deduped) == 2 # 1 duplicate removed!


def test_event_classification_and_importance():
    title_earnings = "TCS Q1 Net Profit rises 14% YoY to Rs 12,000 Crore"
    title_acq = "Infosys acquires European AI cloud consultancy firm for $150 Million"
    
    assert classify_event_type(title_earnings) == "Earnings"
    assert classify_event_type(title_acq) == "Acquisition"

    imp_earnings = calculate_article_importance(title_earnings, event_type="Earnings")
    assert imp_earnings >= 0.85 # High importance due to numbers & earnings event


def test_aggregate_news_features():
    now_ts = datetime.now(timezone.utc)
    raw = [
        NewsArticle(
            symbol="INFY",
            title="Infosys announces strategic cloud partnership with Google Cloud",
            summary="Bullish expansion.",
            url="http://news1.com",
            source="Reuters",
            published_at=now_ts - timedelta(minutes=30)
        )
    ]

    agg = compute_aggregate_company_news_features("INFY", raw, as_of_time=now_ts)
    assert agg.symbol == "INFY"
    assert agg.news_count_1h == 1
    assert agg.news_count_24h == 1
    assert len(agg.processed_articles) == 1
    assert agg.processed_articles[0].sentiment in ["Positive", "Negative", "Neutral"]
