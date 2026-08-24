import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { AuthContext } from './authContextObject';
const AUTH_STORAGE_KEY = 'irrigasense_auth';

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { token: null, user: null };
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  }, [auth]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!auth.token) {
        setLoading(false);
        return;
      }
      try {
        const user = await api.me(auth.token);
        setAuth((prev) => ({ ...prev, user }));
      } catch {
        setAuth({ token: null, user: null });
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [auth.token]);

  const login = (payload) => setAuth(payload);
  const logout = useCallback(async () => {
    try {
      if (auth.token) {
        await api.logout(auth.token);
      }
    } catch {
      // Session might already be invalid; continue local cleanup.
    } finally {
      setAuth({ token: null, user: null });
    }
  }, [auth.token]);

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      isAuthenticated: Boolean(auth.token && auth.user),
      loading,
      login,
      logout,
    }),
    [auth, loading, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

