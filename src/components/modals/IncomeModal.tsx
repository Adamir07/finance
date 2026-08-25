import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { IncomeCategory } from '../../types';
import { getTodayString, formatDateDisplay } from '../../utils/date';
import { formatXOF } from '../../utils/currency';
import { X, Check, TrendingUp } from 'lucide-react';

export const IncomeModal: React.FC = () => {
  const { isIncomeModalOpen, closeIncomeModal, editingIncome, createIncome, updateIncome } = useApp();

  const [date, setDate] = useState(getTodayString());
  const [amount, setAmount] = useState('50000');
  const [category, setCategory] = useState<IncomeCategory>('Freelance');
  const [source, setSource] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingIncome) {
      setDate(editingIncome.transactionDate);
      setAmount(editingIncome.amount.toString());
      setCategory(editingIncome.category);
      setSource(editingIncome.source || '');
      setDescription(editingIncome.description || '');
      setNotes(editingIncome.notes || '');
    } else {
      setDate(getTodayString());
      setAmount('50000');
      setCategory('Freelance');
      setSource('');
      setDescription('');
      setNotes('');
    }
    setErrors({});
  }, [editingIncome, isIncomeModalOpen]);

  if (!isIncomeModalOpen) return null;

  const categories: IncomeCategory[] = [
    'Transfer commission',
    'Freelance',
    'Salary',
    'Business',
    'Gift',
    'Other',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount, 10);
    const errs: Record<string, string> = {};

    if (!date) errs.date = 'Date is required';
    if (isNaN(numAmount) || numAmount <= 0) errs.amount = 'Amount must be greater than 0';
    if (!source.trim()) errs.source = 'Source is required (e.g. Client, Employer)';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      transactionDate: date,
      amount: numAmount,
      currency: 'XOF' as const,
      category,
      source: source.trim(),
      description: description.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (editingIncome) {
      updateIncome(editingIncome.id, payload);
    } else {
      createIncome(payload);
    }

    closeIncomeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {editingIncome ? 'Edit Income' : 'Record Personal Income'}
              </h2>
              <p className="text-xs text-slate-500">Add salary, freelance, gifts, or other earnings</p>
            </div>
          </div>
          <button
            onClick={closeIncomeModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Transaction Date (Allows any past date) <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 outline-hidden"
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
              placeholder="50000"
              className="w-full px-3 py-2 text-xs font-mono font-bold text-emerald-700 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 outline-hidden"
            />
            {errors.amount && <p className="mt-1 text-xs text-rose-600">{errors.amount}</p>}
          </div>

          {/* Category & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as IncomeCategory)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-slate-400 outline-hidden"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Source <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={source}
                onChange={e => setSource(e.target.value)}
                placeholder="e.g. Upwork Client, Company"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-slate-400 outline-hidden"
              />
              {errors.source && <p className="mt-1 text-xs text-rose-600">{errors.source}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Web design retainer payment"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-slate-400 outline-hidden"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Additional details..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-slate-400 outline-hidden"
            />
          </div>

          {/* Footer Actions */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeIncomeModal}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editingIncome ? 'Save Changes' : 'Save Income'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
