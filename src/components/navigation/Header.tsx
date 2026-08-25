import React from 'react';
import { useApp } from '../../context/AppContext';
import { DateRangeSelector } from '../common/DateRangeSelector';
import { 
  Menu, 
  Search, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Database,
  Cloud,
  CloudCheck,
  CloudOff,
  Loader2
} from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { 
    activeTab, 
    setActiveTab,
    dateFilter, 
    setDateFilter, 
    searchQuery, 
    setSearchQuery,
    openTransferModal,
    openIncomeModal,
    openExpenseModal,
    supabaseStatus,
    supabaseLatency,
    isSyncing
  } = useApp();

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Financial Dashboard', subtitle: 'Overview of USD conversions, personal income, and liquidity' },
    transfers: { title: 'USD → CFA Transfers', subtitle: 'Detailed record of client exchange orders and commissions' },
    income: { title: 'Income & Revenues', subtitle: 'Personal earnings and transfer commission records' },
    expenses: { title: 'Personal Expenses', subtitle: 'Daily living costs, bills, and spending categories' },
    savings: { title: 'Savings & Goals', subtitle: 'Track capital reserves, emergency fund, and goal progress' },
    reports: { title: 'Financial Reports', subtitle: 'Analytics, exchange margins, and historical trends' },
    settings: { title: 'Settings & Schema', subtitle: 'Exchange rate defaults, profile, and Supabase DDL SQL' },
  };

  const currentInfo = tabTitles[activeTab] || { title: 'TREKAD', subtitle: 'Personal Finance' };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="px-4 sm:px-6 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Left Title & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              id="mobile-menu-toggle-btn"
              type="button"
              onClick={onMenuToggle}
              className="p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                {currentInfo.title}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                {currentInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Right Controls: Search, Date Filter, Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48 md:w-52">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="global-search-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search records..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 font-mono"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Date Range Selector */}
            <DateRangeSelector filter={dateFilter} onChange={setDateFilter} />

            {/* Supabase Status Pill */}
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              title={
                supabaseStatus === 'connected' 
                  ? `Supabase Connected (${supabaseLatency ? `${supabaseLatency}ms` : 'Active'}) - Click to manage`
                  : supabaseStatus === 'syncing'
                  ? 'Syncing with Supabase...'
                  : supabaseStatus === 'error'
                  ? 'Supabase Connection Error - Click to check'
                  : 'Supabase Not Configured - Click to connect cloud database'
              }
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                supabaseStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80'
                  : supabaseStatus === 'syncing'
                  ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                  : supabaseStatus === 'error'
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/80'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {supabaseStatus === 'connected' ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-mono text-[11px]">Cloud Synced</span>
                </>
              ) : supabaseStatus === 'syncing' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  <span className="text-[11px]">Syncing...</span>
                </>
              ) : supabaseStatus === 'error' ? (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-rose-600" />
                  <span className="text-[11px]">Cloud Error</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] text-slate-500 font-medium">Connect Supabase</span>
                </>
              )}
            </button>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                id="header-quick-transfer-btn"
                type="button"
                onClick={() => openTransferModal()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-indigo-700 inline-flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Transfer</span>
              </button>

              <button
                id="header-quick-income-btn"
                type="button"
                onClick={() => openIncomeModal()}
                title="Add Income"
                className="px-3 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-50 inline-flex items-center gap-1.5 transition-colors hidden sm:inline-flex"
              >
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Income</span>
              </button>

              <button
                id="header-quick-expense-btn"
                type="button"
                onClick={() => openExpenseModal()}
                title="Add Expense"
                className="px-3 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-50 inline-flex items-center gap-1.5 transition-colors hidden sm:inline-flex"
              >
                <TrendingDown className="w-4 h-4 text-rose-500" />
                <span>Expense</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
