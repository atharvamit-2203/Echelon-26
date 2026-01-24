'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FairHireHomepage from '@/components/homepage';
import FairHireLogin from '@/components/login';
import { useAuth } from '@/contexts/AuthContext';

export default function Page() {
  const [currentView, setCurrentView] = useState<'homepage' | 'login'>('homepage');
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleNavigateToLogin = () => {
    setCurrentView('login');
  };

  const handleNavigateToHome = () => {
    setCurrentView('homepage');
  };

  if (currentView === 'login') {
    return (
      <FairHireLogin
        initialIsLogin={true}
        onNavigateToHome={handleNavigateToHome}
      />
    );
  }

  return (
    <FairHireHomepage onNavigateToLogin={handleNavigateToLogin} />
  );
}
