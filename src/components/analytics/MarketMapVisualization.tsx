import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  REGIONAL_MARKET_TRENDS,
  LocalityTrend,
  CityMapRegion,
  HistoricalDataPoint,
} from '../../data/marketTrendsData';
import {
  Map,
  TrendingUp,
  Compass,
  Flame,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Calendar,
  Building2,
  Clock,
  Download,
  CheckCircle2,
  AlertTriangle,
  Info,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

export type MapOverlayMetric = 'demand' | 'appreciation' | 'price' | 'yield';
export type ChartMetricMode = 'index' | 'rate' | 'growth' | 'volume';

export interface MarketMapVisualizationProps {
  initialCity?: 'Delhi' | 'Mumbai' | 'Bengaluru' | 'Hyderabad' | 'Chennai' | 'Jaipur';
  onApplyLocalityToStudio?: (locality: LocalityTrend) => void;
  className?: string;
}

export const MarketMapVisualization: React.FC<MarketMapVisualizationProps> = ({
  initialCity = 'Delhi',
  onApplyLocalityToStudio,
  className = '',
}) => {
  // State
  const [selectedCityId, setSelectedCityId] = useState<string>(initialCity);
  const [overlayMetric, setOverlayMetric] = useState<MapOverlayMetric>('appreciation');
  const [chartMetric, setChartMetric] = useState<ChartMetricMode>('index');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'All' | 'Residential' | 'Commercial' | 'Mixed-Use'>('All');
  const [isFetchingTrend, setIsFetchingTrend] = useState(false);

  // Active region data
  const currentRegion: CityMapRegion = useMemo(() => {
    return REGIONAL_MARKET_TRENDS[selectedCityId] || REGIONAL_MARKET_TRENDS['Delhi'];
  }, [selectedCityId]);

  // Selected locality
  const [selectedLocality, setSelectedLocality] = useState<LocalityTrend>(() => {
    return currentRegion.localities[0];
  });

  // Hovered data point in chart
  const [hoveredDataPoint, setHoveredDataPoint] = useState<HistoricalDataPoint | null>(null);

  // Refs for D3 visualizations
  const mapSvgRef = useRef<SVGSVGElement | null>(null);
  const chartSvgRef = useRef<SVGSVGElement | null>(null);
  const mapZoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Filtered localities based on search query and category
  const filteredLocalities = useMemo(() => {
    return currentRegion.localities.filter((loc) => {
      const matchesSearch =
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.subRegion.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || loc.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [currentRegion, searchQuery, filterCategory]);

  // Handle City Switch
  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    setSearchQuery('');
    const newRegion = REGIONAL_MARKET_TRENDS[cityId];
    if (newRegion && newRegion.localities.length > 0) {
      handleSelectLocality(newRegion.localities[0]);
    }
  };

  // Handle locality selection with micro-interaction fetch
  const handleSelectLocality = (locality: LocalityTrend) => {
    if (locality.id === selectedLocality.id) return;
    setIsFetchingTrend(true);
    // Simulate high-speed micro-market telemetry fetch
    setTimeout(() => {
      setSelectedLocality(locality);
      setIsFetchingTrend(false);
    }, 280);
  };

  // Color scale for Map based on overlayMetric
  const getMetricColor = (locality: LocalityTrend) => {
    if (overlayMetric === 'appreciation') {
      // 6.0% to 15.0% CAGR
      const scale = d3.scaleSequential(d3.interpolateViridis).domain([6.0, 15.0]);
      return scale(locality.appreciationRate5YrCAGR);
    }
    if (overlayMetric === 'demand') {
      // 70 to 100 Demand Score
      const scale = d3.scaleSequential(d3.interpolatePlasma).domain([70, 100]);
      return scale(locality.demandScore);
    }
    if (overlayMetric === 'yield') {
      // 3.0% to 8.5%
      const scale = d3.scaleSequential(d3.interpolateTurbo).domain([3.0, 8.5]);
      return scale(locality.rentalYield);
    }
    // Price / sq ft: 3,000 to 55,000
    const scale = d3.scaleSequential(d3.interpolateCool).domain([3000, 55000]);
    return scale(locality.currentRatePerSqFt);
  };

  // ==========================================
  // D3 ENGINE 1: INTERACTIVE REGIONAL MAP
  // ==========================================
  useEffect(() => {
    if (!mapSvgRef.current) return;

    const svg = d3.select(mapSvgRef.current);
    const width = 800;
    const height = 520;

    // Reset SVG elements
    svg.selectAll('*').remove();

    // Defs for filters and gradients
    const defs = svg.append('defs');

    // Glow filter
    const filter = defs.append('filter').attr('id', 'glow-effect').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Background Grid Pattern
    const pattern = defs
      .append('pattern')
      .attr('id', 'map-grid-pattern')
      .attr('width', 40)
      .attr('height', 40)
      .attr('patternUnits', 'userSpaceOnUse');

    pattern
      .append('path')
      .attr('d', 'M 40 0 L 0 0 0 40')
      .attr('fill', 'none')
      .attr('stroke', 'currentColor')
      .attr('stroke-width', 0.5)
      .attr('stroke-opacity', 0.08);

    // Main map container group for zoom/pan
    const g = svg.append('g').attr('class', 'map-viewport-group');

    // Background rect
    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#map-grid-pattern)')
      .attr('class', 'text-slate-400 dark:text-slate-600');

    // Render Water Bodies
    if (currentRegion.waterBodies && currentRegion.waterBodies.length > 0) {
      const waterGroup = g.append('g').attr('class', 'water-bodies-layer');
      currentRegion.waterBodies.forEach((water) => {
        waterGroup
          .append('path')
          .attr('d', water.path)
          .attr('fill', '#0284c7')
          .attr('fill-opacity', 0.16)
          .attr('stroke', '#38bdf8')
          .attr('stroke-width', 1.2)
          .attr('stroke-opacity', 0.35);

        // Water label
        waterGroup
          .append('text')
          .attr('x', 200)
          .attr('y', 485)
          .attr('font-size', '10px')
          .attr('font-weight', '600')
          .attr('fill', '#38bdf8')
          .attr('fill-opacity', 0.7)
          .attr('letter-spacing', '2px')
          .text(water.name.toUpperCase());
      });
    }

    // Render Transit Corridors (Metros & Expressways)
    const transitGroup = g.append('g').attr('class', 'transit-corridors-layer');
    currentRegion.transitCorridors.forEach((transit) => {
      const isMetro = transit.type === 'metro';
      transitGroup
        .append('path')
        .attr('d', transit.path)
        .attr('fill', 'none')
        .attr('stroke', isMetro ? '#6366f1' : '#f59e0b')
        .attr('stroke-width', isMetro ? 2.8 : 3.4)
        .attr('stroke-dasharray', isMetro ? '6,3' : 'none')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-linecap', 'round');
    });

    // Render Demand Density Aura Layers (Heat effect around localities)
    const heatGroup = g.append('g').attr('class', 'heat-aura-layer');
    currentRegion.localities.forEach((loc) => {
      const color = getMetricColor(loc);
      const intensityRadius =
        overlayMetric === 'demand'
          ? (loc.demandScore / 100) * 58
          : overlayMetric === 'appreciation'
          ? (loc.appreciationRate5YrCAGR / 15) * 55
          : 45;

      const radialGradId = `aura-grad-${loc.id}`;
      const grad = defs.append('radialGradient').attr('id', radialGradId);
      grad.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.45);
      grad.append('stop').attr('offset', '60%').attr('stop-color', color).attr('stop-opacity', 0.15);
      grad.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0);

      heatGroup
        .append('circle')
        .attr('cx', loc.mapCoords.x)
        .attr('cy', loc.mapCoords.y)
        .attr('r', intensityRadius)
        .attr('fill', `url(#${radialGradId})`)
        .attr('pointer-events', 'none');
    });

    // Render Locality Nodes
    const nodesGroup = g.append('g').attr('class', 'locality-nodes-layer');

    currentRegion.localities.forEach((loc) => {
      const isSelected = selectedLocality && selectedLocality.id === loc.id;
      const isMatch = filteredLocalities.some((fl) => fl.id === loc.id);
      const color = getMetricColor(loc);

      const nodeG = nodesGroup
        .append('g')
        .attr('class', `locality-node cursor-pointer transition-opacity duration-200`)
        .attr('transform', `translate(${loc.mapCoords.x}, ${loc.mapCoords.y})`)
        .attr('opacity', isMatch ? 1 : 0.25)
        .on('click', () => {
          handleSelectLocality(loc);
        });

      // Pulse ring for ultra-high demand localities or selected
      if (isSelected || loc.demandLevel === 'Ultra-High') {
        nodeG
          .append('circle')
          .attr('r', isSelected ? 22 : 16)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', isSelected ? 2.5 : 1.5)
          .attr('stroke-opacity', isSelected ? 0.9 : 0.5)
          .attr('class', 'animate-ping origin-center')
          .attr('style', 'animation-duration: 2.5s;');
      }

      // Outer Selection Ring
      if (isSelected) {
        nodeG
          .append('circle')
          .attr('r', 18)
          .attr('fill', 'none')
          .attr('stroke', '#6366f1')
          .attr('stroke-width', 2.5)
          .attr('stroke-dasharray', '4,2')
          .attr('filter', 'url(#glow-effect)');
      }

      // Base marker circle
      nodeG
        .append('circle')
        .attr('r', isSelected ? 12 : 9)
        .attr('fill', color)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .attr('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))');

      // Inner dot
      nodeG
        .append('circle')
        .attr('r', isSelected ? 4 : 3)
        .attr('fill', '#ffffff');

      // Locality Name Label Badge
      const labelG = nodeG
        .append('g')
        .attr('transform', `translate(0, ${isSelected ? 24 : 18})`);

      const text = labelG
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('font-size', isSelected ? '12px' : '10.5px')
        .attr('font-weight', isSelected ? '700' : '600')
        .attr('fill', isSelected ? '#4f46e5' : 'currentColor')
        .attr('class', isSelected ? 'dark:fill-indigo-400 font-bold' : 'text-slate-800 dark:text-slate-200')
        .text(loc.name);

      // Metric Badge below name
      let metricText = '';
      if (overlayMetric === 'appreciation') metricText = `+${loc.appreciationRate5YrCAGR}% 5Y`;
      else if (overlayMetric === 'demand') metricText = `${loc.demandScore}/100`;
      else if (overlayMetric === 'yield') metricText = `${loc.rentalYield}% Yield`;
      else metricText = `₹${(loc.currentRatePerSqFt / 1000).toFixed(1)}k/sqft`;

      labelG
        .append('text')
        .attr('y', 12)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9.5px')
        .attr('font-weight', '600')
        .attr('fill', color)
        .attr('class', 'font-mono')
        .text(metricText);
    });

    // Zoom and Pan configuration
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 3.5])
      .translateExtent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    mapZoomBehaviorRef.current = zoomBehavior;
    svg.call(zoomBehavior);

  }, [currentRegion, selectedLocality, overlayMetric, filteredLocalities]);

  // Zoom control handlers
  const handleZoomIn = () => {
    if (!mapSvgRef.current || !mapZoomBehaviorRef.current) return;
    d3.select(mapSvgRef.current).transition().duration(300).call(mapZoomBehaviorRef.current.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!mapSvgRef.current || !mapZoomBehaviorRef.current) return;
    d3.select(mapSvgRef.current).transition().duration(300).call(mapZoomBehaviorRef.current.scaleBy, 0.77);
  };

  const handleResetZoom = () => {
    if (!mapSvgRef.current || !mapZoomBehaviorRef.current) return;
    d3.select(mapSvgRef.current).transition().duration(400).call(mapZoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  // ==========================================
  // D3 ENGINE 2: INTERACTIVE HISTORICAL CHART
  // ==========================================
  useEffect(() => {
    if (!chartSvgRef.current || !selectedLocality) return;

    const svg = d3.select(chartSvgRef.current);
    const containerWidth = chartSvgRef.current.clientWidth || 580;
    const height = 260;
    const margin = { top: 20, right: 30, bottom: 35, left: 55 };

    svg.selectAll('*').remove();

    const data = selectedLocality.historicalSeries;
    if (!data || data.length === 0) return;

    const innerWidth = containerWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.year) as [number, number])
      .range([0, innerWidth]);

    // Determine Y Scale based on chartMetric
    let yValueFn: (d: HistoricalDataPoint) => number;
    let yFormatFn: (val: number) => string;
    let strokeColor = '#6366f1';
    let areaGradientId = 'chart-area-grad';

    if (chartMetric === 'index') {
      yValueFn = (d) => d.priceIndex;
      yFormatFn = (v) => `${v}`;
      strokeColor = '#6366f1'; // Indigo
    } else if (chartMetric === 'rate') {
      yValueFn = (d) => d.marketRatePerSqFt;
      yFormatFn = (v) => `₹${(v / 1000).toFixed(0)}k`;
      strokeColor = '#10b981'; // Emerald
    } else if (chartMetric === 'growth') {
      yValueFn = (d) => d.yoyGrowth;
      yFormatFn = (v) => `${v}%`;
      strokeColor = '#f59e0b'; // Amber
    } else {
      // volume
      yValueFn = (d) => d.transactionVolume;
      yFormatFn = (v) => `${v}`;
      strokeColor = '#06b6d4'; // Cyan
    }

    const yMin = d3.min(data, yValueFn) || 0;
    const yMax = d3.max(data, yValueFn) || 100;
    const yPadding = (yMax - yMin) * 0.15 || 10;

    const yScale = d3
      .scaleLinear()
      .domain([Math.max(0, yMin - yPadding), yMax + yPadding])
      .range([innerHeight, 0]);

    // Defs & Gradients
    const defs = svg.append('defs');
    const areaGrad = defs
      .append('linearGradient')
      .attr('id', areaGradientId)
      .attr('x1', '0')
      .attr('y1', '0')
      .attr('x2', '0')
      .attr('y2', '1');

    areaGrad.append('stop').attr('offset', '0%').attr('stop-color', strokeColor).attr('stop-opacity', 0.35);
    areaGrad.append('stop').attr('offset', '100%').attr('stop-color', strokeColor).attr('stop-opacity', 0.0);

    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Gridlines
    const yAxisGrid = d3.axisLeft(yScale).ticks(5).tickSize(-innerWidth).tickFormat(() => '');
    g.append('g')
      .attr('class', 'grid text-slate-200 dark:text-slate-800')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-dasharray', '3,3');

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(data.length).tickFormat((d) => `${d}`);
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat((d) => yFormatFn(d as number));

    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis)
      .attr('class', 'text-xs text-slate-500 font-mono')
      .call((ax) => ax.select('.domain').attr('stroke', 'currentColor').attr('stroke-opacity', 0.3));

    g.append('g')
      .call(yAxis)
      .attr('class', 'text-xs text-slate-500 font-mono')
      .call((ax) => ax.select('.domain').remove());

    // Secondary Reference Line: Circle Rate if Rate Mode is selected
    if (chartMetric === 'rate') {
      const circleLine = d3
        .line<HistoricalDataPoint>()
        .x((d) => xScale(d.year))
        .y((d) => yScale(d.circleRatePerSqFt))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4')
        .attr('d', circleLine);
    }

    // Area generator
    const area = d3
      .area<HistoricalDataPoint>()
      .x((d) => xScale(d.year))
      .y0(innerHeight)
      .y1((d) => yScale(yValueFn(d)))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', `url(#${areaGradientId})`)
      .attr('d', area);

    // Line generator
    const line = d3
      .line<HistoricalDataPoint>()
      .x((d) => xScale(d.year))
      .y((d) => yScale(yValueFn(d)))
      .curve(d3.curveMonotoneX);

    // Main line path with animated stroke
    const path = g
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', strokeColor)
      .attr('stroke-width', 2.8)
      .attr('d', line);

    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(750)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // Scatter dots
    g.selectAll('.data-dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'data-dot')
      .attr('cx', (d) => xScale(d.year))
      .attr('cy', (d) => yScale(yValueFn(d)))
      .attr('r', (d) => (hoveredDataPoint?.year === d.year ? 6 : 4))
      .attr('fill', strokeColor)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    // Interactive Overlay Crosshair
    const crosshairLine = g
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,3')
      .style('opacity', 0);

    const focusCircle = g
      .append('circle')
      .attr('r', 6)
      .attr('fill', strokeColor)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2.5)
      .style('opacity', 0);

    // Transparent mouse catch rect
    const bisectYear = d3.bisector<HistoricalDataPoint, number>((d) => d.year).left;

    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event);
        const yearVal = xScale.invert(mx);
        const index = bisectYear(data, yearVal);
        const d0 = data[index - 1];
        const d1 = data[index];
        let d = d0;
        if (d0 && d1) {
          d = yearVal - d0.year > d1.year - yearVal ? d1 : d0;
        } else if (d1) {
          d = d1;
        }

        if (d) {
          setHoveredDataPoint(d);
          const cx = xScale(d.year);
          const cy = yScale(yValueFn(d));

          crosshairLine.attr('x1', cx).attr('x2', cx).style('opacity', 0.8);
          focusCircle.attr('cx', cx).attr('cy', cy).style('opacity', 1);
        }
      })
      .on('mouseleave', () => {
        setHoveredDataPoint(null);
        crosshairLine.style('opacity', 0);
        focusCircle.style('opacity', 0);
      });

  }, [selectedLocality, chartMetric, hoveredDataPoint?.year]);

  // Export Locality Historical Data as CSV
  const handleExportCSV = () => {
    if (!selectedLocality) return;
    const rows = [
      ['Year', 'Price Index (Base 100)', 'Market Rate (INR/sq ft)', 'Circle Rate (INR/sq ft)', 'YoY Growth (%)', 'Rental Yield (%)', 'Transaction Volume Index'],
      ...selectedLocality.historicalSeries.map((h) => [
        h.year,
        h.priceIndex,
        h.marketRatePerSqFt,
        h.circleRatePerSqFt,
        h.yoyGrowth,
        h.rentalYield,
        h.transactionVolume,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedLocality.name}_Price_Index_Trends_${selectedCityId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const citiesList = Object.keys(REGIONAL_MARKET_TRENDS) as ('Delhi' | 'Mumbai' | 'Bengaluru' | 'Hyderabad' | 'Chennai' | 'Jaipur')[];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dashboard Top Control Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <Map className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                MarketMapVisualization: Regional Demand & Historical Price Trends
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Interactive D3 geospatial engine overlaying micro-market demand density, 5-year appreciation CAGR, and registered price index trajectories.
            </p>
          </div>

          {/* Metropolitan City Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {citiesList.map((cityKey) => {
              const isCurrent = selectedCityId === cityKey;
              return (
                <button
                  key={cityKey}
                  onClick={() => handleCityChange(cityKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cityKey}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters and Overlay Switcher Strip */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Overlay Metric Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Map Overlay:</span>
            </span>

            <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                onClick={() => setOverlayMetric('appreciation')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  overlayMetric === 'appreciation'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                5Y Appreciation CAGR
              </button>
              <button
                onClick={() => setOverlayMetric('demand')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  overlayMetric === 'demand'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Market Demand Score
              </button>
              <button
                onClick={() => setOverlayMetric('price')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  overlayMetric === 'price'
                    ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Price / Sq Ft
              </button>
              <button
                onClick={() => setOverlayMetric('yield')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  overlayMetric === 'yield'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Gross Rental Yield
              </button>
            </div>
          </div>

          {/* Search & Asset Category Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search micro-market..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-44"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="py-1 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="All">All Asset Classes</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Mixed-Use">Mixed-Use</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive D3 Map (Left) + Selected Locality Dashboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: D3 Regional Map (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {currentRegion.title}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  (Regional Index: {currentRegion.currentAvgIndex} · 5Y CAGR: +{currentRegion.avgCAGR}%)
                </span>
              </div>

              {/* Map Zoom Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetZoom}
                  title="Reset Map Pan & Zoom"
                  className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="mt-3 py-1.5 px-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Click any locality node to inspect registered historical price indices & demand velocity.</span>
              </span>
              <span className="text-[11px] font-mono text-indigo-500">Pan & scroll zoom active</span>
            </div>

            {/* Map Canvas */}
            <div className="relative mt-3 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-900 select-none">
              <svg
                ref={mapSvgRef}
                viewBox="0 0 800 520"
                className="w-full h-auto max-h-[500px] block cursor-grab active:cursor-grabbing"
              />

              {/* Transit Legend Overlay */}
              <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 text-[11px] text-slate-300 space-y-1.5 shadow-lg">
                <div className="font-semibold text-white text-[10px] uppercase tracking-wider">Map Legend</div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-indigo-400 border-t border-dashed border-indigo-400" />
                  <span>Operational Metro Line</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-amber-400" />
                  <span>Expressway / Arterial</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                  <span>Locality Appraisal Hub</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Locality Switcher Carousel */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 block mb-2">
              Locality Index Quick-Select ({filteredLocalities.length}):
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {filteredLocalities.map((loc) => {
                const isSelected = selectedLocality && selectedLocality.id === loc.id;
                return (
                  <button
                    key={loc.id}
                    onClick={() => handleSelectLocality(loc)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{loc.name}</span>
                    <span className="text-[10px] opacity-75 font-mono">+{loc.appreciationRate5YrCAGR}%</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Interactive Historical Price Index & Insights Dashboard (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Active Locality Card with Live Fetch Status */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs relative overflow-hidden">
            {isFetchingTrend && (
              <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs flex items-center justify-center z-20">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Loading registered price index data...</span>
                </div>
              </div>
            )}

            {/* Header info */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedLocality.name}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {selectedLocality.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedLocality.subRegion}, {selectedLocality.city}
                </p>
              </div>

              {/* Demand Level Badge */}
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-bold font-mono">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{selectedLocality.demandScore}/100</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5 uppercase tracking-wider font-semibold">
                  {selectedLocality.demandLevel} Demand
                </span>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Market Rate</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  ₹{selectedLocality.currentRatePerSqFt.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500 block">per sq ft</span>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Circle Rate</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  ₹{selectedLocality.currentCircleRate.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500 block">govt guideline</span>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">5Y CAGR</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+{selectedLocality.appreciationRate5YrCAGR}%</span>
                </span>
                <span className="text-[10px] text-slate-500 block">annualized</span>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rental Yield</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {selectedLocality.rentalYield}%
                </span>
                <span className="text-[10px] text-slate-500 block">gross annual</span>
              </div>
            </div>

            {/* D3 Historical Chart */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Historical Price Index (2018–2026)
                  </span>
                </div>

                {/* Metric Selector Tabs */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px]">
                  <button
                    onClick={() => setChartMetric('index')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                      chartMetric === 'index'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Index
                  </button>
                  <button
                    onClick={() => setChartMetric('rate')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                      chartMetric === 'rate'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Rate
                  </button>
                  <button
                    onClick={() => setChartMetric('growth')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                      chartMetric === 'growth'
                        ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    YoY %
                  </button>
                  <button
                    onClick={() => setChartMetric('volume')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                      chartMetric === 'volume'
                        ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Volume
                  </button>
                </div>
              </div>

              {/* Chart SVG Container */}
              <div className="w-full relative">
                <svg ref={chartSvgRef} className="w-full h-[260px] block" />

                {/* Hover inspection tooltip read-out */}
                {hoveredDataPoint && (
                  <div className="mt-2 p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">
                        Year {hoveredDataPoint.year}:
                      </span>
                      <span className="text-slate-500 ml-1.5">
                        Index: <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{hoveredDataPoint.priceIndex}</strong> (Base 100 in 2018)
                      </span>
                    </div>
                    <div className="font-mono text-slate-700 dark:text-slate-300">
                      Rate: ₹{hoveredDataPoint.marketRatePerSqFt.toLocaleString('en-IN')}/sq ft (YoY: +{hoveredDataPoint.yoyGrowth}%)
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Drivers & Risk Factors */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                <span className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1 mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Growth Drivers</span>
                </span>
                <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                  {selectedLocality.primaryDrivers.slice(0, 3).map((driver, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{driver}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                <span className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1 mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Risk & Supply Caution</span>
                </span>
                <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                  {selectedLocality.riskFactors.slice(0, 3).map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={handleExportCSV}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Index (CSV)</span>
              </button>

              {onApplyLocalityToStudio && (
                <button
                  onClick={() => onApplyLocalityToStudio(selectedLocality)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply to Valuation Studio</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketMapVisualization;
