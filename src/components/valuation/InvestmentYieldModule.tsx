import React, { useState, useMemo } from 'react';
import { PropertyData, ValuationOutput } from '../../types/property';
import { formatINR } from '../../utils/valuationEngine';
import {
  TrendingUp,
  Percent,
  DollarSign,
  Scale,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  HelpCircle,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  PieChart,
  Calendar,
  Building,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface InvestmentYieldModuleProps {
  propertyData: PropertyData;
  valuation: ValuationOutput;
}

export const InvestmentYieldModule: React.FC<InvestmentYieldModuleProps> = ({
  propertyData,
  valuation,
}) => {
  const isCommercial = propertyData.propertyCategory === 'commercial';
  const assetValue = valuation.fairMarketValue;
  const builtArea = isCommercial
    ? propertyData.builtUpArea || propertyData.carpetArea || 2000
    : propertyData.superBuiltUpArea || (propertyData.carpetArea ? propertyData.carpetArea * 1.25 : 1200);

  // Initial defaults
  const defaultMonthlyRent = propertyData.monthlyRent || Math.round((assetValue * (isCommercial ? 0.075 : 0.038)) / 12);
  const defaultPropertyTaxAnnual = Math.round(assetValue * (isCommercial ? 0.005 : 0.0035));
  const defaultMaintenanceMonthly = Math.round(builtArea * (isCommercial ? 7.0 : 3.0));

  // User Adjustable Financing & Operating State
  const [ltvPct, setLtvPct] = useState<number>(75); // 75% LTV default
  const [interestRatePct, setInterestRatePct] = useState<number>(8.5); // 8.5% p.a.
  const [tenureYears, setTenureYears] = useState<number>(20); // 20 years
  const [monthlyRentInput, setMonthlyRentInput] = useState<number>(defaultMonthlyRent);
  const [propertyTaxAnnual, setPropertyTaxAnnual] = useState<number>(defaultPropertyTaxAnnual);
  const [maintenanceMonthly, setMaintenanceMonthly] = useState<number>(defaultMaintenanceMonthly);
  const [vacancyRatePct, setVacancyRatePct] = useState<number>(isCommercial ? 8 : 5); // 5-8% vacancy
  const [insuranceAnnual, setInsuranceAnnual] = useState<number>(Math.round(assetValue * 0.0008)); // 0.08%
  const [activeViewMode, setActiveViewMode] = useState<'monthly' | 'annual'>('annual');
  const [showSensitivity, setShowSensitivity] = useState<boolean>(false);

  // Derived Calculations
  const calculations = useMemo(() => {
    // 1. Financing
    const loanAmount = Math.round((assetValue * ltvPct) / 100);
    const downPayment = assetValue - loanAmount;

    // Stamp duty and registration from valuation
    const stampDuty = valuation.estimatedStampDuty || Math.round(assetValue * 0.06);
    const registrationFee = valuation.estimatedRegistrationFee || Math.round(assetValue * 0.01);
    const loanProcessingFee = Math.round(loanAmount * 0.005); // 0.5%
    const totalInitialCashInvested = downPayment + stampDuty + registrationFee + loanProcessingFee;

    // Monthly EMI Calculation
    // EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
    let monthlyEmi = 0;
    if (loanAmount > 0 && interestRatePct > 0) {
      const monthlyRate = interestRatePct / 12 / 100;
      const totalMonths = tenureYears * 12;
      monthlyEmi = Math.round(
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
          (Math.pow(1 + monthlyRate, totalMonths) - 1)
      );
    }
    const annualDebtService = monthlyEmi * 12;

    // Year 1 Interest vs Principal (Approximate)
    const year1Interest = Math.round(loanAmount * (interestRatePct / 100));
    const year1Principal = Math.max(0, annualDebtService - year1Interest);

    // 2. Revenue & Operating Expenses
    const grossPotentialAnnualRent = monthlyRentInput * 12;
    const vacancyAllowanceAnnual = Math.round((grossPotentialAnnualRent * vacancyRatePct) / 100);
    const effectiveGrossIncome = grossPotentialAnnualRent - vacancyAllowanceAnnual;

    const maintenanceAnnual = maintenanceMonthly * 12;
    const totalOperatingExpenses = propertyTaxAnnual + maintenanceAnnual + insuranceAnnual;
    const netOperatingIncome = effectiveGrossIncome - totalOperatingExpenses;

    // 3. Pre-Tax Cash Flow
    const annualPreTaxCashFlow = netOperatingIncome - annualDebtService;
    const monthlyPreTaxCashFlow = Math.round(annualPreTaxCashFlow / 12);

    // 4. Cash-on-Cash Return (%)
    // CoC = (Annual Pre-Tax Cash Flow / Total Initial Cash Invested) * 100
    const cashOnCashReturnPct =
      totalInitialCashInvested > 0
        ? Number(((annualPreTaxCashFlow / totalInitialCashInvested) * 100).toFixed(2))
        : 0;

    // Total Return with Principal Paydown
    const totalYear1ReturnPct =
      totalInitialCashInvested > 0
        ? Number((((annualPreTaxCashFlow + year1Principal) / totalInitialCashInvested) * 100).toFixed(2))
        : 0;

    // 5. Break-Even Calculations
    // a. Break-Even Occupancy Rate (%) = (Annual Debt Service + Operating Expenses) / Gross Potential Annual Rent * 100
    const breakEvenOccupancyPct =
      grossPotentialAnnualRent > 0
        ? Number((((annualDebtService + totalOperatingExpenses) / grossPotentialAnnualRent) * 100).toFixed(1))
        : 100;

    // b. Break-Even Monthly Rent (₹) = (Annual Debt Service + Operating Expenses) / 12
    const breakEvenMonthlyRent = Math.round((annualDebtService + totalOperatingExpenses) / 12);

    // c. Break-Even Safety Cushion (%) = (Current Rent - Break-Even Rent) / Current Rent * 100
    const breakEvenSafetyMarginPct =
      monthlyRentInput > 0
        ? Number((((monthlyRentInput - breakEvenMonthlyRent) / monthlyRentInput) * 100).toFixed(1))
        : 0;

    // d. Debt Service Coverage Ratio (DSCR) = NOI / Annual Debt Service
    const dscr =
      annualDebtService > 0 ? Number((netOperatingIncome / annualDebtService).toFixed(2)) : 99;

    // e. Capital Recoupment Horizon (Years)
    const annualTotalRecoupment = annualPreTaxCashFlow + year1Principal;
    const paybackYears =
      annualTotalRecoupment > 0
        ? Number((totalInitialCashInvested / annualTotalRecoupment).toFixed(1))
        : 99;

    return {
      loanAmount,
      downPayment,
      stampDuty,
      registrationFee,
      loanProcessingFee,
      totalInitialCashInvested,
      monthlyEmi,
      annualDebtService,
      year1Interest,
      year1Principal,
      grossPotentialAnnualRent,
      vacancyAllowanceAnnual,
      effectiveGrossIncome,
      maintenanceAnnual,
      totalOperatingExpenses,
      netOperatingIncome,
      annualPreTaxCashFlow,
      monthlyPreTaxCashFlow,
      cashOnCashReturnPct,
      totalYear1ReturnPct,
      breakEvenOccupancyPct,
      breakEvenMonthlyRent,
      breakEvenSafetyMarginPct,
      dscr,
      paybackYears,
    };
  }, [
    assetValue,
    ltvPct,
    interestRatePct,
    tenureYears,
    monthlyRentInput,
    propertyTaxAnnual,
    maintenanceMonthly,
    vacancyRatePct,
    insuranceAnnual,
    valuation,
  ]);

  // Sensitivity Matrix Calculations
  const sensitivityData = useMemo(() => {
    const rateDeltas = [-1.0, 0, 1.0];
    const occupancyRates = [100, 90, 80];

    return rateDeltas.map((rateDelta) => {
      const testRate = Math.max(4.0, interestRatePct + rateDelta);
      const monthlyRate = testRate / 12 / 100;
      const totalMonths = tenureYears * 12;
      const testEmi = Math.round(
        (calculations.loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
          (Math.pow(1 + monthlyRate, totalMonths) - 1)
      );
      const testDebtService = testEmi * 12;

      const cols = occupancyRates.map((occ) => {
        const testGrossRent = calculations.grossPotentialAnnualRent * (occ / 100);
        const testNOI = testGrossRent - calculations.totalOperatingExpenses;
        const testCashFlow = testNOI - testDebtService;
        const testCoC =
          calculations.totalInitialCashInvested > 0
            ? Number(((testCashFlow / calculations.totalInitialCashInvested) * 100).toFixed(1))
            : 0;
        return { occ, testCoC, testCashFlow };
      });

      return {
        testRate,
        cols,
      };
    });
  }, [calculations, interestRatePct, tenureYears]);

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      {/* Header & Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Investment Yield: Cash-on-Cash Return & Break-Even Modeling
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Institutional leverage model deducting mortgage debt service, property tax, and ongoing maintenance to evaluate net liquid investor yield.
          </p>
        </div>

        {/* View Toggle (Monthly vs Annual) */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveViewMode('annual')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeViewMode === 'annual'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Annual View
          </button>
          <button
            onClick={() => setActiveViewMode('monthly')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeViewMode === 'monthly'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Monthly View
          </button>
        </div>
      </div>

      {/* Primary KPI Ribbon (Cash-on-Cash & Break-Even metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Cash-on-Cash Return */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              Cash-on-Cash (CoC) Return
            </span>
            <span
              className={`inline-flex items-center text-xs font-bold ${
                calculations.cashOnCashReturnPct >= 6
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : calculations.cashOnCashReturnPct > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {calculations.cashOnCashReturnPct >= 0 ? '+' : ''}
              {calculations.cashOnCashReturnPct}%
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {calculations.cashOnCashReturnPct}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {calculations.cashOnCashReturnPct >= 7.0
              ? 'Beats Bank FD (7.0%) on pre-tax liquid distribution.'
              : calculations.cashOnCashReturnPct > 0
              ? 'Positive yield; principal amortization adds +' + calculations.totalYear1ReturnPct + '% total ROI.'
              : 'Negative cash flow carry; reliant on capital appreciation.'}
          </p>
        </div>

        {/* KPI 2: Break-Even Occupancy */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              Break-Even Occupancy
            </span>
            <span
              className={`text-xs font-bold ${
                calculations.breakEvenOccupancyPct <= 75
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : calculations.breakEvenOccupancyPct <= 90
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {calculations.breakEvenOccupancyPct}%
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {calculations.breakEvenOccupancyPct}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {calculations.breakEvenOccupancyPct <= 100
              ? `Safety Buffer: ${(100 - calculations.breakEvenOccupancyPct).toFixed(1)}% vacant buffer before deficit.`
              : `Deficit: Requires ₹${formatINR(Math.abs(calculations.annualPreTaxCashFlow))} annual subsidy.`}
          </p>
        </div>

        {/* KPI 3: Break-Even Monthly Rent */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              Break-Even Monthly Rent
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              ₹{calculations.breakEvenMonthlyRent.toLocaleString('en-IN')}/mo
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            ₹{calculations.breakEvenMonthlyRent.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {calculations.breakEvenSafetyMarginPct > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                +{calculations.breakEvenSafetyMarginPct}% safety cushion above breakeven
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                {calculations.breakEvenSafetyMarginPct}% shortfall vs current rent
              </span>
            )}
          </p>
        </div>

        {/* KPI 4: Net Pre-Tax Cash Flow */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              Net Cash Flow ({activeViewMode === 'annual' ? 'Annual' : 'Monthly'})
            </span>
            <span className="text-xs text-slate-400 font-mono">DSCR: {calculations.dscr}x</span>
          </div>
          <div
            className={`text-2xl font-extrabold font-mono ${
              calculations.annualPreTaxCashFlow >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {activeViewMode === 'annual'
              ? formatINR(calculations.annualPreTaxCashFlow)
              : formatINR(calculations.monthlyPreTaxCashFlow)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Initial Equity Invested: <strong>{formatINR(calculations.totalInitialCashInvested)}</strong>
          </p>
        </div>
      </div>

      {/* Interactive Financing & Operating Sliders */}
      <div className="p-5 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-500" />
            <span>Interactive Leverage & Expense Adjustments</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Loan: {formatINR(calculations.loanAmount)} ({ltvPct}%) · Equity: {formatINR(calculations.downPayment)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Slider 1: Loan to Value (LTV %) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Loan-to-Value (LTV):</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">{ltvPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={ltvPct}
              onChange={(e) => setLtvPct(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>All Cash (0%)</span>
              <span>Standard (75%)</span>
              <span>Max (90%)</span>
            </div>
          </div>

          {/* Slider 2: Interest Rate (% p.a.) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Loan Interest Rate:</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">{interestRatePct}% p.a.</span>
            </div>
            <input
              type="range"
              min="6.0"
              max="14.0"
              step="0.25"
              value={interestRatePct}
              onChange={(e) => setInterestRatePct(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Prime (7.5%)</span>
              <span>Retail (8.5%)</span>
              <span>High (12.0%)</span>
            </div>
          </div>

          {/* Slider 3: Loan Tenure (Years) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Loan Tenure:</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">{tenureYears} Years</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>5 Yrs</span>
              <span>20 Yrs (Default)</span>
              <span>30 Yrs</span>
            </div>
          </div>
        </div>

        {/* Operating Inputs Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Monthly Rental Income (₹):
            </label>
            <input
              type="number"
              value={monthlyRentInput}
              onChange={(e) => setMonthlyRentInput(Math.max(0, Number(e.target.value)))}
              className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-hidden"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Annual Property Tax (₹):
            </label>
            <input
              type="number"
              value={propertyTaxAnnual}
              onChange={(e) => setPropertyTaxAnnual(Math.max(0, Number(e.target.value)))}
              className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-hidden"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Monthly Maintenance & Society (₹):
            </label>
            <input
              type="number"
              value={maintenanceMonthly}
              onChange={(e) => setMaintenanceMonthly(Math.max(0, Number(e.target.value)))}
              className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Cash Flow Waterfall Ledger */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
          <span>
            {activeViewMode === 'annual' ? 'Annual Cash Flow Ledger' : 'Monthly Cash Flow Ledger'}
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            Net Cash Flow = Gross Rent − Vacancy − Operating Expenses (Tax + Maintenance) − Loan Debt Service
          </span>
        </h4>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Cash Flow Component</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3 text-right">
                  {activeViewMode === 'annual' ? 'Annual Amount (₹)' : 'Monthly Amount (₹)'}
                </th>
                <th className="py-2.5 px-3 text-right">% of Gross Rent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
              {/* Gross Potential Rent */}
              <tr className="bg-emerald-50/30 dark:bg-emerald-950/20 font-semibold">
                <td className="py-2 px-3 font-sans text-slate-900 dark:text-white">Gross Rental Income</td>
                <td className="py-2 px-3 text-emerald-600 font-sans">Primary Inflow</td>
                <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400">
                  {formatINR(
                    activeViewMode === 'annual'
                      ? calculations.grossPotentialAnnualRent
                      : monthlyRentInput
                  )}
                </td>
                <td className="py-2 px-3 text-right text-slate-500">100.0%</td>
              </tr>

              {/* Vacancy & Credit Loss */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                <td className="py-2 px-3 font-sans text-slate-700 dark:text-slate-300">
                  Vacancy & Credit Loss ({vacancyRatePct}%)
                </td>
                <td className="py-2 px-3 text-slate-400 font-sans">Revenue Deduction</td>
                <td className="py-2 px-3 text-right text-rose-500">
                  -
                  {formatINR(
                    activeViewMode === 'annual'
                      ? calculations.vacancyAllowanceAnnual
                      : Math.round(calculations.vacancyAllowanceAnnual / 12)
                  )}
                </td>
                <td className="py-2 px-3 text-right text-slate-500">-{vacancyRatePct}.0%</td>
              </tr>

              {/* Effective Gross Income */}
              <tr className="bg-slate-50/50 dark:bg-slate-800/40 font-medium">
                <td className="py-2 px-3 font-sans text-slate-900 dark:text-white">
                  Effective Gross Income (EGI)
                </td>
                <td className="py-2 px-3 text-indigo-500 font-sans">Operating Base</td>
                <td className="py-2 px-3 text-right text-slate-900 dark:text-white font-semibold">
                  {formatINR(
                    activeViewMode === 'annual'
                      ? calculations.effectiveGrossIncome
                      : Math.round(calculations.effectiveGrossIncome / 12)
                  )}
                </td>
                <td className="py-2 px-3 text-right text-slate-500">
                  {(100 - vacancyRatePct).toFixed(1)}%
                </td>
              </tr>

              {/* Property Tax */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                <td className="py-2 px-3 font-sans text-slate-700 dark:text-slate-300">
                  Municipal Property Tax
                </td>
                <td className="py-2 px-3 text-slate-400 font-sans">Operating Expense (Tax)</td>
                <td className="py-2 px-3 text-right text-rose-500">
                  -
                  {formatINR(
                    activeViewMode === 'annual'
                      ? propertyTaxAnnual
                      : Math.round(propertyTaxAnnual / 12)
                  )}
                </td>
                <td className="py-2 px-3 text-right text-slate-500">
                  -(
                  {(
                    (propertyTaxAnnual / calculations.grossPotentialAnnualRent) *
                    100
                  ).toFixed(1)}
                  %)
                </td>
              </tr>

              {/* Maintenance & Society */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                <td className="py-2 px-3 font-sans text-slate-700 dark:text-slate-300">
                  Maintenance, Repairs & Society CAM
                </td>
                <td className="py-2 px-3 text-slate-400 font-sans">Operating Expense (Maintenance)</td>
                <td className="py-2 px-3 text-right text-rose-500">
                  -
                  {formatINR(
                    activeViewMode === 'annual'
                      ? calculations.maintenanceAnnual
                      : maintenanceMonthly
                  )}
                </td>
                <td className="py-2 px-3 text-right text-slate-500">
                  -(
                  {(
                    (calculations.maintenanceAnnual / calculations.grossPotentialAnnualRent) *
                    100
                  ).toFixed(1)}
                  %)
                </td>
              </tr>

              {/* Building Insurance */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                <td className="py-2 px-3 font-sans text-slate-700 dark:text-slate-300">
                  Property Insurance & Sundry Reserves
                </td>
                <td className="py-2 px-3 text-slate-400 font-sans">Operating Expense</td>
                <td className="py-2 px-3 text-right text-rose-500">
                  -
                  {formatINR(
                    activeViewMode === 'annual'
                      ? insuranceAnnual
                      : Math.round(insuranceAnnual / 12)
                  )}
                </td>
                <td className="py-2 px-3 text-right text-slate-500">
                  -(
                  {(
                    (insuranceAnnual / calculations.grossPotentialAnnualRent) *
                    100
                  ).toFixed(1)}
                  %)
                </td>
              </tr>

              {/* Net Operating Income (NOI) */}
              <tr className="bg-slate-100 dark:bg-slate-800 font-semibold">
                <td className="py-2 px-3 font-sans text-slate-900 dark:text-white">
                  Net Operating Income (NOI)
                </td>
                <td className="py-2 px-3 text-indigo-600 dark:text-indigo-400 font-sans">
                  Free Cash Before Debt
                </td>
                <td className="py-2 px-3 text-right text-slate-900 dark:text-white">
                  {formatINR(
                    activeViewMode === 'annual'
                      ? calculations.netOperatingIncome
                      : Math.round(calculations.netOperatingIncome / 12)
                  )}
                </td>
                <td className="py-2 px-3 text-right text-slate-600 dark:text-slate-300">
                  {(
                    (calculations.netOperatingIncome / calculations.grossPotentialAnnualRent) *
                    100
                  ).toFixed(1)}
                  %
                </td>
              </tr>

              {/* Loan Debt Service (Principal & Interest) */}
              {calculations.loanAmount > 0 && (
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="py-2 px-3 font-sans text-slate-700 dark:text-slate-300">
                    Loan Debt Service (EMI: ₹{calculations.monthlyEmi.toLocaleString('en-IN')}/mo)
                  </td>
                  <td className="py-2 px-3 text-rose-500 font-sans">Mortgage Financing ({interestRatePct}%)</td>
                  <td className="py-2 px-3 text-right text-rose-500">
                    -
                    {formatINR(
                      activeViewMode === 'annual'
                        ? calculations.annualDebtService
                        : calculations.monthlyEmi
                    )}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-500">
                    -(
                    {(
                      (calculations.annualDebtService / calculations.grossPotentialAnnualRent) *
                      100
                    ).toFixed(1)}
                    %)
                  </td>
                </tr>
              )}

              {/* Net Pre-Tax Cash Flow */}
              <tr
                className={`font-bold text-sm ${
                  calculations.annualPreTaxCashFlow >= 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
                }`}
              >
                <td className="py-2.5 px-3 font-sans">Net Pre-Tax Cash Flow</td>
                <td className="py-2.5 px-3 font-sans font-semibold">
                  {calculations.annualPreTaxCashFlow >= 0 ? 'Surplus Cash Flow' : 'Cash Flow Deficit'}
                </td>
                <td className="py-2.5 px-3 text-right">
                  {formatINR(
                    activeViewMode === 'annual'
                      ? calculations.annualPreTaxCashFlow
                      : calculations.monthlyPreTaxCashFlow
                  )}
                </td>
                <td className="py-2.5 px-3 text-right">
                  {(
                    (calculations.annualPreTaxCashFlow / calculations.grossPotentialAnnualRent) *
                    100
                  ).toFixed(1)}
                  %
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Break-Even & Sensitivity Toggle Section */}
      <div className="pt-2">
        <button
          onClick={() => setShowSensitivity(!showSensitivity)}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer"
        >
          {showSensitivity ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>{showSensitivity ? 'Hide Sensitivity Stress-Test' : 'View Interest Rate & Occupancy Sensitivity Matrix'}</span>
        </button>

        {showSensitivity && (
          <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white">
                Cash-on-Cash Return Sensitivity Matrix
              </span>
              <span className="text-[11px] text-slate-500">
                Evaluates CoC yield across fluctuating borrowing rates and occupancy stress.
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left font-mono">
                <thead className="bg-slate-200/60 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200">
                  <tr>
                    <th className="py-2 px-3 font-sans">Mortgage Rate</th>
                    <th className="py-2 px-3 text-right">100% Occupancy</th>
                    <th className="py-2 px-3 text-right">90% Occupancy</th>
                    <th className="py-2 px-3 text-right">80% Occupancy (Stress)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                  {sensitivityData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-slate-700/30">
                      <td className="py-2 px-3 font-sans font-semibold text-slate-900 dark:text-white">
                        {row.testRate}% p.a.{' '}
                        {row.testRate === interestRatePct && (
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-sans">(Base)</span>
                        )}
                      </td>
                      {row.cols.map((col, colIdx) => (
                        <td
                          key={colIdx}
                          className={`py-2 px-3 text-right font-bold ${
                            col.testCoC >= 6
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : col.testCoC > 0
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {col.testCoC}%{' '}
                          <span className="text-[10px] text-slate-400 font-normal block font-sans">
                            {formatINR(col.testCashFlow)}/yr
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentYieldModule;
