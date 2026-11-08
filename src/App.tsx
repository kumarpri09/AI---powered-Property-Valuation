import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PropertyData } from './types/property';
import { PROPERTY_PRESETS } from './data/presets';
import { calculatePropertyValuation } from './utils/valuationEngine';
import { Header } from './components/common/Header';
import { ValuationStudio } from './components/valuation/ValuationStudio';
import { ValuationReport } from './components/valuation/ValuationReport';
import { ParametersGuide } from './components/guide/ParametersGuide';
import { PresetsBrowser } from './components/presets/PresetsBrowser';
import { PropertyComparison } from './components/valuation/PropertyComparison';
import { SavedPortfolio } from './components/portfolio/SavedPortfolio';
import { MarketTrendsView } from './components/analytics/MarketTrendsView';
import { LocalityTrend } from './data/marketTrendsData';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileDrawer } from './components/auth/UserProfileDrawer';

export function AppContent() {
  const [activeTab, setActiveTab] = useState<'studio' | 'report' | 'guide' | 'presets' | 'comparison' | 'portfolio' | 'trends'>('studio');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  // Subject property data
  const [propertyData, setPropertyData] = useState<PropertyData>(() => {
    try {
      const saved = localStorage.getItem('valuemetric_active_property');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return PROPERTY_PRESETS[0]; // Vajra Lakshmi Nilayam
  });

  // Saved portfolio list
  const [savedProperties, setSavedProperties] = useState<PropertyData[]>(() => {
    try {
      const saved = localStorage.getItem('valuemetric_portfolio');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [PROPERTY_PRESETS[0], PROPERTY_PRESETS[1]];
  });

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Persist active property
  useEffect(() => {
    localStorage.setItem('valuemetric_active_property', JSON.stringify(propertyData));
  }, [propertyData]);

  // Persist portfolio
  useEffect(() => {
    localStorage.setItem('valuemetric_portfolio', JSON.stringify(savedProperties));
  }, [savedProperties]);

  const valuation = calculatePropertyValuation(propertyData);

  const handleSelectPreset = (preset: PropertyData) => {
    setPropertyData(preset);
    setActiveTab('studio');
  };

  const handleSaveToPortfolio = () => {
    setSavedProperties((prev) => {
      const filtered = prev.filter((p) => p.id !== propertyData.id);
      return [{ ...propertyData, updatedAt: new Date().toISOString() }, ...filtered];
    });
  };

  const handleDeleteFromPortfolio = (id: string) => {
    setSavedProperties((prev) => prev.filter((p) => p.id !== id));
  };

  const handleNewValuation = () => {
    const blankProperty: PropertyData = {
      ...PROPERTY_PRESETS[0],
      id: `prop-${Date.now()}`,
      name: 'New Custom Property Valuation',
      locality: 'Prime Urban Sector',
      plotArea: 2500,
      carpetArea: 1600,
      superBuiltUpArea: 2000,
      monthlyRent: 40000,
      comparableMarketRatePerSqFt: 7500,
      buildingAge: 1,
      notes: 'Custom configured property valuation.',
    };
    setPropertyData(blankProperty);
    setActiveTab('studio');
  };

  const handleApplyLocalityToStudio = (locality: LocalityTrend) => {
    setPropertyData((prev) => ({
      ...prev,
      city: locality.city,
      locality: locality.name,
      comparableMarketRatePerSqFt: locality.currentRatePerSqFt,
      circleRatePerSqFt: locality.currentCircleRate,
      expectedAppreciationRatePct: locality.appreciationRate5YrCAGR,
      notes: `Updated from Regional D3 Analytics: ${locality.name} (${locality.subRegion}). 5Y CAGR: +${locality.appreciationRate5YrCAGR}%, Demand Score: ${locality.demandScore}/100.`,
    }));
    setActiveTab('studio');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors flex flex-col">
      {/* Top Bar */}
      <Header
        activeTab={activeTab === 'portfolio' ? 'studio' : activeTab}
        setActiveTab={(tab) => setActiveTab(tab)}
        onOpenAuthModal={() => {
          setAuthMode('login');
          setAuthModalOpen(true);
        }}
        onOpenProfileDrawer={() => setProfileDrawerOpen(true)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onNewValuation={handleNewValuation}
      />

      {/* Main View Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'studio' && (
          <ValuationStudio
            propertyData={propertyData}
            setPropertyData={setPropertyData}
            valuation={valuation}
            onViewReport={() => setActiveTab('report')}
            onSelectPreset={(id) => {
              const found = PROPERTY_PRESETS.find((p) => p.id === id);
              if (found) setPropertyData(found);
            }}
            onExploreMarketTrends={() => setActiveTab('trends')}
          />
        )}

        {activeTab === 'trends' && (
          <MarketTrendsView onApplyLocalityToStudio={handleApplyLocalityToStudio} />
        )}

        {activeTab === 'report' && (
          <ValuationReport
            propertyData={propertyData}
            valuation={valuation}
            onEditParameters={() => setActiveTab('studio')}
            onSaveToPortfolio={handleSaveToPortfolio}
          />
        )}

        {activeTab === 'guide' && <ParametersGuide />}

        {activeTab === 'presets' && (
          <PresetsBrowser
            currentPropertyId={propertyData.id}
            onSelectPreset={handleSelectPreset}
          />
        )}

        {activeTab === 'comparison' && (
          <PropertyComparison currentProperty={propertyData} />
        )}

        {activeTab === 'portfolio' && (
          <SavedPortfolio
            savedProperties={savedProperties}
            onLoadProperty={(prop) => {
              setPropertyData(prop);
              setActiveTab('studio');
            }}
            onDeleteProperty={handleDeleteFromPortfolio}
            onNewProperty={handleNewValuation}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">ValuMetric Valuation Engine</span>
            <span>·</span>
            <span>Aligned with IBBI, RICS, and NGDRS Indian Valuation Standards</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('guide')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              12 Parameters Matrix
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Benchmark Cases
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Saved Portfolio ({savedProperties.length})
            </button>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />

      {/* User Profile Drawer */}
      <UserProfileDrawer
        isOpen={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
        onOpenAuthModal={(mode) => {
          setAuthMode(mode);
          setAuthModalOpen(true);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
