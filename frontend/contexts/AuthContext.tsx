'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  companyName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthInitialized: boolean;
  login: (email: string, companyName?: string) => void;
  logout: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    // Check if user is logged in on mount.
    // Also support legacy "user" key used in other routes.
    const savedUser = localStorage.getItem('fairhire_user') || localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser({
          email: parsedUser.email,
          companyName: parsedUser.companyName
        });
      } catch {
        setUser(null);
      }
    }
    setIsAuthInitialized(true);
  }, []);

  const login = (email: string, companyName?: string) => {
    const newUser = { email, companyName };
    setUser(newUser);
    localStorage.setItem('fairhire_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fairhire_user');
    localStorage.removeItem('user');
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isAuthInitialized, login, logout, showToast }}>
      {children}
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`px-6 py-4 rounded-lg shadow-2xl border backdrop-blur-xl flex items-center gap-3 min-w-[300px] ${
            toast.type === 'success' 
              ? 'bg-green-900/90 border-green-500 text-green-100' 
              : toast.type === 'error'
              ? 'bg-red-900/90 border-red-500 text-red-100'
              : 'bg-blue-900/90 border-blue-500 text-blue-100'
          }`}>
            {toast.type === 'success' && (
              <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.type === 'error' && (
              <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {toast.type === 'info' && (
              <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
