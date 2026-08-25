import React from 'react';
import { formatUSD, formatXOF } from '../../utils/currency';

interface MoneyDisplayProps {
  amount: number;
  currency: 'XOF' | 'USD';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'neutral' | 'success' | 'danger' | 'warning' | 'primary' | 'muted';
  className?: string;
  forceDecimals?: boolean;
}

export const MoneyDisplay: React.FC<MoneyDisplayProps> = ({
  amount,
  currency,
  size = 'md',
  variant = 'neutral',
  className = '',
  forceDecimals = true,
}) => {
  const formatted = currency === 'USD' 
    ? formatUSD(amount, { forceDecimals })
    : formatXOF(amount);

  const sizeClasses = {
    sm: 'text-sm font-semibold',
    md: 'text-base font-semibold',
    lg: 'text-lg font-bold',
    xl: 'text-xl sm:text-2xl font-bold tracking-tight',
    '2xl': 'text-2xl sm:text-3xl font-extrabold tracking-tight font-[\'Outfit\',sans-serif]',
  }[size];

  const variantClasses = {
    neutral: 'text-slate-900',
    success: 'text-emerald-600',
    danger: 'text-rose-600',
    warning: 'text-amber-600',
    primary: 'text-indigo-600',
    muted: 'text-slate-500',
  }[variant];

  return (
    <span className={`inline-flex items-baseline font-mono tracking-tight ${sizeClasses} ${variantClasses} ${className}`}>
      {formatted}
    </span>
  );
};
