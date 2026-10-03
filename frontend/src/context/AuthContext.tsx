import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/auth';
import type { User, AdminProfile } from '../services/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  role: string | null;
  login: (token: string, role: string, userData?: User) => void;
  logout: () => void;
  updateProfile: (profile: Partial<AdminProfile>) => AdminProfile;
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
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [isAuthenticated]);

  const login = (_token: string, role: string, userData?: User) => {
    setIsAuthenticated(true);
    setRole(role);
    if (userData) {
      const storedProfile = authService.getStoredProfile();
      setUser({ ...userData, ...storedProfile });
    } else {
      authService.getCurrentUser().then(u => setUser(u)).catch(() => {});
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setRole(null);
    setUser(null);
  };

  const updateProfile = (newProfile: Partial<AdminProfile>): AdminProfile => {
    const updated = authService.saveProfile(newProfile);
    setUser(prev => prev ? {
      ...prev,
      name: updated.name,
      title: updated.title,
      department: updated.department,
      phone: updated.phone,
      bio: updated.bio,
      avatarColor: updated.avatarColor
    } : null);
    return updated;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, role, login, logout, updateProfile, isLoading }}>
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
