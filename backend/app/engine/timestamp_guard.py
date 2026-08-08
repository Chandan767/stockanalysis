from datetime import datetime, date, timezone
from typing import Dict, Any, List, Tuple
from app.core.config import settings


def classify_return_direction(return_val: float, up_threshold: float = None, down_threshold: float = None) -> str:
    """
    Classifies a percentage return into direction label (UP, DOWN, NEUTRAL).
    Configurable thresholds: UP > +0.5%, DOWN < -0.5%, NEUTRAL in between.
    """
    if up_threshold is None:
        up_threshold = settings.PREDICTION_UP_THRESHOLD
    if down_threshold is None:
        down_threshold = settings.PREDICTION_DOWN_THRESHOLD

    if return_val > up_threshold:
        return "UP"
    elif return_val < down_threshold:
        return "DOWN"
    else:
        return "NEUTRAL"


class TimestampGuard:
    """
    Strict Leakage Prevention System.
    Validates that features and news used for model inference were available
    prior to the prediction cutoff timestamp (e.g. 08:30 IST).
    """

    @staticmethod
    def is_timestamp_valid(source_ts: datetime, cutoff_ts: datetime) -> bool:
        """Returns True if source_ts is <= cutoff_ts."""
        if source_ts.tzinfo is None:
            source_ts = source_ts.replace(tzinfo=timezone.utc)
        if cutoff_ts.tzinfo is None:
            cutoff_ts = cutoff_ts.replace(tzinfo=timezone.utc)

        return source_ts <= cutoff_ts

    @classmethod
    def validate_features(cls, features: Dict[str, Any], cutoff_ts: datetime) -> Tuple[bool, List[str]]:
        """
        Validates feature dictionary for timestamp metadata.
        Rejects features if source_timestamp > cutoff_ts.
        """
        rejected = []
        for key, val in features.items():
            if isinstance(val, dict) and "source_timestamp" in val:
                src_ts = val["source_timestamp"]
                if isinstance(src_ts, str):
                    src_ts = datetime.fromisoformat(src_ts)
                if not cls.is_timestamp_valid(src_ts, cutoff_ts):
                    rejected.append(key)

        return (len(rejected) == 0, rejected)

    @classmethod
    def filter_news_for_prediction(cls, news_articles: List[Dict[str, Any]], cutoff_ts: datetime) -> List[Dict[str, Any]]:
        """Filters news items ensuring published_at <= cutoff_ts."""
        valid_news = []
        for item in news_articles:
            pub_at = item.get("published_at")
            if isinstance(pub_at, str):
                pub_at = datetime.fromisoformat(pub_at)
            
            if pub_at and cls.is_timestamp_valid(pub_at, cutoff_ts):
                valid_news.append(item)

        return valid_news
