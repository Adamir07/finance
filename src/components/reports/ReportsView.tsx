import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateDisplay } from '../../utils/date';
import { formatUSD, formatXOF, calculateSpreadProfit } from '../../utils/currency';
import { exportTransfersToCsv } from '../../utils/export';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  DollarSign, 
  Calendar,
  Layers,
  Wallet,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const ReportsView: React.FC = () => {
  const { 
    filteredTransfers, 
    filteredIncomes, 
    filteredExpenses, 
    savingsTransactions,
    metrics,
    dateRange 
  } = useApp();

  // Monthly aggregated data for transfers & income/expenses
  const monthlyChartData = useMemo(() => {
    const map: Record<string, { 
      month: string; 
      usdIn: number; 
      cfaSent: number; 
      spreadGains: number;
      fees: number; 
      totalTransferProfit: number;
      income: number; 
      expenses: number 
    }> = {};

    // Group transfers
    filteredTransfers.forEach(t => {
      if (t.status !== 'Cancelled') {
        const monthKey = t.transactionDate.substring(0, 7); // YYYY-MM
        if (!map[monthKey]) {
          map[monthKey] = {
            month: formatDateDisplay(`${monthKey}-01`, 'MMM yy'),
            usdIn: 0,
            cfaSent: 0,
            spreadGains: 0,
            fees: 0,
            totalTransferProfit: 0,
            income: 0,
            expenses: 0,
          };
        }
        const spread = calculateSpreadProfit(t.usdAmount, t.referenceRate, t.customRate);
        map[monthKey].usdIn += t.usdAmount;
        map[monthKey].cfaSent += t.cfaAmount;
        map[monthKey].spreadGains += spread;
        map[monthKey].fees += t.feeAmount;
        map[monthKey].totalTransferProfit += (spread + t.feeAmount);
      }
    });

    // Group income
    filteredIncomes.forEach(i => {
      const monthKey = i.transactionDate.substring(0, 7);
      if (!map[monthKey]) {
        map[monthKey] = {
          month: formatDateDisplay(`${monthKey}-01`, 'MMM yy'),
          usdIn: 0,
          cfaSent: 0,
          spreadGains: 0,
          fees: 0,
          totalTransferProfit: 0,
          income: 0,
          expenses: 0,
        };
      }
      map[monthKey].income += i.amount;
    });

    // Group expenses
    filteredExpenses.forEach(e => {
      const monthKey = e.transactionDate.substring(0, 7);
      if (!map[monthKey]) {
        map[monthKey] = {
          month: formatDateDisplay(`${monthKey}-01`, 'MMM yy'),
          usdIn: 0,
          cfaSent: 0,
          spreadGains: 0,
          fees: 0,
          totalTransferProfit: 0,
          income: 0,
          expenses: 0,
        };
      }
      map[monthKey].expenses += e.amount;
    });

    return Object.keys(map)
      .sort()
      .map(k => map[k]);
  }, [filteredTransfers, filteredIncomes, filteredExpenses]);

  // Expense Categories for distribution
  const expenseCategories = useMemo(() => {
    const catMap: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    return Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const PIE_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e', '#64748b'];

  const handleExportFull = () => {
    exportTransfersToCsv(filteredTransfers, `trekad_report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-800">Analyses Financières & Rapports</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tendances des gains sur taux de change, volume de transferts et balance globale
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportFull}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Exporter le Rapport Complet</span>
        </button>
      </div>

      {/* Summary KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Volume Traité
          </span>
          <p className="text-xl font-bold font-mono text-slate-800">{formatUSD(metrics.totalUsdReceived)}</p>
          <p className="text-[11px] text-slate-500 mt-1">{formatXOF(metrics.totalCfaSent)} délivré aux clients</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm bg-emerald-50/20">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block mb-1 flex items-center justify-between">
            <span>Gain sur Taux & Frais</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          </span>
          <p className="text-xl font-bold font-mono text-emerald-700">+{formatXOF(metrics.totalTransferProfit)}</p>
          <p className="text-[11px] text-emerald-800 mt-1">
            Taux: +{formatXOF(metrics.totalSpreadProfit)} | Frais: +{formatXOF(metrics.totalTransferFeesEarned)}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
            Mon Solde Total (Net)
          </span>
          <p className="text-xl font-bold font-mono text-indigo-900">{formatXOF(metrics.totalSolde)}</p>
          <p className="text-[11px] text-indigo-600 mt-1">Cash ({formatXOF(metrics.availableBalance)}) + Épargne ({formatXOF(metrics.currentSavingsBalance)})</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Taux d'Épargne
          </span>
          <p className="text-xl font-bold font-mono text-slate-800">
            {metrics.totalCombinedIncome > 0 
              ? `${Math.round((metrics.totalSavingsContributions / metrics.totalCombinedIncome) * 100)}%` 
              : '0%'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">{formatXOF(metrics.currentSavingsBalance)} préservé dans les coffres</p>
        </div>
      </div>

      {/* Chart 1: USD Received and Spread/Fee Profits Over Time */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Volume USD & Bénéfices sur Transferts</h3>
            <p className="text-xs text-slate-500">Volume brut en USD versus bénéfices réels (Gain sur taux + Commissions)</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Agrégation Mensuelle</span>
        </div>

        {monthlyChartData.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Aucune transaction dans cette période.
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" orientation="left" stroke="#4f46e5" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (name === 'USD Received') return [`$${Number(value).toLocaleString()}`, name];
                    return [`${Number(value).toLocaleString()} FCFA`, name];
                  }}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="usdIn" name="USD Reçu ($)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="totalTransferProfit" name="Bénéfice Total Transferts (FCFA)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Grid: Net Earnings vs Expenses Line Chart & Expense Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Line Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Revenus Totaux vs. Dépenses</h3>
              <p className="text-xs text-slate-500">Comparaison mensuelle des entrées et sorties de fonds</p>
            </div>
          </div>

          {monthlyChartData.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Aucune donnée à afficher.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: any) => [`${Number(value).toLocaleString()} FCFA`]}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="income" name="Autres Revenus" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="expenses" name="Dépenses" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Expense Distribution */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Répartition des Dépenses</h3>
            <p className="text-xs text-slate-500">Distribution par catégorie sur la période</p>
          </div>

          {expenseCategories.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs flex-1 flex items-center justify-center">
              Aucune dépense enregistrée.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
              <div className="w-36 h-36 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={58}
                      paddingAngle={3}
                    >
                      {expenseCategories.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 w-full sm:w-auto text-xs">
                {expenseCategories.slice(0, 5).map((cat, idx) => (
                  <div key={cat.name} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                      <div 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} 
                      />
                      <span className="text-slate-600 font-medium">{cat.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-800">{formatXOF(cat.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
