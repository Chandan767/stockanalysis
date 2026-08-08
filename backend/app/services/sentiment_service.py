import re
from typing import Dict, Any, Tuple


FINANCIAL_POSITIVE_KEYWORDS = [
    "growth", "surge", "profit", "bullish", "expansion", "beat", "outperform",
    "rally", "record", "dividend", "revenue increase", "strong q1", "strong q2",
    "strong q3", "strong q4", "upgrade", "order win", "high margin", "buying"
]

FINANCIAL_NEGATIVE_KEYWORDS = [
    "drop", "fall", "decline", "bearish", "loss", "downgrade", "slash",
    "plunge", "miss", "probe", "investigation", "debt default", "margin compression",
    "layoff", "lawsuit", "penalty", "weakness", "selling pressure"
]


def analyze_news_sentiment(title: str, summary: str = "") -> Tuple[str, float, str]:
    """
    Analyzes financial news headline & text.
    Returns: (sentiment: str, sentiment_score: float, reason: str)
    """
    text = f"{title} {summary}".lower()

    pos_hits = [kw for kw in FINANCIAL_POSITIVE_KEYWORDS if kw in text]
    neg_hits = [kw for kw in FINANCIAL_NEGATIVE_KEYWORDS if kw in text]

    pos_count = len(pos_hits)
    neg_count = len(neg_hits)

    total = pos_count + neg_count
    if total == 0:
        return "Neutral", 0.0, "No strong bullish or bearish keywords detected in article text."

    score = round((pos_count - neg_count) / float(total), 2)

    if score >= 0.2:
        reason = f"Bullish sentiment driven by positive drivers: {', '.join(pos_hits[:3])}."
        return "Positive", score, reason
    elif score <= -0.2:
        reason = f"Bearish sentiment impacted by adverse factors: {', '.join(neg_hits[:3])}."
        return "Negative", score, reason
    else:
        reason = f"Mixed sentiment balancing positive ({', '.join(pos_hits[:2])}) and negative ({', '.join(neg_hits[:2])}) signals."
        return "Neutral", score, reason
