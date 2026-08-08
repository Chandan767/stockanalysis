from pydantic import BaseModel
from typing import Optional
from app.data.base import CompanyFundamentalData
from app.core.config import settings


class LongTermScoreResult(BaseModel):
    symbol: str
    fundamental_quality_score: float
    growth_score: float
    profitability_score: float
    balance_sheet_score: float
    cash_flow_score: float
    valuation_score: float
    management_score: float
    long_term_score: float
    classification: str
    # Classifications: Strong Long-Term Candidate, Watchlist Candidate, Neutral, High Risk, Weak Fundamentals


def calculate_long_term_quality_score(
    fundamentals: CompanyFundamentalData
) -> LongTermScoreResult:
    """Calculates Long-Term Quality Score based on fundamentals, growth, profitability, and valuation."""

    # 1. Growth Score (Revenue & Profit Growth YoY)
    growth_base = 50.0
    rev_g = fundamentals.revenue_growth_yoy or 0.0
    prof_g = fundamentals.profit_growth_yoy or 0.0

    if rev_g > 15.0:
        growth_base += 25.0
    elif rev_g > 8.0:
        growth_base += 15.0

    if prof_g > 15.0:
        growth_base += 25.0
    elif prof_g > 8.0:
        growth_base += 15.0

    growth_score = min(100.0, max(0.0, growth_base))

    # 2. Profitability Score (ROE & ROCE)
    prof_base = 40.0
    roe = fundamentals.roe or 0.0
    roce = fundamentals.roce or 0.0

    if roe >= 25.0:
        prof_base += 30.0
    elif roe >= 15.0:
        prof_base += 20.0

    if roce >= 25.0:
        prof_base += 30.0
    elif roce >= 15.0:
        prof_base += 20.0

    profitability_score = min(100.0, max(0.0, prof_base))

    # 3. Balance Sheet Score (Debt/Equity & Interest Coverage)
    bs_base = 50.0
    de = fundamentals.debt_to_equity
    if de is not None:
        if de <= 0.1: # Practically debt-free
            bs_base += 50.0
        elif de <= 0.5:
            bs_base += 30.0
        elif de <= 1.0:
            bs_base += 10.0
        else:
            bs_base -= 20.0

    balance_sheet_score = min(100.0, max(0.0, bs_base))

    # 4. Cash Flow Score (Free Cash Flow positivity)
    cf_base = 60.0
    fcf = fundamentals.free_cash_flow
    if fcf and fcf > 0:
        cf_base += 35.0
    elif fcf and fcf < 0:
        cf_base -= 25.0

    cash_flow_score = min(100.0, max(0.0, cf_base))

    # 5. Valuation Score (P/E & P/B relative baseline)
    val_base = 60.0
    pe = fundamentals.pe_ratio
    if pe:
        if 10.0 <= pe <= 25.0:
            val_base += 30.0
        elif pe < 10.0:
            val_base += 40.0 # Potentially undervalued or value trap
        elif pe > 50.0:
            val_base -= 20.0

    valuation_score = min(100.0, max(0.0, val_base))

    # 6. Management / Ownership Score (Promoter & Institutional Holding)
    mgmt_base = 60.0
    promoter = fundamentals.promoter_holding
    ii = fundamentals.ii_holding
    if promoter and promoter >= 50.0:
        mgmt_base += 25.0
    if ii and ii >= 20.0:
        mgmt_base += 15.0

    management_score = min(100.0, max(0.0, mgmt_base))

    # Fundamental Quality Composite
    fundamental_quality = (profitability_score + balance_sheet_score + cash_flow_score) / 3.0

    # 7. Total Weighted Calculation
    total_score = (
        fundamental_quality * settings.WEIGHT_LT_FUNDAMENTAL +
        growth_score * settings.WEIGHT_LT_GROWTH +
        profitability_score * settings.WEIGHT_LT_PROFITABILITY +
        balance_sheet_score * settings.WEIGHT_LT_BALANCE_SHEET +
        cash_flow_score * settings.WEIGHT_LT_CASH_FLOW +
        valuation_score * settings.WEIGHT_LT_VALUATION +
        management_score * settings.WEIGHT_LT_MANAGEMENT
    )
    final_score = round(total_score, 1)

    # Determine Classification
    if final_score >= 80.0:
        classification = "Strong Long-Term Candidate"
    elif final_score >= 68.0:
        classification = "Watchlist Candidate"
    elif final_score >= 50.0:
        classification = "Neutral"
    elif final_score >= 35.0:
        classification = "High Risk"
    else:
        classification = "Weak Fundamentals"

    return LongTermScoreResult(
        symbol=fundamentals.symbol.upper(),
        fundamental_quality_score=round(fundamental_quality, 1),
        growth_score=round(growth_score, 1),
        profitability_score=round(profitability_score, 1),
        balance_sheet_score=round(balance_sheet_score, 1),
        cash_flow_score=round(cash_flow_score, 1),
        valuation_score=round(valuation_score, 1),
        management_score=round(management_score, 1),
        long_term_score=final_score,
        classification=classification
    )
