"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import { User } from '@/lib/db';

export interface LoginCredentials {
  email?: string;
  username?: string;
  password?: string;
}

interface UserContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  setUser: Dispatch<SetStateAction<User | null>>;
  login: (data: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkUserStatus: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkUserStatus = async () => {
    setIsLoading(true);
    try {
      // Add timestamp to prevent browser caching of the status check
      const res = await fetch(`/api/account/status?t=${Date.now()}`, {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.isLoggedIn) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to check user status", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUserStatus();
  }, []);

  const login = async (loginData: LoginCredentials) => {
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
    });
    const data = await res.json();
    if (data.success) {
        // Force status check after login to ensure full user object is loaded
        await checkUserStatus();
    } else {
        throw new Error(data.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
        const res = await fetch('/api/logout', { method: 'POST' });
        if (res.ok) {
            setUser(null);
        } else {
            console.error("Logout failed", await res.text());
        }
    } catch (error) {
        console.error("Logout API error:", error);
    }
  };

  const value = {
    user,
    isLoggedIn: !!user,
    isLoading,
    setUser,
    login,
    logout,
    checkUserStatus,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
