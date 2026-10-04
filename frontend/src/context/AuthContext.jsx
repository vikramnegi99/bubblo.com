import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { adminApi } from '../lib/api';

const AuthContext = createContext(null);
const KEY = 'bubblo.admin.token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(KEY) || '');
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    if (!token) { setAdmin(null); return; }
    adminApi.me(token).then((r) => setAdmin(r.admin)).catch(() => {
      localStorage.removeItem(KEY);
      setToken('');
      setAdmin(null);
    });
  }, [token]);

  const login = useCallback(async (email, password) => {
    const r = await adminApi.login(email, password);
    localStorage.setItem(KEY, r.token);
    setToken(r.token);
    setAdmin(r.admin);
    return r.admin;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY);
    setToken('');
    setAdmin(null);
  }, []);

  const value = useMemo(() => ({ token, admin, login, logout, isAuthed: !!token }), [token, admin, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
