import { TransferRecord, IncomeRecord, ExpenseRecord, SavingsTransaction } from '../types';
import { formatUSD, formatXOF } from './currency';
import { formatDateDisplay } from './date';

export function exportTransfersToCsv(transfers: TransferRecord[], filename = 'trekad_transfers.csv') {
  const headers = [
    'Transaction Date',
    'USD Amount',
    'Reference Rate (XOF/USD)',
    'Custom Rate (XOF/USD)',
    'CFA Sent (XOF)',
    'Fee Earned (XOF)',
    'Status',
    'Payment Method',
    'Recipient',
    'Notes',
    'Created At'
  ];

  const rows = transfers.map(t => [
    `"${t.transactionDate}"`,
    `"${t.usdAmount.toFixed(2)}"`,
    `"${t.referenceRate}"`,
    `"${t.customRate}"`,
    `"${t.cfaAmount}"`,
    `"${t.feeAmount}"`,
    `"${t.status}"`,
    `"${t.paymentMethod}"`,
    `"${(t.recipientName || '').replace(/"/g, '""')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
    `"${t.createdAt}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportFinancialLedgerToCsv(data: {
  transfers: TransferRecord[];
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
  savings: SavingsTransaction[];
}, filename = 'trekad_full_financial_ledger.csv') {
  const headers = ['Record Type', 'Date', 'Amount Primary', 'Secondary Currency', 'Category / Method', 'Client / Source / Reason', 'Notes'];

  const rows: string[][] = [];

  data.transfers.forEach(t => {
    rows.push([
      '"Transfer (USD->CFA)"',
      `"${t.transactionDate}"`,
      `"${formatXOF(t.cfaAmount)}"`,
      `"${formatUSD(t.usdAmount)} @ ${t.customRate}"`,
      `"${t.paymentMethod} (${t.status})"`,
      `"${(t.recipientName || '').replace(/"/g, '""')}"`,
      `"Fee: ${formatXOF(t.feeAmount)} | Notes: ${(t.notes || '').replace(/"/g, '""')}"`
    ]);
  });

  data.incomes.forEach(i => {
    rows.push([
      '"Income"',
      `"${i.transactionDate}"`,
      `"${formatXOF(i.amount)}"`,
      '""',
      `"${i.category}"`,
      `"${(i.source || '').replace(/"/g, '""')}"`,
      `"${(i.description || i.notes || '').replace(/"/g, '""')}"`
    ]);
  });

  data.expenses.forEach(e => {
    rows.push([
      '"Expense"',
      `"${e.transactionDate}"`,
      `"${formatXOF(e.amount)}"`,
      '""',
      `"${e.category} (${e.paymentMethod})"`,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ]);
  });

  data.savings.forEach(s => {
    rows.push([
      `"Savings ${s.type === 'contribution' ? 'Contribution' : 'Withdrawal'}"`,
      `"${s.transactionDate}"`,
      `"${s.type === 'contribution' ? '+' : '-'}${formatXOF(s.amount)}"`,
      '""',
      `"${s.type}"`,
      `"${(s.sourceOrReason || '').replace(/"/g, '""')}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`
    ]);
  });

  // Sort by date descending
  rows.sort((a, b) => (b[1] > a[1] ? 1 : -1));

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
