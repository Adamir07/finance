import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/Badge';
import { formatDateDisplay } from '../../utils/date';
import { 
  formatUSD, 
  formatXOF, 
  calculateCfaFromUsd, 
  calculateSpreadProfit,
  calculateTotalTransferProfit
} from '../../utils/currency';
import { 
  Plus, 
  Calculator, 
  ChevronRight,
  Info,
  TrendingUp,
  Wallet,
  Coins,
  ArrowLeftRight,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const DashboardView: React.FC = () => {
  const { 
    metrics, 
    filteredTransfers, 
    filteredExpenses,
    savingsGoals,
    openTransferModal, 
    openGoalModal,
    openTransferDetail,
    setActiveTab,
    profile
  } = useApp();

  // Quick Calculator / Simulator Widget State
  const [calcUsd, setCalcUsd] = useState('100');
  const [calcNormalRate, setCalcNormalRate] = useState(profile.defaultReferenceRate.toString() || '620');
  const [calcCustomRate, setCalcCustomRate] = useState(profile.defaultCustomRate.toString() || '600');
  const [calcFee, setCalcFee] = useState('500');

  const numCalcUsd = parseFloat(calcUsd) || 0;
  const numCalcNormalRate = parseFloat(calcNormalRate) || 0;
  const numCalcCustomRate = parseFloat(calcCustomRate) || 0;
  const numCalcFee = parseFloat(calcFee) || 0;

  const calculatedCfa = calculateCfaFromUsd(numCalcUsd, numCalcCustomRate);
  const calculatedSpreadProfit = calculateSpreadProfit(numCalcUsd, numCalcNormalRate, numCalcCustomRate);
  const calculatedTotalProfit = calculatedSpreadProfit + numCalcFee;

  const handleLaunchCalculatedTransfer = () => {
    openTransferModal({
      id: '',
      userId: profile.id,
      transactionDate: new Date().toISOString().split('T')[0],
      usdAmount: numCalcUsd,
      referenceRate: numCalcNormalRate,
      customRate: numCalcCustomRate,
      cfaAmount: calculatedCfa,
      isManualCfaOverride: false,
      feeAmount: numCalcFee,
      status: 'Completed',
      paymentMethod: 'Mobile Money',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  // Recent transfers (up to 6)
  const recentTransfers = filteredTransfers.slice(0, 6);

  // Expense breakdown calculations
  const totalExpensesAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const expenseByCategory = filteredExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = (Object.entries(expenseByCategory) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name,
      value,
      pct: totalExpensesAmount > 0 ? Math.round((value / totalExpensesAmount) * 100) : 0,
    })).slice(0, 4);

  const PIE_COLORS = ['#f43f5e', '#6366f1', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. HERO CARDS: MON SOLDE TOTAL & CE QUE J'AI GAGNÉ                        */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* CARD A: MON SOLDE TOTAL (The Sum of All I Have) */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Wallet className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-200">Mon Solde Total</h2>
                  <p className="text-[11px] text-slate-400">Somme de tout ce que vous possédez (Cash + Épargne)</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Total Net
              </span>
            </div>

            <div className="my-3">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white">
                {formatXOF(metrics.totalSolde)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Gains totaux nets ({formatXOF(metrics.totalCombinedIncome)}) - Dépenses ({formatXOF(metrics.totalExpenses)})
              </p>
            </div>
          </div>

          {/* Breakdown Pills: Available Cash vs Savings Reserve */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/80 mt-2">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold mb-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Solde Liquide (Cash)</span>
              </div>
              <div className="text-lg font-bold font-mono text-emerald-400">
                {formatXOF(metrics.availableBalance)}
              </div>
              <span className="text-[10px] text-slate-400">Disponible immédiatement</span>
            </div>

            <div 
              onClick={() => setActiveTab('savings')}
              className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 cursor-pointer hover:border-indigo-500/50 transition-colors"
            >
              <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <PiggyBank className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Réserve Épargne</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="text-lg font-bold font-mono text-indigo-300">
                {formatXOF(metrics.currentSavingsBalance)}
              </div>
              <span className="text-[10px] text-slate-400">Placé dans vos coffres</span>
            </div>
          </div>
        </div>

        {/* CARD B: CE QUE J'AI GAGNÉ (What I Earned from Rate Spread + Fees) */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200/90 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <TrendingUp className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Ce Que J'ai Gagné</h2>
                  <p className="text-[11px] text-slate-500">Marge sur taux de change + Frais et commissions</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {metrics.completedTransferCount} transferts
              </span>
            </div>

            <div className="my-3">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-emerald-700">
                +{formatXOF(metrics.totalTransferProfit)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Total des bénéfices générés sur l'ensemble de vos opérations de transfert
              </p>
            </div>
          </div>

          {/* Breakdown: Rate Spread Margin + Commission Fees */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 mt-2">
            
            {/* Rate Spread Gain */}
            <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-xl p-3">
              <div className="text-[11px] font-bold text-emerald-900 mb-0.5 flex items-center justify-between">
                <span>Gain sur le Taux</span>
                <Sparkles className="w-3 h-3 text-emerald-600" />
              </div>
              <div className="text-lg font-bold font-mono text-emerald-700">
                +{formatXOF(metrics.totalSpreadProfit)}
              </div>
              <p className="text-[10px] text-emerald-800/80 font-mono mt-0.5">
                (Taux Normal × $) - (Mon Taux × $)
              </p>
            </div>

            {/* Commission Fees */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="text-[11px] font-bold text-slate-700 mb-0.5">
                Commissions Fixes
              </div>
              <div className="text-lg font-bold font-mono text-slate-800">
                +{formatXOF(metrics.totalTransferFeesEarned)}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Frais de service prélevés
              </p>
            </div>

          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 2. HIGH DENSITY TOP KPI METRICS STRIP                                     */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* USD Received */}
        <div 
          id="metric-usd-received"
          onClick={() => setActiveTab('transfers')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-indigo-300 transition-colors"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">USD Reçu</span>
          <p className="text-lg font-bold text-indigo-600 font-mono">{formatUSD(metrics.totalUsdReceived)}</p>
          <span className="text-[10px] text-slate-400 font-medium">Volume brut</span>
        </div>

        {/* CFA Sent */}
        <div 
          id="metric-cfa-sent"
          onClick={() => setActiveTab('transfers')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-indigo-300 transition-colors"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">CFA Livré</span>
          <p className="text-lg font-bold text-slate-800 font-mono">{formatXOF(metrics.totalCfaSent, { includeSymbol: false })}</p>
          <span className="text-[10px] text-slate-400 font-medium">XOF délivré</span>
        </div>

        {/* Gain sur Taux (Spread) */}
        <div 
          id="metric-spread-profit"
          onClick={() => setActiveTab('transfers')}
          className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs cursor-pointer hover:border-emerald-400 transition-colors"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">Gain sur Taux</span>
          <p className="text-lg font-bold text-emerald-600 font-mono">+{formatXOF(metrics.totalSpreadProfit, { includeSymbol: false })}</p>
          <span className="text-[10px] text-emerald-600 font-medium font-mono">Différence de taux</span>
        </div>

        {/* Commissions Gagnées */}
        <div 
          id="metric-commissions-earned"
          onClick={() => setActiveTab('transfers')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-slate-300 transition-colors"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Commissions</span>
          <p className="text-lg font-bold text-slate-800 font-mono">+{formatXOF(metrics.totalTransferFeesEarned, { includeSymbol: false })}</p>
          <span className="text-[10px] text-slate-400 font-medium">Frais de service</span>
        </div>

        {/* Expenses */}
        <div 
          id="metric-total-expenses"
          onClick={() => setActiveTab('expenses')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-rose-300 transition-colors"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block mb-1">Dépenses</span>
          <p className="text-lg font-bold text-rose-600 font-mono">-{formatXOF(metrics.totalExpenses, { includeSymbol: false })}</p>
          <span className="text-[10px] text-slate-400 font-medium">Sorties de fonds</span>
        </div>

        {/* Mon Solde Total */}
        <div 
          id="metric-total-solde"
          className="bg-white p-3.5 rounded-xl border-2 border-indigo-600 shadow-xs"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">Mon Solde Total</span>
          <p className="text-lg font-bold text-slate-900 font-mono">{formatXOF(metrics.totalSolde, { includeSymbol: false })}</p>
          <span className="text-[10px] text-indigo-600 font-bold">Somme globale</span>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 3. MAIN DASHBOARD CONTENT GRID (8 cols + 4 cols)                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Recent Transfers & Interactive Simulator */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          
          {/* Recent Transfers Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">Derniers Transferts & Gains</h3>
                <p className="text-[11px] text-slate-500">Détail du calcul des gains sur taux et commissions par transaction</p>
              </div>
              <button 
                type="button"
                onClick={() => setActiveTab('transfers')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
              >
                <span>Voir Tout</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              {recentTransfers.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Aucun transfert enregistré dans cette période.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-slate-500 font-bold bg-slate-50/80 border-b border-slate-100">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">USD Reçu</th>
                      <th className="px-4 py-3">Taux (Norm / Mon Taux)</th>
                      <th className="px-4 py-3">CFA Livré</th>
                      <th className="px-4 py-3 text-emerald-700">Gain Taux</th>
                      <th className="px-4 py-3">Frais</th>
                      <th className="px-4 py-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-slate-100">
                    {recentTransfers.map(t => {
                      const spreadGain = calculateSpreadProfit(t.usdAmount, t.referenceRate, t.customRate);
                      return (
                        <tr 
                          key={t.id}
                          onClick={() => openTransferDetail(t)}
                          className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3 text-slate-500 font-medium whitespace-nowrap">
                            {formatDateDisplay(t.transactionDate, 'dd/MM/yyyy')}
                          </td>
                          <td className="px-4 py-3 font-bold font-mono text-slate-900 whitespace-nowrap">
                            {formatUSD(t.usdAmount)}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                            <span className="text-slate-400">{t.referenceRate}</span> → <strong className="text-emerald-700">{t.customRate}</strong>
                          </td>
                          <td className="px-4 py-3 font-mono font-medium text-slate-800 whitespace-nowrap">
                            {formatXOF(t.cfaAmount, { includeSymbol: false })}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-emerald-600 whitespace-nowrap">
                            +{formatXOF(spreadGain, { includeSymbol: false })}
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-medium font-mono whitespace-nowrap">
                            +{formatXOF(t.feeAmount, { includeSymbol: false })}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge status={t.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Quick Calculator & Earnings Simulator */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Calculator className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Simulateur de Gain & Calculateur de Taux
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Calculez instantanément le CFA à envoyer et votre gain selon la formule : (Taux Normal × $) - (Mon Taux × $)
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-bold">
                Temps Réel
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Montant USD ($)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">$</span>
                  <input
                    type="number"
                    value={calcUsd}
                    onChange={e => setCalcUsd(e.target.value)}
                    className="w-full pl-6 pr-2 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Taux Normal (Marché)</label>
                <input
                  type="number"
                  value={calcNormalRate}
                  onChange={e => setCalcNormalRate(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-emerald-700 mb-1">Mon Taux Client</label>
                <input
                  type="number"
                  value={calcCustomRate}
                  onChange={e => setCalcCustomRate(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-mono font-bold text-emerald-800 bg-emerald-50/50 border border-emerald-300 rounded-lg focus:bg-white focus:border-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Frais / Comm. (FCFA)</label>
                <input
                  type="number"
                  value={calcFee}
                  onChange={e => setCalcFee(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-hidden"
                />
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-900 text-white rounded-xl text-xs">
              <div className="border-b sm:border-b-0 sm:border-r border-slate-800 pb-2 sm:pb-0 sm:pr-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">CFA à Livrer au Client</span>
                <span className="text-xl font-bold font-mono text-indigo-300">{formatXOF(calculatedCfa)}</span>
                <p className="text-[10px] text-slate-400 mt-0.5">{numCalcUsd} $ × {numCalcCustomRate}</p>
              </div>

              <div className="border-b sm:border-b-0 sm:border-r border-slate-800 pb-2 sm:pb-0 sm:pr-3">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">Gain sur Taux d'Échange</span>
                <span className="text-xl font-bold font-mono text-emerald-400">+{formatXOF(calculatedSpreadProfit)}</span>
                <p className="text-[10px] text-slate-400 mt-0.5">({numCalcNormalRate} - {numCalcCustomRate}) × {numCalcUsd} $</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">Gain Total sur Opération</span>
                <span className="text-xl font-bold font-mono text-amber-300">+{formatXOF(calculatedTotalProfit)}</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Marge taux + {formatXOF(numCalcFee)} de frais</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLaunchCalculatedTransfer}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Enregistrer ce transfert avec ces paramètres</span>
            </button>
          </div>

        </div>

        {/* Right Column (4 cols): Savings Progress & Expense Breakdown */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* Savings Progress Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">Épargne & Coffres</h3>
                <p className="text-[11px] text-slate-500">Progression vers vos objectifs</p>
              </div>
              <span 
                onClick={() => setActiveTab('savings')}
                className="text-xs text-indigo-600 font-bold cursor-pointer hover:text-indigo-700"
              >
                Gérer
              </span>
            </div>

            {savingsGoals.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                Aucun objectif d'épargne créé pour le moment.
              </div>
            ) : (
              <div className="space-y-4">
                {savingsGoals.slice(0, 3).map((goal, idx) => {
                  const pct = goal.targetAmount > 0 
                    ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) 
                    : 0;
                  const isComplete = pct >= 100;
                  const isEmerald = idx % 2 === 1 || isComplete;

                  return (
                    <div key={goal.id} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700 truncate max-w-[140px]">{goal.name}</span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          {formatXOF(goal.currentAmount, { includeSymbol: false })} / {formatXOF(goal.targetAmount, { includeSymbol: false })}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${isEmerald ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className={`text-[10px] font-bold ${isEmerald ? 'text-emerald-600' : 'text-indigo-600'}`}>
                        {isComplete ? 'Objectif atteint !' : `${pct.toFixed(1)}% complété`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <button 
              type="button"
              onClick={() => openGoalModal()}
              className="w-full mt-5 py-2 border border-dashed border-slate-300 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              + Nouvel Objectif d'Épargne
            </button>
          </div>

          {/* Expense Breakdown Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">Répartition des Dépenses</h3>
                <p className="text-[11px] text-slate-500">Catégories de sorties</p>
              </div>
              <span 
                onClick={() => setActiveTab('expenses')}
                className="text-xs text-indigo-600 font-bold cursor-pointer hover:text-indigo-700"
              >
                Détail
              </span>
            </div>

            {filteredExpenses.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs flex-1 flex items-center justify-center">
                Aucune dépense enregistrée dans cette période.
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-2">
                
                {/* Donut Chart with Centered Total */}
                <div className="relative w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={52}
                        paddingAngle={3}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <p className="text-xs font-bold text-slate-800 font-mono">
                      {totalExpensesAmount > 1000000 
                        ? `${(totalExpensesAmount / 1000000).toFixed(1)}M` 
                        : totalExpensesAmount > 1000 
                        ? `${Math.round(totalExpensesAmount / 1000)}k` 
                        : totalExpensesAmount}
                    </p>
                    <p className="text-[9px] uppercase text-slate-400 font-bold">Total</p>
                  </div>
                </div>

                {/* Categorized List */}
                <div className="w-full space-y-2">
                  {pieData.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <div 
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                        />
                        <span className="text-slate-600 font-medium truncate">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-800 font-mono">{item.pct}%</span>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
