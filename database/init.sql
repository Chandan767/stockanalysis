-- Database Schema Initialization for Stock AI Platform

CREATE TABLE IF NOT EXISTS sectors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stocks (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    isin VARCHAR(20),
    exchange VARCHAR(10) NOT NULL DEFAULT 'NSE',
    sector_id INT REFERENCES sectors(id) ON DELETE SET NULL,
    industry VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stocks_symbol ON stocks(symbol);
CREATE INDEX idx_stocks_sector ON stocks(sector_id);

CREATE TABLE IF NOT EXISTS price_history (
    id BIGSERIAL PRIMARY KEY,
    stock_id INT REFERENCES stocks(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    open NUMERIC(12, 2) NOT NULL,
    high NUMERIC(12, 2) NOT NULL,
    low NUMERIC(12, 2) NOT NULL,
    close NUMERIC(12, 2) NOT NULL,
    adjusted_close NUMERIC(12, 2),
    volume BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_stock_date UNIQUE (stock_id, date)
);

CREATE INDEX idx_price_history_stock_date ON price_history(stock_id, date DESC);

CREATE TABLE IF NOT EXISTS fundamentals (
    id SERIAL PRIMARY KEY,
    stock_id INT REFERENCES stocks(id) ON DELETE CASCADE,
    period_date DATE NOT NULL,
    market_cap NUMERIC(18, 2),
    pe_ratio NUMERIC(8, 2),
    pb_ratio NUMERIC(8, 2),
    ev_to_ebitda NUMERIC(8, 2),
    peg_ratio NUMERIC(8, 2),
    roe NUMERIC(6, 2),
    roce NUMERIC(6, 2),
    debt_to_equity NUMERIC(6, 2),
    interest_coverage NUMERIC(8, 2),
    revenue_growth_yoy NUMERIC(6, 2),
    profit_growth_yoy NUMERIC(6, 2),
    eps_growth_yoy NUMERIC(6, 2),
    operating_margin NUMERIC(6, 2),
    net_margin NUMERIC(6, 2),
    free_cash_flow NUMERIC(18, 2),
    promoter_holding NUMERIC(5, 2),
    ii_holding NUMERIC(5, 2),
    dii_holding NUMERIC(5, 2),
    public_holding NUMERIC(5, 2),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_stock_fundamental_period UNIQUE (stock_id, period_date)
);

CREATE TABLE IF NOT EXISTS stock_scores (
    id SERIAL PRIMARY KEY,
    stock_id INT REFERENCES stocks(id) ON DELETE CASCADE,
    score_date DATE NOT NULL,
    today_opportunity_score NUMERIC(5, 2),
    technical_score NUMERIC(5, 2),
    momentum_score NUMERIC(5, 2),
    volume_score NUMERIC(5, 2),
    sector_score NUMERIC(5, 2),
    news_score NUMERIC(5, 2),
    long_term_quality_score NUMERIC(5, 2),
    fundamental_quality_score NUMERIC(5, 2),
    growth_score NUMERIC(5, 2),
    profitability_score NUMERIC(5, 2),
    balance_sheet_score NUMERIC(5, 2),
    cash_flow_score NUMERIC(5, 2),
    valuation_score NUMERIC(5, 2),
    bias VARCHAR(20), -- Bullish, Bearish, Neutral
    confidence VARCHAR(20), -- High, Medium, Low
    classification VARCHAR(50), -- Strong Candidate, Watchlist, Neutral, etc.
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_stock_score_date UNIQUE (stock_id, score_date)
);

CREATE INDEX idx_scores_today ON stock_scores(score_date, today_opportunity_score DESC);
CREATE INDEX idx_scores_long_term ON stock_scores(score_date, long_term_quality_score DESC);

CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    stock_id INT REFERENCES stocks(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    summary TEXT,
    url TEXT,
    source VARCHAR(100),
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    sentiment VARCHAR(20), -- Positive, Negative, Neutral
    sentiment_score NUMERIC(4, 3),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS watchlists (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(100) DEFAULT 'default_user',
    stock_id INT REFERENCES stocks(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_watchlist_stock UNIQUE (user_name, stock_id)
);

-- ============================================================================
-- DAILY STOCK DIRECTION PREDICTION ENGINE TABLES (PHASE 1)
-- ============================================================================

CREATE TABLE IF NOT EXISTS feature_snapshots (
    id SERIAL PRIMARY KEY,
    stock_id INT REFERENCES stocks(id) ON DELETE CASCADE,
    as_of_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    features_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feature_snapshots_stock_time ON feature_snapshots(stock_id, as_of_timestamp DESC);

CREATE TABLE IF NOT EXISTS daily_predictions (
    id SERIAL PRIMARY KEY,
    stock_id INT REFERENCES stocks(id) ON DELETE CASCADE,
    prediction_date DATE NOT NULL,
    prediction_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    prediction VARCHAR(10) NOT NULL, -- UP, DOWN, NEUTRAL
    up_probability NUMERIC(5, 4) NOT NULL,
    down_probability NUMERIC(5, 4) NOT NULL,
    neutral_probability NUMERIC(5, 4) NOT NULL,
    expected_return NUMERIC(6, 4),
    expected_return_low NUMERIC(6, 4),
    expected_return_high NUMERIC(6, 4),
    confidence VARCHAR(20) NOT NULL, -- High, Medium, Low
    market_regime VARCHAR(50),
    model_version VARCHAR(50) NOT NULL,
    feature_snapshot_id INT REFERENCES feature_snapshots(id) ON DELETE SET NULL,
    prediction_reason JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_stock_prediction_date UNIQUE (stock_id, prediction_date)
);

CREATE INDEX idx_daily_predictions_date ON daily_predictions(prediction_date, up_probability DESC);

CREATE TABLE IF NOT EXISTS prediction_evaluations (
    id SERIAL PRIMARY KEY,
    prediction_id INT UNIQUE REFERENCES daily_predictions(id) ON DELETE CASCADE,
    actual_date DATE NOT NULL,
    actual_open NUMERIC(12, 2),
    actual_close NUMERIC(12, 2),
    actual_return NUMERIC(8, 4),
    actual_direction VARCHAR(10), -- UP, DOWN, NEUTRAL
    prediction_correct BOOLEAN,
    prediction_error NUMERIC(8, 4),
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS global_market_data (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    region VARCHAR(30) NOT NULL, -- US, ASIA, EUROPE, INDIA, COMMODITIES, CURRENCIES
    date DATE NOT NULL,
    close NUMERIC(14, 4) NOT NULL,
    prev_close NUMERIC(14, 4),
    return_1d NUMERIC(8, 4),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_global_symbol_date UNIQUE (symbol, date)
);

CREATE TABLE IF NOT EXISTS macro_events (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    impact_rating VARCHAR(20),
    event_date DATE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

