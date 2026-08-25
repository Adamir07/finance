import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateDisplay } from '../../utils/date';
import { 
  formatUSD, 
  formatXOF, 
  calculateRefCfaFromUsd, 
  calculateSpreadProfit, 
  calculateTotalTransferProfit 
} from '../../utils/currency';
import { StatusBadge, PaymentMethodBadge } from '../common/Badge';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  X, 
  Edit3, 
  Trash2, 
  Printer, 
  ArrowRight, 
  Calendar, 
  DollarSign, 
  Percent, 
  Send, 
  Coins, 
  User, 
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

export const TransferDetailModal: React.FC = () => {
  const { 
    viewingTransferDetail, 
    closeTransferDetail, 
    openTransferModal, 
    deleteTransfer 
  } = useApp();

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  if (!viewingTransferDetail) return null;

  const t = viewingTransferDetail;
  const refCfa = calculateRefCfaFromUsd(t.usdAmount, t.referenceRate);
  const spreadGain = calculateSpreadProfit(t.usdAmount, t.referenceRate, t.customRate);
  const totalEarned = calculateTotalTransferProfit(t.usdAmount, t.referenceRate, t.customRate, t.feeAmount);
  const rateDiff = t.referenceRate - t.customRate;

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = () => {
    deleteTransfer(t.id);
    setIsConfirmDeleteOpen(false);
    closeTransferDetail();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
        <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 print:border-none print:shadow-none">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                {t.id}
              </span>
              <StatusBadge status={t.status} />
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrint}
                title="Print Receipt"
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  closeTransferDetail();
                  openTransferModal(t);
                }}
                title="Edit Transfer"
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(true)}
                title="Delete Transfer"
                className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={closeTransferDetail}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Header */}
          <div className="mt-2 mb-6 text-center">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              USD → CFA Transfer Summary
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Transaction Ref: <span className="font-mono font-bold text-slate-800">{t.id}</span> • Executed on {formatDateDisplay(t.transactionDate, 'MMMM d, yyyy')}
            </p>
          </div>

          {/* Main Financial Highlights */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                USD Amount Received
              </span>
              <span className="text-2xl font-bold font-mono text-slate-900">
                {formatUSD(t.usdAmount)}
              </span>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-4 text-center">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
                CFA Amount Sent
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-800">
                {formatXOF(t.cfaAmount)}
              </span>
            </div>
          </div>

          {/* Rate & Margin Details Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6 text-xs">
            <div className="bg-slate-100/70 px-4 py-2.5 font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center justify-between">
              <span>Conversion & Audit des Gains</span>
              <span className="text-emerald-700 font-mono font-bold">Total Gagné: +{formatXOF(totalEarned)}</span>
            </div>
            
            <div className="divide-y divide-slate-100">
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-slate-500">Taux Normal / Marché (Benchmark)</span>
                <span className="font-mono font-medium text-slate-800">{t.referenceRate} FCFA / USD</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50/30">
                <span className="text-slate-700 font-semibold">Mon Taux Livré au Client</span>
                <span className="font-mono font-bold text-emerald-700">{t.customRate} FCFA / USD</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-slate-500">Écart de Taux</span>
                <span className="font-mono font-semibold text-slate-700">
                  {Math.abs(rateDiff)} FCFA / USD
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-slate-500">Valeur au Taux Normal ({formatUSD(t.usdAmount)} × {t.referenceRate})</span>
                <span className="font-mono text-slate-600">{formatXOF(refCfa)}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 font-medium">
                <span className="text-slate-800">CFA Réellement Livré ({formatUSD(t.usdAmount)} × {t.customRate})</span>
                <span className="font-mono font-bold text-slate-900">{formatXOF(t.cfaAmount)}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50/50">
                <div>
                  <span className="font-bold text-emerald-900 block">Gain sur le Taux d'Échange</span>
                  <span className="text-[10px] text-emerald-700 font-mono">({t.referenceRate} × {formatUSD(t.usdAmount)}) - ({t.customRate} × {formatUSD(t.usdAmount)})</span>
                </div>
                <span className="font-mono font-extrabold text-emerald-700 text-sm">+{formatXOF(spreadGain)}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50">
                <span className="font-medium text-slate-700">Commission / Frais de Service</span>
                <span className="font-mono font-bold text-slate-800">+{formatXOF(t.feeAmount)}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-emerald-100/60 border-t border-emerald-200">
                <span className="font-extrabold text-emerald-950">Bénéfice Total Réalisé sur ce Transfert</span>
                <span className="font-mono font-black text-emerald-900 text-base">+{formatXOF(totalEarned)}</span>
              </div>
            </div>
          </div>

          {/* Operational Metadata */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 text-xs text-slate-600 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Payment Channel:</span>
              <PaymentMethodBadge method={t.paymentMethod} />
            </div>

            {t.recipientName && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Client / Recipient:</span>
                <span className="font-semibold text-slate-900">{t.recipientName}</span>
              </div>
            )}

            {t.notes && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Notes:</span>
                <p className="italic text-slate-700 bg-white p-2 rounded-lg border border-slate-200">{t.notes}</p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Recorded: {formatDateDisplay(t.createdAt, 'yyyy-MM-dd HH:mm')}</span>
              <span>Status: <strong className="text-slate-700">{t.status}</strong></span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 print:hidden">
            <button
              type="button"
              onClick={closeTransferDetail}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                closeTransferDetail();
                openTransferModal(t);
              }}
              className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Record</span>
            </button>
          </div>

        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        title="Delete Transfer Record"
        message={`Are you sure you want to delete transfer #${t.id}? This will remove the transaction and its historical rate record permanently.`}
        confirmLabel="Delete Transfer"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </>
  );
};
