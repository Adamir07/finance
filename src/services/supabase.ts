import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  UserProfile, 
  TransferRecord, 
  IncomeRecord, 
  ExpenseRecord, 
  SavingsTransaction, 
  SavingsGoal 
} from '../types';

const SUPABASE_CONFIG_KEY = 'trekad_supabase_custom_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

let supabaseInstance: SupabaseClient | null = null;
let currentConfig: SupabaseConfig | null = null;

// Get configured credentials (from Vite env or saved config)
export function getSupabaseConfig(): SupabaseConfig | null {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (envUrl && envKey) {
    return { url: envUrl.trim(), anonKey: envKey.trim() };
  }

  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return { url: parsed.url.trim(), anonKey: parsed.anonKey.trim() };
      }
    }
  } catch {
    // Ignore JSON parse errors
  }

  return null;
}

export function saveSupabaseConfig(config: SupabaseConfig | null): void {
  if (config && config.url && config.anonKey) {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify({
      url: config.url.trim(),
      anonKey: config.anonKey.trim()
    }));
  } else {
    localStorage.removeItem(SUPABASE_CONFIG_KEY);
  }
  // Reset client to reinitialize on next request
  supabaseInstance = null;
  currentConfig = null;
}

// Lazy Supabase client getter
export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config || !config.url || !config.anonKey) {
    return null;
  }

  if (supabaseInstance && currentConfig?.url === config.url && currentConfig?.anonKey === config.anonKey) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    currentConfig = config;
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

// ==========================================
// SQL Schema definition for Supabase Editor
// ==========================================
export const SUPABASE_SQL_SCHEMA = `-- =================================================================
-- TREKAD FINANCIAL PLATFORM - SUPABASE SQL SCHEMA & RLS POLICIES
-- Paste this entire script into your Supabase Dashboard -> SQL Editor -> Run
-- =================================================================

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
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

-- 2. Create Transfers Table (USD to CFA liquidity operations)
CREATE TABLE IF NOT EXISTS public.transfers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  usd_cents BIGINT NOT NULL,
  usd_amount NUMERIC(12, 2) NOT NULL,
  reference_rate NUMERIC(10, 2) NOT NULL,
  custom_rate NUMERIC(10, 2) NOT NULL,
  cfa_amount BIGINT NOT NULL,
  is_manual_override BOOLEAN DEFAULT FALSE,
  fee_amount BIGINT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Completed', 'Pending', 'Cancelled')),
  payment_method VARCHAR(50) NOT NULL,
  recipient_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Create Incomes Table (Personal earnings & revenues)
CREATE TABLE IF NOT EXISTS public.incomes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  amount BIGINT NOT NULL,
  currency VARCHAR(3) DEFAULT 'XOF',
  category VARCHAR(50) NOT NULL,
  source TEXT NOT NULL,
  transfer_id TEXT REFERENCES public.transfers(id) ON DELETE SET NULL,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Create Expenses Table (Living costs, bills & spending)
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  amount BIGINT NOT NULL,
  currency VARCHAR(3) DEFAULT 'XOF',
  category VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Create Savings Goals Table
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  target_amount BIGINT NOT NULL,
  current_amount BIGINT NOT NULL DEFAULT 0,
  target_date DATE,
  description TEXT,
  category_icon VARCHAR(30) DEFAULT 'piggy',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 6. Create Savings Transactions Table (Deposits & Withdrawals)
CREATE TABLE IF NOT EXISTS public.savings_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('contribution', 'withdrawal')),
  amount BIGINT NOT NULL,
  source_or_reason TEXT NOT NULL,
  notes TEXT,
  goal_id TEXT REFERENCES public.savings_goals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Create Fast Query Indexes
CREATE INDEX IF NOT EXISTS idx_transfers_user_date ON public.transfers(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_incomes_user_date ON public.incomes(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_savings_txs_user_date ON public.savings_transactions(user_id, transaction_date DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;

-- Public Anon Key Access Policies (Full access with matching applet credentials)
CREATE POLICY "Allow public access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to transfers" ON public.transfers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to incomes" ON public.incomes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to savings_goals" ON public.savings_goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to savings_transactions" ON public.savings_transactions FOR ALL USING (true) WITH CHECK (true);
`;

// ==========================================
// Database Model Transformers
// ==========================================
function mapTransferToDb(t: TransferRecord) {
  return {
    id: t.id,
    user_id: t.userId,
    transaction_date: t.transactionDate,
    usd_cents: t.usdCents,
    usd_amount: t.usdAmount,
    reference_rate: t.referenceRate,
    custom_rate: t.customRate,
    cfa_amount: t.cfaAmount,
    is_manual_override: t.isManualCfaOverride || false,
    fee_amount: t.feeAmount,
    status: t.status,
    payment_method: t.paymentMethod,
    recipient_name: t.recipientName || null,
    notes: t.notes || null,
    created_at: t.createdAt,
    updated_at: t.updatedAt,
  };
}

function mapDbToTransfer(db: any): TransferRecord {
  return {
    id: db.id,
    userId: db.user_id,
    transactionDate: db.transaction_date,
    usdCents: Number(db.usd_cents),
    usdAmount: Number(db.usd_amount),
    referenceRate: Number(db.reference_rate),
    customRate: Number(db.custom_rate),
    cfaAmount: Number(db.cfa_amount),
    isManualCfaOverride: db.is_manual_override,
    feeAmount: Number(db.fee_amount),
    status: db.status,
    paymentMethod: db.payment_method,
    recipientName: db.recipient_name || undefined,
    notes: db.notes || undefined,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

function mapIncomeToDb(i: IncomeRecord) {
  return {
    id: i.id,
    user_id: i.userId,
    transaction_date: i.transactionDate,
    amount: i.amount,
    currency: i.currency,
    category: i.category,
    source: i.source,
    transfer_id: i.transferId || null,
    description: i.description || null,
    notes: i.notes || null,
    created_at: i.createdAt,
    updated_at: i.updatedAt,
  };
}

function mapDbToIncome(db: any): IncomeRecord {
  return {
    id: db.id,
    userId: db.user_id,
    transactionDate: db.transaction_date,
    amount: Number(db.amount),
    currency: db.currency,
    category: db.category,
    source: db.source,
    transferId: db.transfer_id || undefined,
    description: db.description || undefined,
    notes: db.notes || undefined,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

function mapExpenseToDb(e: ExpenseRecord) {
  return {
    id: e.id,
    user_id: e.userId,
    transaction_date: e.transactionDate,
    amount: e.amount,
    currency: e.currency,
    category: e.category,
    payment_method: e.paymentMethod,
    description: e.description,
    notes: e.notes || null,
    created_at: e.createdAt,
    updated_at: e.updatedAt,
  };
}

function mapDbToExpense(db: any): ExpenseRecord {
  return {
    id: db.id,
    userId: db.user_id,
    transactionDate: db.transaction_date,
    amount: Number(db.amount),
    currency: db.currency,
    category: db.category,
    paymentMethod: db.payment_method,
    description: db.description,
    notes: db.notes || undefined,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

function mapSavingsGoalToDb(g: SavingsGoal) {
  return {
    id: g.id,
    user_id: g.userId,
    name: g.name,
    target_amount: g.targetAmount,
    current_amount: g.currentAmount,
    target_date: g.targetDate || null,
    description: g.description || null,
    category_icon: g.categoryIcon || 'piggy',
    created_at: g.createdAt,
    updated_at: g.updatedAt,
  };
}

function mapDbToSavingsGoal(db: any): SavingsGoal {
  return {
    id: db.id,
    userId: db.user_id,
    name: db.name,
    targetAmount: Number(db.target_amount),
    currentAmount: Number(db.current_amount),
    targetDate: db.target_date || undefined,
    description: db.description || undefined,
    categoryIcon: db.category_icon || 'piggy',
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

function mapSavingsTxToDb(s: SavingsTransaction) {
  return {
    id: s.id,
    user_id: s.userId,
    transaction_date: s.transactionDate,
    type: s.type,
    amount: s.amount,
    source_or_reason: s.sourceOrReason,
    notes: s.notes || null,
    goal_id: s.goalId || null,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  };
}

function mapDbToSavingsTx(db: any): SavingsTransaction {
  return {
    id: db.id,
    userId: db.user_id,
    transactionDate: db.transaction_date,
    type: db.type,
    amount: Number(db.amount),
    sourceOrReason: db.source_or_reason,
    notes: db.notes || undefined,
    goalId: db.goal_id || undefined,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

function mapProfileToDb(p: UserProfile) {
  return {
    id: p.id,
    email: p.email,
    full_name: p.fullName,
    default_currency: p.defaultCurrency,
    default_reference_rate: p.defaultReferenceRate,
    default_custom_rate: p.defaultCustomRate,
    default_payment_method: p.defaultPaymentMethod,
    date_format: p.dateFormat,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

function mapDbToProfile(db: any): UserProfile {
  return {
    id: db.id,
    email: db.email,
    fullName: db.full_name,
    defaultCurrency: db.default_currency || 'XOF',
    defaultReferenceRate: Number(db.default_reference_rate) || 600,
    defaultCustomRate: Number(db.default_custom_rate) || 615,
    defaultPaymentMethod: db.default_payment_method || 'Mobile Money',
    dateFormat: db.date_format || 'YYYY-MM-DD',
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

// ==========================================
// Supabase Cloud Service Methods
// ==========================================
export const SupabaseService = {
  // Test connection and table existence
  async testConnection(): Promise<{ success: boolean; message: string; latencyMs?: number }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Supabase URL or Anon Key is missing.' };
    }

    const start = performance.now();
    try {
      // Query profiles or check connection
      const { error } = await client.from('transfers').select('id').limit(1);
      const latencyMs = Math.round(performance.now() - start);

      if (error) {
        if (error.code === '42P01') {
          return { 
            success: false, 
            message: 'Connected to Supabase, but tables are not created yet. Please execute the SQL Schema in your Supabase SQL Editor.' 
          };
        }
        return { success: false, message: `Supabase error: ${error.message} (Code: ${error.code})` };
      }

      return { success: true, message: `Successfully connected to Supabase!`, latencyMs };
    } catch (err: any) {
      return { success: false, message: `Connection failed: ${err.message || 'Unknown network error'}` };
    }
  },

  // Pull all data from Supabase
  async fetchAllData(): Promise<{
    profile?: UserProfile;
    transfers: TransferRecord[];
    incomes: IncomeRecord[];
    expenses: ExpenseRecord[];
    savingsGoals: SavingsGoal[];
    savingsTransactions: SavingsTransaction[];
  } | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const [transfersRes, incomesRes, expensesRes, goalsRes, txsRes, profileRes] = await Promise.all([
        client.from('transfers').select('*').order('transaction_date', { ascending: false }),
        client.from('incomes').select('*').order('transaction_date', { ascending: false }),
        client.from('expenses').select('*').order('transaction_date', { ascending: false }),
        client.from('savings_goals').select('*').order('created_at', { ascending: true }),
        client.from('savings_transactions').select('*').order('transaction_date', { ascending: false }),
        client.from('profiles').select('*').limit(1).maybeSingle(),
      ]);

      if (transfersRes.error) throw transfersRes.error;
      if (incomesRes.error) throw incomesRes.error;
      if (expensesRes.error) throw expensesRes.error;
      if (goalsRes.error) throw goalsRes.error;
      if (txsRes.error) throw txsRes.error;

      return {
        profile: profileRes.data ? mapDbToProfile(profileRes.data) : undefined,
        transfers: (transfersRes.data || []).map(mapDbToTransfer),
        incomes: (incomesRes.data || []).map(mapDbToIncome),
        expenses: (expensesRes.data || []).map(mapDbToExpense),
        savingsGoals: (goalsRes.data || []).map(mapDbToSavingsGoal),
        savingsTransactions: (txsRes.data || []).map(mapDbToSavingsTx),
      };
    } catch (err) {
      console.error('Failed to fetch data from Supabase:', err);
      throw err;
    }
  },

  // Push all local data to Supabase (Full sync / upload)
  async pushAllData(data: {
    profile: UserProfile;
    transfers: TransferRecord[];
    incomes: IncomeRecord[];
    expenses: ExpenseRecord[];
    savingsGoals: SavingsGoal[];
    savingsTransactions: SavingsTransaction[];
  }): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      // 1. Profile
      await client.from('profiles').upsert(mapProfileToDb(data.profile));

      // 2. Transfers
      if (data.transfers.length > 0) {
        await client.from('transfers').upsert(data.transfers.map(mapTransferToDb));
      }

      // 3. Incomes
      if (data.incomes.length > 0) {
        await client.from('incomes').upsert(data.incomes.map(mapIncomeToDb));
      }

      // 4. Expenses
      if (data.expenses.length > 0) {
        await client.from('expenses').upsert(data.expenses.map(mapExpenseToDb));
      }

      // 5. Savings Goals
      if (data.savingsGoals.length > 0) {
        await client.from('savings_goals').upsert(data.savingsGoals.map(mapSavingsGoalToDb));
      }

      // 6. Savings Transactions
      if (data.savingsTransactions.length > 0) {
        await client.from('savings_transactions').upsert(data.savingsTransactions.map(mapSavingsTxToDb));
      }

      return true;
    } catch (err) {
      console.error('Failed to push data to Supabase:', err);
      throw err;
    }
  },

  // Surgical CRUD sync handlers (Fire & Forget or async)
  async syncTransfer(transfer: TransferRecord): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from('transfers').upsert(mapTransferToDb(transfer));
    } catch (err) {
      console.warn('Supabase sync transfer error:', err);
    }
  },

  async deleteTransfer(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from('transfers').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete transfer error:', err);
    }
  },

  async syncIncome(income: IncomeRecord): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from('incomes').upsert(mapIncomeToDb(income));
    } catch (err) {
      console.warn('Supabase sync income error:', err);
    }
  },

  async deleteIncome(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from('incomes').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete income error:', err);
    }
  },

  async syncExpense(expense: ExpenseRecord): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from('expenses').upsert(mapExpenseToDb(expense));
    } catch (err) {
      console.warn('Supabase sync expense error:', err);
    }
  },

  async deleteExpense(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from('expenses').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete expense error:', err);
    }
  },

  async syncSavingsGoal(goal: SavingsGoal): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from('savings_goals').upsert(mapSavingsGoalToDb(goal));
    } catch (err) {
      console.warn('Supabase sync goal error:', err);
    }
  },

  async deleteSavingsGoal(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from('savings_goals').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete goal error:', err);
    }
  },

  async syncSavingsTx(tx: SavingsTransaction): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from('savings_transactions').upsert(mapSavingsTxToDb(tx));
    } catch (err) {
      console.warn('Supabase sync savings tx error:', err);
    }
  },

  async deleteSavingsTx(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from('savings_transactions').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete savings tx error:', err);
    }
  },

  async syncProfile(profile: UserProfile): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from('profiles').upsert(mapProfileToDb(profile));
    } catch (err) {
      console.warn('Supabase sync profile error:', err);
    }
  }
};
