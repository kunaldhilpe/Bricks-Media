import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import createAppTheme from '@/theme';
import storage from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/constants';

const ColorModeContext = createContext(null);

function initialMode() {
  const stored = storage.read(STORAGE_KEYS.mode);
  if (stored === 'light' || stored === 'dark') return stored;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function ColorModeProvider({ children }) {
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    storage.write(STORAGE_KEYS.mode, mode);
    document.documentElement.style.colorScheme = mode;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', mode === 'dark' ? '#131110' : '#ffffff');
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, setMode, toggleMode }), [mode, toggleMode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  const context = useContext(ColorModeContext);
  if (!context) throw new Error('useColorMode must be used inside ColorModeProvider');
  return context;
}

export default ColorModeContext;
