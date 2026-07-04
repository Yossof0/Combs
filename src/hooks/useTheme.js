import { useState, useEffect } from 'react';
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('wc-theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('wc-theme', theme);
  }, [theme]);
  return { theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') };
}
