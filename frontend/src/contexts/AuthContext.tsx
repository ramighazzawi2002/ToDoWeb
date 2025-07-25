import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
export const API_URL =
  import.meta.env.VITE_ENV === "production"
    ? "https://todoweb-backend.onrender.com"
    : "http://localhost:3000"; // Update this to your backend API URL
interface User {
  _id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify({ data: userData }));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const checkAuth = async (): Promise<boolean> => {
    try {
      // First check localStorage
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setIsLoading(false);
        return false;
      }

      const userData = JSON.parse(storedUser);
      if (userData?.data) {
        setUser(userData.data);
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
      setIsLoading(false);
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
