'use client';
import React, { useState } from 'react';
import FairHireHomepage from '@/components/homepage';
import FairHireLogin from '@/components/login';

export default function Page() {
  const [currentView, setCurrentView] = useState<'homepage' | 'login'>('homepage');

  const handleNavigateToLogin = () => {
    setCurrentView('login');
  };

  const handleNavigateToHome = () => {
    setCurrentView('homepage');
  };

  const handleLoginSuccess = (formData: any) => {
    console.log('Login successful:', formData);
    // Here you can add navigation to dashboard or other pages
    alert('Welcome to Fair-Hire Sentinel! Login successful.');
  };

  if (currentView === 'login') {
    return (
      <FairHireLogin
        initialIsLogin={true}
        onNavigateToHome={handleNavigateToHome}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <FairHireHomepage onNavigateToLogin={handleNavigateToLogin} />
  );
}
