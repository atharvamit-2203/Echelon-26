'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Shield, TrendingUp } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

export default function UserLogin() {
  const router = useRouter();

  const handleMockLogin = () => {
    const mockUser = {
      id: 'user123',
      email: 'demo@example.com',
      name: 'Demo User',
      picture: 'https://ui-avatars.com/api/?name=Demo+User&background=3b82f6&color=fff'
    };
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'demo_token');
    router.push('/user');
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: '818859269716-h5rrb76hvnb8i4oeavc50ehgb8i1hrr8.apps.googleusercontent.com',
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('googleSignInButton'),
        { theme: 'outline', size: 'large', width: 320 }
      );
    };

    return () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleCredentialResponse = async (response: any) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        router.push('/user');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl mb-4">
            <Briefcase className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Fair-Hire
          </h1>
          <p className="text-gray-600 text-lg">
            Your journey to fair hiring starts here
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Sign In
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Upload your resume and get unbiased analysis
          </p>

          <div className="space-y-4">
            <div className="flex justify-center">
              <div id="googleSignInButton"></div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500 font-medium">Or try demo</span>
              </div>
            </div>
            
            <button
              onClick={handleMockLogin}
              className="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              Continue as Demo User
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Shield className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-gray-600">Bias-Free</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-gray-600">AI-Powered</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Briefcase className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-gray-600">Fair Hiring</p>
          </div>
        </div>
      </div>
    </div>
  );
}