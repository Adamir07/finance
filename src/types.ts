export type TransferStatus = 'Completed' | 'Pending' | 'Cancelled';

export type PaymentMethod = 'Mobile Money' | 'Bank' | 'Cash' | 'Wave' | 'Orange Money' | 'MTN MoMo' | 'Other';

export type IncomeCategory = 
  | 'Transfer commission' 
  | 'Freelance' 
  | 'Salary' 
  | 'Business' 
  | 'Gift' 
  | 'Other';

export type ExpenseCategory = 
  | 'Food'
  | 'Transport'
  | 'Phone / Internet'
  | 'Education'
  | 'Shopping'
  | 'Entertainment'
  | 'Rent / Accommodation'
  | 'Travel'
  | 'Family'
  | 'Health'
  | 'Bills'
  | 'Other';

export type SavingsTransactionType = 'contribution' | 'withdrawal';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  defaultCurrency: 'XOF' | 'USD';
  defaultReferenceRate: number; // e.g. 600
  defaultCustomRate: number; // e.g. 615
  defaultPaymentMethod: PaymentMethod;
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
  createdAt: string;
  updatedAt: string;
}

export interface TransferRecord {
  id: string;
  userId: string;
  transactionDate: string; // YYYY-MM-DD (supports backdating)
  usdCents: number; // Stored as integer cents ($100.00 -> 10000)
  usdAmount: number; // Helper getter/value e.g. 100.00
  referenceRate: number; // e.g. 600
  customRate: number; // e.g. 615 (permanently saved with this transfer)
  cfaAmount: number; // e.g. 61500 (integer XOF)
  isManualCfaOverride?: boolean;
  feeAmount: number; // e.g. 3000 (commission earned in XOF)
  status: TransferStatus;
  paymentMethod: PaymentMethod;
  recipientName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeRecord {
  id: string;
  userId: string;
  transactionDate: string; // YYYY-MM-DD
  amount: number; // in XOF (integer)
  currency: 'XOF' | 'USD';
  category: IncomeCategory;
  source: string;
  transferId?: string; // If auto-linked from a transfer fee
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseRecord {
  id: string;
  userId: string;
  transactionDate: string; // YYYY-MM-DD
  amount: number; // in XOF (integer)
  currency: 'XOF' | 'USD';
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  description: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsTransaction {
  id: string;
  userId: string;
  transactionDate: string; // YYYY-MM-DD
  type: SavingsTransactionType;
  amount: number; // in XOF (integer)
  sourceOrReason: string; // Source for contribution, Reason for withdrawal
  notes?: string;
  goalId?: string; // Optional target goal
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number; // in XOF (integer)
  currentAmount: number; // in XOF (integer)
  targetDate?: string;
  description?: string;
  categoryIcon?: string;
  createdAt: string;
  updatedAt: string;
}

export type DateFilterPreset = 
  | 'all'
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'custom';

export interface DateFilterRange {
  preset: DateFilterPreset;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

export type ActiveTab = 
  | 'dashboard'
  | 'transfers'
  | 'income'
  | 'expenses'
  | 'savings'
  | 'reports'
  | 'settings';
