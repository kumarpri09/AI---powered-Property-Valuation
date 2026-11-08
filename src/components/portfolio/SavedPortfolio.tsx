import React from 'react';
import { PropertyData } from '../../types/property';
import { calculatePropertyValuation, formatINR } from '../../utils/valuationEngine';
import { FolderCheck, Trash2, ArrowUpRight, Plus, Download } from 'lucide-react';

interface SavedPortfolioProps {
  savedProperties: PropertyData[];
  onLoadProperty: (prop: PropertyData) => void;
  onDeleteProperty: (id: string) => void;
  onNewProperty: () => void;
}

export const SavedPortfolio: React.FC<SavedPortfolioProps> = ({
  savedProperties,
  onLoadProperty,
  onDeleteProperty,
  onNewProperty,
}) => {
  const handleExportJSON = (prop: PropertyData) => {
    const val = calculatePropertyValuation(prop);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ property: prop, valuation: val }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${prop.name.replace(/\s+/g, '_')}_Valuation.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FolderCheck className="w-5 h-5 text-indigo-600" />
            Saved Property Valuation Portfolio
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Valuations saved to your local device and authenticated valuer profile.
          </p>
        </div>

        <button
          onClick={onNewProperty}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Property Valuation</span>
        </button>
      </div>

      {savedProperties.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <FolderCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              No Saved Valuations Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              Start by configuring any residential or commercial asset in the Valuation Studio, then click &quot;Save Appraisal&quot; in the report.
            </p>
          </div>
          <button
            onClick={onNewProperty}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl transition-colors cursor-pointer"
          >
            Create First Valuation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedProperties.map((prop) => {
            const val = calculatePropertyValuation(prop);
            return (
              <div
                key={prop.id}
                className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 capitalize">
                      {prop.propertyCategory} Asset
                    </span>
                    <button
                      onClick={() => onDeleteProperty(prop.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                      {prop.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {prop.locality}, {prop.city}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase block">Fair Market Value</span>
                    <div className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">
                      {formatINR(val.fairMarketValue)}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-600">
                      Gross Yield: {val.grossRentalYield}% · NOI: {formatINR(val.netOperatingIncome)}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => onLoadProperty(prop)}
                    className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Load in Studio</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleExportJSON(prop)}
                    className="p-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    title="Export JSON report"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
