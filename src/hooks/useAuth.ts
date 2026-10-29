/**
 * Hook personalizado para manejo de autenticación
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as authApi from '../api/auth.api';
import { saveAccessToken, saveRefreshToken, getAccessToken, clearTokens } from '../utils/storage';
import { handleApiError, ApiError } from '../utils/errorHandler';
import { User } from '../types/user';

interface UseAuthState {
  user: User | null;
  loading: boolean;
  error: ApiError | null;
  isAuthenticated: boolean;
}

interface UseAuthReturn extends UseAuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [state, setState] = useState<UseAuthState>({
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  });

  const isMounted = useRef(true);

  const checkAuth = useCallback(async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        if (isMounted.current) {
          setState(prev => ({ ...prev, isAuthenticated: false }));
        }
        return;
      }

      if (isMounted.current) {
        setState(prev => ({ ...prev, loading: true }));
      }
      
      const user = await authApi.getCurrentUser();
      
      if (isMounted.current) {
        setState({
          user,
          loading: false,
          error: null,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      if (isMounted.current) {
        setState({
          user: null,
          loading: false,
          error: null,
          isAuthenticated: false,
        });
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (isMounted.current) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      const response = await authApi.login({ email, password });

      await saveAccessToken(response.token);
      await saveRefreshToken(response.refreshToken);

      if (isMounted.current) {
        setState({
          user: response.user,
          loading: false,
          error: null,
          isAuthenticated: true,
        });
      }

      return true;
    } catch (error) {
      const apiError = handleApiError(error);
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: apiError,
          isAuthenticated: false,
        }));
      }
      return false;
    }
  }, []);

  const register = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (isMounted.current) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      await authApi.register({ email, password });
      return await login(email, password);
    } catch (error) {
      const apiError = handleApiError(error);
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: apiError,
        }));
      }
      return false;
    }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignorar errores de logout
    } finally {
      await clearTokens();
      if (isMounted.current) {
        setState({
          user: null,
          loading: false,
          error: null,
          isAuthenticated: false,
        });
      }
      router.replace('/');
    }
  }, [router]);

  const clearError = useCallback(() => {
    if (isMounted.current) {
      setState(prev => ({ ...prev, error: null }));
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    checkAuth();
    
    return () => {
      isMounted.current = false;
    };
  }, [checkAuth]);

  return {
    ...state,
    login,
    register,
    logout,
    checkAuth,
    clearError,
  };
}
