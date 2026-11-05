/**
 * Context para manejo de tema de la aplicacion
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeColors {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  border: string;
  card: string;
  error: string;
}

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const lightColors: ThemeColors = {
  background: '#FFFFFF',
  text: '#111827',
  primary: '#3B82F6',
  secondary: '#6B7280',
  border: '#E5E7EB',
  card: '#F9FAFB',
  error: '#EF4444',
};

const darkColors: ThemeColors = {
  background: '#111827',
  text: '#F9FAFB',
  primary: '#3B82F6',
  secondary: '#9CA3AF',
  border: '#374151',
  card: '#1F2937',
  error: '#EF4444',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = '@theme_preference';

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setTheme(savedTheme);
      } else if (systemColorScheme) {
        setTheme(systemColorScheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const saveTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  const colors = useMemo(() => {
    return theme === 'dark' ? darkColors : lightColors;
  }, [theme]);

  const isDark = theme === 'dark';

  const value = useMemo<ThemeContextType>(() => ({
    theme,
    colors,
    isDark,
    toggleTheme,
    setTheme: handleSetTheme,
  }), [theme, colors, isDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
