import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = savedTheme ? savedTheme === 'dark' : true;
    setIsDarkTheme(prefersDark);
  }, []);

  useEffect(() => {
    if (isDarkTheme) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]); // Re-run this effect whenever isDarkTheme changes

  const toggleTheme = () => {
    setIsDarkTheme(prev => !prev);
  };

  const value = {
    isDarkTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};