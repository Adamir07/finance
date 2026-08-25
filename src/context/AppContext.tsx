import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  UserProfile, 
  TransferRecord, 
  IncomeRecord, 
  ExpenseRecord, 
  SavingsTransaction, 
  SavingsGoal, 
  ActiveTab, 
  DateFilterRange,
  TransferStatus,
  PaymentMethod
} from '../types';
import { StorageService } from '../services/storage';
import { 
  SupabaseService, 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  SupabaseConfig 
} from '../services/supabase';
import { calculateSpreadProfit, calculateTotalTransferProfit } from '../utils/currency';
import { isDateInRange } from '../utils/date';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type SupabaseStatus = 'connected' | 'not_configured' | 'error' | 'syncing';

interface AppContextType {
  // State
  profile: UserProfile;
  transfers: TransferRecord[];
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
  savingsTransactions: SavingsTransaction[];
  savingsGoals: SavingsGoal[];
  activeTab: ActiveTab;
  dateFilter: DateFilterRange;
  searchQuery: string;
  authSession: { isAuthenticated: boolean; user: { email: string; name: string } | null };
  isOnboardingOpen: boolean;
  toasts: Toast[];

  // Supabase Cloud Sync State
  supabaseStatus: SupabaseStatus;
  supabaseLatency: number | null;
  lastSyncedAt: string | null;
  supabaseConfig: SupabaseConfig | null;
  isSyncing: boolean;

  // Supabase Actions
  testSupabaseConnection: () => Promise<{ success: boolean; message: string; latencyMs?: number }>;
  syncToSupabase: () => Promise<boolean>;
  syncFromSupabase: () => Promise<boolean>;
  saveSupabaseCredentials: (config: SupabaseConfig | null) => Promise<{ success: boolean; message: string }>;

  // Modal Controls
  isTransferModalOpen: boolean;
  editingTransfer: TransferRecord | null;
  isIncomeModalOpen: boolean;
  editingIncome: IncomeRecord | null;
  isExpenseModalOpen: boolean;
  editingExpense: ExpenseRecord | null;
  isSavingsModalOpen: boolean;
  savingsModalType: 'contribution' | 'withdrawal';
  selectedGoalIdForSavings?: string;
  isGoalModalOpen: boolean;
  editingGoal: SavingsGoal | null;
  viewingTransferDetail: TransferRecord | null;

  // Filtered Lists
  filteredTransfers: TransferRecord[];
  filteredIncomes: IncomeRecord[];
  filteredExpenses: ExpenseRecord[];
  filteredSavingsTxs: SavingsTransaction[];

  // Financial Computations
  metrics: {
    totalUsdReceived: number;
    totalCfaSent: number;
    totalSpreadProfit: number; // Rate margin gain: (Normal Rate * USD) - (My Rate * USD)
    totalTransferFeesEarned: number; // Fixed commission fees
    totalTransferProfit: number; // Spread Profit + Fixed Fees
    totalPersonalIncome: number;
    totalCombinedIncome: number; // Total transfer profit + personal income
    totalExpenses: number;
    totalSavingsContributions: number;
    totalSavingsWithdrawals: number;
    currentSavingsBalance: number; // All-time cumulative savings reserve
    availableBalance: number; // Liquid cash (Solde disponible)
    totalSolde: number; // Grand Total Balance ("The sum of all I have" = Available + Savings)
    netProfit: number; // Net earnings (Combined Income - Expenses)
    completedTransferCount: number;
    pendingTransferCount: number;
    averageCustomRate: number;
    averageReferenceRate: number;
  };

  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setDateFilter: (filter: DateFilterRange) => void;
  setSearchQuery: (query: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Modals Open/Close
  openTransferModal: (transfer?: TransferRecord | null) => void;
  closeTransferModal: () => void;
  openIncomeModal: (income?: IncomeRecord | null) => void;
  closeIncomeModal: () => void;
  openExpenseModal: (expense?: ExpenseRecord | null) => void;
  closeExpenseModal: () => void;
  openSavingsModal: (type?: 'contribution' | 'withdrawal', goalId?: string) => void;
  closeSavingsModal: () => void;
  openGoalModal: (goal?: SavingsGoal | null) => void;
  closeGoalModal: () => void;
  openTransferDetail: (transfer: TransferRecord | null) => void;
  closeTransferDetail: () => void;
  closeOnboarding: () => void;
  openOnboarding: () => void;

  // CRUD
  createTransfer: (data: {
    transactionDate: string;
    usdAmount: number;
    referenceRate: number;
    customRate: number;
    cfaAmount: number;
    isManualCfaOverride?: boolean;
    feeAmount: number;
    status: TransferStatus;
    paymentMethod: PaymentMethod;
    recipientName?: string;
    notes?: string;
  }) => TransferRecord;
  updateTransfer: (id: string, data: Partial<TransferRecord>) => void;
  deleteTransfer: (id: string) => void;

  createIncome: (data: Omit<IncomeRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => IncomeRecord;
  updateIncome: (id: string, data: Partial<IncomeRecord>) => void;
  deleteIncome: (id: string) => void;

  createExpense: (data: Omit<ExpenseRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => ExpenseRecord;
  updateExpense: (id: string, data: Partial<ExpenseRecord>) => void;
  deleteExpense: (id: string) => void;

  createSavingsTransaction: (data: Omit<SavingsTransaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => SavingsTransaction;
  deleteSavingsTransaction: (id: string) => void;

  createSavingsGoal: (data: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => SavingsGoal;
  updateSavingsGoal: (id: string, data: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;

  updateProfile: (data: Partial<UserProfile>) => void;
  resetToSampleData: () => void;
  clearAllData: () => void;
  importDataFromJson: (json: string) => boolean;

  // Auth
  login: (email: string, name?: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Database state
  const [profile, setProfile] = useState<UserProfile>(StorageService.getProfile);
  const [transfers, setTransfers] = useState<TransferRecord[]>(StorageService.getTransfers);
  const [incomes, setIncomes] = useState<IncomeRecord[]>(StorageService.getIncomes);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(StorageService.getExpenses);
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>(StorageService.getSavingsTransactions);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(StorageService.getSavingsGoals);
  const [authSession, setAuthSession] = useState(StorageService.getAuthSession);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => !StorageService.hasOnboarded());

  // Supabase Cloud sync state
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig | null>(getSupabaseConfig);
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus>(() => {
    const config = getSupabaseConfig();
    return (config && config.url && config.anonKey) ? 'syncing' : 'not_configured';
  });
  const [supabaseLatency, setSupabaseLatency] = useState<number | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    return localStorage.getItem('trekad_supabase_last_sync_v1');
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // UI Filters
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [dateFilter, setDateFilter] = useState<DateFilterRange>({ preset: 'this_month' });
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<TransferRecord | null>(null);

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeRecord | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);

  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [savingsModalType, setSavingsModalType] = useState<'contribution' | 'withdrawal'>('contribution');
  const [selectedGoalIdForSavings, setSelectedGoalIdForSavings] = useState<string | undefined>(undefined);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [viewingTransferDetail, setViewingTransferDetail] = useState<TransferRecord | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Filtered records
  const filteredTransfers = useMemo(() => {
    return transfers.filter(t => {
      const inDate = isDateInRange(t.transactionDate, dateFilter);
      if (!inDate) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        (t.recipientName && t.recipientName.toLowerCase().includes(q)) ||
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        t.paymentMethod.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q) ||
        t.usdAmount.toString().includes(q) ||
        t.cfaAmount.toString().includes(q)
      );
    });
  }, [transfers, dateFilter, searchQuery]);

  const filteredIncomes = useMemo(() => {
    return incomes.filter(i => {
      const inDate = isDateInRange(i.transactionDate, dateFilter);
      if (!inDate) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        i.category.toLowerCase().includes(q) ||
        i.source.toLowerCase().includes(q) ||
        (i.description && i.description.toLowerCase().includes(q)) ||
        (i.notes && i.notes.toLowerCase().includes(q)) ||
        i.amount.toString().includes(q)
      );
    });
  }, [incomes, dateFilter, searchQuery]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const inDate = isDateInRange(e.transactionDate, dateFilter);
      if (!inDate) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        e.category.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.paymentMethod.toLowerCase().includes(q) ||
        (e.notes && e.notes.toLowerCase().includes(q)) ||
        e.amount.toString().includes(q)
      );
    });
  }, [expenses, dateFilter, searchQuery]);

  const filteredSavingsTxs = useMemo(() => {
    return savingsTransactions.filter(s => {
      const inDate = isDateInRange(s.transactionDate, dateFilter);
      if (!inDate) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.sourceOrReason.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q) ||
        (s.notes && s.notes.toLowerCase().includes(q)) ||
        s.amount.toString().includes(q)
      );
    });
  }, [savingsTransactions, dateFilter, searchQuery]);

  // Overall & Filtered Metrics
  const metrics = useMemo(() => {
    // Transfers completed
    const completedTransfers = filteredTransfers.filter(t => t.status === 'Completed');
    const pendingTransfers = filteredTransfers.filter(t => t.status === 'Pending');

    const totalUsdReceived = completedTransfers.reduce((acc, t) => acc + t.usdAmount, 0);
    const totalCfaSent = completedTransfers.reduce((acc, t) => acc + t.cfaAmount, 0);
    
    // Spread profit from rate differential: (Normal Rate * USD) - (My Rate * USD)
    const totalSpreadProfit = completedTransfers.reduce(
      (acc, t) => acc + calculateSpreadProfit(t.usdAmount, t.referenceRate, t.customRate),
      0
    );
    const totalTransferFeesEarned = completedTransfers.reduce((acc, t) => acc + t.feeAmount, 0);
    const totalTransferProfit = totalSpreadProfit + totalTransferFeesEarned;

    // Other Incomes (exclude transfer_id if already auto-linked to avoid double counting)
    const nonTransferIncomes = filteredIncomes.filter(i => !i.transferId);
    const totalPersonalIncome = nonTransferIncomes.reduce((acc, i) => acc + i.amount, 0);

    const totalCombinedIncome = totalPersonalIncome + totalTransferProfit;

    // Expenses
    const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

    // Savings within selected period
    const totalSavingsContributions = filteredSavingsTxs
      .filter(s => s.type === 'contribution')
      .reduce((acc, s) => acc + s.amount, 0);
    
    const totalSavingsWithdrawals = filteredSavingsTxs
      .filter(s => s.type === 'withdrawal')
      .reduce((acc, s) => acc + s.amount, 0);

    // Cumulative All-Time Savings Balance (Reserve / Coffre)
    const allTimeContributions = savingsTransactions
      .filter(s => s.type === 'contribution')
      .reduce((acc, s) => acc + s.amount, 0);
    const allTimeWithdrawals = savingsTransactions
      .filter(s => s.type === 'withdrawal')
      .reduce((acc, s) => acc + s.amount, 0);
    const currentSavingsBalance = Math.max(0, allTimeContributions - allTimeWithdrawals);

    // Net Profit across all revenue streams minus expenses
    const netProfit = totalCombinedIncome - totalExpenses;

    // "Mon Solde Total (The Sum of All I Have)": Total Net Wealth = Total Earnings - Expenses
    // This is equal to: Available Liquid Cash + Savings Reserve
    const totalSolde = netProfit;

    // Available Liquid Balance (Cash in hand / wallet): Total Solde minus funds locked in Savings
    const netSavingsMovement = totalSavingsContributions - totalSavingsWithdrawals;
    const availableBalance = totalCombinedIncome - totalExpenses - netSavingsMovement;

    // Average rates
    const avgCustom = completedTransfers.length > 0
      ? completedTransfers.reduce((acc, t) => acc + t.customRate, 0) / completedTransfers.length
      : profile.defaultCustomRate;

    const avgRef = completedTransfers.length > 0
      ? completedTransfers.reduce((acc, t) => acc + t.referenceRate, 0) / completedTransfers.length
      : profile.defaultReferenceRate;

    return {
      totalUsdReceived,
      totalCfaSent,
      totalSpreadProfit,
      totalTransferFeesEarned,
      totalTransferProfit,
      totalPersonalIncome,
      totalCombinedIncome,
      totalExpenses,
      totalSavingsContributions,
      totalSavingsWithdrawals,
      currentSavingsBalance,
      availableBalance,
      totalSolde,
      netProfit,
      completedTransferCount: completedTransfers.length,
      pendingTransferCount: pendingTransfers.length,
      averageCustomRate: avgCustom,
      averageReferenceRate: avgRef,
    };
  }, [filteredTransfers, filteredIncomes, filteredExpenses, filteredSavingsTxs, savingsTransactions, profile]);

  // Modal open/close actions
  const openTransferModal = useCallback((transfer: TransferRecord | null = null) => {
    setEditingTransfer(transfer);
    setIsTransferModalOpen(true);
  }, []);

  const closeTransferModal = useCallback(() => {
    setIsTransferModalOpen(false);
    setEditingTransfer(null);
  }, []);

  const openIncomeModal = useCallback((income: IncomeRecord | null = null) => {
    setEditingIncome(income);
    setIsIncomeModalOpen(true);
  }, []);

  const closeIncomeModal = useCallback(() => {
    setIsIncomeModalOpen(false);
    setEditingIncome(null);
  }, []);

  const openExpenseModal = useCallback((expense: ExpenseRecord | null = null) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  }, []);

  const closeExpenseModal = useCallback(() => {
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  }, []);

  const openSavingsModal = useCallback((type: 'contribution' | 'withdrawal' = 'contribution', goalId?: string) => {
    setSavingsModalType(type);
    setSelectedGoalIdForSavings(goalId);
    setIsSavingsModalOpen(true);
  }, []);

  const closeSavingsModal = useCallback(() => {
    setIsSavingsModalOpen(false);
    setSelectedGoalIdForSavings(undefined);
  }, []);

  const openGoalModal = useCallback((goal: SavingsGoal | null = null) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  }, []);

  const closeGoalModal = useCallback(() => {
    setIsGoalModalOpen(false);
    setEditingGoal(null);
  }, []);

  const openTransferDetail = useCallback((transfer: TransferRecord | null) => {
    setViewingTransferDetail(transfer);
  }, []);

  const closeTransferDetail = useCallback(() => {
    setViewingTransferDetail(null);
  }, []);

  const closeOnboarding = useCallback(() => {
    setIsOnboardingOpen(false);
    StorageService.setOnboarded(true);
  }, []);

  const openOnboarding = useCallback(() => {
    setIsOnboardingOpen(true);
  }, []);

  // Supabase Actions
  const testSupabaseConnection = useCallback(async () => {
    const config = getSupabaseConfig();
    if (!config || !config.url || !config.anonKey) {
      setSupabaseStatus('not_configured');
      setSupabaseLatency(null);
      return { success: false, message: 'Supabase URL and Anon Key are not configured.' };
    }

    setSupabaseStatus('syncing');
    const result = await SupabaseService.testConnection();
    if (result.success) {
      setSupabaseStatus('connected');
      setSupabaseLatency(result.latencyMs || 0);
    } else {
      setSupabaseStatus('error');
      setSupabaseLatency(null);
    }
    return result;
  }, []);

  const syncToSupabase = useCallback(async () => {
    const config = getSupabaseConfig();
    if (!config || !config.url || !config.anonKey) {
      showToast('Please configure your Supabase URL & Anon Key first.', 'error');
      return false;
    }

    setIsSyncing(true);
    setSupabaseStatus('syncing');
    try {
      await SupabaseService.pushAllData({
        profile,
        transfers,
        incomes,
        expenses,
        savingsGoals,
        savingsTransactions,
      });

      const now = new Date().toISOString();
      setLastSyncedAt(now);
      localStorage.setItem('trekad_supabase_last_sync_v1', now);
      setSupabaseStatus('connected');
      showToast('All local data successfully synced to Supabase cloud!', 'success');
      return true;
    } catch (err: any) {
      console.error('Push to Supabase failed:', err);
      setSupabaseStatus('error');
      showToast(`Supabase Sync Failed: ${err.message || 'Check database schema/table creation'}`, 'error');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [profile, transfers, incomes, expenses, savingsGoals, savingsTransactions, showToast]);

  const syncFromSupabase = useCallback(async () => {
    const config = getSupabaseConfig();
    if (!config || !config.url || !config.anonKey) {
      showToast('Please configure your Supabase URL & Anon Key first.', 'error');
      return false;
    }

    setIsSyncing(true);
    setSupabaseStatus('syncing');
    try {
      const data = await SupabaseService.fetchAllData();
      if (!data) {
        throw new Error('No data received from Supabase.');
      }

      if (data.profile) {
        StorageService.updateProfile(data.profile);
        setProfile(data.profile);
      }
      StorageService.saveTransfers(data.transfers);
      setTransfers(data.transfers);

      StorageService.saveIncomes(data.incomes);
      setIncomes(data.incomes);

      StorageService.saveExpenses(data.expenses);
      setExpenses(data.expenses);

      StorageService.saveSavingsGoals(data.savingsGoals);
      setSavingsGoals(data.savingsGoals);

      StorageService.saveSavingsTransactions(data.savingsTransactions);
      setSavingsTransactions(data.savingsTransactions);

      const now = new Date().toISOString();
      setLastSyncedAt(now);
      localStorage.setItem('trekad_supabase_last_sync_v1', now);
      setSupabaseStatus('connected');
      showToast(`Fetched ${data.transfers.length} transfers & ${data.incomes.length + data.expenses.length} records from Supabase!`, 'success');
      return true;
    } catch (err: any) {
      console.error('Fetch from Supabase failed:', err);
      setSupabaseStatus('error');
      showToast(`Fetch Failed: ${err.message || 'Check connection'}`, 'error');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [showToast]);

  const saveSupabaseCredentials = useCallback(async (config: SupabaseConfig | null) => {
    saveSupabaseConfig(config);
    setSupabaseConfig(config);

    if (!config || !config.url || !config.anonKey) {
      setSupabaseStatus('not_configured');
      setSupabaseLatency(null);
      showToast('Supabase configuration cleared.', 'info');
      return { success: true, message: 'Configuration cleared.' };
    }

    setSupabaseStatus('syncing');
    const result = await SupabaseService.testConnection();
    if (result.success) {
      setSupabaseStatus('connected');
      setSupabaseLatency(result.latencyMs || 0);
      showToast('Supabase connected successfully! You can now sync data.', 'success');
    } else {
      setSupabaseStatus('error');
      setSupabaseLatency(null);
      showToast(`Supabase test failed: ${result.message}`, 'error');
    }
    return result;
  }, [showToast]);

  // Initial connection test on mount if credentials configured
  useEffect(() => {
    const config = getSupabaseConfig();
    if (config && config.url && config.anonKey) {
      SupabaseService.testConnection().then(res => {
        if (res.success) {
          setSupabaseStatus('connected');
          setSupabaseLatency(res.latencyMs || 0);
        } else {
          setSupabaseStatus('error');
        }
      });
    } else {
      setSupabaseStatus('not_configured');
    }
  }, []);

  // CRUD Operations
  const createTransfer = useCallback((data: {
    transactionDate: string;
    usdAmount: number;
    referenceRate: number;
    customRate: number;
    cfaAmount: number;
    isManualCfaOverride?: boolean;
    feeAmount: number;
    status: TransferStatus;
    paymentMethod: PaymentMethod;
    recipientName?: string;
    notes?: string;
  }) => {
    const newRecord = StorageService.addTransfer({
      ...data,
      userId: profile.id,
    });
    setTransfers(StorageService.getTransfers());
    showToast(`Transfer ${newRecord.id} recorded successfully!`, 'success');

    // Async cloud replication
    SupabaseService.syncTransfer(newRecord).catch(() => {});

    return newRecord;
  }, [profile.id, showToast]);

  const updateTransfer = useCallback((id: string, data: Partial<TransferRecord>) => {
    const updated = StorageService.updateTransfer(id, data);
    if (updated) {
      setTransfers(StorageService.getTransfers());
      showToast(`Transfer ${id} updated`, 'success');
      if (viewingTransferDetail?.id === id) {
        setViewingTransferDetail(updated);
      }
      // Async cloud replication
      SupabaseService.syncTransfer(updated).catch(() => {});
    }
  }, [showToast, viewingTransferDetail]);

  const deleteTransfer = useCallback((id: string) => {
    const success = StorageService.deleteTransfer(id);
    if (success) {
      setTransfers(StorageService.getTransfers());
      showToast(`Transfer ${id} deleted`, 'info');
      if (viewingTransferDetail?.id === id) {
        setViewingTransferDetail(null);
      }
      // Async cloud replication
      SupabaseService.deleteTransfer(id).catch(() => {});
    }
  }, [showToast, viewingTransferDetail]);

  const createIncome = useCallback((data: Omit<IncomeRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newRecord = StorageService.addIncome({
      ...data,
      userId: profile.id,
    });
    setIncomes(StorageService.getIncomes());
    showToast('Income recorded successfully!', 'success');
    SupabaseService.syncIncome(newRecord).catch(() => {});
    return newRecord;
  }, [profile.id, showToast]);

  const updateIncome = useCallback((id: string, data: Partial<IncomeRecord>) => {
    const updated = StorageService.updateIncome(id, data);
    if (updated) {
      setIncomes(StorageService.getIncomes());
      showToast('Income record updated', 'success');
      SupabaseService.syncIncome(updated).catch(() => {});
    }
  }, [showToast]);

  const deleteIncome = useCallback((id: string) => {
    const success = StorageService.deleteIncome(id);
    if (success) {
      setIncomes(StorageService.getIncomes());
      showToast('Income record deleted', 'info');
      SupabaseService.deleteIncome(id).catch(() => {});
    }
  }, [showToast]);

  const createExpense = useCallback((data: Omit<ExpenseRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newRecord = StorageService.addExpense({
      ...data,
      userId: profile.id,
    });
    setExpenses(StorageService.getExpenses());
    showToast('Expense recorded successfully!', 'success');
    SupabaseService.syncExpense(newRecord).catch(() => {});
    return newRecord;
  }, [profile.id, showToast]);

  const updateExpense = useCallback((id: string, data: Partial<ExpenseRecord>) => {
    const updated = StorageService.updateExpense(id, data);
    if (updated) {
      setExpenses(StorageService.getExpenses());
      showToast('Expense record updated', 'success');
      SupabaseService.syncExpense(updated).catch(() => {});
    }
  }, [showToast]);

  const deleteExpense = useCallback((id: string) => {
    const success = StorageService.deleteExpense(id);
    if (success) {
      setExpenses(StorageService.getExpenses());
      showToast('Expense record deleted', 'info');
      SupabaseService.deleteExpense(id).catch(() => {});
    }
  }, [showToast]);

  const createSavingsTransaction = useCallback((data: Omit<SavingsTransaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newRecord = StorageService.addSavingsTransaction({
      ...data,
      userId: profile.id,
    });
    setSavingsTransactions(StorageService.getSavingsTransactions());
    setSavingsGoals(StorageService.getSavingsGoals());
    showToast(`Savings ${data.type} recorded!`, 'success');
    SupabaseService.syncSavingsTx(newRecord).catch(() => {});
    return newRecord;
  }, [profile.id, showToast]);

  const deleteSavingsTransaction = useCallback((id: string) => {
    const success = StorageService.deleteSavingsTransaction(id);
    if (success) {
      setSavingsTransactions(StorageService.getSavingsTransactions());
      setSavingsGoals(StorageService.getSavingsGoals());
      showToast('Savings transaction deleted', 'info');
      SupabaseService.deleteSavingsTx(id).catch(() => {});
    }
  }, [showToast]);

  const createSavingsGoal = useCallback((data: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newRecord = StorageService.addSavingsGoal({
      ...data,
      userId: profile.id,
    });
    setSavingsGoals(StorageService.getSavingsGoals());
    showToast('New savings goal created!', 'success');
    SupabaseService.syncSavingsGoal(newRecord).catch(() => {});
    return newRecord;
  }, [profile.id, showToast]);

  const updateSavingsGoal = useCallback((id: string, data: Partial<SavingsGoal>) => {
    const updated = StorageService.updateSavingsGoal(id, data);
    if (updated) {
      setSavingsGoals(StorageService.getSavingsGoals());
      showToast('Savings goal updated', 'success');
      SupabaseService.syncSavingsGoal(updated).catch(() => {});
    }
  }, [showToast]);

  const deleteSavingsGoal = useCallback((id: string) => {
    const success = StorageService.deleteSavingsGoal(id);
    if (success) {
      setSavingsGoals(StorageService.getSavingsGoals());
      showToast('Savings goal deleted', 'info');
      SupabaseService.deleteSavingsGoal(id).catch(() => {});
    }
  }, [showToast]);

  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    const updated = StorageService.updateProfile(data);
    setProfile(updated);
    showToast('Profile & preferences updated', 'success');
    SupabaseService.syncProfile(updated).catch(() => {});
  }, [showToast]);

  const resetToSampleData = useCallback(() => {
    StorageService.resetToSampleData();
    setProfile(StorageService.getProfile());
    setTransfers(StorageService.getTransfers());
    setIncomes(StorageService.getIncomes());
    setExpenses(StorageService.getExpenses());
    setSavingsTransactions(StorageService.getSavingsTransactions());
    setSavingsGoals(StorageService.getSavingsGoals());
    showToast('Reset to demo sample data completed', 'info');
  }, [showToast]);

  const clearAllData = useCallback(() => {
    StorageService.clearAllData();
    setTransfers([]);
    setIncomes([]);
    setExpenses([]);
    setSavingsTransactions([]);
    setSavingsGoals([]);
    showToast('All transaction records cleared', 'info');
  }, [showToast]);

  const importDataFromJson = useCallback((json: string): boolean => {
    const success = StorageService.importBackupJson(json);
    if (success) {
      setProfile(StorageService.getProfile());
      setTransfers(StorageService.getTransfers());
      setIncomes(StorageService.getIncomes());
      setExpenses(StorageService.getExpenses());
      setSavingsTransactions(StorageService.getSavingsTransactions());
      setSavingsGoals(StorageService.getSavingsGoals());
      showToast('Backup restored successfully!', 'success');
      return true;
    } else {
      showToast('Failed to import JSON data. Check format.', 'error');
      return false;
    }
  }, [showToast]);

  const login = useCallback((email: string, name?: string) => {
    const session = {
      isAuthenticated: true,
      user: {
        email,
        name: name || email.split('@')[0] || 'User',
      }
    };
    StorageService.setAuthSession(session);
    setAuthSession(session);
    showToast(`Welcome back, ${session.user.name}!`, 'success');
  }, [showToast]);

  const logout = useCallback(() => {
    const session = { isAuthenticated: false, user: null };
    StorageService.setAuthSession(session);
    setAuthSession(session);
    showToast('Logged out securely', 'info');
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        profile,
        transfers,
        incomes,
        expenses,
        savingsTransactions,
        savingsGoals,
        activeTab,
        dateFilter,
        searchQuery,
        authSession,
        isOnboardingOpen,
        toasts,

        // Supabase State & Actions
        supabaseStatus,
        supabaseLatency,
        lastSyncedAt,
        supabaseConfig,
        isSyncing,
        testSupabaseConnection,
        syncToSupabase,
        syncFromSupabase,
        saveSupabaseCredentials,

        isTransferModalOpen,
        editingTransfer,
        isIncomeModalOpen,
        editingIncome,
        isExpenseModalOpen,
        editingExpense,
        isSavingsModalOpen,
        savingsModalType,
        selectedGoalIdForSavings,
        isGoalModalOpen,
        editingGoal,
        viewingTransferDetail,

        filteredTransfers,
        filteredIncomes,
        filteredExpenses,
        filteredSavingsTxs,
        metrics,

        setActiveTab,
        setDateFilter,
        setSearchQuery,
        showToast,
        removeToast,

        openTransferModal,
        closeTransferModal,
        openIncomeModal,
        closeIncomeModal,
        openExpenseModal,
        closeExpenseModal,
        openSavingsModal,
        closeSavingsModal,
        openGoalModal,
        closeGoalModal,
        openTransferDetail,
        closeTransferDetail,
        closeOnboarding,
        openOnboarding,

        createTransfer,
        updateTransfer,
        deleteTransfer,
        createIncome,
        updateIncome,
        deleteIncome,
        createExpense,
        updateExpense,
        deleteExpense,
        createSavingsTransaction,
        deleteSavingsTransaction,
        createSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        updateProfile,
        resetToSampleData,
        clearAllData,
        importDataFromJson,

        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
