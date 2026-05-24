'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthResponse } from '@/types';
import { authService } from '@/services/auth.service';
import { apiClient } from '@/lib/api-client';

interface ProfileFormData {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileFormData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          const savedUser = localStorage.getItem('user');
          if (token && savedUser) {
            apiClient.setToken(token);
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // SIMULACIÓN DE LOGIN LOCAL
      const mockUser = { id: '1', email, name: 'Admin Local', role: 'ADMIN' } as unknown as User;
      const mockToken = 'local-dummy-token';

      apiClient.setToken(mockToken);
      setUser(mockUser);

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', mockToken);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      // await authService.logout(); // No hay backend para logout
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiClient.clearToken();
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      // Simulación de actualización de perfil (sin backend real)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser(prev => prev ? { ...prev, ...data } : null);
      
      if (typeof window !== 'undefined') {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...data }));
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
