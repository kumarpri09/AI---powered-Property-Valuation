import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { PropertyData, ValuationOutput } from '../../types/property';
import { formatINR } from '../../utils/valuationEngine';
import { BarChart3, Info, Scale, Layers } from 'lucide-react';

interface ValuationBenchmarkChartD3Props {
  propertyData: PropertyData;
  valuation: ValuationOutput;
}

interface BenchmarkItem {
  id: string;
  label: string;
  shortLabel: string;
  totalValue: number;
  ratePerSqFt: number;
  color: string;
  category: 'subject' | 'market' | 'circle' | 'method';
  description: string;
}

export const ValuationBenchmarkChartD3: React.FC<ValuationBenchmarkChartD3Props> = ({
  propertyData,
  valuation,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [viewMode, setViewMode] = useState<'total' | 'rate'>('total');
  const [hoveredItem, setHoveredItem] = useState<BenchmarkItem | null>(null);

  const isCommercial = propertyData.propertyCategory === 'commercial';
  const effectiveArea = isCommercial
    ? (propertyData.builtUpArea || propertyData.carpetArea || 2000)
    : (propertyData.superBuiltUpArea || (propertyData.carpetArea ? propertyData.carpetArea * 1.25 : 1200));

  const localMarketAverageTotal = Math.round(effectiveArea * propertyData.comparableMarketRatePerSqFt);

  // Prepare benchmark data points
  const benchmarks: BenchmarkItem[] = [
    {
      id: 'fmv',
      label: 'Subject Fair Market Value',
      shortLabel: 'Subject FMV',
      totalValue: valuation.fairMarketValue,
      ratePerSqFt: Math.round(valuation.fairMarketValue / effectiveArea),
      color: '#4f46e5', // Indigo
      category: 'subject',
      description: 'Certified reconciled fair market value synthesized across comparison, income, and cost methods.',
    },
    {
      id: 'local_avg',
      label: 'Local Market Average',
      shortLabel: 'Locality Avg',
      totalValue: localMarketAverageTotal,
      ratePerSqFt: propertyData.comparableMarketRatePerSqFt,
      color: '#0284c7', // Sky Blue
      category: 'market',
      description: 'Prevailing transaction average across comparable properties in this micro-market.',
    },
    {
      id: 'circle_rate',
      label: 'Government Circle Rate',
      shortLabel: 'Circle Rate',
      totalValue: valuation.circleRateValue,
      ratePerSqFt: propertyData.circleRatePerSqFt,
      color: '#64748b', // Slate
      category: 'circle',
      description: 'Minimum statutory guidance rate notified by State Revenue Dept for stamp duty calculation.',
    },
    {
      id: 'income_cap',
      label: 'Income Capitalisation',
      shortLabel: 'Income Method',
      totalValue: valuation.incomeCapitalisationValue,
      ratePerSqFt: Math.round(valuation.incomeCapitalisationValue / effectiveArea),
      color: '#0d9488', // Teal
      category: 'method',
      description: 'Capitalized net operating income (NOI) divided by prevailing market cap rate.',
    },
    {
      id: 'cost_approach',
      label: 'Cost Approach (Replacement)',
      shortLabel: 'Cost Method',
      totalValue: valuation.costApproachValue,
      ratePerSqFt: Math.round(valuation.costApproachValue / effectiveArea),
      color: '#d97706', // Amber
      category: 'method',
      description: 'Underlying land value plus depreciated building replacement cost.',
    },
    {
      id: 'quick_sale',
      label: 'Quick-Sale (30 Days)',
      shortLabel: 'Quick-Sale',
      totalValue: valuation.quickSaleValue,
      ratePerSqFt: Math.round(valuation.quickSaleValue / effectiveArea),
      color: '#e11d48', // Rose
      category: 'subject',
      description: 'Expected liquidation price under compressed marketing timeline (15% distress markdown).',
    },
  ];

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const containerWidth = 720;
    const containerHeight = 310;
    const margin = { top: 32, right: 30, bottom: 55, left: 75 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Defs for filters / drop shadows
    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'barShadow')
      .attr('x', '-10%')
      .attr('y', '-10%')
      .attr('width', '120%')
      .attr('height', '130%');
    filter.append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '3')
      .attr('stdDeviation', '3')
      .attr('flood-opacity', '0.15');

    // X scale
    const xScale = d3.scaleBand()
      .domain(benchmarks.map((d) => d.shortLabel))
      .range([0, width])
      .padding(0.32);

    // Y scale
    const maxVal = d3.max(benchmarks, (d) => viewMode === 'total' ? d.totalValue : d.ratePerSqFt) || 100000;
    const yScale = d3.scaleLinear()
      .domain([0, maxVal * 1.18])
      .range([height, 0]);

    // Horizontal Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .attr('stroke', '#cbd5e1')
      .attr('stroke-opacity', 0.2);

    // Benchmark Threshold Reference Line (Circle Rate)
    const circleVal = viewMode === 'total' ? valuation.circleRateValue : propertyData.circleRatePerSqFt;
    const circleY = yScale(circleVal);

    const refG = g.append('g').attr('class', 'ref-line');
    refG.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', circleY)
      .attr('y2', circleY)
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,4');

    refG.append('text')
      .attr('x', width - 4)
      .attr('y', circleY - 4)
      .attr('text-anchor', 'end')
      .attr('font-size', '9px')
      .attr('font-family', 'Plus Jakarta Sans, sans-serif')
      .attr('font-weight', '600')
      .attr('fill', '#64748b')
      .text('Statutory Circle Floor');

    // X Axis
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale))
      .attr('font-family', 'Plus Jakarta Sans, sans-serif')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('color', '#64748b')
      .selectAll('text')
      .attr('dy', '10px');

    // Y Axis
    g.append('g')
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickFormat((d) => {
            const num = Number(d);
            if (viewMode === 'total') {
              if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
              if (num >= 100000) return `₹${(num / 100000).toFixed(0)}L`;
              return `₹${num}`;
            }
            if (num >= 1000) return `₹${(num / 1000).toFixed(0)}k/sf`;
            return `₹${num}`;
          })
      )
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '10px')
      .attr('color', '#64748b');

    // Render Bars
    const barsG = g.append('g').attr('class', 'bars');

    benchmarks.forEach((d) => {
      const val = viewMode === 'total' ? d.totalValue : d.ratePerSqFt;
      const barX = xScale(d.shortLabel) || 0;
      const barY = yScale(val);
      const barH = height - barY;
      const barW = xScale.bandwidth();

      const barGroup = barsG.append('g')
        .attr('class', 'bar-item cursor-pointer')
        .on('mouseenter', () => setHoveredItem(d))
        .on('mouseleave', () => setHoveredItem(null));

      // Bar rectangle with rounded top
      barGroup.append('path')
        .attr('d', `
          M ${barX},${height}
          L ${barX},${barY + 6}
          Q ${barX},${barY} ${barX + 6},${barY}
          L ${barX + barW - 6},${barY}
          Q ${barX + barW},${barY} ${barX + barW},${barY + 6}
          L ${barX + barW},${height}
          Z
        `)
        .attr('fill', d.color)
        .attr('filter', 'url(#barShadow)')
        .attr('opacity', hoveredItem && hoveredItem.id !== d.id ? 0.45 : 0.95)
        .transition()
        .duration(300)
        .attr('opacity', hoveredItem && hoveredItem.id !== d.id ? 0.45 : 1);

      // Value Label above bar
      const labelText = viewMode === 'total'
        ? (val >= 10000000 ? `₹${(val / 10000000).toFixed(2)}Cr` : `₹${(val / 100000).toFixed(1)}L`)
        : `₹${val.toLocaleString('en-IN')}`;

      barGroup.append('text')
        .attr('x', barX + barW / 2)
        .attr('y', barY - 8)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10.5px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-weight', '700')
        .attr('fill', d.color)
        .text(labelText);

      // Variance tag vs Circle Rate (only if not circle rate itself)
      if (d.id !== 'circle_rate' && valuation.circleRateValue > 0) {
        const circleRef = viewMode === 'total' ? valuation.circleRateValue : propertyData.circleRatePerSqFt;
        const diffPct = (((val - circleRef) / circleRef) * 100).toFixed(0);
        const sign = Number(diffPct) > 0 ? '+' : '';

        barGroup.append('text')
          .attr('x', barX + barW / 2)
          .attr('y', barY - 20)
          .attr('text-anchor', 'middle')
          .attr('font-size', '8.5px')
          .attr('font-family', 'Plus Jakarta Sans, sans-serif')
          .attr('font-weight', '600')
          .attr('fill', Number(diffPct) >= 0 ? '#10b981' : '#f43f5e')
          .text(`${sign}${diffPct}% vs Circle`);
      }
    });

  }, [benchmarks, viewMode, hoveredItem, valuation, propertyData]);

  // Calculations for quick highlight comparison
  const spreadVsCircle = valuation.circleRateDifferencePct;
  const spreadVsMarket = localMarketAverageTotal > 0
    ? Number((((valuation.fairMarketValue - localMarketAverageTotal) / localMarketAverageTotal) * 100).toFixed(1))
    : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs">
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              D3 Valuation Benchmark Comparison & Circle Rate Analysis
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visual comparison of certified FMV against local micro-market average, statutory circle rates, and alternative appraisal approaches.
          </p>
        </div>

        {/* Toggle: Total Consideration (₹) vs Rate per Sq. Ft (₹) */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('total')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'total'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Total Value (₹)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('rate')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'rate'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Rate / Sq. Ft (₹)
          </button>
        </div>
      </div>

      {/* D3.js SVG Canvas */}
      <div className="w-full overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox="0 0 720 310"
          className="w-full h-[260px] sm:h-[300px] select-none block"
        />
      </div>

      {/* Dynamic Hover Tooltip / Detail Callout */}
      {hoveredItem ? (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex items-start gap-2.5 transition-all">
          <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">
                {hoveredItem.label}
              </span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {formatINR(hoveredItem.totalValue)} (₹{hoveredItem.ratePerSqFt.toLocaleString('en-IN')}/sq ft)
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              {hoveredItem.description}
            </p>
          </div>
        </div>
      ) : (
        /* Statistical Highlights Strip */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
              Circle Rate Premium
            </span>
            <span className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400">
              {spreadVsCircle > 0 ? `+${spreadVsCircle}%` : `${spreadVsCircle}%`}
            </span>
            <span className="text-[10px] text-slate-500 block">
              Above statutory registration baseline
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
              Market Comparable Spread
            </span>
            <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {spreadVsMarket >= 0 ? `+${spreadVsMarket}%` : `${spreadVsMarket}%`}
            </span>
            <span className="text-[10px] text-slate-500 block">
              Relative to locality average transactions
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
              Quick-Sale Liquidity Margin
            </span>
            <span className="text-base font-bold font-mono text-rose-600 dark:text-rose-400">
              -15.0% Markdown
            </span>
            <span className="text-[10px] text-slate-500 block">
              {formatINR(valuation.quickSaleValue)} for 30-day exit
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
