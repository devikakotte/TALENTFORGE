import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setAccessToken, setUnauthorizedHandler } from '../services/apiClient';
import authService from '../services/authService';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const applySession = useCallback((sessionUser, accessToken) => {
    setUser(sessionUser);
    setAccessToken(accessToken);
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
  }, []);

  const register = useCallback(
    async (payload) => {
      const { user: newUser, accessToken } = await authService.register(payload);
      applySession(newUser, accessToken);
      return newUser;
    },
    [applySession],
  );

  const login = useCallback(
    async (credentials) => {
      const { user: loggedInUser, accessToken } = await authService.login(credentials);
      applySession(loggedInUser, accessToken);
      return loggedInUser;
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    setUnauthorizedHandler(() => clearSession());
  }, [clearSession]);

  // On first load, attempt a silent refresh using the httpOnly refresh
  // cookie so a page reload doesn't force the user to log in again.
  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      try {
        const { user: refreshedUser, accessToken } = await authService.refresh();
        if (isMounted) applySession(refreshedUser, accessToken);
      } catch (error) {
        if (isMounted) clearSession();
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    }

    bootstrapSession();
    return () => {
      isMounted = false;
    };
  }, [applySession, clearSession]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      register,
      login,
      logout,
    }),
    [user, isInitializing, register, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
