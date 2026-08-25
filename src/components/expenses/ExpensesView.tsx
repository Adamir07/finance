import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseCategory } from '../../types';
import { formatDateDisplay } from '../../utils/date';
import { formatXOF } from '../../utils/currency';
import { PaymentMethodBadge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { 
  TrendingDown, 
  Plus, 
  Edit3, 
  Trash2, 
  ShoppingBag, 
  Utensils, 
  Car, 
  Home, 
  Wifi 
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { 
    filteredExpenses, 
    openExpenseModal, 
    deleteExpense,
    metrics
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const processedExpenses = useMemo(() => {
    return filteredExpenses.filter(e => {
      if (categoryFilter !== 'all') return e.category === categoryFilter;
      return true;
    });
  }, [filteredExpenses, categoryFilter]);

  // Category totals
  const categoryTotals = filteredExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const allCategories: ExpenseCategory[] = [
    'Food',
    'Transport',
    'Phone / Internet',
    'Education',
    'Shopping',
    'Entertainment',
    'Rent / Accommodation',
    'Travel',
    'Family',
    'Health',
    'Bills',
    'Other',
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-rose-50 text-rose-600">
                <TrendingDown className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-800">Personal Expenses</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Track living costs, bills, transport, and discretionary purchases
            </p>
          </div>

          <div className="flex items-center gap-4 bg-rose-50/70 border border-rose-200/80 rounded-xl px-4 py-2.5 text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-rose-700 block">Total Spent in Period</span>
              <span className="font-bold font-mono text-rose-800 text-base">{formatXOF(metrics.totalExpenses)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openExpenseModal()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              categoryFilter === 'all' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Categories ({filteredExpenses.length})
          </button>
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                categoryFilter === cat ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat} {categoryTotals[cat] ? `(${formatXOF(categoryTotals[cat])})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {processedExpenses.length === 0 ? (
          <EmptyState
            icon={TrendingDown}
            title="No Expenses Found"
            description="No expense records match your current filter."
            actionLabel="+ Record Expense"
            onAction={() => openExpenseModal()}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount (FCFA)</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {formatDateDisplay(exp.transactionDate, 'MMM d, yyyy')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600 text-sm">
                      -{formatXOF(exp.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-medium text-[11px] text-slate-700">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <PaymentMethodBadge method={exp.paymentMethod} />
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {exp.description}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openExpenseModal(exp)}
                          title="Edit Expense"
                          className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteExpense(exp.id)}
                          title="Delete Expense"
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
