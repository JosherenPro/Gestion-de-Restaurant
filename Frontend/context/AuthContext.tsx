import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api.service';
import { UserRole } from '../types';

interface User {
  id: number;
  email: string;
  role: UserRole;
  nom?: string;
  prenom?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth_token');
  });

  useEffect(() => {
    if (token) {
      // Try to fetch current user info
      apiService.getCurrentUser(token)
        .then((userData) => {
          setUser({
            id: userData.id,
            email: userData.email,
            role: userData.role?.toUpperCase() as UserRole,
            nom: userData.nom,
            prenom: userData.prenom,
          });
        })
        .catch((error) => {
          console.error('Failed to fetch user:', error);
          // Token might be invalid
          localStorage.removeItem('auth_token');
          setToken(null);
        });
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      const accessToken = response.access_token;
      
      setToken(accessToken);
      localStorage.setItem('auth_token', accessToken);
      
      // Fetch user details
      const userData = await apiService.getCurrentUser(accessToken);
      setUser({
        id: userData.id,
        email: userData.email,
        role: userData.role?.toUpperCase() as UserRole,
        nom: userData.nom,
        prenom: userData.prenom,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
