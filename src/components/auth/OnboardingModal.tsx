import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ArrowRight, Check, DollarSign, PiggyBank, ArrowLeftRight, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, closeOnboarding, profile, updateProfile, createSavingsGoal, openTransferModal } = useApp();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(profile.fullName || 'Adam Traore');
  const [refRate, setRefRate] = useState(profile.defaultReferenceRate.toString() || '600');
  const [customRate, setCustomRate] = useState(profile.defaultCustomRate.toString() || '615');
  const [goalName, setGoalName] = useState('New Laptop');
  const [goalTarget, setGoalTarget] = useState('1500000');

  if (!isOnboardingOpen) return null;

  const handleFinish = (openTransferAfter = false) => {
    updateProfile({
      fullName: name,
      defaultReferenceRate: parseFloat(refRate) || 600,
      defaultCustomRate: parseFloat(customRate) || 615,
    });

    if (goalName.trim() && parseInt(goalTarget, 10) > 0) {
      createSavingsGoal({
        name: goalName.trim(),
        targetAmount: parseInt(goalTarget, 10),
        currentAmount: 0,
        description: 'First savings milestone goal',
        categoryIcon: 'laptop',
      });
    }

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    closeOnboarding();

    if (openTransferAfter) {
      openTransferModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-8 h-1.5 rounded-full transition-colors ${step >= 1 ? 'bg-emerald-600' : 'bg-slate-200'}`} />
          <div className={`w-8 h-1.5 rounded-full transition-colors ${step >= 2 ? 'bg-emerald-600' : 'bg-slate-200'}`} />
          <div className={`w-8 h-1.5 rounded-full transition-colors ${step >= 3 ? 'bg-emerald-600' : 'bg-slate-200'}`} />
        </div>

        {/* Step 1: Name & Welcome */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">Welcome to TREKAD</h3>
              <p className="text-xs text-slate-500 mt-1">Let's set up your personal USD ⇄ CFA money management profile</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">What is your name?</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Adam Traore"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Base Currency</label>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">XOF — West African CFA Franc (FCFA)</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold">Standard</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <span>Next: Exchange Rate Defaults</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Exchange Rates */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <ArrowLeftRight className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">Default Exchange Rates</h3>
              <p className="text-xs text-slate-500 mt-1">These will pre-fill new transfers (you can customize each transaction individually)</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Benchmark / Ref Rate</label>
                <input
                  type="number"
                  value={refRate}
                  onChange={e => setRefRate(e.target.value)}
                  placeholder="600"
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-400 outline-hidden"
                />
                <span className="text-[10px] text-slate-400">Market benchmark</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-700 mb-1">Custom Rate to Client</label>
                <input
                  type="number"
                  value={customRate}
                  onChange={e => setCustomRate(e.target.value)}
                  placeholder="615"
                  className="w-full px-3 py-2 text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-xl focus:bg-white focus:border-emerald-500 outline-hidden"
                />
                <span className="text-[10px] text-emerald-600 font-medium">Locked per transaction</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <span>Next: Savings Goal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: First Savings Goal & Launch */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <PiggyBank className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">Create Your First Goal</h3>
              <p className="text-xs text-slate-500 mt-1">Set a savings target to motivate your commission growth</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Goal Name</label>
              <input
                type="text"
                value={goalName}
                onChange={e => setGoalName(e.target.value)}
                placeholder="e.g. New Laptop, Travel, Emergency Cushion"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Amount (FCFA)</label>
              <input
                type="number"
                value={goalTarget}
                onChange={e => setGoalTarget(e.target.value)}
                placeholder="1500000"
                className="w-full px-3.5 py-2 text-xs font-mono font-bold text-indigo-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden"
              />
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleFinish(false)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Go to Dashboard</span>
                <Check className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleFinish(true)}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Add First USD Transfer Now</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
