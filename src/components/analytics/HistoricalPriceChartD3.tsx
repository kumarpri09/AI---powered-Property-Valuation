import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { LocalityTrend, HistoricalDataPoint } from '../../data/marketTrendsData';
import { formatINR } from '../../utils/valuationEngine';
import { TrendingUp, BarChart2, DollarSign, Percent } from 'lucide-react';

export type ChartMetricMode = 'rate' | 'index' | 'volume' | 'yield';

interface HistoricalPriceChartD3Props {
  locality: LocalityTrend;
}

export const HistoricalPriceChartD3: React.FC<HistoricalPriceChartD3Props> = ({
  locality,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [metricMode, setMetricMode] = useState<ChartMetricMode>('rate');

  const series = locality.historicalSeries;

  useEffect(() => {
    if (!svgRef.current || !series || series.length === 0) return;

    const svg = d3.select(svgRef.current);
    const containerWidth = 720;
    const containerHeight = 360;
    const margin = { top: 30, right: 30, bottom: 45, left: 65 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Defs for gradient
    const defs = svg.append('defs');
    const areaGradient = defs.append('linearGradient')
      .attr('id', 'priceAreaGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');

    const primaryColor = metricMode === 'rate'
      ? '#6366f1' // indigo
      : metricMode === 'index'
      ? '#10b981' // emerald
      : metricMode === 'volume'
      ? '#f59e0b' // amber
      : '#06b6d4'; // cyan

    areaGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', primaryColor)
      .attr('stop-opacity', 0.4);

    areaGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', primaryColor)
      .attr('stop-opacity', 0.02);

    // X scale (Year 2018 to 2026)
    const xScale = d3.scaleLinear()
      .domain([d3.min(series, (d) => d.year) || 2018, d3.max(series, (d) => d.year) || 2026])
      .range([0, width]);

    // Y scale based on metricMode
    let yDomain: [number, number] = [0, 100];
    if (metricMode === 'rate') {
      const minVal = (d3.min(series, (d) => Math.min(d.marketRatePerSqFt, d.circleRatePerSqFt)) || 2000) * 0.9;
      const maxVal = (d3.max(series, (d) => d.marketRatePerSqFt) || 50000) * 1.1;
      yDomain = [minVal, maxVal];
    } else if (metricMode === 'index') {
      const minVal = 90;
      const maxVal = (d3.max(series, (d) => d.priceIndex) || 200) * 1.08;
      yDomain = [minVal, maxVal];
    } else if (metricMode === 'volume') {
      const maxVal = (d3.max(series, (d) => d.transactionVolume) || 1000) * 1.2;
      yDomain = [0, maxVal];
    } else {
      // yield
      const minVal = Math.max(0, (d3.min(series, (d) => d.rentalYield) || 2.5) - 0.5);
      const maxVal = (d3.max(series, (d) => d.rentalYield) || 8) + 0.8;
      yDomain = [minVal, maxVal];
    }

    const yScale = d3.scaleLinear().domain(yDomain).range([height, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .attr('stroke', '#cbd5e1')
      .attr('stroke-opacity', 0.15);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(series.length)
          .tickFormat((d) => d.toString())
      )
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '11px')
      .attr('color', '#64748b');

    // Y Axis
    g.append('g')
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickFormat((d) => {
            const num = Number(d);
            if (metricMode === 'rate') {
              if (num >= 1000) return `₹${(num / 1000).toFixed(0)}k`;
              return `₹${num}`;
            }
            if (metricMode === 'index') return `${num.toFixed(0)}`;
            if (metricMode === 'volume') return `${num}`;
            return `${num.toFixed(1)}%`;
          })
      )
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '11px')
      .attr('color', '#64748b');

    // Value getter
    const getValue = (d: HistoricalDataPoint) => {
      if (metricMode === 'rate') return d.marketRatePerSqFt;
      if (metricMode === 'index') return d.priceIndex;
      if (metricMode === 'volume') return d.transactionVolume;
      return d.rentalYield;
    };

    // Area Generator
    const area = d3.area<HistoricalDataPoint>()
      .x((d) => xScale(d.year))
      .y0(height)
      .y1((d) => yScale(getValue(d)))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(series)
      .attr('fill', 'url(#priceAreaGradient)')
      .attr('d', area);

    // Primary Line
    const line = d3.line<HistoricalDataPoint>()
      .x((d) => xScale(d.year))
      .y((d) => yScale(getValue(d)))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(series)
      .attr('fill', 'none')
      .attr('stroke', primaryColor)
      .attr('stroke-width', 2.8)
      .attr('d', line);

    // If Rate mode, also draw Circle Rate benchmark line
    if (metricMode === 'rate') {
      const circleLine = d3.line<HistoricalDataPoint>()
        .x((d) => xScale(d.year))
        .y((d) => yScale(d.circleRatePerSqFt))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(series)
        .attr('fill', 'none')
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 1.8)
        .attr('stroke-dasharray', '4,4')
        .attr('d', circleLine);
    }

    // Interactive Data Points
    const dotsG = g.append('g').attr('class', 'dots');
    series.forEach((d) => {
      dotsG.append('circle')
        .attr('cx', xScale(d.year))
        .attr('cy', yScale(getValue(d)))
        .attr('r', 4.5)
        .attr('fill', primaryColor)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2);
    });

    // Crosshair and Interactive Tooltip Overlay
    const focusG = g.append('g').attr('class', 'focus').style('display', 'none');

    // Vertical line
    const focusLine = focusG.append('line')
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    // Active circle
    const focusCircle = focusG.append('circle')
      .attr('r', 6)
      .attr('fill', primaryColor)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    // Tooltip popup group inside SVG
    const tooltipBox = focusG.append('g').attr('class', 'tooltip-box');
    tooltipBox.append('rect')
      .attr('width', 150)
      .attr('height', 62)
      .attr('rx', 8)
      .attr('fill', '#090d16')
      .attr('stroke', '#334155')
      .attr('stroke-width', 1);

    const tooltipYear = tooltipBox.append('text')
      .attr('x', 10).attr('y', 18)
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .attr('fill', '#ffffff');

    const tooltipValue = tooltipBox.append('text')
      .attr('x', 10).attr('y', 36)
      .attr('font-size', '12px')
      .attr('font-weight', '800')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', primaryColor);

    const tooltipSub = tooltipBox.append('text')
      .attr('x', 10).attr('y', 52)
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', '#94a3b8');

    // Invisible overlay for capturing mousemove
    const bisectYear = d3.bisector((d: HistoricalDataPoint) => d.year).center;

    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .on('mouseenter', () => focusG.style('display', null))
      .on('mouseleave', () => focusG.style('display', 'none'))
      .on('mousemove', function (event) {
        const [mx] = d3.pointer(event);
        const yearVal = xScale.invert(mx);
        const idx = bisectYear(series, yearVal);
        const point = series[idx];
        if (!point) return;

        const xPos = xScale(point.year);
        const yPos = yScale(getValue(point));

        focusLine.attr('x1', xPos).attr('x2', xPos);
        focusCircle.attr('cx', xPos).attr('cy', yPos);

        tooltipYear.text(`Calendar Year ${point.year}`);

        if (metricMode === 'rate') {
          tooltipValue.text(`₹${point.marketRatePerSqFt.toLocaleString('en-IN')}/sq ft`);
          tooltipSub.text(`Circle: ₹${point.circleRatePerSqFt.toLocaleString('en-IN')} (YoY +${point.yoyGrowth}%)`);
        } else if (metricMode === 'index') {
          tooltipValue.text(`Index: ${point.priceIndex.toFixed(1)} pts`);
          tooltipSub.text(`YoY Gain: +${point.yoyGrowth}% vs prev yr`);
        } else if (metricMode === 'volume') {
          tooltipValue.text(`${point.transactionVolume} Sales`);
          tooltipSub.text(`Market Liquidity: Healthy`);
        } else {
          tooltipValue.text(`Gross Yield: ${point.rentalYield}%`);
          tooltipSub.text(`Rate: ₹${point.marketRatePerSqFt.toLocaleString('en-IN')}/sq ft`);
        }

        // Keep tooltip inside chart boundaries
        const tooltipX = xPos > width - 160 ? xPos - 160 : xPos + 10;
        const tooltipY = Math.max(10, Math.min(height - 70, yPos - 30));
        tooltipBox.attr('transform', `translate(${tooltipX}, ${tooltipY})`);
      });

  }, [locality, series, metricMode]);

  // Overall metric stats calculations
  const firstPoint = series[0];
  const lastPoint = series[series.length - 1];
  const totalGainPct = firstPoint && lastPoint
    ? (((lastPoint.marketRatePerSqFt - firstPoint.marketRatePerSqFt) / firstPoint.marketRatePerSqFt) * 100).toFixed(1)
    : '0';

  const peakYear = series.reduce((max, curr) => (curr.yoyGrowth > max.yoyGrowth ? curr : max), series[0]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
      {/* Top Header & Metric Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Historical Price Index & Valuation Trajectory (2018 – 2026)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Micro-market dataset for <strong className="text-slate-700 dark:text-slate-300">{locality.name}</strong> ({locality.subRegion})
          </p>
        </div>

        {/* Segmented Metric Switcher */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setMetricMode('rate')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              metricMode === 'rate'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            ₹/Sq. Ft
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('index')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              metricMode === 'index'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Price Index (100)
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('volume')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              metricMode === 'volume'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Sales Volume
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('yield')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              metricMode === 'yield'
                ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Rental Yield %
          </button>
        </div>
      </div>

      {/* D3 Responsive SVG Container */}
      <div className="w-full overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox="0 0 720 360"
          className="w-full h-[280px] sm:h-[340px] select-none block"
        />
      </div>

      {/* Mode Subtext Legend */}
      {metricMode === 'rate' && (
        <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-indigo-600 inline-block" />
            <span>Market Selling Rate (₹/sq ft)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 border-b border-dashed border-slate-400 inline-block" />
            <span>Official Circle Rate Benchmark</span>
          </div>
        </div>
      )}

      {/* Statistical Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">5-Year CAGR</span>
          <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
            +{locality.appreciationRate5YrCAGR}%
          </span>
          <span className="text-[10px] text-slate-500 block">Compound Annual</span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">All-Time Gain</span>
          <span className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400">
            +{totalGainPct}%
          </span>
          <span className="text-[10px] text-slate-500 block">Since 2018 Baseline</span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Peak Surge Year</span>
          <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
            {peakYear ? `${peakYear.year} (+${peakYear.yoyGrowth}%)` : '2021'}
          </span>
          <span className="text-[10px] text-slate-500 block">Post-pandemic absorption</span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Market Liquidity</span>
          <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
            {locality.inventoryAbsorptionDays} Days
          </span>
          <span className="text-[10px] text-slate-500 block">Average selling window</span>
        </div>
      </div>
    </div>
  );
};
