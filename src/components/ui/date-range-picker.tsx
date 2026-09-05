'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from 'lucide-react';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

interface CustomDateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  onClear?: () => void;
  className?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateString(str?: string): Date | null {
  if (!str) return null;
  const parts = str.split('-');
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const date = new Date(y, m, d);
  return isNaN(date.getTime()) ? null : date;
}

export function CustomDateRangePicker({
  value,
  onChange,
  onClear,
  className = '',
}: CustomDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialStart = parseDateString(value.startDate);
  const [viewYear, setViewYear] = useState(initialStart ? initialStart.getFullYear() : new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(initialStart ? initialStart.getMonth() : new Date().getMonth());

  const [selectingStart, setSelectingStart] = useState<string | null>(value.startDate || null);
  const [selectingEnd, setSelectingEnd] = useState<string | null>(value.endDate || null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    setSelectingStart(value.startDate || null);
    setSelectingEnd(value.endDate || null);
  }, [value.startDate, value.endDate]);

  // Close popup on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const days: { dateStr: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

  // Previous month filler days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNumber = daysInPrevMonth - i;
    const prevMonthDate = new Date(viewYear, viewMonth - 1, dayNumber);
    days.push({
      dateStr: formatDateString(prevMonthDate),
      dayNumber,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const currDate = new Date(viewYear, viewMonth, i);
    days.push({
      dateStr: formatDateString(currDate),
      dayNumber: i,
      isCurrentMonth: true,
    });
  }

  // Next month filler days (to complete 35 or 42 grid slots)
  const remaining = 42 - days.length;
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const nextMonthDate = new Date(viewYear, viewMonth + 1, i);
      days.push({
        dateStr: formatDateString(nextMonthDate),
        dayNumber: i,
        isCurrentMonth: false,
      });
    }
  } else {
    const nextSlots = 35 - days.length;
    for (let i = 1; i <= nextSlots; i++) {
      const nextMonthDate = new Date(viewYear, viewMonth + 1, i);
      days.push({
        dateStr: formatDateString(nextMonthDate),
        dayNumber: i,
        isCurrentMonth: false,
      });
    }
  }

  const handleDateClick = (dateStr: string) => {
    if (!selectingStart || (selectingStart && selectingEnd)) {
      // Starting new selection
      setSelectingStart(dateStr);
      setSelectingEnd(null);
    } else if (selectingStart && !selectingEnd) {
      // Selecting end date
      if (dateStr < selectingStart) {
        setSelectingEnd(selectingStart);
        setSelectingStart(dateStr);
        onChange({ startDate: dateStr, endDate: selectingStart });
      } else {
        setSelectingEnd(dateStr);
        onChange({ startDate: selectingStart, endDate: dateStr });
      }
      setIsOpen(false);
    }
  };

  const handleApplyPreset = (type: 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'thisYear') => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (type === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (type === 'yesterday') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    } else if (type === 'last7') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (type === 'last30') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (type === 'thisMonth') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (type === 'lastMonth') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (type === 'thisYear') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
    }

    const startStr = formatDateString(start);
    const endStr = formatDateString(end);
    setSelectingStart(startStr);
    setSelectingEnd(endStr);
    onChange({ startDate: startStr, endDate: endStr });
    setIsOpen(false);
  };

  const isDateInRange = (dateStr: string) => {
    if (!selectingStart) return false;
    const endTarget = selectingEnd || hoverDate;
    if (!endTarget) return dateStr === selectingStart;

    const min = selectingStart < endTarget ? selectingStart : endTarget;
    const max = selectingStart < endTarget ? endTarget : selectingStart;
    return dateStr >= min && dateStr <= max;
  };

  const isStart = (dateStr: string) => dateStr === selectingStart;
  const isEnd = (dateStr: string) => dateStr === selectingEnd;

  const displayLabel = value.startDate && value.endDate
    ? `${value.startDate}  →  ${value.endDate}`
    : value.startDate
    ? `From ${value.startDate}`
    : 'Select Custom Date Range';

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700/80 transition-colors duration-150 shadow-sm"
      >
        <CalendarIcon className="w-4 h-4 text-brand-700 dark:text-emerald-400 shrink-0" />
        <span>{displayLabel}</span>
        {(value.startDate || value.endDate) && onClear && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setSelectingStart(null);
              setSelectingEnd(null);
              onClear();
            }}
            className="ml-1 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
            title="Clear Date Range"
          >
            <X className="w-3 h-3" />
          </span>
        )}
      </button>

      {/* Popover Custom Calendar Window */}
      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 space-y-4 animate-in fade-in zoom-in-95">
          {/* Quick Presets */}
          <div className="flex flex-wrap gap-1 pb-3 border-b border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => handleApplyPreset('today')}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('yesterday')}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 transition-colors"
            >
              Yesterday
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('last7')}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 transition-colors"
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('last30')}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 transition-colors"
            >
              Last 30 Days
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('thisMonth')}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 transition-colors"
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('thisYear')}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 transition-colors"
            >
              This Year
            </button>
          </div>

          {/* Calendar Header Navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-extrabold text-gray-900 dark:text-slate-100">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center text-[11px] font-bold text-gray-400 dark:text-slate-500">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
            {days.map((item, idx) => {
              const inRange = isDateInRange(item.dateStr);
              const start = isStart(item.dateStr);
              const end = isEnd(item.dateStr);
              const isToday = item.dateStr === formatDateString(new Date());

              return (
                <div
                  key={`${item.dateStr}-${idx}`}
                  onMouseEnter={() => {
                    if (selectingStart && !selectingEnd) {
                      setHoverDate(item.dateStr);
                    }
                  }}
                  onClick={() => handleDateClick(item.dateStr)}
                  className={`relative py-1.5 cursor-pointer select-none transition-colors duration-100 ${
                    inRange && !start && !end
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                      : ''
                  } ${start ? 'rounded-l-lg bg-emerald-600 text-white font-bold' : ''} ${
                    end ? 'rounded-r-lg bg-emerald-600 text-white font-bold' : ''
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${
                      start || end
                        ? 'bg-emerald-600 text-white'
                        : isToday
                        ? 'border border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                        : item.isCurrentMonth
                        ? 'text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                        : 'text-gray-300 dark:text-slate-600'
                    }`}
                  >
                    {item.dayNumber}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer Status & Actions */}
          <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-[11px] text-gray-500 dark:text-slate-400">
              {selectingStart && !selectingEnd ? 'Click end date' : selectingStart && selectingEnd ? 'Range active' : 'Pick start date'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectingStart(null);
                  setSelectingEnd(null);
                  if (onClear) onClear();
                  setIsOpen(false);
                }}
                className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectingStart && selectingEnd) {
                    onChange({ startDate: selectingStart, endDate: selectingEnd });
                  }
                  setIsOpen(false);
                }}
                className="px-3 py-1 bg-brand-700 dark:bg-emerald-600 text-white rounded-lg font-bold text-xs shadow-sm hover:bg-brand-800 dark:hover:bg-emerald-500 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

