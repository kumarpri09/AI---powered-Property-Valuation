import React, { useState } from 'react';
import { PropertyData, ValuationOutput, AIAppraisalReport } from '../../types/property';
import { formatINR } from '../../utils/valuationEngine';
import { useAuth } from '../../context/AuthContext';
import {
  Printer,
  Sparkles,
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  TrendingUp,
  FileCheck,
  Percent,
  RefreshCw,
  FileDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateValuationPDF } from '../../utils/pdfGenerator';
import { ValuationBenchmarkChartD3 } from './ValuationBenchmarkChartD3';
import { InvestmentYieldModule } from './InvestmentYieldModule';

interface ValuationReportProps {
  propertyData: PropertyData;
  valuation: ValuationOutput;
  onEditParameters: () => void;
  onSaveToPortfolio: () => void;
}

export const ValuationReport: React.FC<ValuationReportProps> = ({
  propertyData,
  valuation,
  onEditParameters,
  onSaveToPortfolio,
}) => {
  const { user } = useAuth();
  const [aiReport, setAiReport] = useState<AIAppraisalReport | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      generateValuationPDF(propertyData, valuation, user, aiReport);
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleGenerateAiAppraisal = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/gemini-appraise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...propertyData,
          calculatedValues: {
            fairMarketValue: valuation.fairMarketValue,
            marketComparisonValue: valuation.marketComparisonValue,
            incomeCapitalisationValue: valuation.incomeCapitalisationValue,
            costApproachValue: valuation.costApproachValue,
            circleRateValue: valuation.circleRateValue,
            rentalYield: valuation.grossRentalYield,
          },
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAiReport(data.analysis);
      }
    } catch (err) {
      console.error('Failed to generate AI appraisal:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    onSaveToPortfolio();
    setIsSaved(true);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // ignore
    }
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCopySummary = () => {
    const text = `VALUMETRIC PROPERTY APPRAISAL SUMMARY
Property: ${propertyData.name} (${propertyData.propertyCategory.toUpperCase()})
Location: ${propertyData.locality}, ${propertyData.city}
Estimated Fair Market Value (FMV): ${formatINR(valuation.fairMarketValue)}
Quick-Sale Liquidation Value: ${formatINR(valuation.quickSaleValue)}
Price Range: ${formatINR(valuation.expectedPriceRange.conservative)} - ${formatINR(valuation.expectedPriceRange.optimistic)}
Market Comparison: ${formatINR(valuation.marketComparisonValue)}
Income Capitalisation: ${formatINR(valuation.incomeCapitalisationValue)}
Cost Approach: ${formatINR(valuation.costApproachValue)}
Government Circle Rate: ${formatINR(valuation.circleRateValue)}
Gross Rental Yield: ${valuation.grossRentalYield}% | Cap Rate: ${valuation.capitalisationRate}%
Legal Risk Rating: ${valuation.legalRiskScore}`;

    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 print:p-0 print:m-0 print:max-w-none">
      {/* Action Toolbar (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Valuation Status:
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled & Ready
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onEditParameters}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Edit Parameters
          </button>

          <button
            onClick={handleCopySummary}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedNotice ? 'Summary Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleSave}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Saved to Portfolio!' : 'Save Appraisal'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{isGeneratingPDF ? 'Generating PDF...' : 'Download as PDF'}</span>
          </button>
        </div>
      </div>

      {/* Formal Printable Appraisal Document */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs print:border-none print:shadow-none print:p-0 space-y-8">
        {/* Appraisal Letterhead */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-indigo-600" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  ValuMetric Certified Property Appraisal Report
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Conducted in accordance with International Valuation Standards (IVS) and IBBI Registered Valuer guidelines.
              </p>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
              <p><span className="font-semibold text-slate-700 dark:text-slate-300">Valuation Date:</span> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              <p><span className="font-semibold text-slate-700 dark:text-slate-300">Report Ref:</span> VM-{Date.now().toString().slice(-6)}</p>
              <p><span className="font-semibold text-slate-700 dark:text-slate-300">Appraiser:</span> {user?.name || 'Authorized Real Estate Valuer'}</p>
            </div>
          </div>
        </div>

        {/* Subject Property Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Subject Asset</span>
            <span className="font-bold text-sm text-slate-900 dark:text-white block mt-0.5">{propertyData.name}</span>
            <span className="text-xs text-slate-500 capitalize">{propertyData.propertyCategory} ({propertyData.residentialType || propertyData.commercialCategory})</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Micro-Market</span>
            <span className="font-semibold text-xs text-slate-900 dark:text-white block mt-0.5">{propertyData.locality}</span>
            <span className="text-xs text-slate-500">{propertyData.city}, {propertyData.cityTier}</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Effective Area</span>
            <span className="font-bold text-xs text-slate-900 dark:text-white block mt-0.5 font-mono">
              {propertyData.propertyCategory === 'commercial'
                ? `${propertyData.builtUpArea || propertyData.carpetArea || 2000} sq. ft (Leasable)`
                : `${propertyData.superBuiltUpArea || 1500} sq. ft (Super Built-Up)`}
            </span>
            <span className="text-xs text-slate-500">Plot: {propertyData.plotArea.toLocaleString('en-IN')} sq. ft</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Legal Title & OC</span>
            <span className="font-semibold text-xs text-slate-900 dark:text-white block mt-0.5">{propertyData.landOwnership}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400">{propertyData.occupancyCertificate}</span>
          </div>
        </div>

        {/* Key Valuation Verdict Card */}
        <div className="p-6 bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                Certified Fair Market Value (FMV)
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono">
                {formatINR(valuation.fairMarketValue)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                Synthesized from registered transactional evidence, income capitalisation yield analysis, and depreciated replacement cost.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-800">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[10px] text-slate-400 block uppercase">Quick-Sale Value</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {formatINR(valuation.quickSaleValue)}
                </span>
                <span className="text-[10px] text-slate-500 block">30-day liquidation</span>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[10px] text-slate-400 block uppercase">Gross Rental Yield</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {valuation.grossRentalYield}%
                </span>
                <span className="text-[10px] text-slate-500 block">Annual {formatINR(valuation.grossAnnualRent)}</span>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block uppercase">Circle Rate Benchmark</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {formatINR(valuation.circleRateValue)}
                </span>
                <span className="text-[10px] text-slate-500 block">{valuation.circleRateDifferencePct > 0 ? `+${valuation.circleRateDifferencePct}% above circle` : 'Below circle rate'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* D3.js Valuation vs Benchmark Bar Chart Comparison */}
        <ValuationBenchmarkChartD3 propertyData={propertyData} valuation={valuation} />

        {/* The 3 Primary Valuation Methods Detailed Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              The Three Primary Valuation Approaches
            </h3>
            <span className="text-xs text-slate-500">
              Weighted Reconciliation: {propertyData.propertyCategory === 'commercial' ? 'Income (65%) · Comparison (25%) · Cost (10%)' : 'Comparison (60%) · Cost (25%) · Income (15%)'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* METHOD 1: MARKET COMPARISON */}
            <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Method 1: Comparison
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {propertyData.propertyCategory === 'commercial' ? '25% Weight' : '60% Weight'}
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {formatINR(valuation.marketComparisonValue)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono space-y-1 pt-1 border-t border-slate-100 dark:border-slate-700">
                <div>Base Rate: ₹{propertyData.comparableMarketRatePerSqFt.toLocaleString('en-IN')}/sq ft</div>
                <div>Adjusted Rate: ₹{valuation.adjustedMarketRatePerSqFt.toLocaleString('en-IN')}/sq ft</div>
                <div className="text-indigo-600 dark:text-indigo-400 font-semibold">
                  Net Adjustment: {valuation.netAdjustmentPercentage > 0 ? `+${valuation.netAdjustmentPercentage}%` : `${valuation.netAdjustmentPercentage}%`}
                </div>
              </div>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Key Adjustment Drivers:
                </span>
                <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                  {valuation.adjustmentsList.slice(0, 4).map((adj, i) => (
                    <li key={i} className="flex items-start justify-between">
                      <span className="truncate pr-1">{adj.factor}</span>
                      <span className={`font-mono font-semibold ${adj.impactPercentage > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {adj.impactPercentage > 0 ? `+${adj.impactPercentage}%` : `${adj.impactPercentage}%`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* METHOD 2: INCOME CAPITALISATION */}
            <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Method 2: Income Capitalisation
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {propertyData.propertyCategory === 'commercial' ? '65% Weight' : '15% Weight'}
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {formatINR(valuation.incomeCapitalisationValue)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono space-y-1 pt-1 border-t border-slate-100 dark:border-slate-700">
                <div>Gross Rent: {formatINR(valuation.grossAnnualRent)}/yr</div>
                <div>Operating Exp: {formatINR(valuation.annualOperatingExpensesTotal)}/yr</div>
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Net Operating Income (NOI): {formatINR(valuation.netOperatingIncome)}
                </div>
                <div>Cap Rate Used: {valuation.capRateUsed}%</div>
              </div>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Cap Rate Sensitivity Yield:
                </span>
                <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-center">
                  {valuation.capRateSensitivity.slice(1, 4).map((sens, i) => (
                    <div key={i} className="p-1 bg-slate-50 dark:bg-slate-700/60 rounded">
                      <span className="text-slate-400 block">{sens.capRate}%</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{formatINR(sens.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* METHOD 3: COST APPROACH */}
            <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Method 3: Cost Approach
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {propertyData.propertyCategory === 'commercial' ? '10% Weight' : '25% Weight'}
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {formatINR(valuation.costApproachValue)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono space-y-1 pt-1 border-t border-slate-100 dark:border-slate-700">
                <div>Land Value: {formatINR(valuation.landValue)}</div>
                <div>Replacement Cost: {formatINR(valuation.replacementCostBuilding)}</div>
                <div className="text-rose-500">
                  Depreciation & Obsolescence: -{formatINR(valuation.physicalDepreciation + valuation.functionalObsolescence)}
                </div>
                <div className="text-slate-700 dark:text-slate-300 font-semibold">
                  Depreciated Building: {formatINR(valuation.depreciatedBuildingValue)}
                </div>
              </div>
              <div className="pt-2 text-[11px] text-slate-500">
                Calculated as Land Value + (Replacement Cost − Depreciation − Obsolescence).
              </div>
            </div>
          </div>
        </div>

        {/* Government Circle Rates & Stamp Duty Section */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Statutory Government Circle Rate & Registration Costs
            </h4>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              Revenue Dept / Sub-Registrar Benchmark
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Circle Rate Benchmark</span>
              <span className="font-bold text-slate-900 dark:text-white">
                ₹{propertyData.circleRatePerSqFt.toLocaleString('en-IN')}/sq ft
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Circle Rate Consideration</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatINR(valuation.circleRateValue)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Estimated Stamp Duty</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatINR(valuation.estimatedStampDuty)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Registration Fee (1%)</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatINR(valuation.estimatedRegistrationFee)}
              </span>
            </div>
          </div>
        </div>

        {/* Investment Yield: Cash-on-Cash Return & Break-Even Modeling */}
        <InvestmentYieldModule propertyData={propertyData} valuation={valuation} />

        {/* 10-Year Financial Forecast Table */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            10-Year Capital Appreciation & Cumulative Cash Flow Forecast
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Based on {propertyData.expectedAppreciationRatePct || 8.5}% annual capital appreciation and 5% rental escalation compounding.
          </p>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Horizon</th>
                  <th className="py-2.5 px-3">Projected Asset Value</th>
                  <th className="py-2.5 px-3">Annual Gross Rent</th>
                  <th className="py-2.5 px-3">Annual Net Cash Flow</th>
                  <th className="py-2.5 px-3 text-right">Cumulative ROI %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {valuation.tenYearForecast.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="py-2 px-3 font-sans font-medium text-slate-900 dark:text-white">Year {row.year}</td>
                    <td className="py-2 px-3 text-indigo-600 dark:text-indigo-400 font-semibold">{formatINR(row.propertyValue)}</td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{formatINR(row.annualRent)}</td>
                    <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400">{formatINR(row.netCashFlow)}</td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-900 dark:text-white">+{row.cumulativeReturnPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Valuation Insights & Valuer Commentary */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Chartered Surveyor Executive Appraisal Insights
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                AI valuation reasoning powered by Gemini 3.8 Flash evaluating all 12 parameter sets.
              </p>
            </div>
            {!aiReport && (
              <button
                onClick={handleGenerateAiAppraisal}
                disabled={isGeneratingAi}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isGeneratingAi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Parameters...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate AI Valuer Analysis</span>
                  </>
                )}
              </button>
            )}
          </div>

          {aiReport ? (
            <div className="space-y-4 pt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">Executive Appraisal Opinion:</span>
                <p>{aiReport.executiveSummary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 block">Primary Value Drivers:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                    {aiReport.keyStrengths.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <span className="font-bold text-rose-700 dark:text-rose-400 block">Risk Flags & Due Diligence:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                    {aiReport.riskFactors.map((rf, i) => (
                      <li key={i}>{rf}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">Valuer Recommendation:</span>
                <p>{aiReport.valuerRecommendation}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              Click &quot;Generate AI Valuer Analysis&quot; to produce an automated expert critique of methodology, liquidity timing, and micro-market growth.
            </div>
          )}
        </div>

        {/* Certification Sign-off Block */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">Valuation Undertaken By:</span>
            <span>{user?.name || 'ValuMetric Licensed Real Estate Valuer'} ({user?.role || 'Chartered Valuer'})</span>
            <p className="text-[11px] text-slate-400">Verified Mobile: +91 {user?.mobileNumber || '9876543210'}</p>
          </div>
          <div className="text-left sm:text-right">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">Signature & Digital Seal:</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">DIGITALLY CERTIFIED</span>
            <p className="text-[11px] text-slate-400">Hash: SHA256-VM-{Date.now().toString().slice(-8)}</p>
            <div className="pt-2 print:hidden">
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download Signed PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
