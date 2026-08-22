import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ requires2FA?: boolean; tempToken?: string; user?: User }>;
  verify2FALogin: (tempToken: string, code: string, rememberDevice?: boolean) => Promise<User>;
  signup: (data: { name: string; email: string; password: string; department: string; year: string }) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hacktracker_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('hacktracker_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch (err) {
          console.error('Failed to authenticate with stored token:', err);
          localStorage.removeItem('hacktracker_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = true) => {
    const res = await api.post('/auth/login', { email, password, rememberMe });
    
    if (res.data.requires2FA) {
      return { requires2FA: true, tempToken: res.data.tempToken };
    }

    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('hacktracker_token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    return { user: receivedUser };
  };

  const verify2FALogin = async (tempToken: string, code: string, rememberDevice: boolean = false) => {
    const res = await api.post('/auth/2fa/verify-login', { tempToken, code, rememberDevice });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('hacktracker_token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const signup = async (data: { name: string; email: string; password: string; department: string; year: string }) => {
    const res = await api.post('/auth/signup', data);
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('hacktracker_token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('hacktracker_token');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedFields: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        verify2FALogin,
        signup,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
