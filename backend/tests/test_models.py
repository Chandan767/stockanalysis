import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.models import Stock, Sector, PriceHistory, Fundamental, StockScore, News, Watchlist
from datetime import date, datetime, timezone

# Setup SQLite in-memory database for testing models
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


def test_create_stock_and_sector(db_session):
    sector = Sector(name="Information Technology", description="IT Services and Software")
    db_session.add(sector)
    db_session.commit()
    db_session.refresh(sector)

    stock = Stock(
        symbol="TCS",
        name="Tata Consultancy Services Ltd.",
        exchange="NSE",
        sector_id=sector.id,
        industry="IT Services"
    )
    db_session.add(stock)
    db_session.commit()
    db_session.refresh(stock)

    assert stock.id is not None
    assert stock.symbol == "TCS"
    assert stock.sector.name == "Information Technology"


def test_price_history_and_scores(db_session):
    stock = Stock(symbol="RELIANCE", name="Reliance Industries Ltd.", exchange="NSE")
    db_session.add(stock)
    db_session.commit()
    db_session.refresh(stock)

    price = PriceHistory(
        stock_id=stock.id,
        date=date(2026, 8, 1),
        open=2950.00,
        high=3010.00,
        low=2940.00,
        close=2995.50,
        volume=5000000
    )
    score = StockScore(
        stock_id=stock.id,
        score_date=date(2026, 8, 1),
        today_opportunity_score=84.5,
        technical_score=88.0,
        bias="Bullish",
        confidence="Medium"
    )
    db_session.add_all([price, score])
    db_session.commit()

    assert len(stock.price_history) == 1
    assert stock.price_history[0].close == 2995.50
    assert stock.scores[0].today_opportunity_score == 84.5
