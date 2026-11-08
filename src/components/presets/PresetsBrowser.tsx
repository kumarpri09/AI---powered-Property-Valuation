import React from 'react';
import { PROPERTY_PRESETS } from '../../data/presets';
import { PropertyData } from '../../types/property';
import { calculatePropertyValuation, formatINR } from '../../utils/valuationEngine';
import { Building2, Home, Briefcase, ArrowRight, Check } from 'lucide-react';

interface PresetsBrowserProps {
  currentPropertyId: string;
  onSelectPreset: (preset: PropertyData) => void;
}

export const PresetsBrowser: React.FC<PresetsBrowserProps> = ({
  currentPropertyId,
  onSelectPreset,
}) => {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Benchmark Property Case Studies
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Realistic real estate assets pre-configured with complete 12-parameter data sets from official guidance examples.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PROPERTY_PRESETS.map((preset) => {
          const val = calculatePropertyValuation(preset);
          const isSelected = currentPropertyId === preset.id;
          const isComm = preset.propertyCategory === 'commercial';

          return (
            <div
              key={preset.id}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {isComm ? <Briefcase className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                    <span className="capitalize">{preset.propertyCategory} Asset</span>
                  </div>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" /> Active in Studio
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                    {preset.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {preset.locality}, {preset.city}
                  </p>
                </div>

                {/* Key Metrics Pill Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Fair Market Value</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                      {formatINR(val.fairMarketValue)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Gross Rental Yield</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {val.grossRentalYield}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Effective Area</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {isComm ? `${preset.builtUpArea || 2000} sq ft` : `${preset.superBuiltUpArea || 1500} sq ft`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Monthly Rent</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {formatINR(preset.monthlyRent)}/mo
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                  &quot;{preset.notes}&quot;
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => onSelectPreset(preset)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{isSelected ? 'Loaded in Studio' : 'Load into Valuation Studio'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
