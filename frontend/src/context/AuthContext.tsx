"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  full_name: string;
  provider: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData?: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("cognimirror_token");
    const storedUser = localStorage.getItem("cognimirror_user");

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // Fallback if parsing fails
          localStorage.removeItem("cognimirror_token");
          localStorage.removeItem("cognimirror_user");
          setToken(null);
          setUser(null);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, userData?: User) => {
    localStorage.setItem("cognimirror_token", newToken);
    setToken(newToken);
    
    if (userData) {
      localStorage.setItem("cognimirror_user", JSON.stringify(userData));
      setUser(userData);
    }
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("cognimirror_token");
    localStorage.removeItem("cognimirror_user");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...userData };
      setUser(updated);
      localStorage.setItem("cognimirror_user", JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
