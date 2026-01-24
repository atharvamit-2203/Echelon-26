'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, CheckCircle, AlertTriangle, TrendingUp, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Target, Sparkles } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

interface CandidateData {
  id: number;
  name: string;
  atsScore: number;
  semanticScore: number;
  codingScore: number;
  actualPotential: number;
  status: string;
  reason: string;
  yearsExp: number;
  education: string;
  isRescued: boolean;
  driftScore: number;
}

export default function Analytics() {
  const router = useRouter();
  const [selectedResume, setSelectedResume] = useState<number | null>(null);
  const [showATSAnalysis, setShowATSAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState<'resumes' | 'charts'>('resumes');
  const [chartView, setChartView] = useState<'scatter' | 'drift' | 'clustering' | 'breakdown'>('scatter');
  const [realCVs, setRealCVs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchCVData();
  }, []);

  const fetchCVData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/cvs');
      const data = await response.json();
      if (data.cvs) {
        setRealCVs(data.cvs);
      }
    } catch (error) {
      console.error('Error fetching CVs:', error);
    } finally {
      setLoading(false);
    }
  };

  const startAnalysis = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('http://localhost:8000/api/start-batch-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        alert('Analysis started! Results will appear shortly.');
        // Refresh data after a delay
        setTimeout(() => {
          fetchCVData();
          setAnalyzing(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error starting analysis:', error);
      setAnalyzing(false);
    }
  };

  // Enhanced candidate data for scatter plots
  const candidateAnalytics: CandidateData[] = [
    { id: 1, name: 'Alice Johnson', atsScore: 92, semanticScore: 88, codingScore: 89, actualPotential: 89, status: 'accepted', reason: 'Strong match', yearsExp: 10, education: 'BS CS', isRescued: false, driftScore: 3 },
    { id: 2, name: 'Marcus Davis', atsScore: 65, semanticScore: 82, codingScore: 78, actualPotential: 80, status: 'rejected', reason: 'Keyword mismatch', yearsExp: 6, education: 'BA Business', isRescued: true, driftScore: 15 },
    { id: 3, name: 'Sarah Chen', atsScore: 95, semanticScore: 90, codingScore: 92, actualPotential: 92, status: 'accepted', reason: 'Excellent fit', yearsExp: 8, education: 'MBA', isRescued: false, driftScore: 2 },
    { id: 4, name: 'John Smith', atsScore: 58, semanticScore: 75, codingScore: 72, actualPotential: 73, status: 'rejected', reason: 'Missing keywords', yearsExp: 5, education: 'BS IT', isRescued: true, driftScore: 15 },
    { id: 5, name: 'Emily Brown', atsScore: 88, semanticScore: 85, codingScore: 86, actualPotential: 86, status: 'accepted', reason: 'Good match', yearsExp: 7, education: 'MS CS', isRescued: false, driftScore: 2 },
    { id: 6, name: 'David Lee', atsScore: 62, semanticScore: 80, codingScore: 81, actualPotential: 81, status: 'rejected', reason: 'Experience format', yearsExp: 9, education: 'BS Engineering', isRescued: true, driftScore: 19 },
    { id: 7, name: 'Lisa Wang', atsScore: 90, semanticScore: 87, codingScore: 88, actualPotential: 88, status: 'accepted', reason: 'Strong technical', yearsExp: 6, education: 'BS CS', isRescued: false, driftScore: 2 },
    { id: 8, name: 'Mike Wilson', atsScore: 55, semanticScore: 78, codingScore: 76, actualPotential: 77, status: 'rejected', reason: 'Brand keywords', yearsExp: 8, education: 'BA', isRescued: true, driftScore: 22 },
  ];

  // Drift timeline data
  const driftTimeline = [
    { month: 'Jan', atsThreshold: 75, actualSkillAvg: 82 },
    { month: 'Feb', atsThreshold: 78, actualSkillAvg: 83 },
    { month: 'Mar', atsThreshold: 80, actualSkillAvg: 84 },
    { month: 'Apr', atsThreshold: 82, actualSkillAvg: 83 },
    { month: 'May', atsThreshold: 85, actualSkillAvg: 82 },
    { month: 'Jun', atsThreshold: 87, actualSkillAvg: 81 },
  ];

  const COLORS = {
    accepted: '#10b981',
    rejected: '#64748b',
    rescued: '#f59e0b'
  };

  const PIE_COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#10b981'];

  // Sample resume data with ATS analysis
  const resumes = [
    {
      id: 1,
      name: 'Alice Johnson',
      position: 'Senior Software Engineer',
      matchPercent: 89,
      content: `ALICE JOHNSON
Senior Software Engineer | 10+ Years Experience

CORE SKILLS
• Python, Java, AWS, Docker, Kubernetes
• System Design & Architecture
• Agile & Scrum Methodologies
• Cloud Infrastructure
• Leadership & Team Management

PROFESSIONAL EXPERIENCE
Senior Software Engineer | Tech Corp (2020-Present)
- Led team of 5 engineers in building microservices
- Designed AWS infrastructure for 1M+ users
- Improved system performance by 40%

EDUCATION
B.S. Computer Science | State University (2014)`,
      keywordsRequired: ['Python', 'AWS', 'Docker', 'Leadership', 'System Design'],
      keywordsFound: ['Python', 'AWS', 'Docker', 'Leadership', 'System Design'],
      bias_indicators: { age: 'None', gender: 'None' },
      passed: true
    },
    {
      id: 2,
      name: 'Marcus Davis',
      position: 'Data Analyst',
      matchPercent: 65,
      content: `MARCUS DAVIS
Data Analyst | 6 Years Experience

SKILLS
• SQL, Excel, Tableau
• Google Analytics
• Python basics
• Data Visualization

EXPERIENCE
Data Analyst | Analytics Inc (2019-Present)
- Created dashboards for stakeholders
- Analyzed customer behavior patterns
- Reported on KPIs monthly

EDUCATION
B.A. Business Analytics | University (2018)`,
      keywordsRequired: ['SQL', 'Python', 'Machine Learning', 'Tableau', 'Statistics'],
      keywordsFound: ['SQL', 'Tableau'],
      bias_indicators: { age: 'Potential bias detected', gender: 'None' },
      passed: false
    },
    {
      id: 3,
      name: 'Sarah Chen',
      position: 'Product Manager',
      matchPercent: 92,
      content: `SARAH CHEN
Product Manager | 8 Years Experience

KEY SKILLS
• Product Strategy & Roadmapping
• User Research & Analytics
• Cross-functional Leadership
• OKR Management
• Agile Product Development

EXPERIENCE
Senior Product Manager | InnovateCo (2021-Present)
- Launched 3 products generating $5M revenue
- Led 12-person cross-functional team
- Improved user retention by 35%

PREVIOUS ROLE
Product Manager | StartupXYZ (2017-2021)
- Managed product lifecycle
- Conducted user interviews & research
- Built analytics dashboard

EDUCATION
MBA - Product Management | Tech University (2017)
B.S. Business | State University (2015)`,
      keywordsRequired: ['Product Strategy', 'Analytics', 'Leadership', 'OKR', 'User Research'],
      keywordsFound: ['Product Strategy', 'Analytics', 'Leadership', 'OKR', 'User Research'],
      bias_indicators: { age: 'None', gender: 'None' },
      passed: true
    }
  ];

  const handleATSAnalysis = (index: number) => {
    setSelectedResume(index);
    setShowATSAnalysis(true);
  };

  const handleDashboardRedirect = () => {
    router.push('/dashboard');
  };

  if (showATSAnalysis && selectedResume !== null) {
    const resume = resumes[selectedResume];
    
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black text-gray-100">
          <Navbar />
          <div className="px-6 py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">🔍 ATS Analysis</h1>
              <p className="text-gray-400 mt-1">{resume.name} - {resume.position}</p>
            </div>
            <button
              onClick={() => setShowATSAnalysis(false)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Back to List
            </button>
          </div>

          {/* Match Score Banner */}
          <div className={`border rounded-lg p-6 ${resume.passed ? 'bg-green-900/20 border-green-700' : 'bg-amber-900/20 border-amber-700'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {resume.passed ? '✅ Strong Match' : '⚠️ Partial Match'}
                </h2>
                <p className={resume.passed ? 'text-green-400' : 'text-amber-400'}>
                  {resume.matchPercent}% keyword match rate
                </p>
              </div>
              <div className={`text-5xl font-bold ${resume.passed ? 'text-green-400' : 'text-amber-400'}`}>
                {resume.matchPercent}%
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resume Content */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-cyan-400" />
                Resume Content
              </h3>
              <div className="bg-gray-800 rounded p-4 h-96 overflow-y-auto">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                  {resume.content}
                </pre>
              </div>
            </div>

            {/* Keywords Analysis */}
            <div className="space-y-6">
              {/* Required Keywords */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">🔑 Required Keywords</h3>
                <div className="space-y-2">
                  {resume.keywordsRequired.map((keyword, idx) => {
                    const found = resume.keywordsFound.includes(keyword);
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded border ${
                          found
                            ? 'bg-green-900/20 border-green-700'
                            : 'bg-red-900/20 border-red-700'
                        }`}
                      >
                        {found ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        )}
                        <span className={found ? 'text-green-400' : 'text-red-400'}>
                          {keyword}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bias Indicators */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">⚖️ Bias Detection</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <span className="text-gray-300">Age Bias</span>
                    <span className={resume.bias_indicators.age === 'None' ? 'text-green-400 font-semibold' : 'text-yellow-400 font-semibold'}>
                      {resume.bias_indicators.age}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <span className="text-gray-300">Gender Bias</span>
                    <span className={resume.bias_indicators.gender === 'None' ? 'text-green-400 font-semibold' : 'text-yellow-400 font-semibold'}>
                      {resume.bias_indicators.gender}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {resume.passed ? (
                  <button
                    onClick={handleDashboardRedirect}
                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Move to Dashboard
                  </button>
                ) : (
                  <button
                    onClick={() => setShowATSAnalysis(false)}
                    className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Review More Candidates
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-gray-100">
        <Navbar />
        <div className="px-6 py-6 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">📈 ATS Analytics</h1>
                <p className="text-gray-400 mt-1">Review resume screening results and bias detection</p>
              </div>
              <button
                onClick={startAnalysis}
                disabled={analyzing}
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                {analyzing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Run Analysis
                  </>
                )}
              </button>
            </div>
        {/* Tab Navigation */}
        <div className="flex gap-2 bg-gray-900 border border-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('resumes')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'resumes'
                ? 'bg-cyan-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Resume Analysis
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'charts'
                ? 'bg-cyan-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Visual Analytics
          </button>
        </div>

        {activeTab === 'resumes' ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
                <div className="text-sm text-gray-400 mb-2">Total Resumes</div>
                <div className="text-3xl font-bold text-white">{resumes.length}</div>
                <div className="text-sm text-cyan-400 mt-1">Analyzed</div>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
                <div className="text-sm text-gray-400 mb-2">Strong Matches</div>
                <div className="text-3xl font-bold text-green-400">{resumes.filter(r => r.passed).length}</div>
                <div className="text-sm text-green-400 mt-1">Ready for dashboard</div>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
                <div className="text-sm text-gray-400 mb-2">Partial Matches</div>
                <div className="text-3xl font-bold text-amber-400">{resumes.filter(r => !r.passed).length}</div>
                <div className="text-sm text-amber-400 mt-1">Need review</div>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
                <div className="text-sm text-gray-400 mb-2">Avg Match Rate</div>
                <div className="text-3xl font-bold text-cyan-400">
                  {Math.round(resumes.reduce((sum, r) => sum + r.matchPercent, 0) / resumes.length)}%
                </div>
                <div className="text-sm text-cyan-400 mt-1">Across all</div>
              </div>
            </div>

            {/* Resumes List */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
                Resume Screening Results
              </h2>

              <div className="space-y-3">
                {resumes.map((resume, idx) => (
                  <div
                    key={resume.id}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{resume.name}</h3>
                            <p className="text-xs text-gray-400">{resume.position}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Match Score */}
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${resume.matchPercent >= 80 ? 'text-green-400' : resume.matchPercent >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                            {resume.matchPercent}%
                          </div>
                          <p className="text-xs text-gray-400">Match</p>
                        </div>

                        {/* Status Badge */}
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${resume.passed ? 'bg-green-900/30 text-green-400 border border-green-700' : 'bg-amber-900/30 text-amber-400 border border-amber-700'}`}>
                          {resume.passed ? '✓ Pass' : '⚠ Review'}
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => handleATSAnalysis(idx)}
                          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Analyze
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-cyan-900/20 border border-cyan-700 rounded-lg p-6">
                <h3 className="font-semibold text-cyan-400 mb-2">💡 Key Insight</h3>
                <p className="text-gray-300">Candidates with Python and AWS experience have 35% higher match rates across all positions</p>
              </div>

              <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-6">
                <h3 className="font-semibold text-amber-400 mb-2">⚡ Action Item</h3>
                <p className="text-gray-300">2 candidates with partial matches may still be strong fits. Consider manual review.</p>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            {/* Chart Type Selector */}
            <div className="flex gap-2 bg-gray-800 border border-gray-700 rounded-lg p-1 overflow-x-auto">
              {[
                { id: 'scatter', label: '📊 Scatter Analysis', icon: '📊' },
                { id: 'drift', label: '📉 Algorithm Drift', icon: '📉' },
                { id: 'clustering', label: '🎨 Clustering', icon: '🎨' },
                { id: 'breakdown', label: '📋 Breakdown', icon: '📋' }
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => setChartView(view.id as any)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
                    chartView === view.id
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400 text-purple-300'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>

            {/* Scatter Chart View */}
            {chartView === 'scatter' && (
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-6 text-white">ATS Score vs Actual Potential</h3>
                <ResponsiveContainer width="100%" height={500}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      type="number" 
                      dataKey="atsScore" 
                      name="ATS Score"
                      label={{ value: 'ATS Score (Keyword Match)', position: 'bottom', offset: 0, fill: '#9ca3af' }}
                      domain={[50, 100]}
                      stroke="#6b7280"
                      tick={{ fill: '#9ca3af' }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="actualPotential" 
                      name="Actual Potential"
                      label={{ value: 'Actual Potential', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                      domain={[70, 95]}
                      stroke="#6b7280"
                      tick={{ fill: '#9ca3af' }}
                    />
                    <ZAxis type="number" dataKey="driftScore" range={[50, 400]} name="Drift" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#e5e7eb'
                      }}
                      content={({ payload }) => {
                        if (payload && payload.length > 0) {
                          const data = payload[0].payload as CandidateData;
                          return (
                            <div className="bg-gray-800 p-3 border border-gray-600 rounded-lg shadow-xl">
                              <div className="font-semibold text-white mb-2">{data.name}</div>
                              <div className="text-sm text-gray-300 space-y-1">
                                <div>ATS: <span className="text-purple-400">{data.atsScore}</span></div>
                                <div>Semantic: <span className="text-blue-400">{data.semanticScore}</span></div>
                                <div>Coding: <span className="text-green-400">{data.codingScore}</span></div>
                                <div>Experience: <span className="text-amber-400">{data.yearsExp}y</span></div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ color: '#9ca3af' }} />
                    <Scatter
                      name="Accepted by ATS"
                      data={candidateAnalytics.filter(c => c.status === 'accepted')}
                      fill={COLORS.accepted}
                    />
                    <Scatter
                      name="Should Be Rescued"
                      data={candidateAnalytics.filter(c => c.isRescued)}
                      fill={COLORS.rescued}
                    />
                    <Scatter
                      name="Rejected by ATS"
                      data={candidateAnalytics.filter(c => c.status === 'rejected' && !c.isRescued)}
                      fill={COLORS.rejected}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <p className="text-sm text-blue-200">
                    💡 <strong>Insight:</strong> {candidateAnalytics.filter(c => c.isRescued).length} candidates were rejected by ATS but have high potential scores. These represent valuable talent that might be lost without semantic analysis.
                  </p>
                </div>
              </div>
            )}

            {/* Drift Analysis View */}
            {chartView === 'drift' && (
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-6 text-white">Algorithm Drift Over Time</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={driftTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#6b7280" tick={{ fill: '#9ca3af' }} />
                    <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#e5e7eb'
                      }}
                    />
                    <Legend wrapperStyle={{ color: '#9ca3af' }} />
                    <Line 
                      type="monotone" 
                      dataKey="atsThreshold" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      name="ATS Threshold"
                      dot={{ fill: '#ef4444', r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actualSkillAvg" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="Avg Candidate Skills"
                      dot={{ fill: '#10b981', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 p-4 bg-orange-900/20 border border-orange-700 rounded-lg">
                  <p className="text-sm text-orange-200">
                    ⚠️ <strong>Drift Alert:</strong> As ATS keyword requirements become stricter over time, they increasingly diverge from actual candidate capabilities. This growing gap indicates potential bias.
                  </p>
                </div>
              </div>
            )}

            {/* Clustering View */}
            {chartView === 'clustering' && (
              <div className="space-y-6">
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-2xl font-bold mb-6 text-white">Rejection Clustering by Skills</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        type="number" 
                        dataKey="semanticScore" 
                        name="Semantic Match"
                        label={{ value: 'Semantic Match Score', position: 'bottom', offset: 0, fill: '#9ca3af' }}
                        stroke="#6b7280"
                        tick={{ fill: '#9ca3af' }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="codingScore" 
                        name="Coding Ability"
                        label={{ value: 'Coding Ability Score', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                        stroke="#6b7280"
                        tick={{ fill: '#9ca3af' }}
                      />
                      <ZAxis type="number" dataKey="yearsExp" range={[50, 400]} name="Years Exp" />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#e5e7eb'
                        }}
                      />
                      <Legend wrapperStyle={{ color: '#9ca3af' }} />
                      {Array.from(new Set(candidateAnalytics.filter(c => c.status === 'rejected').map(c => c.reason))).map((reason, idx) => (
                        <Scatter
                          key={reason}
                          name={reason}
                          data={candidateAnalytics.filter(c => c.reason === reason)}
                          fill={PIE_COLORS[idx % PIE_COLORS.length]}
                        />
                      ))}
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Rejection Reasons Pie Chart */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-bold mb-4 text-white">Rejection Reasons</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={Array.from(
                            candidateAnalytics.filter(c => c.status === 'rejected')
                              .reduce((acc, c) => {
                                acc.set(c.reason, (acc.get(c.reason) || 0) + 1);
                                return acc;
                              }, new Map<string, number>())
                          ).map(([name, value]) => ({ name, value }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {Array.from(new Set(candidateAnalytics.filter(c => c.status === 'rejected').map(c => c.reason))).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#e5e7eb'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Coding Score Comparison */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-bold mb-4 text-white">Coding Score Comparison</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { 
                          group: 'Accepted', 
                          score: candidateAnalytics.filter(c => c.status === 'accepted').reduce((sum, c) => sum + c.codingScore, 0) / candidateAnalytics.filter(c => c.status === 'accepted').length 
                        },
                        { 
                          group: 'Rescued', 
                          score: candidateAnalytics.filter(c => c.isRescued).reduce((sum, c) => sum + c.codingScore, 0) / candidateAnalytics.filter(c => c.isRescued).length 
                        },
                        { 
                          group: 'Other Rejected', 
                          score: candidateAnalytics.filter(c => c.status === 'rejected' && !c.isRescued).reduce((sum, c) => sum + c.codingScore, 0) / (candidateAnalytics.filter(c => c.status === 'rejected' && !c.isRescued).length || 1)
                        }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="group"
                          stroke="#6b7280"
                          tick={{ fill: '#9ca3af' }}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          tick={{ fill: '#9ca3af' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#e5e7eb'
                          }}
                        />
                        <Bar dataKey="score" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Breakdown View */}
            {chartView === 'breakdown' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-xl mb-4 text-white">❌ Rejected Candidates</h4>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {candidateAnalytics.filter(c => c.status === 'rejected').sort((a, b) => b.actualPotential - a.actualPotential).map(c => (
                      <div 
                        key={c.id}
                        className={`p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                          c.isRescued 
                            ? 'bg-gradient-to-br from-amber-900/30 to-amber-800/20 border-amber-500/50' 
                            : 'bg-gray-800/50 border-gray-700/50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-semibold text-white">{c.name}</div>
                          {c.isRescued && (
                            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                              ✨ RESCUE
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400 mb-2">{c.reason}</div>
                        <div className="text-xs text-gray-500 font-mono bg-gray-900/50 p-2 rounded">
                          ATS: {c.atsScore} | Sem: {c.semanticScore} | Code: {c.codingScore} | {c.yearsExp}y exp
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-4 text-white">✅ Accepted Candidates</h4>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {candidateAnalytics.filter(c => c.status === 'accepted').sort((a, b) => b.actualPotential - a.actualPotential).map(c => (
                      <div 
                        key={c.id}
                        className="p-4 rounded-xl border-2 bg-gradient-to-br from-green-900/30 to-emerald-800/20 border-green-500/50 transition-all hover:scale-[1.02]"
                      >
                        <div className="font-semibold mb-2 text-white">{c.name}</div>
                        <div className="text-xs text-gray-500 font-mono bg-gray-900/50 p-2 rounded">
                          ATS: {c.atsScore} | Sem: {c.semanticScore} | Code: {c.codingScore} | {c.yearsExp}y exp
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-900/30 to-cyan-800/20 border border-blue-700 rounded-lg p-6">
                <h3 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  False Negative Impact
                </h3>
                <p className="text-sm text-gray-300">
                  {candidateAnalytics.filter(c => c.isRescued).length} qualified candidates being systematically excluded. This represents valuable talent loss.
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-900/30 to-amber-800/20 border border-orange-700 rounded-lg p-6">
                <h3 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Algorithm Drift
                </h3>
                <p className="text-sm text-gray-300">
                  Average drift score suggests ATS criteria are increasingly misaligned with actual candidate capabilities.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-900/30 to-emerald-800/20 border border-green-700 rounded-lg p-6">
                <h3 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Optimization Potential
                </h3>
                <p className="text-sm text-gray-300">
                  By rescuing these candidates, you could increase your quality hire pool by {((candidateAnalytics.filter(c => c.isRescued).length / candidateAnalytics.filter(c => c.status === 'accepted').length) * 100).toFixed(0)}%.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
      </div>
    </ProtectedRoute>
  )
}