import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TransferRecord, TransferStatus, PaymentMethod } from '../../types';
import { formatDateDisplay } from '../../utils/date';
import { formatUSD, formatXOF, calculateSpreadProfit, calculateTotalTransferProfit } from '../../utils/currency';
import { StatusBadge, PaymentMethodBadge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { exportTransfersToCsv } from '../../utils/export';
import { 
  ArrowLeftRight, 
  Plus, 
  Download, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  Edit3, 
  Trash2, 
  Check, 
  Clock, 
  XCircle,
  TrendingUp,
  FileSpreadsheet,
  Coins,
  Sparkles
} from 'lucide-react';

export const TransfersView: React.FC = () => {
  const { 
    filteredTransfers, 
    openTransferModal, 
    openTransferDetail, 
    deleteTransfer,
    searchQuery,
    setSearchQuery
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'usd' | 'cfa' | 'fee' | 'spread' | 'total'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter and sort transfers
  const processedTransfers = useMemo(() => {
    let result = [...filteredTransfers];

    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }

    if (methodFilter !== 'all') {
      result = result.filter(t => t.paymentMethod === methodFilter);
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = a.transactionDate.localeCompare(b.transactionDate);
      } else if (sortBy === 'usd') {
        comparison = a.usdAmount - b.usdAmount;
      } else if (sortBy === 'cfa') {
        comparison = a.cfaAmount - b.cfaAmount;
      } else if (sortBy === 'fee') {
        comparison = a.feeAmount - b.feeAmount;
      } else if (sortBy === 'spread') {
        const spreadA = calculateSpreadProfit(a.usdAmount, a.referenceRate, a.customRate);
        const spreadB = calculateSpreadProfit(b.usdAmount, b.referenceRate, b.customRate);
        comparison = spreadA - spreadB;
      } else if (sortBy === 'total') {
        const totalA = calculateTotalTransferProfit(a.usdAmount, a.referenceRate, a.customRate, a.feeAmount);
        const totalB = calculateTotalTransferProfit(b.usdAmount, b.referenceRate, b.customRate, b.feeAmount);
        comparison = totalA - totalB;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [filteredTransfers, statusFilter, methodFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(processedTransfers.length / itemsPerPage) || 1;
  const paginatedTransfers = processedTransfers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Filtered Totals
  const totalUsd = processedTransfers.reduce((acc, t) => acc + t.usdAmount, 0);
  const totalCfa = processedTransfers.reduce((acc, t) => acc + t.cfaAmount, 0);
  const totalSpread = processedTransfers.reduce((acc, t) => acc + calculateSpreadProfit(t.usdAmount, t.referenceRate, t.customRate), 0);
  const totalFees = processedTransfers.reduce((acc, t) => acc + t.feeAmount, 0);
  const totalGains = totalSpread + totalFees;

  const handleExport = () => {
    exportTransfersToCsv(processedTransfers, `trekad_transfers_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const toggleSort = (field: 'date' | 'usd' | 'cfa' | 'fee' | 'spread' | 'total') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* Top Banner: Quick Stats & Primary Action */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <ArrowLeftRight className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-800">Transferts & Gains sur Devises (USD → CFA)</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Affichage de {processedTransfers.length} transactions avec décomposition détaillée des marges de change
            </p>
          </div>

          {/* Aggregated Totals in Filter */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">USD Reçu</span>
              <span className="font-bold font-mono text-slate-800">{formatUSD(totalUsd)}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">CFA Livré</span>
              <span className="font-bold font-mono text-indigo-700">{formatXOF(totalCfa)}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-emerald-700 block">Gain Taux (Spread)</span>
              <span className="font-bold font-mono text-emerald-600">+{formatXOF(totalSpread)}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-amber-700 block">Total Bénéfice</span>
              <span className="font-bold font-mono text-amber-700">+{formatXOF(totalGains)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="export-transfers-csv-btn"
              type="button"
              onClick={handleExport}
              className="px-3 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              id="add-transfer-page-btn"
              type="button"
              onClick={() => openTransferModal()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Transfert</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Status Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
              {['all', 'Completed', 'Pending', 'Cancelled'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
                  className={`px-3 py-1 rounded-md transition-all capitalize ${
                    statusFilter === st ? 'bg-white text-slate-800 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st === 'all' ? 'Tous' : st}
                </button>
              ))}
            </div>

            {/* Payment Method Selector */}
            <select
              value={methodFilter}
              onChange={e => { setMethodFilter(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-hidden"
            >
              <option value="all">Tous les modes de paiement</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Wave">Wave</option>
              <option value="Orange Money">Orange Money</option>
              <option value="Bank">Virement Bancaire</option>
              <option value="Cash">Espèces / Cash</option>
              <option value="MTN MoMo">MTN MoMo</option>
              <option value="Other">Autre</option>
            </select>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Page {currentPage} sur {totalPages}
          </span>
        </div>
      </div>

      {/* Transfers Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {processedTransfers.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="Aucun Transfert Trouvé"
            description="Aucune transaction USD vers CFA ne correspond à vos filtres actuels."
            actionLabel="+ Enregistrer un Transfert"
            onAction={() => openTransferModal()}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                    <th 
                      onClick={() => toggleSort('date')} 
                      className="py-3 px-4 cursor-pointer hover:text-slate-800 select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>Date</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      onClick={() => toggleSort('usd')} 
                      className="py-3 px-4 cursor-pointer hover:text-slate-800 select-none text-right"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>USD ($)</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 text-center">Taux (Norm / Client)</th>
                    <th 
                      onClick={() => toggleSort('cfa')} 
                      className="py-3 px-4 cursor-pointer hover:text-slate-800 select-none text-right"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>CFA Livré</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      onClick={() => toggleSort('spread')} 
                      className="py-3 px-4 cursor-pointer hover:text-emerald-700 select-none text-right"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Gain Taux (Spread)</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      onClick={() => toggleSort('fee')} 
                      className="py-3 px-4 cursor-pointer hover:text-slate-800 select-none text-right"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Commission</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      onClick={() => toggleSort('total')} 
                      className="py-3 px-4 cursor-pointer hover:text-amber-700 select-none text-right"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Gain Total</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {paginatedTransfers.map(t => {
                    const spreadGain = calculateSpreadProfit(t.usdAmount, t.referenceRate, t.customRate);
                    const totalProfit = calculateTotalTransferProfit(t.usdAmount, t.referenceRate, t.customRate, t.feeAmount);
                    
                    return (
                      <tr 
                        key={t.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Date & Ref */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              {formatDateDisplay(t.transactionDate, 'dd/MM/yyyy')}
                            </span>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold">
                              {t.id}
                            </span>
                          </div>
                        </td>

                        {/* USD Amount */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                          {formatUSD(t.usdAmount)}
                        </td>

                        {/* Rate */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1 font-mono text-xs">
                            <span className="text-slate-400">{t.referenceRate}</span>
                            <span className="text-slate-300">→</span>
                            <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                              {t.customRate}
                            </span>
                          </div>
                        </td>

                        {/* CFA Sent */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                          {formatXOF(t.cfaAmount)}
                        </td>

                        {/* Spread Earned */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                          +{formatXOF(spreadGain)}
                        </td>

                        {/* Fee Earned */}
                        <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-700">
                          +{formatXOF(t.feeAmount)}
                        </td>

                        {/* Total Earned */}
                        <td className="py-3.5 px-4 text-right font-mono font-extrabold text-amber-700 bg-amber-50/40">
                          +{formatXOF(totalProfit)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <StatusBadge status={t.status} />
                        </td>

                        {/* Payment & Client */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <PaymentMethodBadge method={t.paymentMethod} />
                            {t.recipientName && (
                              <p className="text-[11px] text-slate-600 truncate max-w-[120px] font-medium">
                                {t.recipientName}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => openTransferDetail(t)}
                              title="Voir détails"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openTransferModal(t)}
                              title="Modifier"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTransfer(t.id)}
                              title="Supprimer"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/50">
                <span className="text-slate-500">
                  Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, processedTransfers.length)} sur {processedTransfers.length} transactions
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-2.5 py-1 border border-slate-200 rounded-md disabled:opacity-40 hover:bg-white text-slate-700"
                  >
                    Précédent
                  </button>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 border border-slate-200 rounded-md disabled:opacity-40 hover:bg-white text-slate-700"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
};
