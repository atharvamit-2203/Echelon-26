'use client';

import { useRouter } from 'next/navigation';
import { Users, Shield } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Fair-Hire Sentinel
          </h1>
          <p className="text-xl text-gray-600">
            AI-powered bias detection for fair hiring practices
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div 
            onClick={() => router.push('/user/login')}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-200"
          >
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Job Seeker
              </h2>
              <p className="text-gray-600 mb-4">
                Upload your resume and get fair hiring analysis
              </p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </button>
            </div>
          </div>

          <div 
            onClick={() => router.push('/dashboard')}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-green-200"
          >
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                HR Admin
              </h2>
              <p className="text-gray-600 mb-4">
                Monitor hiring process and detect bias patterns
              </p>
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Admin Portal
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>Ensuring fair and unbiased hiring for everyone</p>
        </div>
      </div>
    </div>
  );
}