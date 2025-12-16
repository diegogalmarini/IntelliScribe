
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center p-2 rounded-full transition-transform active:scale-95 focus:outline-none"
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      {theme === 'light' ? (
        <span className="material-symbols-outlined text-[24px] text-orange-500 material-symbols-filled drop-shadow-sm">
          light_mode
        </span>
      ) : (
        <span className="material-symbols-outlined text-[24px] text-blue-400 material-symbols-filled drop-shadow-sm">
          dark_mode
        </span>
      )}
    </button>
  );
};
