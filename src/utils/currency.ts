/**
 * Currency & Financial Calculations Utility
 * 
 * Strict integer-based math for financial values:
 * - USD amounts can be represented in cents (integer) or formatted with 2 decimals
 * - XOF (FCFA) has no decimal subunit and is stored as pure integers
 * - Exchange rates retain decimal precision
 */

export function usdToCents(usd: number): number {
  return Math.round(Number(usd || 0) * 100);
}

export function centsToUsd(cents: number): number {
  return (cents || 0) / 100;
}

export function formatUSD(amount: number, options: { includeSymbol?: boolean; forceDecimals?: boolean } = {}): string {
  const { includeSymbol = true, forceDecimals = true } = options;
  const num = Number(amount || 0);
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: forceDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(num);

  return includeSymbol ? `$${formatted}` : formatted;
}

export function formatXOF(amount: number, options: { includeSymbol?: boolean } = {}): string {
  const { includeSymbol = true } = options;
  const num = Math.round(Number(amount || 0));
  const formatted = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(num).replace(/\s/g, ',');

  return includeSymbol ? `${formatted} FCFA` : formatted;
}

export function formatRate(rate: number): string {
  const num = Number(rate || 0);
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Calculates CFA amount from USD and exchange rate
 */
export function calculateCfaFromUsd(usdAmount: number, customRate: number): number {
  const usd = Number(usdAmount || 0);
  const rate = Number(customRate || 0);
  return Math.round(usd * rate);
}

/**
 * Calculates reference CFA value from USD and reference rate
 */
export function calculateRefCfaFromUsd(usdAmount: number, refRate: number): number {
  const usd = Number(usdAmount || 0);
  const rate = Number(refRate || 0);
  return Math.round(usd * rate);
}

/**
 * Calculates rate margin / spread profit in CFA:
 * Formula: (Normal Rate * USD) - (My Rate * USD) = (Normal Rate - My Rate) * USD
 */
export function calculateSpreadProfit(usdAmount: number, normalRate: number, myRate: number): number {
  const usd = Number(usdAmount || 0);
  const ref = Number(normalRate || 0);
  const custom = Number(myRate || 0);
  // Support both directional spread and positive margin
  const diff = ref !== 0 && custom !== 0 ? Math.abs(ref - custom) : 0;
  return Math.round(usd * diff);
}

/**
 * Calculates signed rate margin in CFA:
 * Formula: (Normal Rate - My Rate) * USD
 */
export function calculateSignedSpreadProfit(usdAmount: number, normalRate: number, myRate: number): number {
  const usd = Number(usdAmount || 0);
  const ref = Number(normalRate || 0);
  const custom = Number(myRate || 0);
  return Math.round(usd * (ref - custom));
}

/**
 * Calculates total earnings on a transfer:
 * Formula: Spread Profit ((Normal Rate * USD) - (My Rate * USD)) + Fixed Fee
 */
export function calculateTotalTransferProfit(usdAmount: number, normalRate: number, myRate: number, feeAmount: number): number {
  const spread = calculateSpreadProfit(usdAmount, normalRate, myRate);
  const fee = Math.max(0, Number(feeAmount || 0));
  return spread + fee;
}

/**
 * Calculates rate margin in CFA (legacy helper alias)
 */
export function calculateRateMargin(usdAmount: number, customRate: number, refRate: number): number {
  return calculateSpreadProfit(usdAmount, refRate, customRate);
}
