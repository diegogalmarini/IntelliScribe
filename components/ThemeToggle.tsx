
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { MSymbol } from './ui/MSymbol';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center p-2 rounded-full transition-transform active:scale-95 focus:outline-none"
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      {theme === 'light' ? (
        <MSymbol name="light_mode" fill className="text-orange-500 drop-shadow-sm" />
      ) : (
        <MSymbol name="dark_mode" fill className="text-blue-400 drop-shadow-sm" />
      )}
    </button>
  );
};
