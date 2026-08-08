import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_stocks_list_api():
    response = client.get("/api/v1/stocks")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert "stocks" in data


def test_stock_quote_api():
    response = client.get("/api/v1/stocks/TCS?use_mock=true")
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "TCS"
    assert data["price"] > 0


def test_research_today_api():
    response = client.get("/api/v1/research/today?use_mock=true")
    assert response.status_code == 200
    data = response.json()
    assert "scan_date" in data
    assert "bullish_candidates" in data


def test_research_long_term_api():
    response = client.get("/api/v1/research/long-term?use_mock=true")
    assert response.status_code == 200
    data = response.json()
    assert "scan_date" in data
    assert "all_ranked" in data


def test_individual_stock_research_api():
    response = client.get("/api/v1/research/RELIANCE?use_mock=true")
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "RELIANCE"
    assert "today_score" in data
    assert "long_term_score" in data
    assert "ai_summary" in data
    assert "strengths" in data["ai_summary"]


def test_market_overview_api():
    response = client.get("/api/v1/market/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Market Open"
    assert "indices" in data
    assert "NIFTY_50" in data["indices"]
