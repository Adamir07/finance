import { 
  format, 
  parseISO, 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  startOfYear, 
  endOfYear, 
  isWithinInterval,
  isValid
} from 'date-fns';
import { DateFilterPreset, DateFilterRange } from '../types';

export function formatDateDisplay(dateString: string, formatStr: string = 'MMM d, yyyy'): string {
  if (!dateString) return '';
  try {
    // If YYYY-MM-DD, parse safely to avoid timezone offset shifts
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return format(date, formatStr);
    }
    const parsed = parseISO(dateString);
    if (!isValid(parsed)) return dateString;
    return format(parsed, formatStr);
  } catch {
    return dateString;
  }
}

export function formatDateLong(dateString: string): string {
  return formatDateDisplay(dateString, 'MMMM d, yyyy');
}

export function formatDateShort(dateString: string): string {
  return formatDateDisplay(dateString, 'yyyy-MM-dd');
}

export function formatMonthYear(dateString: string): string {
  return formatDateDisplay(dateString, 'MMMM yyyy');
}

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateRangeFromPreset(preset: DateFilterPreset, customStart?: string, customEnd?: string): { start: Date | null; end: Date | null } {
  const now = new Date();

  switch (preset) {
    case 'today':
      return {
        start: startOfDay(now),
        end: endOfDay(now),
      };
    case 'this_week':
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }), // Monday start
        end: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case 'this_month':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };
    case 'last_month': {
      const lastMonth = subMonths(now, 1);
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
      };
    }
    case 'this_year':
      return {
        start: startOfYear(now),
        end: endOfYear(now),
      };
    case 'custom':
      return {
        start: customStart ? startOfDay(parseISO(customStart)) : null,
        end: customEnd ? endOfDay(parseISO(customEnd)) : null,
      };
    case 'all':
    default:
      return { start: null, end: null };
  }
}

export function isDateInRange(dateString: string, filter: DateFilterRange): boolean {
  if (!dateString) return false;
  if (filter.preset === 'all') return true;

  const { start, end } = getDateRangeFromPreset(filter.preset, filter.startDate, filter.endDate);
  if (!start && !end) return true;

  try {
    const parts = dateString.split('-');
    let dateObj: Date;
    if (parts.length === 3) {
      dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0);
    } else {
      dateObj = parseISO(dateString);
    }

    if (!isValid(dateObj)) return true;

    if (start && end) {
      return isWithinInterval(dateObj, { start, end });
    } else if (start) {
      return dateObj >= start;
    } else if (end) {
      return dateObj <= end;
    }
    return true;
  } catch {
    return true;
  }
}
