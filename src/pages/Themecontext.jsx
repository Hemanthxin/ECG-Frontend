import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  light: {
    key: 'light',
    // Page / layout
    pageBg:      '#f0f4f8',
    sidebarBg:   '#ffffff',
    sidebarBorder:'#e5e7eb',
    // Cards
    cardBg:      '#ffffff',
    cardBorder:  '#e5e7eb',
    cardShadow:  '0 1px 3px rgba(0,0,0,0.06)',
    // Text
    textPrimary: '#111827',
    textSecondary:'#4b5563',
    textMuted:   '#9ca3af',
    // Inputs
    inputBg:     '#f9fafb',
    inputBorder: '#e5e7eb',
    inputText:   '#111827',
    // Nav
    navActive:   '#eff6ff',
    navActiveTxt:'#1d4ed8',
    navHover:    '#f3f4f6',
    navTxt:      '#6b7280',
    // Accent
    accent:      '#2563eb',
    accentHover: '#1d4ed8',
    accentText:  '#ffffff',
    // Divider
    divider:     '#f3f4f6',
    // Badge / tag
    badgeBg:     '#eff6ff',
    badgeTxt:    '#1d4ed8',
    badgeBorder: '#bfdbfe',
    // Stat card accent
    statVal:     '#2563eb',
    // Table
    tableHdr:    '#f9fafb',
    tableRow:    '#ffffff',
    tableRowHov: '#f9fafb',
    tableDiv:    '#f3f4f6',
    // Modal backdrop
    modalBack:   'rgba(0,0,0,0.4)',
    // Section heading line
    headingLine: '#e5e7eb',
  },
  dark: {
    key: 'dark',
    pageBg:      '#0f172a',
    sidebarBg:   '#0f172a',
    sidebarBorder:'#1e293b',
    cardBg:      '#1e293b',
    cardBorder:  '#334155',
    cardShadow:  '0 1px 3px rgba(0,0,0,0.3)',
    textPrimary: '#f1f5f9',
    textSecondary:'#cbd5e1',
    textMuted:   '#64748b',
    inputBg:     '#0f172a',
    inputBorder: '#334155',
    inputText:   '#f1f5f9',
    navActive:   '#1e3a5f',
    navActiveTxt:'#93c5fd',
    navHover:    '#1e293b',
    navTxt:      '#94a3b8',
    accent:      '#3b82f6',
    accentHover: '#2563eb',
    accentText:  '#ffffff',
    divider:     '#1e293b',
    badgeBg:     '#1e3a5f',
    badgeTxt:    '#93c5fd',
    badgeBorder: '#1e40af',
    statVal:     '#60a5fa',
    tableHdr:    '#1e293b',
    tableRow:    '#1e293b',
    tableRowHov: '#263548',
    tableDiv:    '#334155',
    modalBack:   'rgba(0,0,0,0.7)',
    headingLine: '#334155',
  },
  neon: {
    key: 'neon',
    pageBg:      '#020617',
    sidebarBg:   '#020617',
    sidebarBorder:'#0f2030',
    cardBg:      '#080f1a',
    cardBorder:  '#0f2030',
    cardShadow:  '0 0 20px rgba(0,255,204,0.04)',
    textPrimary: '#e2e8f0',
    textSecondary:'#94a3b8',
    textMuted:   '#475569',
    inputBg:     '#0a1628',
    inputBorder: '#0f2030',
    inputText:   '#e2e8f0',
    navActive:   '#001a14',
    navActiveTxt:'#00ffcc',
    navHover:    '#080f1a',
    navTxt:      '#475569',
    accent:      '#00ffcc',
    accentHover: '#00e6b8',
    accentText:  '#020617',
    divider:     '#0f2030',
    badgeBg:     '#001a14',
    badgeTxt:    '#00ffcc',
    badgeBorder: '#00ffcc33',
    statVal:     '#00ffcc',
    tableHdr:    '#080f1a',
    tableRow:    '#080f1a',
    tableRowHov: '#0a1628',
    tableDiv:    '#0f2030',
    modalBack:   'rgba(0,0,0,0.85)',
    headingLine: '#0f2030',
  },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('ecg-theme') || 'light';
    return THEMES[saved] || THEMES.light;
  });

  const applyTheme = (key) => {
    const t = THEMES[key] || THEMES.light;
    setTheme(t);
    localStorage.setItem('ecg-theme', key);
  };

  // Inject global CSS on theme change
  useEffect(() => {
    const t = theme;
    let styleEl = document.getElementById('ecg-theme-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'ecg-theme-style';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      body { background: ${t.pageBg} !important; }
      :root {
        --page-bg: ${t.pageBg};
        --sidebar-bg: ${t.sidebarBg};
        --card-bg: ${t.cardBg};
        --card-border: ${t.cardBorder};
        --text-primary: ${t.textPrimary};
        --text-muted: ${t.textMuted};
        --accent: ${t.accent};
        --input-bg: ${t.inputBg};
        --input-border: ${t.inputBorder};
        --divider: ${t.divider};
      }
    `;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}