import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const current = queue[0] ?? null;

  const push = useCallback((message, severity = 'success', action = null) => {
    setQueue((existing) => [...existing, { id: Date.now() + Math.random(), message, severity, action }]);
  }, []);

  const close = useCallback(() => setQueue((existing) => existing.slice(1)), []);

  const value = useMemo(
    () => ({
      notify: push,
      success: (message, action) => push(message, 'success', action),
      error: (message) => push(message, 'error'),
      info: (message, action) => push(message, 'info', action),
      warn: (message) => push(message, 'warning'),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        key={current?.id}
        open={Boolean(current)}
        autoHideDuration={current?.severity === 'error' ? 6000 : 3200}
        onClose={(_, reason) => {
          if (reason !== 'clickaway') close();
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={close}
          severity={current?.severity ?? 'info'}
          variant="filled"
          action={current?.action ?? undefined}
          sx={{ alignItems: 'center' }}
        >
          {current?.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}

export default ToastContext;
