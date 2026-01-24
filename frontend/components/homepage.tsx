'use client';
import React from 'react';
import { Shield, AlertTriangle, TrendingUp, Users, CheckCircle, ArrowRight, Zap, Eye, Target } from 'lucide-react';

interface FairHireHomepageProps {
  onNavigateToLogin?: () => void;
}

export default function FairHireHomepage({ onNavigateToLogin }: FairHireHomepageProps) {
  return (
    <div className="min-h-screen bg-black text-gray-100">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-cyan-400" />
            <span className="text-xl font-bold text-white">Fair-Hire Sentinel</span>
          </div>
          <button 
            onClick={onNavigateToLogin}
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-colors"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden mt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-black to-purple-900/20"></div>
        
        <div className="relative px-6 py-20 max-w-7xl mx-auto">
          <div className="text-center space-y-6">
            <div className="inline-block">
              <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-2 mb-6">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-cyan-400 font-medium">Real-time AI-Powered Bias Detection</span>
              </div>
            </div>
            
            <h1 className="text-6xl font-bold text-white leading-tight">
              Fair-Hire Sentinel
            </h1>
            
            <p className="text-2xl text-gray-400 max-w-3xl mx-auto">
              The intelligent monitoring layer that sits on top of your ATS, detecting bias and rescuing qualified candidates before they're lost
            </p>

            <div className="flex gap-4 justify-center pt-6">
              <button 
                onClick={onNavigateToLogin}
                className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-lg font-semibold transition-colors flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-lg text-lg font-semibold transition-colors">
                View Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="px-6 py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-950/30 border border-cyan-800/50 rounded-lg p-6 text-center">
            <Shield className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
            <div className="text-4xl font-bold text-cyan-400 mb-2">250</div>
            <div className="text-sm text-gray-400">Resumes Analyzed</div>
          </div>

          <div className="bg-gradient-to-br from-green-900/30 to-green-950/30 border border-green-800/50 rounded-lg p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <div className="text-4xl font-bold text-green-400 mb-2">12</div>
            <div className="text-sm text-gray-400">Candidates Rescued</div>
          </div>

          <div className="bg-gradient-to-br from-red-900/30 to-red-950/30 border border-red-800/50 rounded-lg p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <div className="text-4xl font-bold text-red-400 mb-2">3</div>
            <div className="text-sm text-gray-400">Active Bias Alerts</div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-purple-950/30 border border-purple-800/50 rounded-lg p-6 text-center">
            <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <div className="text-4xl font-bold text-purple-400 mb-2">-18%</div>
            <div className="text-sm text-gray-400">Bias Reduction</div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="px-6 py-16 bg-gray-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">How Fair-Hire Works</h2>
            <p className="text-xl text-gray-400">A three-step approach to eliminate bias and rescue talent</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8">
              <div className="w-16 h-16 bg-blue-500/20 border border-blue-500 rounded-lg flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">1. Statistical Detection</h3>
              <p className="text-gray-400 leading-relaxed">
                Monitors ATS rejection patterns using the "Four-Fifths Rule" to identify disparate impact across demographics. Flags when acceptance rates drop below fairness thresholds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8">
              <div className="w-16 h-16 bg-cyan-500/20 border border-cyan-500 rounded-lg flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">2. Semantic Analysis</h3>
              <p className="text-gray-400 leading-relaxed">
                Analyzes rejected resumes for semantic similarity. Identifies "Hidden Experts" who used different terminology but possess the required skills (96% similarity match).
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8">
              <div className="w-16 h-16 bg-green-500/20 border border-green-500 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">3. Talent Rescue</h3>
              <p className="text-gray-400 leading-relaxed">
                Automatically flags high-potential candidates for human review. Provides recommendations to update keyword filters and eliminate bias in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Issues */}
      <div className="px-6 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Active Issues Detected</h2>
          <p className="text-xl text-gray-400">Real-time alerts from your hiring pipeline</p>
        </div>

        <div className="space-y-4">
          <div className="bg-red-950/20 border-l-4 border-red-500 rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <h3 className="text-xl font-bold text-red-400">CRITICAL: Age Discrimination Detected</h3>
                </div>
                <p className="text-gray-300 mb-2">
                  Acceptance rate for 45+ candidates: <span className="text-red-400 font-bold">18%</span> vs younger candidates: <span className="text-green-400 font-bold">91%</span>
                </p>
                <p className="text-sm text-gray-400">
                  Bias Score: 0.22 (High) • Affected Keywords: "KPI", "OKR", "Digital Strategy"
                </p>
              </div>
              <button 
                onClick={onNavigateToLogin}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors whitespace-nowrap"
              >
                Investigate
              </button>
            </div>
          </div>

          <div className="bg-yellow-950/20 border-l-4 border-yellow-500 rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  <h3 className="text-xl font-bold text-yellow-400">WARNING: Keyword Drift</h3>
                </div>
                <p className="text-gray-300 mb-2">
                  "Sales Cloud" is acting as a brand barrier, rejecting 60% of qualified CRM experts
                </p>
                <p className="text-sm text-gray-400">
                  Recommended: Add semantic synonyms for Oracle, HubSpot, Salesforce
                </p>
              </div>
              <button 
                onClick={onNavigateToLogin}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors whitespace-nowrap"
              >
                Review
              </button>
            </div>
          </div>

          <div className="bg-cyan-950/20 border-l-4 border-cyan-500 rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-6 h-6 text-cyan-500" />
                  <h3 className="text-xl font-bold text-cyan-400">Talent Rescue Opportunity</h3>
                </div>
                <p className="text-gray-300 mb-2">
                  <span className="font-bold">12 high-potential candidates</span> with &gt;85% semantic match found in rejections
                </p>
                <p className="text-sm text-gray-400">
                  Demographics: Primarily experienced professionals (45+) and female candidates
                </p>
              </div>
              <button 
                onClick={onNavigateToLogin}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded font-medium transition-colors whitespace-nowrap"
              >
                View Candidates
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 py-20 bg-gradient-to-br from-cyan-900/20 via-black to-purple-900/20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-5xl font-bold text-white">
            Stop Losing Top Talent to Bias
          </h2>
          <p className="text-xl text-gray-400">
            Fair-Hire Sentinel acts as your bias smoke detector, catching problems before qualified candidates slip through the cracks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <button 
              onClick={onNavigateToLogin}
              className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-lg text-lg font-semibold transition-colors">
              View Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-950 px-6 py-8">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2026 Fair-Hire Sentinel. Built to eliminate bias and rescue talent.</p>
        </div>
      </footer>
    </div>
  );
}
