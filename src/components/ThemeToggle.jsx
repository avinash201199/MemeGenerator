import React from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
        isDark ? 'bg-gray-700' : 'bg-gray-300'
      }`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
          isDark ? 'translate-x-7' : 'translate-x-1'
        }`}
      >
        <span className="flex h-full w-full items-center justify-center text-xs">
          {isDark ? '🌙' : '☀️'}
        </span>
      </span>
    </button>
  );
};

export default ThemeToggle;