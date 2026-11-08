import React, { useState } from 'react';
import { PropertyData } from '../../types/property';
import { PROPERTY_PRESETS } from '../../data/presets';
import { calculatePropertyValuation, formatINR } from '../../utils/valuationEngine';
import { ArrowLeftRight, Check, X, ShieldAlert, Award } from 'lucide-react';

interface PropertyComparisonProps {
  currentProperty: PropertyData;
}

export const PropertyComparison: React.FC<PropertyComparisonProps> = ({
  currentProperty,
}) => {
  const [comparePropertyId, setComparePropertyId] = useState<string>(
    currentProperty.propertyCategory === 'residential' ? 'embassy-247-mumbai' : 'vajra-lakshmi-nilayam'
  );

  const propA = currentProperty;
  const propB = PROPERTY_PRESETS.find((p) => p.id === comparePropertyId) || PROPERTY_PRESETS[0];

  const valA = calculatePropertyValuation(propA);
  const valB = calculatePropertyValuation(propB);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
            Side-by-Side Property & Valuation Comparison
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Compare yield dynamics, capital appreciation, and risk matrices between residential and commercial assets.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Compare with:</span>
          <select
            value={comparePropertyId}
            onChange={(e) => setComparePropertyId(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white outline-none"
          >
            {PROPERTY_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Property A Card */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-indigo-500/40 shadow-xs space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                Subject Asset (Studio)
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {propA.name}
              </h3>
              <p className="text-xs text-slate-500">{propA.locality}, {propA.city}</p>
            </div>
            <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold uppercase">
              {propA.propertyCategory}
            </span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
            <span className="text-[11px] text-slate-400 block uppercase">Reconciled Fair Market Value</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {formatINR(valA.fairMarketValue)}
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>Gross Yield: <strong className="text-emerald-600">{valA.grossRentalYield}%</strong></span>
              <span>Quick-Sale: {formatINR(valA.quickSaleValue)}</span>
            </div>
          </div>

          {/* Core Attribute Comparison Rows */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Method 1: Comparison Value</span>
              <span className="font-mono font-semibold">{formatINR(valA.marketComparisonValue)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Method 2: Income Capitalisation</span>
              <span className="font-mono font-semibold">{formatINR(valA.incomeCapitalisationValue)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Method 3: Cost Approach</span>
              <span className="font-mono font-semibold">{formatINR(valA.costApproachValue)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Government Circle Rate Value</span>
              <span className="font-mono font-semibold">{formatINR(valA.circleRateValue)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Road Width & Transit</span>
              <span className="font-medium">{propA.roadWidth} ft · {propA.metroProximity}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Building Age & Health</span>
              <span className="font-medium">{propA.buildingAge} yrs · {propA.structuralCondition}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">Legal Risk Rating</span>
              <span className={`font-semibold ${valA.legalRiskScore.includes('Low') ? 'text-emerald-600' : 'text-rose-500'}`}>
                {valA.legalRiskScore}
              </span>
            </div>
          </div>
        </div>

        {/* Property B Card */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Comparative Asset
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {propB.name}
              </h3>
              <p className="text-xs text-slate-500">{propB.locality}, {propB.city}</p>
            </div>
            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold uppercase">
              {propB.propertyCategory}
            </span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
            <span className="text-[11px] text-slate-400 block uppercase">Reconciled Fair Market Value</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {formatINR(valB.fairMarketValue)}
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>Gross Yield: <strong className="text-emerald-600">{valB.grossRentalYield}%</strong></span>
              <span>Quick-Sale: {formatINR(valB.quickSaleValue)}</span>
            </div>
          </div>

          {/* Core Attribute Comparison Rows */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Method 1: Comparison Value</span>
              <span className="font-mono font-semibold">{formatINR(valB.marketComparisonValue)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Method 2: Income Capitalisation</span>
              <span className="font-mono font-semibold">{formatINR(valB.incomeCapitalisationValue)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Method 3: Cost Approach</span>
              <span className="font-mono font-semibold">{formatINR(valB.costApproachValue)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Government Circle Rate Value</span>
              <span className="font-mono font-semibold">{formatINR(valB.circleRateValue)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Road Width & Transit</span>
              <span className="font-medium">{propB.roadWidth} ft · {propB.metroProximity}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Building Age & Health</span>
              <span className="font-medium">{propB.buildingAge} yrs · {propB.structuralCondition}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">Legal Risk Rating</span>
              <span className={`font-semibold ${valB.legalRiskScore.includes('Low') ? 'text-emerald-600' : 'text-rose-500'}`}>
                {valB.legalRiskScore}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
