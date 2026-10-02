import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth';
import type { User } from '../services/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  role: string | null;
  login: (token: string, role: string, userData?: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());
  const [role, setRole] = useState<string | null>(authService.getRole());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Failed to load user session", error);
          // Only force logout if it's an auth error (handled by interceptor)
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [isAuthenticated]);

  const login = (token: string, role: string, userData?: User) => {
    setIsAuthenticated(true);
    setRole(role);
    if (userData) {
      setUser(userData);
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, role, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
