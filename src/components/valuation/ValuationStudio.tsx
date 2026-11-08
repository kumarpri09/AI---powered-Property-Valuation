import React, { useState } from 'react';
import { PropertyData, ValuationOutput } from '../../types/property';
import { calculatePropertyValuation, formatINR } from '../../utils/valuationEngine';
import { INDIAN_CITIES_CIRCLE_DATA } from '../../data/circleRates';
import {
  MapPin,
  Layers,
  Building,
  FileCheck2,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Home,
  Briefcase
} from 'lucide-react';

interface ValuationStudioProps {
  propertyData: PropertyData;
  setPropertyData: React.Dispatch<React.SetStateAction<PropertyData>>;
  valuation: ValuationOutput;
  onViewReport: () => void;
  onSelectPreset: (presetId: string) => void;
  onExploreMarketTrends?: () => void;
}

export const ValuationStudio: React.FC<ValuationStudioProps> = ({
  propertyData,
  setPropertyData,
  valuation,
  onViewReport,
  onExploreMarketTrends,
}) => {
  const [activeSection, setActiveSection] = useState<string>('location');

  const updateField = <K extends keyof PropertyData>(field: K, value: PropertyData[K]) => {
    setPropertyData((prev) => {
      const next = { ...prev, [field]: value };
      // if city changes, auto-suggest circle rates
      if (field === 'city' && typeof value === 'string' && INDIAN_CITIES_CIRCLE_DATA[value]) {
        const cityData = INDIAN_CITIES_CIRCLE_DATA[value];
        next.cityTier = cityData.tier;
        if (cityData.localities.length > 0) {
          next.locality = cityData.localities[0].name;
          next.circleRatePerSqFt = cityData.localities[0].circleRatePerSqFt;
          next.comparableMarketRatePerSqFt = cityData.localities[0].averageMarketRatePerSqFt;
        }
      }
      return next;
    });
  };

  const toggleFacility = (facility: string) => {
    const list = propertyData.societyFacilities || [];
    if (list.includes(facility)) {
      updateField('societyFacilities', list.filter((f) => f !== facility));
    } else {
      updateField('societyFacilities', [...list, facility]);
    }
  };

  const toggleSecurity = (sec: string) => {
    const list = propertyData.securityInfrastructure || [];
    if (list.includes(sec)) {
      updateField('securityInfrastructure', list.filter((s) => s !== sec));
    } else {
      updateField('securityInfrastructure', [...list, sec]);
    }
  };

  const handleCategorySwitch = (category: 'residential' | 'commercial') => {
    setPropertyData((prev) => ({
      ...prev,
      propertyCategory: category,
      // sensible defaults when switching
      monthlyRent: category === 'commercial' ? 120000 : 35000,
      marketCapRate: category === 'commercial' ? 7.5 : 4.0,
      comparableMarketRatePerSqFt: category === 'commercial' ? 9500 : 7000,
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner: Asset Classification & Live Valuation Metric Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left Title and Category Selector */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={propertyData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-600 outline-none transition-colors"
                placeholder="Property Name / Valuation Title"
              />
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {propertyData.city}, {propertyData.cityTier}
              </span>
            </div>

            {/* Category Segmented Control */}
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => handleCategorySwitch('residential')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  propertyData.propertyCategory === 'residential'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-indigo-500" />
                <span>Residential Property</span>
              </button>
              <button
                type="button"
                onClick={() => handleCategorySwitch('commercial')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  propertyData.propertyCategory === 'commercial'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                <span>Commercial Property</span>
              </button>
            </div>
          </div>

          {/* Right Live Valuation Indicators Strip */}
          <div className="flex flex-wrap items-center gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
            <div className="text-right">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Estimated Fair Market Value (FMV)
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                {formatINR(valuation.fairMarketValue)}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Range: {formatINR(valuation.expectedPriceRange.conservative)} – {formatINR(valuation.expectedPriceRange.optimistic)}
              </span>
            </div>

            <div className="h-10 w-px bg-slate-200 dark:border-slate-800 hidden sm:block" />

            <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Yield:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                  {valuation.grossRentalYield}% Gross
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Quick-Sale:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {formatINR(valuation.quickSaleValue)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onViewReport}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ml-auto sm:ml-0"
            >
              <span>View Full Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Accordion Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { id: 'location', label: '1. Location & Area', icon: MapPin },
          { id: 'land', label: '2. Land & Site', icon: Layers },
          { id: 'building', label: '3. Building & Quality', icon: Building },
          { id: 'legal', label: '4. Legal Clearances', icon: FileCheck2 },
          { id: 'specs', label: '5. Specs & Financials', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 font-semibold shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
              <span className="text-xs truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: LOCATION AND NEIGHBOURHOOD PARAMETERS */}
      {activeSection === 'location' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                Category A: Location and Neighbourhood Parameters
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                City tier, road accessibility, transit connectivity, safety, and infrastructure drivers.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {onExploreMarketTrends && (
                <button
                  type="button"
                  onClick={onExploreMarketTrends}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>D3 Demand Map</span>
                </button>
              )}
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold font-mono">
                High Value Sensitivity
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City / Urban Center
              </label>
              <select
                value={propertyData.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {Object.keys(INDIAN_CITIES_CIRCLE_DATA).map((cityName) => (
                  <option key={cityName} value={cityName}>{cityName}</option>
                ))}
                <option value="Pune">Pune</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Gurgaon">Gurgaon</option>
                <option value="Noida">Noida</option>
              </select>
            </div>

            {/* City Tier */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City Classification
              </label>
              <select
                value={propertyData.cityTier}
                onChange={(e) => updateField('cityTier', e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Metro">Metro (Delhi, Mumbai, Bengaluru, Hyderabad, Chennai)</option>
                <option value="Tier 1">Tier 1 (Jaipur, Pune, Ahmedabad, Chandigarh)</option>
                <option value="Tier 2">Tier 2 (Indore, Lucknow, Kochi, Surat)</option>
                <option value="Tier 3">Tier 3 (Emerging Districts)</option>
              </select>
            </div>

            {/* Locality Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Locality Profile
              </label>
              <select
                value={propertyData.localityType}
                onChange={(e) => updateField('localityType', e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Premium">Premium / Prime Urban Zone (+6% to +10%)</option>
                <option value="Developed">Developed Mature Sector (Baseline)</option>
                <option value="Developing">Developing Growth Corridor (-4% Liquidity)</option>
                <option value="Suburban">Suburban Fringe / Outskirts</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Locality Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Locality / Sub-Market Name
              </label>
              <input
                type="text"
                value={propertyData.locality}
                onChange={(e) => updateField('locality', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Greater Kailash, Hitec City, Mansarovar"
              />
            </div>

            {/* Road Width */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Facing Road Width (Feet)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={10}
                  max={200}
                  value={propertyData.roadWidth}
                  onChange={(e) => updateField('roadWidth', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">ft</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                60ft+ provides arterial access and commercial viability.
              </p>
            </div>

            {/* Road Connectivity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Road Connectivity Type
              </label>
              <select
                value={propertyData.roadConnectivity}
                onChange={(e) => updateField('roadConnectivity', e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Main Road">Main Road Frontage</option>
                <option value="Internal Road">Internal Sector Road</option>
                <option value="Arterial Corridor">Arterial Corridor / Boulevard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Metro Proximity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Metro Station Proximity
              </label>
              <select
                value={propertyData.metroProximity}
                onChange={(e) => updateField('metroProximity', e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Under 500m">Under 500m (Walkable +3.5%)</option>
                <option value="500m - 1km">500m - 1km (Optimal)</option>
                <option value="1km - 3km">1km - 3km</option>
                <option value="3km+">3km+</option>
                <option value="No Metro">No Metro Rail Service</option>
              </select>
            </div>

            {/* Highway Proximity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Highway / Expressway (km)
              </label>
              <input
                type="number"
                step="0.1"
                value={propertyData.highwayDistanceKm}
                onChange={(e) => updateField('highwayDistanceKm', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Airport Proximity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Airport Distance (km)
              </label>
              <input
                type="number"
                value={propertyData.airportDistanceKm}
                onChange={(e) => updateField('airportDistanceKm', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Employment Hubs */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Major Employment Hubs
              </label>
              <select
                value={propertyData.employmentHubs}
                onChange={(e) => updateField('employmentHubs', e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Major IT/Corporate Park (<2km)">Major IT/CBD Park (&lt;2km)</option>
                <option value="Moderate (<5km)">Moderate Distance (&lt;5km)</option>
                <option value="Distant (>10km)">Distant (&gt;10km)</option>
              </select>
            </div>
          </div>

          {/* Social Infrastructure Checkboxes */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Civic Amenities in 2km Catchment:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={propertyData.schoolsNearby}
                  onChange={(e) => updateField('schoolsNearby', e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-700 dark:text-slate-300">Reputed Schools Nearby</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={propertyData.hospitalsNearby}
                  onChange={(e) => updateField('hospitalsNearby', e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-700 dark:text-slate-300">Multi-Specialty Hospitals</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={propertyData.shoppingHubsNearby}
                  onChange={(e) => updateField('shoppingHubsNearby', e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-700 dark:text-slate-300">Shopping Malls / Markets</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={propertyData.futureDevelopment === 'High (Upcoming Metro / Expressway / SEZ)'}
                  onChange={(e) => updateField('futureDevelopment', e.target.checked ? 'High (Upcoming Metro / Expressway / SEZ)' : 'Stable / Mature')}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-700 dark:text-slate-300">Upcoming Infra / Metro SEZ</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: LAND-RELATED PARAMETERS & FORMULAS */}
      {activeSection === 'land' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Category B: Land-Related Parameters & FAR Calculations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Plot area, permissible built-up area via FAR, road frontage, corner plot, and soil suitability.
              </p>
            </div>
          </div>

          {/* Formulas Highlight Card */}
          <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block">
                Statutory Formula 1: Land Value
              </span>
              <p className="text-xs font-mono text-indigo-700 dark:text-indigo-400 mt-0.5">
                Land Value = Plot Area ({propertyData.plotArea.toLocaleString('en-IN')} sq. ft) × Land Rate (₹{propertyData.landRatePerSqFt.toLocaleString('en-IN')})
              </p>
              <div className="text-sm font-bold text-indigo-950 dark:text-white font-mono mt-1">
                = {formatINR(propertyData.plotArea * propertyData.landRatePerSqFt)}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block">
                Statutory Formula 2: Permissible Built-Up Area
              </span>
              <p className="text-xs font-mono text-indigo-700 dark:text-indigo-400 mt-0.5">
                Permissible Built-Up = Plot Area ({propertyData.plotArea} sq. ft) × Permitted FAR ({propertyData.permittedFAR})
              </p>
              <div className="text-sm font-bold text-indigo-950 dark:text-white font-mono mt-1">
                = {(propertyData.plotArea * propertyData.permittedFAR).toLocaleString('en-IN')} sq. ft
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Plot Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Plot Area (Sq. Ft)
              </label>
              <input
                type="number"
                value={propertyData.plotArea}
                onChange={(e) => updateField('plotArea', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Land Rate per Sq Ft */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Land Rate per Sq. Ft (INR)
              </label>
              <input
                type="number"
                value={propertyData.landRatePerSqFt}
                onChange={(e) => updateField('landRatePerSqFt', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Permitted FAR */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Permitted FAR / FSI (Floor Space Index)
              </label>
              <input
                type="number"
                step="0.1"
                value={propertyData.permittedFAR}
                onChange={(e) => updateField('permittedFAR', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Land Shape */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Plot Shape
              </label>
              <select
                value={propertyData.landShape}
                onChange={(e) => updateField('landShape', e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Rectangular">Regular Rectangular</option>
                <option value="Square">Square</option>
                <option value="Irregular">Irregular (-3% Usability)</option>
                <option value="L-Shaped">L-Shaped</option>
                <option value="Trapezoidal">Trapezoidal</option>
              </select>
            </div>

            {/* Road Frontage */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Road Frontage Width (Ft)
              </label>
              <input
                type="number"
                value={propertyData.roadFrontage}
                onChange={(e) => updateField('roadFrontage', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Corner Plot */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Corner Plot (Faces 2 Roads)
              </label>
              <select
                value={propertyData.cornerPlot ? 'yes' : 'no'}
                onChange={(e) => updateField('cornerPlot', e.target.value === 'yes')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="yes">Yes (Corner Plot +4%)</option>
                <option value="no">No (Intermediate Plot)</option>
              </select>
            </div>

            {/* Land Ownership */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Land Ownership Title
              </label>
              <select
                value={propertyData.landOwnership}
                onChange={(e) => updateField('landOwnership', e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Freehold">Freehold (100% Perpetual)</option>
                <option value="Leasehold">Leasehold (Authority Lease)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: BUILDING AND CONSTRUCTION PARAMETERS */}
      {activeSection === 'building' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                Category C: Building, Construction Quality & Depreciation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Physical age, structural condition, replacement cost, MEP fittings, lifts, and useful economic life.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Building Age */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Building Age (Years)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={propertyData.buildingAge}
                onChange={(e) => updateField('buildingAge', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Construction Quality */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Construction Specification
              </label>
              <select
                value={propertyData.constructionQuality}
                onChange={(e) => updateField('constructionQuality', e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Premium / Grade-A">Premium / Grade-A (+5%)</option>
                <option value="Standard / Grade-B">Standard / Grade-B</option>
                <option value="Budget / Low-Cost">Budget / Low-Cost (-8%)</option>
              </select>
            </div>

            {/* Structural Condition */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Structural Health Condition
              </label>
              <select
                value={propertyData.structuralCondition}
                onChange={(e) => updateField('structuralCondition', e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Excellent (Well Maintained)">Excellent (Well Maintained +3%)</option>
                <option value="Good">Good (Minor cosmetic wear)</option>
                <option value="Average / Minor Repairs">Average / Minor Repairs</option>
                <option value="Poor / Distressed">Poor / Distressed (-10%)</option>
              </select>
            </div>

            {/* Replacement Cost per sq ft */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Replacement Cost (₹/Sq Ft)
              </label>
              <input
                type="number"
                value={propertyData.currentReplacementConstructionCostPerSqFt}
                onChange={(e) => updateField('currentReplacementConstructionCostPerSqFt', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Flooring */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Flooring Finish
              </label>
              <select
                value={propertyData.flooring}
                onChange={(e) => updateField('flooring', e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Italian Marble / Imported Stone">Italian Marble / Imported Stone</option>
                <option value="Indian Marble / Granite">Indian Marble / Granite</option>
                <option value="Vitrified Tiles">Vitrified Tiles (Standard)</option>
                <option value="Cement / IPS">Cement / IPS / Laser Screed</option>
              </select>
            </div>

            {/* Ceiling Height */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Floor-to-Ceiling Height (ft)
              </label>
              <input
                type="number"
                step="0.5"
                value={propertyData.ceilingHeight}
                onChange={(e) => updateField('ceilingHeight', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Lift */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Elevator / Lift Provision
              </label>
              <select
                value={propertyData.liftAvailability}
                onChange={(e) => updateField('liftAvailability', e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="High-speed Branded Passenger + Service Lifts">Passenger + Service Lifts</option>
                <option value="Standard Lift">Standard Lift</option>
                <option value="No Lift">No Lift</option>
              </select>
            </div>

            {/* Power Backup */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Power Backup System
              </label>
              <select
                value={propertyData.powerBackup}
                onChange={(e) => updateField('powerBackup', e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="100% Full Load DG Backup">100% Full Load DG Backup</option>
                <option value="Partial / Common Areas">Partial / Common Areas</option>
                <option value="Individual Inverter">Individual Inverter</option>
                <option value="None">None</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: LEGAL AND DOCUMENTATION PARAMETERS */}
      {activeSection === 'legal' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-indigo-600" />
                Category D: Legal and Documentation Due Diligence
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Statutory title chain, registered sale deed, Encumbrance Certificate, OC/CC, and RERA compliance.
              </p>
            </div>
            <div className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
              valuation.legalRiskScore.includes('Low')
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
            }`}>
              {valuation.legalRiskScore}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sale Deed */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Conveyance / Sale Deed Status
              </label>
              <select
                value={propertyData.saleDeedStatus}
                onChange={(e) => updateField('saleDeedStatus', e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Verified & Registered Sale Deed">Verified & Registered Sale Deed</option>
                <option value="Agreement to Sell / GPA">Agreement to Sell / GPA (Not registered)</option>
                <option value="Under Mutation">Under Mutation in Revenue Records</option>
              </select>
            </div>

            {/* Title Chain Verification */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Title Search History
              </label>
              <select
                value={propertyData.titleChainVerification}
                onChange={(e) => updateField('titleChainVerification', e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Clear 30+ Year Title Search Available">Clear 30+ Year Chain Available</option>
                <option value="Chain Incomplete">Chain Incomplete / Gaps</option>
                <option value="Under Legal Review">Under Legal Due Diligence</option>
              </select>
            </div>

            {/* Encumbrance Certificate */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Encumbrance Certificate (EC)
              </label>
              <select
                value={propertyData.encumbranceCertificate}
                onChange={(e) => updateField('encumbranceCertificate', e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Nil Encumbrance (Form 15 Issued)">Nil Encumbrance (Form 15 Issued)</option>
                <option value="Encumbrance Found (Form 16)">Encumbrance Recorded (Form 16)</option>
                <option value="Not Applied">Not Applied / Unverified</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Occupancy Certificate (OC) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Occupancy Certificate (OC)
              </label>
              <select
                value={propertyData.occupancyCertificate}
                onChange={(e) => updateField('occupancyCertificate', e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Occupancy Certificate (OC) Issued">OC Issued by Municipal Body</option>
                <option value="Applied / Deemed OC">Applied / Deemed OC</option>
                <option value="Pending / No OC">Pending / No OC (-8% Penalty)</option>
              </select>
            </div>

            {/* Litigation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Court Litigation Status
              </label>
              <select
                value={propertyData.litigationStatus}
                onChange={(e) => updateField('litigationStatus', e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Nil / Zero Pending Litigation in Courts">Nil / Zero Litigation</option>
                <option value="Family Partition / Title Dispute Pending">Title Dispute / Suit Pending (-18%)</option>
              </select>
            </div>

            {/* RERA */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                RERA Registration Status
              </label>
              <select
                value={propertyData.reraRegistration}
                onChange={(e) => updateField('reraRegistration', e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="RERA Registered & Active">RERA Registered & Active</option>
                <option value="RERA Exempted (< 8 units/500 sqm)">RERA Exempted (&lt;8 units/500 sqm)</option>
                <option value="RERA Non-Compliant">RERA Non-Compliant / Unregistered</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: PROPERTY-SPECIFIC PARAMETERS & FINANCIALS */}
      {activeSection === 'specs' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Category E: {propertyData.propertyCategory === 'residential' ? 'Residential Specification' : 'Commercial Specification'} & Financial Inputs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Area breakdown (carpet vs super built-up), lease terms, contractual rent, and cap rate.
              </p>
            </div>
          </div>

          {propertyData.propertyCategory === 'residential' ? (
            /* Residential Parameters */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Residential Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Property Sub-Type
                  </label>
                  <select
                    value={propertyData.residentialType || 'Flat / Apartment'}
                    onChange={(e) => updateField('residentialType', e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Flat / Apartment">Flat / High-Rise Apartment</option>
                    <option value="Builder Floor">Builder Floor with Stilt</option>
                    <option value="Villa">Independent Villa / Gated Enclave</option>
                    <option value="Independent House / Kothi">Independent House / Kothi</option>
                    <option value="Residential Plot">Residential Plot</option>
                  </select>
                </div>

                {/* BHK */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    BHK Typology
                  </label>
                  <select
                    value={propertyData.bhk || '3 BHK'}
                    onChange={(e) => updateField('bhk', e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="1 BHK">1 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="3 BHK">3 BHK</option>
                    <option value="4 BHK">4 BHK</option>
                    <option value="5+ BHK / Penthouse">5+ BHK / Penthouse</option>
                  </select>
                </div>

                {/* Carpet Area */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Carpet Area (RERA Usable Sq. Ft)
                  </label>
                  <input
                    type="number"
                    value={propertyData.carpetArea || 1200}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateField('carpetArea', val);
                      if (!propertyData.superBuiltUpArea) {
                        updateField('superBuiltUpArea', Math.round(val * 1.3));
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Super Built-Up Area */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Super Built-Up Area (Sq. Ft)
                  </label>
                  <input
                    type="number"
                    value={propertyData.superBuiltUpArea || 1500}
                    onChange={(e) => updateField('superBuiltUpArea', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Loading: {propertyData.carpetArea && propertyData.superBuiltUpArea
                      ? `${Math.round(((propertyData.superBuiltUpArea - propertyData.carpetArea) / propertyData.carpetArea) * 100)}%`
                      : '25%'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Floor Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Floor Number
                  </label>
                  <input
                    type="number"
                    value={propertyData.floorNumber || 3}
                    onChange={(e) => updateField('floorNumber', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Facing Direction */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Facing Direction
                  </label>
                  <select
                    value={propertyData.facingDirection || 'East'}
                    onChange={(e) => updateField('facingDirection', e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="North-East">North-East (Optimal Vastu +2.5%)</option>
                    <option value="East">East (Morning Sun +2%)</option>
                    <option value="North">North</option>
                    <option value="West">West</option>
                    <option value="South">South</option>
                  </select>
                </div>

                {/* Vastu Compliance */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vastu Compliance
                  </label>
                  <select
                    value={propertyData.vastuCompliance || 'Fully Vastu Compliant'}
                    onChange={(e) => updateField('vastuCompliance', e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Fully Vastu Compliant">Fully Vastu Compliant</option>
                    <option value="Partially Compliant">Partially Compliant</option>
                    <option value="Non-Compliant / Irrelevant">Non-Compliant / Neutral</option>
                  </select>
                </div>

                {/* Floor Rights */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Floor & Roof Rights
                  </label>
                  <select
                    value={propertyData.floorOwnershipRights}
                    onChange={(e) => updateField('floorOwnershipRights', e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Approved Floor Rights with Roof Rights">Floor + Exclusive Roof Rights (+6%)</option>
                    <option value="Floor Rights only">Floor Rights Only</option>
                    <option value="Undivided Share of Land (UDS)">Undivided Share of Land (UDS)</option>
                  </select>
                </div>
              </div>

              {/* Society Amenities Grid */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  Society Facilities & Security Amenities:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Clubhouse',
                    'Swimming Pool',
                    'Gymnasium',
                    'Landscaped Gardens',
                    'Children Play Area',
                    'Badminton/Tennis Court',
                    'EV Charging Stations',
                    '24/7 Security Guards',
                    'CCTV Surveillance',
                    'Boom Barriers with RFID',
                  ].map((amenity) => {
                    const isChecked = (propertyData.societyFacilities || []).includes(amenity) || (propertyData.securityInfrastructure || []).includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleFacility(amenity)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Commercial Parameters */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Commercial Category
                  </label>
                  <select
                    value={propertyData.commercialCategory || 'Grade-A Corporate Office'}
                    onChange={(e) => updateField('commercialCategory', e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Grade-A Corporate Office">Grade-A Corporate Office</option>
                    <option value="High-Street Showroom">High-Street Showroom</option>
                    <option value="Retail Shop">Retail Shop</option>
                    <option value="Warehouse / Logistics">Warehouse / Logistics</option>
                    <option value="Industrial Building">Industrial Building</option>
                  </select>
                </div>

                {/* Leasable Area */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Leasable / Carpet Area (Sq. Ft)
                  </label>
                  <input
                    type="number"
                    value={propertyData.builtUpArea || propertyData.carpetArea || 2000}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateField('builtUpArea', val);
                      updateField('carpetArea', val);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Commercial Floor */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Floor Location
                  </label>
                  <select
                    value={propertyData.commercialFloor || '2nd - 5th Floor'}
                    onChange={(e) => updateField('commercialFloor', e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Ground Floor (Prime Retail)">Ground Floor (Prime Retail +10%)</option>
                    <option value="1st Floor / Mezzanine">1st Floor / Mezzanine</option>
                    <option value="2nd - 5th Floor">2nd - 5th Floor</option>
                    <option value="High Floor (6th+)">High Floor (6th+)</option>
                    <option value="Basement">Basement (-12%)</option>
                  </select>
                </div>

                {/* Footfall */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Daily Customer Footfall
                  </label>
                  <select
                    value={propertyData.dailyFootfall || 'High (3,000 - 10,000/day)'}
                    onChange={(e) => updateField('dailyFootfall', e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Ultra-High (High-Street / Metro Junction > 10,000/day)">Ultra-High (&gt;10,000/day)</option>
                    <option value="High (3,000 - 10,000/day)">High (3,000 - 10,000/day)</option>
                    <option value="Moderate (1,000 - 3,000/day)">Moderate (1,000 - 3,000/day)</option>
                    <option value="Low / Destination Only">Low / Destination Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Tenant Covenant */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tenant Profile Covenant
                  </label>
                  <select
                    value={propertyData.tenantProfile || 'Blue-chip MNC / Fortune 500'}
                    onChange={(e) => updateField('tenantProfile', e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Blue-chip MNC / Fortune 500">Blue-chip MNC / Fortune 500 (+5%)</option>
                    <option value="National Retail / Bank Anchor">National Retail / Bank Anchor</option>
                    <option value="Regional Corporate">Regional Corporate</option>
                    <option value="Independent SME">Independent SME</option>
                  </select>
                </div>

                {/* Lease Duration */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lease Term (Years)
                  </label>
                  <input
                    type="number"
                    value={propertyData.leaseDurationYears || 9}
                    onChange={(e) => updateField('leaseDurationYears', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Clear Ceiling Height */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Clear Ceiling Height (Ft)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={propertyData.clearCeilingHeight || 13.5}
                    onChange={(e) => updateField('clearCeilingHeight', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Sanctioned Power */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sanctioned Power Load (kVA)
                  </label>
                  <input
                    type="number"
                    value={propertyData.sanctionedPowerLoadKva || 150}
                    onChange={(e) => updateField('sanctionedPowerLoadKva', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Financials & Market Calibration Rates */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Financial & Capitalisation Rates
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Comparable Market Rate */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Comparable Market Rate (₹/Sq. Ft)
                </label>
                <input
                  type="number"
                  value={propertyData.comparableMarketRatePerSqFt}
                  onChange={(e) => updateField('comparableMarketRatePerSqFt', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Monthly Rental Income */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contractual Monthly Rent (₹/Month)
                </label>
                <input
                  type="number"
                  value={propertyData.monthlyRent}
                  onChange={(e) => updateField('monthlyRent', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Market Cap Rate */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Market Capitalisation Rate (Cap Rate %)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={propertyData.marketCapRate || (propertyData.propertyCategory === 'commercial' ? 7.5 : 4.0)}
                  onChange={(e) => updateField('marketCapRate', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {propertyData.propertyCategory === 'commercial' ? 'Commercial benchmark: 7.0% - 9.0%' : 'Residential benchmark: 3.5% - 5.0%'}
                </span>
              </div>

              {/* Circle Rate */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Circle Rate (₹/Sq. Ft)
                </label>
                <input
                  type="number"
                  value={propertyData.circleRatePerSqFt}
                  onChange={(e) => updateField('circleRatePerSqFt', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
