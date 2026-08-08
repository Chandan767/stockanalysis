import re
import math
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel

from app.data.base import NewsArticle
from app.services.sentiment_service import analyze_news_sentiment

# Keyword event patterns
EVENT_PATTERNS = {
    "Earnings": [r"q[1-4]", r"earnings", r"profit", r"revenue", r"quarterly", r"pat", r"ebitda", r"financial results"],
    "Acquisition": [r"acquire", r"acquisition", r"merger", r"buyout", r"takeover", r"stake", r"deal"],
    "Regulation": [r"rbi", r"sebi", r"penalty", r"regulation", r"governance", r"policy", r"tax", r"tariff"],
    "Management": [r"ceo", r"cfo", r"board", r"resigns", r"appointed", r"director", r"management"],
    "Guidance": [r"guidance", r"forecast", r"target", r"outlook", r"projection"],
    "Upgrade": [r"upgrade", r"bullish", r"buy rating", r"outperform", r"target price raised"],
    "Downgrade": [r"downgrade", r"bearish", r"sell rating", r"underperform", r"target price cut"],
    "Legal": [r"court", r"lawsuit", r"litigation", r"notice", r"investigation", r"fraud"],
    "Geopolitical": [r"war", r"sanction", r"tariff", r"oil shock", r"trade war", r"election"],
}


class ProcessedNLPArticle(BaseModel):
    title: str
    summary: Optional[str]
    url: Optional[str]
    source: str
    published_at: str
    symbol: str
    sentiment: str # Positive, Negative, Neutral
    sentiment_score: float # -1.0 to +1.0
    relevance_score: float # 0.0 to 1.0
    novelty_score: float # 0.0 to 1.0
    importance_score: float # 0.0 to 1.0
    event_type: str


class AggregateCompanyNewsFeatures(BaseModel):
    symbol: str
    as_of_timestamp: str
    news_sentiment_1h: float
    news_sentiment_6h: float
    news_sentiment_24h: float
    news_count_1h: int
    news_count_6h: int
    news_count_24h: int
    positive_news_count: int
    negative_news_count: int
    neutral_news_count: int
    weighted_news_score: float # -1.0 to +1.0
    top_event_types: List[str]
    processed_articles: List[ProcessedNLPArticle]


def normalize_text(text: str) -> str:
    """Removes non-alphanumeric characters and converts to lowercase for deduplication."""
    return re.sub(r"[^\w\s]", "", text.lower()).strip()


def calculate_jaccard_similarity(text1: str, text2: str) -> float:
    """Calculates token-based Jaccard similarity between two headlines."""
    tokens1 = set(normalize_text(text1).split())
    tokens2 = set(normalize_text(text2).split())
    if not tokens1 or not tokens2:
        return 0.0
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    return len(intersection) / len(union)


def deduplicate_news_articles(articles: List[NewsArticle], similarity_threshold: float = 0.65) -> List[NewsArticle]:
    """
    Deduplicates news articles from multiple sources reporting on the same event.
    Keeps the earliest/most descriptive article.
    """
    unique_articles: List[NewsArticle] = []

    for item in sorted(articles, key=lambda x: x.published_at, reverse=True):
        is_duplicate = False
        for existing in unique_articles:
            sim = calculate_jaccard_similarity(item.title, existing.title)
            # If headlines are > 65% similar and published within 12 hours, treat as duplicate
            time_diff = abs((item.published_at - existing.published_at).total_seconds())
            if sim >= similarity_threshold and time_diff <= 43200:
                is_duplicate = True
                break
        
        if not is_duplicate:
            unique_articles.append(item)

    return unique_articles


def classify_event_type(title: str, summary: str = "") -> str:
    """Classifies news article into structured financial event categories."""
    full_text = f"{title} {summary}".lower()
    for event, patterns in EVENT_PATTERNS.items():
        for pat in patterns:
            if re.search(pat, full_text):
                return event
    return "Corporate News"


def calculate_article_importance(title: str, summary: str = "", event_type: str = "Corporate News") -> float:
    """Calculates importance rating (0.0 to 1.0) based on event gravity."""
    high_impact_events = {"Earnings": 0.90, "Acquisition": 0.85, "Guidance": 0.85, "Regulation": 0.80, "Legal": 0.75}
    med_impact_events = {"Upgrade": 0.70, "Downgrade": 0.70, "Management": 0.65, "Geopolitical": 0.65}
    
    base_importance = high_impact_events.get(event_type, med_impact_events.get(event_type, 0.50))
    
    # Increase importance if numbers/percentages are mentioned in headline
    if re.search(r"\d+(\.\d+)?%", title):
        base_importance = min(1.0, base_importance + 0.10)
        
    return round(base_importance, 2)


def process_article_nlp(article: NewsArticle, symbol: str) -> ProcessedNLPArticle:
    """Extracts structured NLP features (sentiment, relevance, novelty, importance, event type) per article."""
    sent_label, raw_sent_score, reason = analyze_news_sentiment(article.title, article.summary or "")

    # Convert sentiment label/score to continuous scale -1.0 to +1.0
    if sent_label == "Positive":
        sent_scale = min(1.0, max(0.2, raw_sent_score / 100.0 if raw_sent_score > 1.0 else raw_sent_score))
    elif sent_label == "Negative":
        sent_scale = max(-1.0, min(-0.2, -(raw_sent_score / 100.0) if raw_sent_score > 1.0 else -raw_sent_score))
    else:
        sent_scale = 0.0

    # Relevance score based on ticker/name presence
    rel_score = 1.0 if symbol.lower() in article.title.lower() else 0.75

    event_type = classify_event_type(article.title, article.summary or "")
    importance = calculate_article_importance(article.title, article.summary or "", event_type)

    return ProcessedNLPArticle(
        title=article.title,
        summary=article.summary,
        url=article.url,
        source=article.source or "Financial Media",
        published_at=article.published_at.isoformat(),
        symbol=symbol.upper(),
        sentiment=sent_label,
        sentiment_score=round(sent_scale, 2),
        relevance_score=rel_score,
        novelty_score=1.0, # Freshly ingested
        importance_score=importance,
        event_type=event_type
    )


def compute_aggregate_company_news_features(
    symbol: str,
    raw_articles: List[NewsArticle],
    as_of_time: Optional[datetime] = None
) -> AggregateCompanyNewsFeatures:
    """
    Phase 3 News NLP Pipeline:
    1. Deduplicates multi-source articles.
    2. Runs NLP feature extraction.
    3. Calculates 1h, 6h, 24h rolling time-decayed sentiment signals & article counts.
    """
    if as_of_time is None:
        as_of_time = datetime.now(timezone.utc)
    if as_of_time.tzinfo is None:
        as_of_time = as_of_time.replace(tzinfo=timezone.utc)

    # 1. Deduplicate
    unique = deduplicate_news_articles(raw_articles)

    # 2. NLP Processing
    processed = [process_article_nlp(art, symbol) for art in unique]

    # 3. Rolling Multi-Window Calculations
    count_1h, count_6h, count_24h = 0, 0, 0
    scores_1h, scores_6h, scores_24h = [], [], []
    pos_c, neg_c, neu_c = 0, 0, 0
    weighted_scores = []
    events = set()

    for item, raw in zip(processed, unique):
        pub_ts = raw.published_at
        if pub_ts.tzinfo is None:
            pub_ts = pub_ts.replace(tzinfo=timezone.utc)

        age_hours = (as_of_time - pub_ts).total_seconds() / 3600.0
        
        # Count sentiment labels
        if item.sentiment == "Positive":
            pos_c += 1
        elif item.sentiment == "Negative":
            neg_c += 1
        else:
            neu_c += 1

        events.add(item.event_type)

        # Time decay weight: exponential decay half-life of 12 hours
        decay_weight = math.exp(-0.0577 * max(0.0, age_hours))
        combined_weight = decay_weight * item.relevance_score * item.importance_score
        weighted_scores.append(item.sentiment_score * combined_weight)

        if age_hours <= 1.0:
            count_1h += 1
            scores_1h.append(item.sentiment_score)
        if age_hours <= 6.0:
            count_6h += 1
            scores_6h.append(item.sentiment_score)
        if age_hours <= 24.0:
            count_24h += 1
            scores_24h.append(item.sentiment_score)

    avg_1h = round(sum(scores_1h) / len(scores_1h), 2) if scores_1h else 0.0
    avg_6h = round(sum(scores_6h) / len(scores_6h), 2) if scores_6h else 0.0
    avg_24h = round(sum(scores_24h) / len(scores_24h), 2) if scores_24h else 0.0

    weighted_aggregate = round(sum(weighted_scores) / len(weighted_scores), 2) if weighted_scores else 0.0

    return AggregateCompanyNewsFeatures(
        symbol=symbol.upper(),
        as_of_timestamp=as_of_time.isoformat(),
        news_sentiment_1h=avg_1h,
        news_sentiment_6h=avg_6h,
        news_sentiment_24h=avg_24h,
        news_count_1h=count_1h,
        news_count_6h=count_6h,
        news_count_24h=count_24h,
        positive_news_count=pos_c,
        negative_news_count=neg_c,
        neutral_news_count=neu_c,
        weighted_news_score=weighted_aggregate,
        top_event_types=list(events)[:5],
        processed_articles=processed
    )
