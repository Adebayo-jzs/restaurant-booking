'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from './types';
import { fetchApi } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load stored token & user on client mount
    try {
      const storedToken = localStorage.getItem('vt_token');
      const storedUser = localStorage.getItem('vt_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to load auth from localStorage:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('vt_token', newToken);
    localStorage.setItem('vt_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vt_token');
    localStorage.removeItem('vt_user');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetchApi<{ success: boolean; user?: User; data?: User }>('/auth/me', { token });
      const updatedUser = res.user || res.data;
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('vt_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
