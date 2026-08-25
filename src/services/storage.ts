import { 
  UserProfile, 
  TransferRecord, 
  IncomeRecord, 
  ExpenseRecord, 
  SavingsTransaction, 
  SavingsGoal 
} from '../types';
import { usdToCents } from '../utils/currency';

const STORAGE_KEYS = {
  PROFILE: 'trekad_user_profile_v1',
  TRANSFERS: 'trekad_transfers_v1',
  INCOMES: 'trekad_incomes_v1',
  EXPENSES: 'trekad_expenses_v1',
  SAVINGS_TXS: 'trekad_savings_txs_v1',
  SAVINGS_GOALS: 'trekad_savings_goals_v1',
  AUTH: 'trekad_auth_session_v1',
  ONBOARDED: 'trekad_has_onboarded_v1',
};

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_default_01',
  email: 'adamtraoreoubeydoulaye@gmail.com',
  fullName: 'Adam Traore',
  defaultCurrency: 'XOF',
  defaultReferenceRate: 600,
  defaultCustomRate: 615,
  defaultPaymentMethod: 'Mobile Money',
  dateFormat: 'YYYY-MM-DD',
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-24T00:00:00Z',
};

const INITIAL_TRANSFERS: TransferRecord[] = [
  {
    id: 'TR-0001',
    userId: 'usr_default_01',
    transactionDate: '2026-08-01',
    usdCents: 10000,
    usdAmount: 100,
    referenceRate: 600,
    customRate: 610,
    cfaAmount: 61000,
    feeAmount: 2000,
    status: 'Completed',
    paymentMethod: 'Mobile Money',
    recipientName: 'Kouamé Jean',
    notes: 'First USD to CFA conversion of the month. Sent via Orange Money.',
    createdAt: '2026-08-01T10:15:00Z',
    updatedAt: '2026-08-01T10:15:00Z',
  },
  {
    id: 'TR-0002',
    userId: 'usr_default_01',
    transactionDate: '2026-08-08',
    usdCents: 20000,
    usdAmount: 200,
    referenceRate: 605,
    customRate: 615,
    cfaAmount: 123000,
    feeAmount: 4000,
    status: 'Completed',
    paymentMethod: 'Wave',
    recipientName: 'Diop Fatou',
    notes: 'Commercial merchandise exchange funds.',
    createdAt: '2026-08-08T14:30:00Z',
    updatedAt: '2026-08-08T14:30:00Z',
  },
  {
    id: 'TR-0003',
    userId: 'usr_default_01',
    transactionDate: '2026-08-15',
    usdCents: 5000,
    usdAmount: 50,
    referenceRate: 610,
    customRate: 620,
    cfaAmount: 31000,
    feeAmount: 1500,
    status: 'Completed',
    paymentMethod: 'Mobile Money',
    recipientName: 'Traore Amadou',
    notes: 'Emergency family support transfer.',
    createdAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-08-15T09:00:00Z',
  },
  {
    id: 'TR-0004',
    userId: 'usr_default_01',
    transactionDate: '2026-08-20',
    usdCents: 40000,
    usdAmount: 400,
    referenceRate: 608,
    customRate: 618,
    cfaAmount: 247200,
    feeAmount: 8000,
    status: 'Completed',
    paymentMethod: 'Wave',
    recipientName: 'Bakayoko Sarah',
    notes: 'Monthly contractor payment converted to CFA.',
    createdAt: '2026-08-20T16:45:00Z',
    updatedAt: '2026-08-20T16:45:00Z',
  },
  {
    id: 'TR-0005',
    userId: 'usr_default_01',
    transactionDate: '2026-08-23',
    usdCents: 50000,
    usdAmount: 500,
    referenceRate: 612,
    customRate: 625,
    cfaAmount: 312500,
    feeAmount: 10000,
    status: 'Pending',
    paymentMethod: 'Bank',
    recipientName: 'Coulibaly Ibrahim',
    notes: 'Awaiting client confirmation of cash delivery.',
    createdAt: '2026-08-23T11:20:00Z',
    updatedAt: '2026-08-23T11:20:00Z',
  },
];

const INITIAL_INCOMES: IncomeRecord[] = [
  {
    id: 'INC-001',
    userId: 'usr_default_01',
    transactionDate: '2026-08-05',
    amount: 150000,
    currency: 'XOF',
    category: 'Freelance',
    source: 'Upwork Web Design',
    description: 'Landing page development for international client',
    notes: 'Direct client payment',
    createdAt: '2026-08-05T12:00:00Z',
    updatedAt: '2026-08-05T12:00:00Z',
  },
  {
    id: 'INC-002',
    userId: 'usr_default_01',
    transactionDate: '2026-08-12',
    amount: 80000,
    currency: 'XOF',
    category: 'Business',
    source: 'IT Consulting',
    description: 'Technical audit for local firm',
    notes: 'Cash received',
    createdAt: '2026-08-12T15:00:00Z',
    updatedAt: '2026-08-12T15:00:00Z',
  },
];

const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'EXP-001',
    userId: 'usr_default_01',
    transactionDate: '2026-08-02',
    amount: 85000,
    currency: 'XOF',
    category: 'Rent / Accommodation',
    paymentMethod: 'Bank',
    description: 'Monthly apartment rent',
    notes: 'Paid via bank transfer',
    createdAt: '2026-08-02T08:00:00Z',
    updatedAt: '2026-08-02T08:00:00Z',
  },
  {
    id: 'EXP-002',
    userId: 'usr_default_01',
    transactionDate: '2026-08-06',
    amount: 28000,
    currency: 'XOF',
    category: 'Food',
    paymentMethod: 'Cash',
    description: 'Supermarket groceries & fresh market',
    createdAt: '2026-08-06T18:00:00Z',
    updatedAt: '2026-08-06T18:00:00Z',
  },
  {
    id: 'EXP-003',
    userId: 'usr_default_01',
    transactionDate: '2026-08-10',
    amount: 12000,
    currency: 'XOF',
    category: 'Transport',
    paymentMethod: 'Cash',
    description: 'Fuel & taxi rides',
    createdAt: '2026-08-10T19:30:00Z',
    updatedAt: '2026-08-10T19:30:00Z',
  },
  {
    id: 'EXP-004',
    userId: 'usr_default_01',
    transactionDate: '2026-08-14',
    amount: 15000,
    currency: 'XOF',
    category: 'Phone / Internet',
    paymentMethod: 'Wave',
    description: 'High-speed fiber internet subscription',
    createdAt: '2026-08-14T11:00:00Z',
    updatedAt: '2026-08-14T11:00:00Z',
  },
  {
    id: 'EXP-005',
    userId: 'usr_default_01',
    transactionDate: '2026-08-18',
    amount: 5000,
    currency: 'XOF',
    category: 'Transport',
    paymentMethod: 'Cash',
    description: 'Taxi',
    notes: 'Ride to meeting',
    createdAt: '2026-08-18T14:15:00Z',
    updatedAt: '2026-08-18T14:15:00Z',
  },
  {
    id: 'EXP-006',
    userId: 'usr_default_01',
    transactionDate: '2026-08-22',
    amount: 25000,
    currency: 'XOF',
    category: 'Shopping',
    paymentMethod: 'Mobile Money',
    description: 'Office accessories and clothing',
    createdAt: '2026-08-22T17:00:00Z',
    updatedAt: '2026-08-22T17:00:00Z',
  },
];

const INITIAL_SAVINGS_TXS: SavingsTransaction[] = [
  {
    id: 'SAV-TX-001',
    userId: 'usr_default_01',
    transactionDate: '2026-08-03',
    type: 'contribution',
    amount: 100000,
    sourceOrReason: 'Salary & business buffer allocation',
    notes: 'Initial monthly savings deposit',
    goalId: 'GOAL-003',
    createdAt: '2026-08-03T10:00:00Z',
    updatedAt: '2026-08-03T10:00:00Z',
  },
  {
    id: 'SAV-TX-002',
    userId: 'usr_default_01',
    transactionDate: '2026-08-10',
    type: 'contribution',
    amount: 20000,
    sourceOrReason: 'Transfer earnings',
    notes: 'Allocated directly from transfer fees',
    goalId: 'GOAL-001',
    createdAt: '2026-08-10T12:00:00Z',
    updatedAt: '2026-08-10T12:00:00Z',
  },
  {
    id: 'SAV-TX-003',
    userId: 'usr_default_01',
    transactionDate: '2026-08-16',
    type: 'contribution',
    amount: 50000,
    sourceOrReason: 'Freelance surplus',
    notes: 'Laptop goal fund contribution',
    goalId: 'GOAL-001',
    createdAt: '2026-08-16T15:00:00Z',
    updatedAt: '2026-08-16T15:00:00Z',
  },
  {
    id: 'SAV-TX-004',
    userId: 'usr_default_01',
    transactionDate: '2026-08-21',
    type: 'withdrawal',
    amount: 10000,
    sourceOrReason: 'Emergency',
    notes: 'Urgent car repair expense',
    createdAt: '2026-08-21T09:30:00Z',
    updatedAt: '2026-08-21T09:30:00Z',
  },
];

const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'GOAL-001',
    userId: 'usr_default_01',
    name: 'New Laptop',
    targetAmount: 1500000,
    currentAmount: 350000,
    targetDate: '2026-12-31',
    description: 'MacBook Pro M3 for high-performance development and client design work',
    categoryIcon: 'laptop',
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-24T00:00:00Z',
  },
  {
    id: 'GOAL-002',
    userId: 'usr_default_01',
    name: 'Travel',
    targetAmount: 800000,
    currentAmount: 180000,
    targetDate: '2027-04-15',
    description: 'Regional travel & family reunion trip',
    categoryIcon: 'plane',
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-24T00:00:00Z',
  },
  {
    id: 'GOAL-003',
    userId: 'usr_default_01',
    name: 'Emergency Fund',
    targetAmount: 500000,
    currentAmount: 220000,
    targetDate: '2026-10-31',
    description: '3 months essential living expenses cushion in liquid account',
    categoryIcon: 'shield',
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-24T00:00:00Z',
  },
];

export const StorageService = {
  // --- Profile & Auth ---
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) return JSON.parse(data);
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  updateProfile(profile: Partial<UserProfile>): UserProfile {
    const current = this.getProfile();
    const updated: UserProfile = {
      ...current,
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    return updated;
  },

  getAuthSession(): { isAuthenticated: boolean; user: { email: string; name: string } | null } {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (data) return JSON.parse(data);
      // Default to logged in as demo user for instant preview
      const defaultAuth = {
        isAuthenticated: true,
        user: { email: DEFAULT_PROFILE.email, name: DEFAULT_PROFILE.fullName }
      };
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(defaultAuth));
      return defaultAuth;
    } catch {
      return { isAuthenticated: true, user: { email: DEFAULT_PROFILE.email, name: DEFAULT_PROFILE.fullName } };
    }
  },

  setAuthSession(session: { isAuthenticated: boolean; user: { email: string; name: string } | null }): void {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(session));
  },

  hasOnboarded(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDED) === 'true';
  },

  setOnboarded(value: boolean): void {
    localStorage.setItem(STORAGE_KEYS.ONBOARDED, value ? 'true' : 'false');
  },

  // --- Transfers ---
  getTransfers(): TransferRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSFERS);
      if (data) return JSON.parse(data);
      localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(INITIAL_TRANSFERS));
      return INITIAL_TRANSFERS;
    } catch {
      return INITIAL_TRANSFERS;
    }
  },

  saveTransfers(transfers: TransferRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers));
  },

  addTransfer(transfer: Omit<TransferRecord, 'id' | 'createdAt' | 'updatedAt' | 'usdCents'>): TransferRecord {
    const transfers = this.getTransfers();
    const nextNum = transfers.length + 1;
    const id = `TR-${String(nextNum).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const newRecord: TransferRecord = {
      ...transfer,
      id,
      usdCents: usdToCents(transfer.usdAmount),
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newRecord, ...transfers];
    this.saveTransfers(updated);
    return newRecord;
  },

  updateTransfer(id: string, transfer: Partial<TransferRecord>): TransferRecord | null {
    const transfers = this.getTransfers();
    const index = transfers.findIndex(t => t.id === id);
    if (index === -1) return null;

    const current = transfers[index];
    const usdAmount = transfer.usdAmount !== undefined ? transfer.usdAmount : current.usdAmount;
    
    const updatedRecord: TransferRecord = {
      ...current,
      ...transfer,
      usdAmount,
      usdCents: usdToCents(usdAmount),
      updatedAt: new Date().toISOString(),
    };

    transfers[index] = updatedRecord;
    this.saveTransfers(transfers);
    return updatedRecord;
  },

  deleteTransfer(id: string): boolean {
    const transfers = this.getTransfers();
    const filtered = transfers.filter(t => t.id !== id);
    if (filtered.length === transfers.length) return false;
    this.saveTransfers(filtered);
    return true;
  },

  // --- Incomes ---
  getIncomes(): IncomeRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INCOMES);
      if (data) return JSON.parse(data);
      localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(INITIAL_INCOMES));
      return INITIAL_INCOMES;
    } catch {
      return INITIAL_INCOMES;
    }
  },

  saveIncomes(incomes: IncomeRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
  },

  addIncome(income: Omit<IncomeRecord, 'id' | 'createdAt' | 'updatedAt'>): IncomeRecord {
    const incomes = this.getIncomes();
    const nextNum = incomes.length + 1;
    const id = `INC-${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newRecord: IncomeRecord = {
      ...income,
      id,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newRecord, ...incomes];
    this.saveIncomes(updated);
    return newRecord;
  },

  updateIncome(id: string, income: Partial<IncomeRecord>): IncomeRecord | null {
    const incomes = this.getIncomes();
    const index = incomes.findIndex(i => i.id === id);
    if (index === -1) return null;

    const updatedRecord: IncomeRecord = {
      ...incomes[index],
      ...income,
      updatedAt: new Date().toISOString(),
    };

    incomes[index] = updatedRecord;
    this.saveIncomes(incomes);
    return updatedRecord;
  },

  deleteIncome(id: string): boolean {
    const incomes = this.getIncomes();
    const filtered = incomes.filter(i => i.id !== id);
    if (filtered.length === incomes.length) return false;
    this.saveIncomes(filtered);
    return true;
  },

  // --- Expenses ---
  getExpenses(): ExpenseRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (data) return JSON.parse(data);
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
      return INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  },

  saveExpenses(expenses: ExpenseRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  },

  addExpense(expense: Omit<ExpenseRecord, 'id' | 'createdAt' | 'updatedAt'>): ExpenseRecord {
    const expenses = this.getExpenses();
    const nextNum = expenses.length + 1;
    const id = `EXP-${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newRecord: ExpenseRecord = {
      ...expense,
      id,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newRecord, ...expenses];
    this.saveExpenses(updated);
    return newRecord;
  },

  updateExpense(id: string, expense: Partial<ExpenseRecord>): ExpenseRecord | null {
    const expenses = this.getExpenses();
    const index = expenses.findIndex(e => e.id === id);
    if (index === -1) return null;

    const updatedRecord: ExpenseRecord = {
      ...expenses[index],
      ...expense,
      updatedAt: new Date().toISOString(),
    };

    expenses[index] = updatedRecord;
    this.saveExpenses(expenses);
    return updatedRecord;
  },

  deleteExpense(id: string): boolean {
    const expenses = this.getExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    if (filtered.length === expenses.length) return false;
    this.saveExpenses(filtered);
    return true;
  },

  // --- Savings Transactions ---
  getSavingsTransactions(): SavingsTransaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVINGS_TXS);
      if (data) return JSON.parse(data);
      localStorage.setItem(STORAGE_KEYS.SAVINGS_TXS, JSON.stringify(INITIAL_SAVINGS_TXS));
      return INITIAL_SAVINGS_TXS;
    } catch {
      return INITIAL_SAVINGS_TXS;
    }
  },

  saveSavingsTransactions(txs: SavingsTransaction[]): void {
    localStorage.setItem(STORAGE_KEYS.SAVINGS_TXS, JSON.stringify(txs));
  },

  addSavingsTransaction(tx: Omit<SavingsTransaction, 'id' | 'createdAt' | 'updatedAt'>): SavingsTransaction {
    const txs = this.getSavingsTransactions();
    const nextNum = txs.length + 1;
    const id = `SAV-TX-${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newRecord: SavingsTransaction = {
      ...tx,
      id,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newRecord, ...txs];
    this.saveSavingsTransactions(updated);

    // If attached to a goal, optionally update goal progress
    if (tx.goalId) {
      this.syncGoalProgress(tx.goalId);
    }

    return newRecord;
  },

  deleteSavingsTransaction(id: string): boolean {
    const txs = this.getSavingsTransactions();
    const target = txs.find(t => t.id === id);
    const filtered = txs.filter(t => t.id !== id);
    if (filtered.length === txs.length) return false;
    this.saveSavingsTransactions(filtered);
    if (target?.goalId) {
      this.syncGoalProgress(target.goalId);
    }
    return true;
  },

  // --- Savings Goals ---
  getSavingsGoals(): SavingsGoal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS);
      if (data) return JSON.parse(data);
      localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(INITIAL_SAVINGS_GOALS));
      return INITIAL_SAVINGS_GOALS;
    } catch {
      return INITIAL_SAVINGS_GOALS;
    }
  },

  saveSavingsGoals(goals: SavingsGoal[]): void {
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals));
  },

  addSavingsGoal(goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>): SavingsGoal {
    const goals = this.getSavingsGoals();
    const nextNum = goals.length + 1;
    const id = `GOAL-${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newRecord: SavingsGoal = {
      ...goal,
      id,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [...goals, newRecord];
    this.saveSavingsGoals(updated);
    return newRecord;
  },

  updateSavingsGoal(id: string, goal: Partial<SavingsGoal>): SavingsGoal | null {
    const goals = this.getSavingsGoals();
    const index = goals.findIndex(g => g.id === id);
    if (index === -1) return null;

    const updatedRecord: SavingsGoal = {
      ...goals[index],
      ...goal,
      updatedAt: new Date().toISOString(),
    };

    goals[index] = updatedRecord;
    this.saveSavingsGoals(goals);
    return updatedRecord;
  },

  deleteSavingsGoal(id: string): boolean {
    const goals = this.getSavingsGoals();
    const filtered = goals.filter(g => g.id !== id);
    if (filtered.length === goals.length) return false;
    this.saveSavingsGoals(filtered);
    return true;
  },

  syncGoalProgress(goalId: string): void {
    const txs = this.getSavingsTransactions().filter(t => t.goalId === goalId);
    const totalContributed = txs.reduce((acc, t) => {
      return t.type === 'contribution' ? acc + t.amount : acc - t.amount;
    }, 0);

    const goals = this.getSavingsGoals();
    const goalIndex = goals.findIndex(g => g.id === goalId);
    if (goalIndex !== -1) {
      goals[goalIndex].currentAmount = Math.max(0, totalContributed);
      this.saveSavingsGoals(goals);
    }
  },

  // --- Reset to Sample Data ---
  resetToSampleData(): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
    localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(INITIAL_TRANSFERS));
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(INITIAL_INCOMES));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
    localStorage.setItem(STORAGE_KEYS.SAVINGS_TXS, JSON.stringify(INITIAL_SAVINGS_TXS));
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(INITIAL_SAVINGS_GOALS));
  },

  // --- Clear All Data ---
  clearAllData(): void {
    localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SAVINGS_TXS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify([]));
  },

  // --- Export Full JSON Backup ---
  exportBackupJson(): string {
    return JSON.stringify({
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      transfers: this.getTransfers(),
      incomes: this.getIncomes(),
      expenses: this.getExpenses(),
      savingsTransactions: this.getSavingsTransactions(),
      savingsGoals: this.getSavingsGoals(),
    }, null, 2);
  },

  // --- Import Backup JSON ---
  importBackupJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(parsed.profile));
      if (Array.isArray(parsed.transfers)) localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(parsed.transfers));
      if (Array.isArray(parsed.incomes)) localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(parsed.incomes));
      if (Array.isArray(parsed.expenses)) localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(parsed.expenses));
      if (Array.isArray(parsed.savingsTransactions)) localStorage.setItem(STORAGE_KEYS.SAVINGS_TXS, JSON.stringify(parsed.savingsTransactions));
      if (Array.isArray(parsed.savingsGoals)) localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(parsed.savingsGoals));
      return true;
    } catch {
      return false;
    }
  },

  // --- PostgreSQL / Supabase Schema Definition ---
  getSupabaseSchemaSql(): string {
    return `-- =================================================================
-- TREKAD POSTGRESQL & SUPABASE DDL SCHEMA & ROW LEVEL SECURITY (RLS)
-- Compatible with PostgreSQL 14+ / Supabase
-- =================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  default_currency VARCHAR(3) DEFAULT 'XOF',
  default_reference_rate NUMERIC(10, 2) DEFAULT 600.00,
  default_custom_rate NUMERIC(10, 2) DEFAULT 615.00,
  default_payment_method TEXT DEFAULT 'Mobile Money',
  date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Transfers Table (USD -> CFA)
CREATE TABLE IF NOT EXISTS public.transfers (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  usd_cents BIGINT NOT NULL, -- Integer cents e.g. 10000 = $100.00
  usd_amount NUMERIC(12, 2) NOT NULL,
  reference_rate NUMERIC(10, 2) NOT NULL,
  custom_rate NUMERIC(10, 2) NOT NULL,
  cfa_amount BIGINT NOT NULL, -- Integer FCFA e.g. 61500
  is_manual_override BOOLEAN DEFAULT FALSE,
  fee_amount BIGINT NOT NULL DEFAULT 0, -- Commission earned in FCFA
  status VARCHAR(20) NOT NULL CHECK (status IN ('Completed', 'Pending', 'Cancelled')),
  payment_method VARCHAR(50) NOT NULL,
  recipient_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Incomes Table
CREATE TABLE IF NOT EXISTS public.incomes (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  amount BIGINT NOT NULL, -- in FCFA integer
  currency VARCHAR(3) DEFAULT 'XOF',
  category VARCHAR(50) NOT NULL,
  source TEXT NOT NULL,
  transfer_id TEXT REFERENCES public.transfers(id) ON DELETE SET NULL,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  amount BIGINT NOT NULL, -- in FCFA integer
  currency VARCHAR(3) DEFAULT 'XOF',
  category VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Savings Goals Table
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount BIGINT NOT NULL,
  current_amount BIGINT NOT NULL DEFAULT 0,
  target_date DATE,
  description TEXT,
  category_icon VARCHAR(30) DEFAULT 'piggy',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 6. Savings Transactions Table
CREATE TABLE IF NOT EXISTS public.savings_transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('contribution', 'withdrawal')),
  amount BIGINT NOT NULL,
  source_or_reason TEXT NOT NULL,
  notes TEXT,
  goal_id TEXT REFERENCES public.savings_goals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;

-- Security Policies (Users can only access their own financial records)
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own transfers" ON public.transfers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own incomes" ON public.incomes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own expenses" ON public.expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own savings goals" ON public.savings_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own savings transactions" ON public.savings_transactions FOR ALL USING (auth.uid() = user_id);
`;
  }
};
