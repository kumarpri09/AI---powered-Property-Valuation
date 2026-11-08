import React, { useState } from 'react';
import {
  BookOpen,
  MapPin,
  Layers,
  Building,
  FileCheck2,
  Home,
  Briefcase,
  Calculator,
  Compass,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const ParametersGuide: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('intro');

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-lg">
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-300">
            Certified Chartered Valuation Framework
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Complete Guide to Determining Residential & Commercial Property Market Value
          </h1>
          <p className="text-sm sm:text-base text-indigo-200 leading-relaxed">
            A comprehensive reference covering all 12 appraisal parameter categories, 3 primary valuation methodologies, statutory circle rates, and evidence-based adjustment mathematics.
          </p>
        </div>
      </div>

      {/* Guide Navigation Bar */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-slate-200 dark:border-slate-800 no-scrollbar">
        {[
          { id: 'intro', label: 'Core Valuation Concepts' },
          { id: 'location', label: '1. Location & Neighbourhood' },
          { id: 'land', label: '2. Land & FAR Formulas' },
          { id: 'building', label: '3. Building & Construction' },
          { id: 'legal', label: '4. Legal & Approvals' },
          { id: 'res_comm', label: '5. Residential vs Commercial' },
          { id: 'methods', label: '6. The 3 Primary Methods' },
          { id: 'adjustments', label: '7. Adjustment Factors Matrix' },
          { id: 'workflow', label: '8. 10-Step Valuer Workflow' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategory(tab.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION: INTRO & 3 VALUES */}
      {activeCategory === 'intro' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              The Three Distinct Real Estate Values
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              In professional real estate appraisal, it is vital to distinguish between three core benchmark values which are fundamentally different and must never be conflated:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40 space-y-2">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">
                1. Fair Market Value (FMV)
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                The estimated price at which a property would reasonably transact between a willing buyer and a willing seller in an open, competitive market, assuming both parties act prudently, knowledgeably, and free from undue duress.
              </p>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                2. Government / Circle Rate
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                The minimum statutory benchmark rate notified by state revenue authorities (e.g. Sub-Registrar / IGR / DLC / Kaveri) below which a property deed cannot be registered for stamp duty and registration fee calculations.
              </p>
            </div>

            <div className="p-5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/40 space-y-2">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                3. Investment / Yield Value
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                The specific worth of an asset to a particular investor based on individual investment criteria, target IRR, future net rental income stream, tax positioning, and expected capital appreciation over a defined holding period.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: 1. LOCATION */}
      {activeCategory === 'location' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              1. Location and Neighbourhood Parameters Matrix
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Location constitutes the single highest impact category in both residential and commercial valuation.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-4">Parameter</th>
                  <th className="py-2.5 px-4">What to Evaluate</th>
                  <th className="py-2.5 px-4 text-right">Effect on Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { param: 'City Tier', eval: 'Metro, Tier 1, Tier 2, Tier 3 urban classification', effect: 'High' },
                  { param: 'Locality', eval: 'Premium, developed, developing growth sectors', effect: 'High' },
                  { param: 'Road Connectivity', eval: 'Main road arterial exposure vs internal narrow lane', effect: 'High' },
                  { param: 'Road Width', eval: '12 ft, 20 ft, 30 ft, 60 ft, 100 ft vehicular right-of-way', effect: 'High' },
                  { param: 'Metro Proximity', eval: 'Distance to operational and under-construction stations', effect: 'High' },
                  { param: 'Railway Connectivity', eval: 'Distance to passenger railway terminals', effect: 'Medium' },
                  { param: 'Airport Proximity', eval: 'Transit time and distance to international/domestic airport', effect: 'Medium' },
                  { param: 'Highway Access', eval: 'Proximity to national/state expressways and bypasses', effect: 'High' },
                  { param: 'Neighbourhood Type', eval: 'Homogeneous residential enclave vs commercial mix', effect: 'High' },
                  { param: 'Safety & Security', eval: 'Crime rates, police beat presence, gated entry with guards', effect: 'Medium' },
                  { param: 'Pollution / Environment', eval: 'Air quality (AQI), industrial noise, drainage effluent', effect: 'Medium' },
                  { param: 'Public Transport', eval: 'Bus frequency, auto stands, cab aggregator availability', effect: 'Medium' },
                  { param: 'Schools & Healthcare', eval: 'Nearby tier-1 educational institutes and hospitals', effect: 'Medium' },
                  { param: 'Employment Hubs', eval: 'Proximity to IT SEZs, corporate parks, and CBD offices', effect: 'High' },
                  { param: 'Future Infrastructure', eval: 'Upcoming flyovers, metro lines, peripheral ring roads', effect: 'High' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="py-2 px-4 font-semibold text-slate-900 dark:text-white">{row.param}</td>
                    <td className="py-2 px-4 text-slate-600 dark:text-slate-400">{row.eval}</td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.effect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION: 2. LAND */}
      {activeCategory === 'land' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              2. Land-Related Parameters & Statutory Formulas
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Land represents the non-depreciating component of property valuation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Formula 1: Underlying Land Value</span>
              <div className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                Land Value = Plot Area × Land Rate per Unit
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Example: A 2,000 sq. ft. plot at ₹5,000/sq. ft. yields a Land Value of ₹1,00,00,000 (₹1.00 Crore).
              </p>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Formula 2: Permissible Built-Up Area</span>
              <div className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                Permissible Built-up Area = Plot Area × Permitted FAR
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Example: A 2,000 sq. ft. plot with a permissible FAR of 2.0 allows up to 4,000 sq. ft. of sanctioned construction.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: 3. THE 3 PRIMARY METHODS */}
      {activeCategory === 'methods' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              The Three Primary Methods of Property Valuation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Professional valuation standards (RICS & IBBI) recognize three core approaches.
            </p>
          </div>

          <div className="space-y-5">
            {/* Method 1 */}
            <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Method 1: Market Comparison Approach (Sales Comparison)
                </span>
                <span className="text-xs px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold rounded">
                  Primary for Residential
                </span>
              </div>
              <div className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                V = A × R
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Where V is estimated property value, A is comparable area (carpet or super built-up), and R is adjusted market rate per sq. ft. calibrated for location, building age, floor, corner plot, road width, and parking.
              </p>
            </div>

            {/* Method 2 */}
            <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Method 2: Income Capitalisation Approach
                </span>
                <span className="text-xs px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-semibold rounded">
                  Primary for Commercial
                </span>
              </div>
              <div className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                V = NOI ÷ Capitalisation Rate
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Where NOI is Net Operating Income (Gross Annual Rent minus Operating Expenses, Property Taxes, Insurance, and Vacancy Reserves), divided by the prevailing market Capitalisation Rate (e.g. 7.5% - 8.5%).
              </p>
            </div>

            {/* Method 3 */}
            <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Method 3: Cost Approach (Depreciated Replacement Cost)
                </span>
                <span className="text-xs px-2 py-0.5 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-semibold rounded">
                  Useful for Special-Purpose & Standalone Houses
                </span>
              </div>
              <div className="font-mono text-xs text-amber-600 dark:text-amber-400 font-bold">
                V = L + (RC − D − O)
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Where L is the underlying Land Value, RC is the Replacement Construction Cost of an equivalent building, D is Physical Depreciation, and O is Functional and Economic Obsolescence.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: 7. ADJUSTMENT FACTORS */}
      {activeCategory === 'adjustments' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600" />
              Evidence-Based Property Adjustment Factors
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Two properties in the same locality command distinct values based on specific physical and legal premiums or discounts.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-4">Adjustment Factor</th>
                  <th className="py-2.5 px-4 text-emerald-600 dark:text-emerald-400">Generally Favourable</th>
                  <th className="py-2.5 px-4 text-rose-600 dark:text-rose-400">Generally Unfavourable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { factor: 'Location', fav: 'Prime locality (+5% to +10%)', unfav: 'Remote or industrial fringe (-5%)' },
                  { factor: 'Road Width', fav: 'Wide road ≥ 60 ft (+4.5%)', unfav: 'Narrow congested lane ≤ 20 ft (-5%)' },
                  { factor: 'Floor Number', fav: 'Preferred middle floor with view (+3%)', unfav: 'Basement or extreme top without insulation (-6%)' },
                  { factor: 'Facing & Vastu', fav: 'North-East / East morning light (+2.5%)', unfav: 'South-West unshielded afternoon heat (-2%)' },
                  { factor: 'Parking Provision', fav: 'Dedicated covered stilt/basement (+3.5%)', unfav: 'No dedicated parking on public street (-5%)' },
                  { factor: 'Building Condition', fav: 'New / impeccably maintained (+3%)', unfav: 'Structural seepage or spalling concrete (-10%)' },
                  { factor: 'Legal Clearance', fav: 'Clear 30-yr title chain & OC (+2%)', unfav: 'Pending OC or litigation (-15% to -25%)' },
                  { factor: 'Commercial Frontage', fav: 'Wide frontage with high footfall (+8%)', unfav: 'Poor street visibility / rear corridor (-8%)' },
                  { factor: 'Tenant Profile', fav: 'AAA Blue-chip MNC 9-yr lock-in (+5%)', unfav: 'Irregular tenant with default history (-8%)' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="py-2 px-4 font-semibold text-slate-900 dark:text-white">{row.factor}</td>
                    <td className="py-2 px-4 text-slate-700 dark:text-slate-300">{row.fav}</td>
                    <td className="py-2 px-4 text-slate-600 dark:text-slate-400">{row.unfav}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION: 8. WORKFLOW */}
      {activeCategory === 'workflow' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              The 10-Step Professional Property Valuation Workflow
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Standard operating procedure executed by chartered valuation surveyors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {[
              { step: '01', title: 'Property Identification', desc: 'Identify postal address, municipal survey number, ownership, and valuation purpose.' },
              { step: '02', title: 'Document Verification', desc: 'Verify 30-year title chain, registered sale deed, sanctioned building plan, and encumbrance.' },
              { step: '03', title: 'Physical Inspection', desc: 'Inspect structural integrity, foundation, MEP, ceiling height, lifts, and fire compliance.' },
              { step: '04', title: 'Area Measurement', desc: 'Cross-verify carpet area, built-up area, super built-up loading factor, and permissible FAR.' },
              { step: '05', title: 'Market Research', desc: 'Collect registered sale transactions from Sub-Registrar and comparable listings.' },
              { step: '06', title: 'Rental & Yield Analysis', desc: 'Determine contractual rent, CAM charges, operating expenses, vacancy, and net income.' },
              { step: '07', title: 'Apply Valuation Methods', desc: 'Calculate Market Comparison, Income Capitalisation, and Depreciated Cost values.' },
              { step: '08', title: 'Evidence-Based Adjustments', desc: 'Apply mathematical adjustments for road width, corner plot, age, and legal status.' },
              { step: '09', title: 'Risk & Liquidity Assessment', desc: 'Evaluate quick-sale discount, legal title risk, environmental index, and market depth.' },
              { step: '10', title: 'Final Valuation Opinion', desc: 'Issue reconciled Fair Market Value report with assumptions and digital certification.' },
            ].map((item) => (
              <div key={item.step} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold font-mono text-sm shrink-0 mt-0.5">
                  {item.step}
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
