'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark =
      document.documentElement.classList.contains('dark') ||
      localStorage.getItem('village_mart_theme') === 'dark' ||
      (!localStorage.getItem('village_mart_theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('village_mart_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('village_mart_theme', 'light');
    }
  };

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-500 opacity-60 ${className}`}
      >
        <Moon className="w-4 h-4" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative w-9 h-9 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-amber-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-150 flex items-center justify-center shadow-sm ${className}`}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-gray-600" />
      )}
    </button>
  );
}
