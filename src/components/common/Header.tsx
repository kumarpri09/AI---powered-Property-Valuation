import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, User, Moon, Sun, PlusCircle } from 'lucide-react';

interface HeaderProps {
  activeTab: 'studio' | 'report' | 'guide' | 'presets' | 'comparison' | 'trends';
  setActiveTab: (tab: 'studio' | 'report' | 'guide' | 'presets' | 'comparison' | 'trends') => void;
  onOpenAuthModal: () => void;
  onOpenProfileDrawer: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onNewValuation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuthModal,
  onOpenProfileDrawer,
  isDarkMode,
  setIsDarkMode,
  onNewValuation,
}) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-600/30">
            <Building2 className="w-5 h-5" />
          </div>
          <button
            onClick={() => setActiveTab('studio')}
            className="text-left cursor-pointer group"
          >
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap block">
              ValuMetric
            </span>
          </button>
        </div>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveTab('studio')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
              activeTab === 'studio'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Valuation Studio
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
              activeTab === 'trends'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Market Map & Trends
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
              activeTab === 'report'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Appraisal Report
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
              activeTab === 'presets'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Benchmarks
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
              activeTab === 'guide'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            12-Parameter Matrix
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
              activeTab === 'comparison'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Asset Compare
          </button>
        </nav>

        {/* Zone 3: Primary Action & User Zone */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick New Valuation Button */}
          <button
            onClick={onNewValuation}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            title="Start New Valuation"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-500" />
            <span>New Valuation</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Toggle color theme"
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile / Login Button */}
          {isAuthenticated && user ? (
            <button
              onClick={onOpenProfileDrawer}
              className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-all cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                {user.name.charAt(0)}
              </div>
              <span className="text-xs font-medium max-w-[100px] truncate hidden sm:inline">
                {user.name}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In / OTP</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile subnav strip for seamless phone browsing */}
      <div className="md:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-slate-200 dark:border-slate-800 gap-2 no-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
        <button
          onClick={() => setActiveTab('studio')}
          className={`px-3 py-1 text-xs font-medium whitespace-nowrap rounded-md ${
            activeTab === 'studio'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Studio
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`px-3 py-1 text-xs font-medium whitespace-nowrap rounded-md ${
            activeTab === 'trends'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Market Map
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-3 py-1 text-xs font-medium whitespace-nowrap rounded-md ${
            activeTab === 'report'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Appraisal Report
        </button>
        <button
          onClick={() => setActiveTab('presets')}
          className={`px-3 py-1 text-xs font-medium whitespace-nowrap rounded-md ${
            activeTab === 'presets'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Benchmarks
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`px-3 py-1 text-xs font-medium whitespace-nowrap rounded-md ${
            activeTab === 'guide'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          12 Parameters
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-3 py-1 text-xs font-medium whitespace-nowrap rounded-md ${
            activeTab === 'comparison'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Compare
        </button>
      </div>
    </header>
  );
};
