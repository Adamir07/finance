import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IncomeCategory } from '../../types';
import { formatDateDisplay } from '../../utils/date';
import { formatXOF } from '../../utils/currency';
import { EmptyState } from '../common/EmptyState';
import { 
  TrendingUp, 
  Plus, 
  Edit3, 
  Trash2, 
  Coins, 
  Briefcase, 
  Gift, 
  Building2, 
  Layers 
} from 'lucide-react';

export const IncomeView: React.FC = () => {
  const { 
    filteredIncomes, 
    filteredTransfers,
    openIncomeModal, 
    deleteIncome,
    metrics
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const processedIncomes = filteredIncomes.filter(i => {
    if (categoryFilter !== 'all') return i.category === categoryFilter;
    return true;
  });

  // Calculate category totals
  const categoryTotals = filteredIncomes.reduce((acc, inc) => {
    acc[inc.category] = (acc[inc.category] || 0) + inc.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* Top Banner: Income Overview */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <TrendingUp className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-800">Income & Revenues</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Personal revenues, freelance contracts, and USD transfer service commissions
            </p>
          </div>

          {/* Key Totals */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Transfer Fees</span>
              <span className="font-bold font-mono text-emerald-600">+{formatXOF(metrics.totalTransferFeesEarned)}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Personal Income</span>
              <span className="font-bold font-mono text-slate-800">{formatXOF(metrics.totalPersonalIncome)}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Combined Total</span>
              <span className="font-bold font-mono text-emerald-700 text-sm">{formatXOF(metrics.totalCombinedIncome)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openIncomeModal()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Income</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              categoryFilter === 'all' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Categories ({filteredIncomes.length})
          </button>
          {['Freelance', 'Business', 'Salary', 'Gift', 'Transfer commission', 'Other'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                categoryFilter === cat ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat} {categoryTotals[cat] ? `(${formatXOF(categoryTotals[cat])})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Income Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {processedIncomes.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No Income Records"
            description="No personal income recorded for this period."
            actionLabel="+ Record Income"
            onAction={() => openIncomeModal()}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount (FCFA)</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Source / Payer</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedIncomes.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {formatDateDisplay(inc.transactionDate, 'MMM d, yyyy')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 text-sm">
                      +{formatXOF(inc.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-medium text-[11px] text-slate-700">
                        {inc.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {inc.source}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {inc.description || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openIncomeModal(inc)}
                          title="Edit Income"
                          className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteIncome(inc.id)}
                          title="Delete Income"
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
