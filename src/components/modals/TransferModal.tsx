import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TransferRecord, TransferStatus, PaymentMethod } from '../../types';
import { getTodayString, formatDateDisplay } from '../../utils/date';
import { calculateCfaFromUsd, calculateRefCfaFromUsd, formatUSD, formatXOF } from '../../utils/currency';
import { X, ArrowRight, Calculator, Info, Check, Sparkles } from 'lucide-react';

export const TransferModal: React.FC = () => {
  const { 
    isTransferModalOpen, 
    closeTransferModal, 
    editingTransfer, 
    createTransfer, 
    updateTransfer, 
    profile 
  } = useApp();

  const [date, setDate] = useState(getTodayString());
  const [usdAmount, setUsdAmount] = useState<string>('100');
  const [referenceRate, setReferenceRate] = useState<string>('600');
  const [customRate, setCustomRate] = useState<string>('615');
  const [cfaAmount, setCfaAmount] = useState<string>('61500');
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [feeAmount, setFeeAmount] = useState<string>('3000');
  const [status, setStatus] = useState<TransferStatus>('Completed');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Mobile Money');
  const [recipientName, setRecipientName] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or Populate form when opened or editingTransfer changes
  useEffect(() => {
    if (editingTransfer) {
      setDate(editingTransfer.transactionDate);
      setUsdAmount(editingTransfer.usdAmount.toString());
      setReferenceRate(editingTransfer.referenceRate.toString());
      setCustomRate(editingTransfer.customRate.toString());
      setCfaAmount(editingTransfer.cfaAmount.toString());
      setIsManualOverride(!!editingTransfer.isManualCfaOverride);
      setFeeAmount(editingTransfer.feeAmount.toString());
      setStatus(editingTransfer.status);
      setPaymentMethod(editingTransfer.paymentMethod);
      setRecipientName(editingTransfer.recipientName || '');
      setNotes(editingTransfer.notes || '');
    } else {
      setDate(getTodayString());
      setUsdAmount('100');
      setReferenceRate((profile.defaultReferenceRate || 600).toString());
      setCustomRate((profile.defaultCustomRate || 615).toString());
      setCfaAmount((100 * (profile.defaultCustomRate || 615)).toString());
      setIsManualOverride(false);
      setFeeAmount('3000');
      setStatus('Completed');
      setPaymentMethod(profile.defaultPaymentMethod || 'Mobile Money');
      setRecipientName('');
      setNotes('');
    }
    setErrors({});
  }, [editingTransfer, isTransferModalOpen, profile]);

  // Recalculate automatic CFA when USD or Custom Rate changes (if not manual override)
  useEffect(() => {
    if (!isManualOverride) {
      const u = parseFloat(usdAmount) || 0;
      const r = parseFloat(customRate) || 0;
      const calculated = calculateCfaFromUsd(u, r);
      setCfaAmount(calculated.toString());
    }
  }, [usdAmount, customRate, isManualOverride]);

  if (!isTransferModalOpen) return null;

  const numUsd = parseFloat(usdAmount) || 0;
  const numRefRate = parseFloat(referenceRate) || 0;
  const numCustomRate = parseFloat(customRate) || 0;
  const numCfa = parseFloat(cfaAmount) || 0;
  const numFee = parseFloat(feeAmount) || 0;

  const refCfaValue = calculateRefCfaFromUsd(numUsd, numRefRate);
  const spreadProfitValue = Math.abs(numRefRate - numCustomRate) * numUsd;
  const rateDiff = numRefRate - numCustomRate;
  const totalEarnedOnTransfer = spreadProfitValue + Math.max(0, numFee);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!date) errs.date = 'Transaction date is required.';
    if (isNaN(numUsd) || numUsd <= 0) errs.usdAmount = 'USD amount must be greater than 0.';
    if (isNaN(numRefRate) || numRefRate <= 0) errs.referenceRate = 'Reference rate must be greater than 0.';
    if (isNaN(numCustomRate) || numCustomRate <= 0) errs.customRate = 'Custom rate must be greater than 0.';
    if (isNaN(numCfa) || numCfa <= 0) errs.cfaAmount = 'CFA amount must be greater than 0.';
    if (isNaN(numFee) || numFee < 0) errs.feeAmount = 'Commission fee cannot be negative.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      transactionDate: date,
      usdAmount: numUsd,
      referenceRate: numRefRate,
      customRate: numCustomRate,
      cfaAmount: numCfa,
      isManualCfaOverride: isManualOverride,
      feeAmount: numFee,
      status,
      paymentMethod,
      recipientName: recipientName.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (editingTransfer) {
      updateTransfer(editingTransfer.id, payload);
    } else {
      createTransfer(payload);
    }

    closeTransferModal();
  };

  const paymentMethods: PaymentMethod[] = [
    'Mobile Money',
    'Wave',
    'Orange Money',
    'Bank',
    'Cash',
    'MTN MoMo',
    'Other'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {editingTransfer ? `Edit Transfer #${editingTransfer.id}` : 'Record USD → CFA Transfer'}
            </h2>
            <p className="text-xs text-slate-500">
              Convert received USD to CFA, lock historical rates, and record service commission.
            </p>
          </div>
          <button
            onClick={closeTransferModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Row 1: Transaction Date (Full Backdating Allowed) */}
          <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <span>Transaction Date (Any Historical Date Allowed)</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-amber-700 font-medium">
                {formatDateDisplay(date, 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            <input
              id="transfer-date-input"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-amber-300/80 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
            />
            {errors.date && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.date}</p>}
            <p className="mt-1.5 text-[11px] text-amber-800/80">
              Select the exact date the transfer happened. Reports will use this transaction date.
            </p>
          </div>

          {/* Row 2: USD Amount & Rates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* USD Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                USD Received ($) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">$</span>
                <input
                  id="transfer-usd-amount-input"
                  type="number"
                  step="any"
                  min="0.01"
                  value={usdAmount}
                  onChange={e => setUsdAmount(e.target.value)}
                  placeholder="100.00"
                  className="w-full pl-7 pr-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 outline-hidden"
                />
              </div>
              {errors.usdAmount && <p className="mt-1 text-[11px] text-rose-600">{errors.usdAmount}</p>}
            </div>

            {/* Reference Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Normal / Ref Rate <span className="text-rose-500">*</span>
              </label>
              <input
                id="transfer-ref-rate-input"
                type="number"
                step="any"
                min="1"
                value={referenceRate}
                onChange={e => setReferenceRate(e.target.value)}
                placeholder="600"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-slate-400 outline-hidden"
              />
              <span className="text-[10px] text-slate-400">Market benchmark rate</span>
              {errors.referenceRate && <p className="mt-1 text-[11px] text-rose-600">{errors.referenceRate}</p>}
            </div>

            {/* Custom Rate Given to Client */}
            <div>
              <label className="block text-xs font-semibold text-emerald-700 mb-1">
                Custom Client Rate <span className="text-rose-500">*</span>
              </label>
              <input
                id="transfer-custom-rate-input"
                type="number"
                step="any"
                min="1"
                value={customRate}
                onChange={e => setCustomRate(e.target.value)}
                placeholder="615"
                className="w-full px-3 py-2 text-xs font-mono font-bold text-emerald-800 bg-emerald-50/50 border border-emerald-300 rounded-lg focus:bg-white focus:border-emerald-500 outline-hidden"
              />
              <span className="text-[10px] text-emerald-600 font-medium">Rate locked with transfer</span>
              {errors.customRate && <p className="mt-1 text-[11px] text-rose-600">{errors.customRate}</p>}
            </div>

          </div>

          {/* Real-time Calculation Summary Card */}
          <div className="p-3.5 bg-slate-900 text-white rounded-xl text-xs space-y-2.5">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5 font-medium">
                <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                <span>Décomposition des Gains en Direct</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                Gain Taux: +{formatXOF(spreadProfitValue)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">USD Reçu:</span>
                <span className="font-bold text-white">{formatUSD(numUsd)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Valeur Normale:</span>
                <span className="text-slate-300">{formatXOF(refCfaValue)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">CFA Livré Client:</span>
                <span className="font-bold text-indigo-300">{formatXOF(calculateCfaFromUsd(numUsd, numCustomRate))}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Gain Total Opération:</span>
                <span className="font-bold text-emerald-400">+{formatXOF(totalEarnedOnTransfer)}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800 flex items-center justify-between font-mono">
              <span>Formule: ({numRefRate} - {numCustomRate}) × {numUsd}$ = +{formatXOF(spreadProfitValue)}</span>
              <span className="text-emerald-400 font-bold">+ {formatXOF(numFee)} commission = {formatXOF(totalEarnedOnTransfer)}</span>
            </div>
          </div>

          {/* Row 3: CFA Sent Amount & Manual Override */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  CFA Sent (XOF) <span className="text-rose-500">*</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-500">
                  <input
                    type="checkbox"
                    checked={isManualOverride}
                    onChange={e => setIsManualOverride(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Manual override</span>
                </label>
              </div>
              <input
                id="transfer-cfa-amount-input"
                type="number"
                min="1"
                step="1"
                value={cfaAmount}
                disabled={!isManualOverride}
                onChange={e => setCfaAmount(e.target.value)}
                className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-lg outline-hidden ${
                  isManualOverride
                    ? 'bg-amber-50 border border-amber-300 text-amber-900 focus:border-amber-500'
                    : 'bg-slate-100 border border-slate-200 text-slate-900 cursor-not-allowed'
                }`}
              />
              {errors.cfaAmount && <p className="mt-1 text-[11px] text-rose-600">{errors.cfaAmount}</p>}
            </div>

            {/* Fee / Commission Earned */}
            <div>
              <label className="block text-xs font-semibold text-emerald-800 mb-1">
                My Fee / Commission Earned (FCFA) <span className="text-rose-500">*</span>
              </label>
              <input
                id="transfer-fee-amount-input"
                type="number"
                min="0"
                step="1"
                value={feeAmount}
                onChange={e => setFeeAmount(e.target.value)}
                placeholder="3000"
                className="w-full px-3 py-2 text-xs font-mono font-bold text-emerald-800 bg-emerald-50/60 border border-emerald-300 rounded-lg focus:bg-white focus:border-emerald-500 outline-hidden"
              />
              <span className="text-[10px] text-slate-500">Your direct service payment earned</span>
              {errors.feeAmount && <p className="mt-1 text-[11px] text-rose-600">{errors.feeAmount}</p>}
            </div>
          </div>

          {/* Row 4: Status & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                id="transfer-status-select"
                value={status}
                onChange={e => setStatus(e.target.value as TransferStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-slate-400 outline-hidden"
              >
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                id="transfer-method-select"
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

          {/* Row 5: Recipient & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient / Client Name</label>
              <input
                id="transfer-recipient-input"
                type="text"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                placeholder="e.g. Kouamé Jean"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-slate-400 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
              <input
                id="transfer-notes-input"
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Received via USD transfer, sent CFA via Wave"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-slate-400 outline-hidden"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeTransferModal}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="transfer-submit-btn"
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editingTransfer ? 'Save Changes' : 'Save Transfer'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
