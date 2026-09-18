import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '@/api/auth';
import { ROLES } from '@/utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authApi.readSession());
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  // Keep tabs in sync: signing out in one tab signs out the others.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === 'luxe.session') setSession(authApi.readSession());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const signIn = useCallback(async (credentials) => {
    setStatus('pending');
    setError(null);
    try {
      const next = await authApi.login(credentials);
      setSession(next);
      setStatus('authenticated');
      return next;
    } catch (caught) {
      setError(caught.message);
      setStatus('error');
      throw caught;
    }
  }, []);

  const signOut = useCallback(() => {
    authApi.logout();
    setSession(null);
    setStatus('idle');
  }, []);

  const saveProfile = useCallback(async (patch) => {
    const next = await authApi.updateProfile(patch);
    setSession(next);
    return next;
  }, []);

  const value = useMemo(() => {
    const user = session?.user ?? null;
    return {
      user,
      session,
      status,
      error,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === ROLES.admin,
      isCustomer: user?.role === ROLES.customer,
      signIn,
      signOut,
      saveProfile,
      clearError: () => setError(null),
    };
  }, [session, status, error, signIn, signOut, saveProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

export default AuthContext;
