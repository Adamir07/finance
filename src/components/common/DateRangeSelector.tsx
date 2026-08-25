import React, { useState } from 'react';
import { DateFilterPreset, DateFilterRange } from '../../types';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { getTodayString } from '../../utils/date';

interface DateRangeSelectorProps {
  filter: DateFilterRange;
  onChange: (filter: DateFilterRange) => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ filter, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState(filter.startDate || getTodayString());
  const [customEnd, setCustomEnd] = useState(filter.endDate || getTodayString());

  const presets: { label: string; value: DateFilterPreset }[] = [
    { label: 'This Month', value: 'this_month' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'this_week' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'This Year', value: 'this_year' },
    { label: 'All Time', value: 'all' },
    { label: 'Custom Range', value: 'custom' },
  ];

  const currentLabel = presets.find(p => p.value === filter.preset)?.label || 'Filter Date';

  const handleSelectPreset = (preset: DateFilterPreset) => {
    if (preset === 'custom') {
      onChange({ preset: 'custom', startDate: customStart, endDate: customEnd });
    } else {
      onChange({ preset });
      setIsOpen(false);
    }
  };

  const handleApplyCustom = () => {
    onChange({ preset: 'custom', startDate: customStart, endDate: customEnd });
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        id="date-filter-trigger-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-slate-700 shadow-2xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-slate-900/10"
      >
        <Calendar className="w-3.5 h-3.5 text-slate-500" />
        <span>{currentLabel}</span>
        {filter.preset === 'custom' && filter.startDate && (
          <span className="text-[11px] text-slate-400 font-mono">
            ({filter.startDate} → {filter.endDate || 'now'})
          </span>
        )}
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-72 rounded-xl bg-white border border-slate-200 shadow-lg z-40 p-2 text-xs space-y-1">
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Date Filter Presets
            </div>
            {presets.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => handleSelectPreset(p.value)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  filter.preset === p.value ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{p.label}</span>
                {filter.preset === p.value && <Check className="w-3.5 h-3.5 text-slate-800" />}
              </button>
            ))}

            {filter.preset === 'custom' && (
              <div className="pt-2 mt-1 border-t border-slate-100 px-1 space-y-2">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">From Date</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={e => setCustomStart(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md focus:border-slate-400 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">To Date</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={e => setCustomEnd(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md focus:border-slate-400 outline-hidden"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCustom}
                  className="w-full mt-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-xs text-center transition-colors"
                >
                  Apply Custom Range
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
