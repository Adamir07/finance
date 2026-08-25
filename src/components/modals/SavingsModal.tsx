import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SavingsTransactionType } from '../../types';
import { getTodayString } from '../../utils/date';
import { X, Check, PiggyBank, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export const SavingsModal: React.FC = () => {
  const { 
    isSavingsModalOpen, 
    closeSavingsModal, 
    savingsModalType, 
    selectedGoalIdForSavings, 
    createSavingsTransaction, 
    savingsGoals 
  } = useApp();

  const [type, setType] = useState<SavingsTransactionType>(savingsModalType);
  const [date, setDate] = useState(getTodayString());
  const [amount, setAmount] = useState('20000');
  const [sourceOrReason, setSourceOrReason] = useState('Transfer earnings');
  const [goalId, setGoalId] = useState<string>(selectedGoalIdForSavings || '');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setType(savingsModalType);
    setDate(getTodayString());
    setAmount('20000');
    setSourceOrReason(savingsModalType === 'contribution' ? 'Transfer earnings' : 'Emergency');
    setGoalId(selectedGoalIdForSavings || (savingsGoals.length > 0 ? savingsGoals[0].id : ''));
    setNotes('');
    setErrors({});
  }, [savingsModalType, selectedGoalIdForSavings, isSavingsModalOpen, savingsGoals]);

  if (!isSavingsModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount, 10);
    const errs: Record<string, string> = {};

    if (!date) errs.date = 'Date is required';
    if (isNaN(numAmount) || numAmount <= 0) errs.amount = 'Amount must be greater than 0';
    if (!sourceOrReason.trim()) {
      errs.sourceOrReason = type === 'contribution' ? 'Source is required' : 'Reason is required';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    createSavingsTransaction({
      transactionDate: date,
      type,
      amount: numAmount,
      sourceOrReason: sourceOrReason.trim(),
      goalId: goalId || undefined,
      notes: notes.trim() || undefined,
    });

    closeSavingsModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${type === 'contribution' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {type === 'contribution' ? 'Add Savings Contribution' : 'Withdraw from Savings'}
              </h2>
              <p className="text-xs text-slate-500">
                {type === 'contribution' 
                  ? 'Allocate earnings or transfer fees to reserve capital' 
                  : 'Log a withdrawal from accumulated savings'}
              </p>
            </div>
          </div>
          <button
            onClick={closeSavingsModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Type Toggle */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setType('contribution');
                if (sourceOrReason === 'Emergency') setSourceOrReason('Transfer earnings');
              }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                type === 'contribution' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Contribution (+)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('withdrawal');
                if (sourceOrReason === 'Transfer earnings') setSourceOrReason('Emergency');
              }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                type === 'withdrawal' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Withdrawal (-)</span>
            </button>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Transaction Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-hidden"
            />
            {errors.date && <p className="mt-1 text-xs text-rose-600">{errors.date}</p>}
          </div>

          {/* Amount (XOF) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount (FCFA) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="20000"
              className={`w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-hidden ${
                type === 'contribution' ? 'text-indigo-700 focus:border-indigo-500' : 'text-amber-700 focus:border-amber-500'
              }`}
            />
            {errors.amount && <p className="mt-1 text-xs text-rose-600">{errors.amount}</p>}
          </div>

          {/* Source or Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {type === 'contribution' ? 'Source of Funds' : 'Reason for Withdrawal'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={sourceOrReason}
              onChange={e => setSourceOrReason(e.target.value)}
              placeholder={type === 'contribution' ? 'e.g. Transfer earnings, Salary buffer' : 'e.g. Emergency, Medical, Asset purchase'}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-hidden"
            />
            {errors.sourceOrReason && <p className="mt-1 text-xs text-rose-600">{errors.sourceOrReason}</p>}
          </div>

          {/* Target Goal (Optional) */}
          {savingsGoals.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link to Goal (Optional)
              </label>
              <select
                value={goalId}
                onChange={e => setGoalId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-hidden"
              >
                <option value="">General Liquid Savings (No specific goal)</option>
                {savingsGoals.map(g => (
                  <option key={g.id} value={g.id}>{g.name} (Target: {g.targetAmount.toLocaleString()} FCFA)</option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Additional notes..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-slate-400 outline-hidden"
            />
          </div>

          {/* Footer Actions */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeSavingsModal}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5 ${
                type === 'contribution' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{type === 'contribution' ? 'Deposit to Savings' : 'Confirm Withdrawal'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
