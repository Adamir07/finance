import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SavingsGoal, SavingsTransaction } from '../../types';
import { formatDateDisplay } from '../../utils/date';
import { formatXOF } from '../../utils/currency';
import { EmptyState } from '../common/EmptyState';
import { 
  PiggyBank, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Target, 
  Trash2, 
  Edit3, 
  Laptop, 
  Plane, 
  Shield, 
  Home, 
  Car, 
  Heart, 
  Smartphone,
  CheckCircle2
} from 'lucide-react';

export const SavingsView: React.FC = () => {
  const { 
    savingsTransactions, 
    savingsGoals, 
    openSavingsModal, 
    openGoalModal, 
    deleteSavingsTransaction, 
    deleteSavingsGoal, 
    metrics 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'goals' | 'ledger'>('goals');

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'plane': return <Plane className="w-5 h-5" />;
      case 'shield': return <Shield className="w-5 h-5" />;
      case 'home': return <Home className="w-5 h-5" />;
      case 'car': return <Car className="w-5 h-5" />;
      case 'heart': return <Heart className="w-5 h-5" />;
      case 'smartphone': return <Smartphone className="w-5 h-5" />;
      case 'laptop':
      default:
        return <Laptop className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner: Savings Position */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <PiggyBank className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-800">Savings & Target Goals</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Accumulate reserves from commission profits and track milestone targets
            </p>
          </div>

          {/* Savings Balance */}
          <div className="flex flex-wrap items-center gap-4 bg-indigo-50/70 border border-indigo-200/80 rounded-xl px-4 py-2.5 text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-indigo-700 block">Total Contributions</span>
              <span className="font-bold font-mono text-indigo-900">+{formatXOF(metrics.totalSavingsContributions)}</span>
            </div>
            <div className="h-6 w-px bg-indigo-200" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-indigo-700 block">Total Withdrawals</span>
              <span className="font-bold font-mono text-amber-800">-{formatXOF(metrics.totalSavingsWithdrawals)}</span>
            </div>
            <div className="h-6 w-px bg-indigo-200" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-indigo-700 block">Net Current Savings</span>
              <span className="font-bold font-mono text-indigo-950 text-base">{formatXOF(metrics.currentSavingsBalance)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openSavingsModal('contribution')}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Deposit</span>
            </button>
            <button
              type="button"
              onClick={() => openSavingsModal('withdrawal')}
              className="px-3 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <ArrowDownRight className="w-4 h-4 text-amber-600" />
              <span>Withdraw</span>
            </button>
            <button
              type="button"
              onClick={() => openGoalModal()}
              className="px-3 py-2 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Goal</span>
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'goals' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Savings Goals ({savingsGoals.length})
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'ledger' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Transaction History ({savingsTransactions.length})
          </button>
        </div>
      </div>

      {/* Goals View */}
      {activeTab === 'goals' && (
        <div>
          {savingsGoals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="You haven't started saving yet."
              description="Create milestone targets for gadgets, emergency funds, or travel."
              actionLabel="Create Savings Goal"
              onAction={() => openGoalModal()}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savingsGoals.map(g => {
                const percent = Math.min(100, Math.round((g.currentAmount / (g.targetAmount || 1)) * 100));
                const isCompleted = g.currentAmount >= g.targetAmount;

                return (
                  <div
                    key={g.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                            {getIcon(g.categoryIcon)}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">{g.name}</h3>
                            {g.targetDate && (
                              <p className="text-[11px] text-slate-400">Target: {formatDateDisplay(g.targetDate, 'MMM yyyy')}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openGoalModal(g)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSavingsGoal(g.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {g.description && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{g.description}</p>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {formatXOF(g.currentAmount)}
                        </span>
                        <span className="font-mono text-slate-500 text-[11px]">
                          Target: {formatXOF(g.targetAmount)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-indigo-700 font-mono">{percent}% Achieved</span>
                        <button
                          onClick={() => openSavingsModal('contribution', g.id)}
                          className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Funds</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Ledger History View */}
      {activeTab === 'ledger' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          {savingsTransactions.length === 0 ? (
            <EmptyState
              icon={PiggyBank}
              title="No Savings Transactions"
              description="No deposits or withdrawals recorded yet."
              actionLabel="Make First Deposit"
              onAction={() => openSavingsModal('contribution')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Amount (FCFA)</th>
                    <th className="py-3 px-4">Source / Reason</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {savingsTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {formatDateDisplay(tx.transactionDate, 'MMM d, yyyy')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                          tx.type === 'contribution' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {tx.type === 'contribution' ? '+ Deposit' : '- Withdrawal'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm">
                        <span className={tx.type === 'contribution' ? 'text-indigo-700' : 'text-amber-700'}>
                          {tx.type === 'contribution' ? '+' : '-'}{formatXOF(tx.amount)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {tx.sourceOrReason}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {tx.notes || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => deleteSavingsTransaction(tx.id)}
                          title="Delete Transaction"
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
