import React from 'react';
import { TransferStatus, PaymentMethod } from '../../types';
import { CheckCircle2, Clock, XCircle, Smartphone, CreditCard, Banknote, ShieldAlert } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'rose' | 'amber' | 'blue' | 'indigo' | 'slate' | 'violet';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  icon,
  className = '',
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-100 text-emerald-700',
    rose: 'bg-rose-100 text-rose-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    slate: 'bg-slate-100 text-slate-700',
    violet: 'bg-violet-100 text-violet-700',
  }[variant];

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] font-bold',
    md: 'px-2.5 py-1 text-xs font-semibold',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full whitespace-nowrap ${variantStyles} ${sizeStyles} ${className}`}>
      {icon}
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: TransferStatus }> = ({ status }) => {
  switch (status) {
    case 'Completed':
      return (
        <Badge variant="emerald" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
          Completed
        </Badge>
      );
    case 'Pending':
      return (
        <Badge variant="amber" icon={<Clock className="w-3.5 h-3.5" />}>
          Pending
        </Badge>
      );
    case 'Cancelled':
      return (
        <Badge variant="rose" icon={<XCircle className="w-3.5 h-3.5" />}>
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="slate">{status}</Badge>;
  }
};

export const PaymentMethodBadge: React.FC<{ method: PaymentMethod }> = ({ method }) => {
  let icon = <CreditCard className="w-3.5 h-3.5" />;
  if (method === 'Mobile Money' || method === 'Wave' || method === 'Orange Money' || method === 'MTN MoMo') {
    icon = <Smartphone className="w-3.5 h-3.5" />;
  } else if (method === 'Cash') {
    icon = <Banknote className="w-3.5 h-3.5" />;
  }

  return (
    <Badge variant="slate" icon={icon}>
      {method}
    </Badge>
  );
};
