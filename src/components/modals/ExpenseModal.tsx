import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseCategory, PaymentMethod } from '../../types';
import { getTodayString } from '../../utils/date';
import { X, Check, TrendingDown } from 'lucide-react';

export const ExpenseModal: React.FC = () => {
  const { isExpenseModalOpen, closeExpenseModal, editingExpense, createExpense, updateExpense, profile } = useApp();

  const [date, setDate] = useState(getTodayString());
  const [amount, setAmount] = useState('5000');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingExpense) {
      setDate(editingExpense.transactionDate);
      setAmount(editingExpense.amount.toString());
      setCategory(editingExpense.category);
      setPaymentMethod(editingExpense.paymentMethod);
      setDescription(editingExpense.description);
      setNotes(editingExpense.notes || '');
    } else {
      setDate(getTodayString());
      setAmount('5000');
      setCategory('Food');
      setPaymentMethod(profile.defaultPaymentMethod || 'Cash');
      setDescription('');
      setNotes('');
    }
    setErrors({});
  }, [editingExpense, isExpenseModalOpen, profile]);

  if (!isExpenseModalOpen) return null;

  const categories: ExpenseCategory[] = [
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

  const paymentMethods: PaymentMethod[] = [
    'Cash',
    'Mobile Money',
    'Wave',
    'Orange Money',
    'Bank',
    'MTN MoMo',
    'Other',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount, 10);
    const errs: Record<string, string> = {};

    if (!date) errs.date = 'Date is required';
    if (isNaN(numAmount) || numAmount <= 0) errs.amount = 'Amount must be greater than 0';
    if (!description.trim()) errs.description = 'Description is required (e.g. Taxi, Lunch)';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      transactionDate: date,
      amount: numAmount,
      currency: 'XOF' as const,
      category,
      paymentMethod,
      description: description.trim(),
      notes: notes.trim() || undefined,
    };

    if (editingExpense) {
      updateExpense(editingExpense.id, payload);
    } else {
      createExpense(payload);
    }

    closeExpenseModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {editingExpense ? 'Edit Expense' : 'Record Personal Expense'}
              </h2>
              <p className="text-xs text-slate-500">Log living costs, bills, and daily spending</p>
            </div>
          </div>
          <button
            onClick={closeExpenseModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Transaction Date (Allows historical dates) <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-rose-500 outline-hidden"
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
              placeholder="5000"
              className="w-full px-3 py-2 text-xs font-mono font-bold text-rose-700 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-rose-500 outline-hidden"
            />
            {errors.amount && <p className="mt-1 text-xs text-rose-600">{errors.amount}</p>}
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-slate-400 outline-hidden"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-slate-400 outline-hidden"
              >
                {paymentMethods.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Taxi to downtown meeting, Fresh fruit groceries"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-slate-400 outline-hidden"
            />
            {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional context..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-slate-400 outline-hidden"
            />
          </div>

          {/* Footer Actions */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeExpenseModal}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editingExpense ? 'Save Changes' : 'Save Expense'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
