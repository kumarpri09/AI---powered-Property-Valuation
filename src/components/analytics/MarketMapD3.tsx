import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CityMapRegion, LocalityTrend } from '../../data/marketTrendsData';
import { ZoomIn, ZoomOut, RotateCcw, MapPin, Compass } from 'lucide-react';

export type MapOverlayMetric = 'appreciation' | 'demand' | 'price' | 'yield';

interface MarketMapD3Props {
  region: CityMapRegion;
  selectedLocality: LocalityTrend | null;
  onSelectLocality: (locality: LocalityTrend) => void;
  overlayMetric: MapOverlayMetric;
}

export const MarketMapD3: React.FC<MarketMapD3Props> = ({
  region,
  selectedLocality,
  onSelectLocality,
  overlayMetric,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Color scales based on metric
  const getColor = (locality: LocalityTrend) => {
    if (overlayMetric === 'appreciation') {
      // 6% to 15% CAGR
      const scale = d3.scaleSequential(d3.interpolateViridis)
        .domain([6.0, 15.0]);
      return scale(locality.appreciationRate5YrCAGR);
    }
    if (overlayMetric === 'demand') {
      // 70 to 100 score
      const scale = d3.scaleSequential(d3.interpolatePlasma)
        .domain([70, 100]);
      return scale(locality.demandScore);
    }
    if (overlayMetric === 'yield') {
      // 3% to 8.5%
      const scale = d3.scaleSequential(d3.interpolateTurbo)
        .domain([3.0, 8.5]);
      return scale(locality.rentalYield);
    }
    // Price
    const scale = d3.scaleSequential(d3.interpolateCool)
      .domain([3000, 60000]);
    return scale(locality.currentRatePerSqFt);
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 520;

    // Clear previous contents
    svg.selectAll('*').remove();

    // Create main zoomable group
    const g = svg.append('g').attr('class', 'map-content');

    // Define Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 4])
      .translateExtent([[ -100, -100 ], [ width + 100, height + 100 ]])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Defs for gradients, dropshadow, and glowing rings
    const defs = svg.append('defs');

    // Filter for glowing pulse
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Soft Map background
    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent');

    // Subtle Grid pattern
    const gridG = g.append('g').attr('class', 'grid-lines').attr('opacity', 0.25);
    for (let x = 40; x < width; x += 60) {
      gridG.append('line')
        .attr('x1', x).attr('y1', 20)
        .attr('x2', x).attr('y2', height - 20)
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 0.5)
        .attr('stroke-dasharray', '2,4');
    }
    for (let y = 40; y < height; y += 60) {
      gridG.append('line')
        .attr('x1', 20).attr('y1', y)
        .attr('x2', width - 20).attr('y2', y)
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 0.5)
        .attr('stroke-dasharray', '2,4');
    }

    // Water bodies
    if (region.waterBodies && region.waterBodies.length > 0) {
      const waterG = g.append('g').attr('class', 'water-bodies');
      region.waterBodies.forEach((wb) => {
        waterG.append('path')
          .attr('d', wb.path)
          .attr('fill', '#0284c7')
          .attr('fill-opacity', 0.18)
          .attr('stroke', '#38bdf8')
          .attr('stroke-opacity', 0.4)
          .attr('stroke-width', 1.5);
      });
    }

    // Transit Corridors (Metros & Expressways)
    const transitG = g.append('g').attr('class', 'transit-corridors');
    region.transitCorridors.forEach((tc) => {
      // Glow underlay
      transitG.append('path')
        .attr('d', tc.path)
        .attr('fill', 'none')
        .attr('stroke', tc.type === 'metro' ? '#6366f1' : tc.type === 'expressway' ? '#f59e0b' : '#10b981')
        .attr('stroke-width', tc.type === 'expressway' ? 5 : 3.5)
        .attr('stroke-opacity', 0.25)
        .attr('stroke-linecap', 'round');

      // Core line
      transitG.append('path')
        .attr('d', tc.path)
        .attr('fill', 'none')
        .attr('stroke', tc.type === 'metro' ? '#6366f1' : tc.type === 'expressway' ? '#f59e0b' : '#10b981')
        .attr('stroke-width', tc.type === 'expressway' ? 2 : 1.5)
        .attr('stroke-dasharray', tc.type === 'metro' ? '6,4' : 'none')
        .attr('stroke-linecap', 'round');
    });

    // Locality Nodes Group
    const nodesG = g.append('g').attr('class', 'locality-nodes');

    // Tooltip selection
    const tooltip = d3.select('#d3-map-tooltip');

    region.localities.forEach((loc) => {
      const isSelected = selectedLocality?.id === loc.id;
      const nodeColor = getColor(loc);

      const node = nodesG.append('g')
        .attr('class', `locality-node cursor-pointer`)
        .attr('transform', `translate(${loc.mapCoords.x}, ${loc.mapCoords.y})`)
        .on('click', () => onSelectLocality(loc))
        .on('mouseenter', (event) => {
          tooltip.style('opacity', '1')
            .style('left', `${event.pageX + 15}px`)
            .style('top', `${event.pageY - 20}px`)
            .html(`
              <div class="font-bold text-xs text-white">${loc.name}</div>
              <div class="text-[11px] text-slate-300">${loc.subRegion}</div>
              <div class="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-700 text-[10px] font-mono">
                <div>Rate: <span class="text-indigo-300 font-bold">₹${loc.currentRatePerSqFt.toLocaleString('en-IN')}/sq ft</span></div>
                <div>5Y CAGR: <span class="text-emerald-400 font-bold">+${loc.appreciationRate5YrCAGR}%</span></div>
                <div>Demand Score: <span class="text-amber-300 font-bold">${loc.demandScore}/100</span></div>
                <div>Absorption: <span class="text-white">${loc.inventoryAbsorptionDays} days</span></div>
              </div>
            `);
        })
        .on('mousemove', (event) => {
          tooltip
            .style('left', `${event.pageX + 15}px`)
            .style('top', `${event.pageY - 20}px`);
        })
        .on('mouseleave', () => {
          tooltip.style('opacity', '0');
        });

      // Ambient ripple halo for demand level
      if (loc.demandLevel === 'Ultra-High') {
        node.append('circle')
          .attr('r', isSelected ? 30 : 22)
          .attr('fill', nodeColor)
          .attr('fill-opacity', 0.12)
          .attr('stroke', nodeColor)
          .attr('stroke-opacity', 0.3)
          .attr('stroke-width', 1);
      }

      // Outer Selection Ring
      if (isSelected) {
        node.append('circle')
          .attr('r', 20)
          .attr('fill', 'none')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2.5)
          .attr('stroke-dasharray', '4,2')
          .attr('filter', 'url(#glow)');
      }

      // Main Node Disc
      node.append('circle')
        .attr('r', isSelected ? 14 : 11)
        .attr('fill', nodeColor)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .attr('filter', isSelected ? 'url(#glow)' : 'none');

      // Inner center dot
      node.append('circle')
        .attr('r', 4)
        .attr('fill', '#ffffff');

      // Metric Badge / Label
      const labelText = overlayMetric === 'appreciation'
        ? `+${loc.appreciationRate5YrCAGR}%`
        : overlayMetric === 'demand'
        ? `${loc.demandScore}`
        : overlayMetric === 'yield'
        ? `${loc.rentalYield}%`
        : `₹${(loc.currentRatePerSqFt / 1000).toFixed(0)}k`;

      // Label background pill
      const labelG = node.append('g').attr('transform', 'translate(0, 24)');
      
      labelG.append('text')
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .attr('font-family', 'Plus Jakarta Sans, sans-serif')
        .attr('fill', isSelected ? '#4f46e5' : '#334155')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 3)
        .attr('paint-order', 'stroke')
        .text(loc.name.split('&')[0].trim());

      labelG.append('text')
        .attr('y', 13)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('fill', nodeColor)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .attr('paint-order', 'stroke')
        .text(labelText);
    });

  }, [region, selectedLocality, overlayMetric]);

  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.7);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(400).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-inner">
      {/* Map Header Status Bar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
        <span className="font-semibold text-white">{region.title}</span>
        <span className="text-slate-500">·</span>
        <span className="text-emerald-400 font-mono font-medium">Avg CAGR +{region.avgCAGR}%</span>
      </div>

      {/* Floating Zoom & Reset Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-md">
        <button
          onClick={handleZoomIn}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Reset map view"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
        <div className="font-semibold text-white flex items-center gap-1.5">
          <Compass className="w-3 h-3 text-indigo-400" />
          <span>Active Metric: {overlayMetric.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-indigo-500 inline-block" />
            <span>Metro Line</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-amber-500 inline-block" />
            <span>Expressway</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Locality Node</span>
          </div>
        </div>
      </div>

      {/* D3 SVG Viewport */}
      <svg
        ref={svgRef}
        viewBox="0 0 800 520"
        className="w-full h-[400px] sm:h-[480px] lg:h-[520px] select-none block"
      />

      {/* Shared Tooltip for D3 Hover */}
      <div
        id="d3-map-tooltip"
        className="fixed z-50 pointer-events-none p-3 bg-slate-950/95 text-white rounded-xl border border-slate-700 shadow-2xl transition-opacity duration-150 opacity-0 max-w-xs"
      />
    </div>
  );
};
