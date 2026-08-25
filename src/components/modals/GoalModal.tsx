import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Check, Target, Laptop, Plane, Shield, Home, Car, Heart, Smartphone } from 'lucide-react';

export const GoalModal: React.FC = () => {
  const { isGoalModalOpen, closeGoalModal, editingGoal, createSavingsGoal, updateSavingsGoal } = useApp();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('1000000');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [description, setDescription] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('laptop');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingGoal) {
      setName(editingGoal.name);
      setTargetAmount(editingGoal.targetAmount.toString());
      setCurrentAmount(editingGoal.currentAmount.toString());
      setTargetDate(editingGoal.targetDate || '');
      setDescription(editingGoal.description || '');
      setCategoryIcon(editingGoal.categoryIcon || 'laptop');
    } else {
      setName('');
      setTargetAmount('1000000');
      setCurrentAmount('0');
      setTargetDate('');
      setDescription('');
      setCategoryIcon('laptop');
    }
    setErrors({});
  }, [editingGoal, isGoalModalOpen]);

  if (!isGoalModalOpen) return null;

  const icons = [
    { id: 'laptop', label: 'Tech / Work', icon: Laptop },
    { id: 'plane', label: 'Travel', icon: Plane },
    { id: 'shield', label: 'Emergency', icon: Shield },
    { id: 'home', label: 'Housing', icon: Home },
    { id: 'car', label: 'Vehicle', icon: Car },
    { id: 'heart', label: 'Family / Health', icon: Heart },
    { id: 'smartphone', label: 'Gadget', icon: Smartphone },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numTarget = parseInt(targetAmount, 10);
    const numCurrent = parseInt(currentAmount, 10) || 0;
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = 'Goal name is required';
    if (isNaN(numTarget) || numTarget <= 0) errs.targetAmount = 'Target amount must be greater than 0';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      name: name.trim(),
      targetAmount: numTarget,
      currentAmount: numCurrent,
      targetDate: targetDate || undefined,
      description: description.trim() || undefined,
      categoryIcon,
    };

    if (editingGoal) {
      updateSavingsGoal(editingGoal.id, payload);
    } else {
      createSavingsGoal(payload);
    }

    closeGoalModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {editingGoal ? 'Edit Savings Goal' : 'Create New Savings Goal'}
              </h2>
              <p className="text-xs text-slate-500">Set target milestones for big purchases or reserves</p>
            </div>
          </div>
          <button
            onClick={closeGoalModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Goal Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Goal Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. New Laptop, Emergency Reserve, Travel Fund"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-hidden"
            />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
          </div>

          {/* Target Amount & Initial Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Amount (FCFA) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={targetAmount}
                onChange={e => setTargetAmount(e.target.value)}
                placeholder="1500000"
                className="w-full px-3 py-2 text-xs font-mono font-bold text-indigo-700 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-hidden"
              />
              {errors.targetAmount && <p className="mt-1 text-xs text-rose-600">{errors.targetAmount}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current / Initial Amount (FCFA)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={currentAmount}
                onChange={e => setCurrentAmount(e.target.value)}
                placeholder="350000"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-slate-400 outline-hidden"
              />
            </div>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Deadline (Optional)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-hidden"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Category Visual</label>
            <div className="flex flex-wrap gap-2">
              {icons.map(ic => {
                const IconComponent = ic.icon;
                const isSelected = categoryIcon === ic.id;
                return (
                  <button
                    key={ic.id}
                    type="button"
                    onClick={() => setCategoryIcon(ic.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{ic.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Why this goal is important..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-slate-400 outline-hidden"
            />
          </div>

          {/* Footer Actions */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeGoalModal}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editingGoal ? 'Save Changes' : 'Create Goal'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
