"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, AlertTriangle, CheckCircle, XCircle, Clock, Activity, Download, Eye, Target } from 'lucide-react';
import BatchAnalysisPanel from '../../components/BatchAnalysisPanel';
import RecruiterUploadPanel from '../../components/RecruiterUploadPanel';
import ComprehensiveBiasAnalysis from '../../components/ComprehensiveBiasAnalysis';
import Navbar from '../../components/Navbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import Notification from '../../components/Notification';

const Dashboard = () => {
  const router = useRouter();
  const [selectedResume, setSelectedResume] = useState(null);
  const [pendingResumes, setPendingResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [homeData, setHomeData] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState<{ message: string; count: number }>({ message: '', count: 0 });
  const [jobCriteria, setJobCriteria] = useState<any>(null);

  useEffect(() => {
    fetchCVs();
    fetchHomeData();
    fetchJobCriteria();
  }, []);

  const fetchHomeData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/home');
      const data = await response.json();
      setHomeData(data);
    } catch (error) {
      console.error('Error fetching home data:', error);
    }
  };

  const fetchJobCriteria = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/active-job-criteria');
      const data = await response.json();
      if (data.criteria) {
        setJobCriteria(data.criteria);
      }
    } catch (error) {
      console.error('Error fetching job criteria:', error);
    }
  };

  const startAnalysis = async () => {
    // Start analysis and redirect to analysis page
    setAnalyzing(true);
    setShowNotification(false);

    // Redirect to analysis page immediately so user can see the progress
    router.push('/analysis');
  };

  const fetchCVs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/cvs');
      const data = await response.json();

      if (data.cvs) {
        // Transform CV data for display
        const transformedCVs = data.cvs.map((cv, index) => ({
          id: cv.candidateId || `CV-${index + 1}`,
          name: cv.name || cv.filename || 'Unknown Candidate',
          position: cv.currentRole || 'Position from CV',
          uploadedAt: cv.uploadedAt ? 'Recently uploaded' : 'File uploaded',
          status: cv.status || 'pending',
          age: cv.age || 'N/A',
          gender: cv.gender || 'N/A',
          source: cv.source || 'database',
          filename: cv.filename
        }));
        setPendingResumes(transformedCVs);
      }
    } catch (error) {
      console.error('Error fetching CVs:', error);
      // Fallback to sample data if API fails
      setPendingResumes([
        { id: 'R-2401', name: 'Michael Rodriguez', position: 'Senior Sales Manager', uploadedAt: '2 mins ago', status: 'pending', age: '48', gender: 'Male' },
        { id: 'R-2402', name: 'Jennifer Wu', position: 'CRM Specialist', uploadedAt: '5 mins ago', status: 'pending', age: '42', gender: 'Female' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const [atsScreening, setAtsScreening] = useState<any[]>([]);

  useEffect(() => {
    fetchAtsScreening();
  }, []);

  const fetchAtsScreening = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/rescue-alerts');
      const data = await response.json();
      if (data.rescue_alerts) {
        const screeningData = data.rescue_alerts.flatMap((alert: any) =>
          (alert.candidates || []).map((candidate: any) => ({
            id: candidate.candidate_id || 'N/A',
            name: candidate.name || 'Unknown',
            position: 'Position not specified',
            status: candidate.rescued || candidate.status === 'rescued' ? 'rescued' : 'rejected',
            reason: candidate.rescue_reason || candidate.rejection_reason || 'Keyword mismatch',
            similarity: candidate.semantic_score ? `${Math.round(candidate.semantic_score * 100)}%` : null,
            flagged: true,
            age: candidate.age || 'N/A'
          }))
        );
        setAtsScreening(screeningData.slice(0, 3)); // Show only first 3
      }
    } catch (error) {
      console.error('Error fetching ATS screening:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-gray-100">
        <Navbar />
        {showNotification && (
          <Notification
            message={notificationData.message}
            type="warning"
            onClose={() => setShowNotification(false)}
            onClick={() => router.push('/alerts')}
            duration={10000}
          />
        )}
        <div className="px-6 py-6 space-y-6">
          {/* Active Job Criteria Banner */}
          {jobCriteria && (
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    Active Screening Criteria: {jobCriteria.job_title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {jobCriteria.keywords?.slice(0, 8).map((keyword: string) => (
                      <span key={keyword} className="bg-purple-600/30 border border-purple-500 text-purple-200 px-3 py-1 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                    {jobCriteria.keywords?.length > 8 && (
                      <span className="text-purple-300 text-sm">+{jobCriteria.keywords.length - 8} more</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    💡 CVs will be screened against these keywords. Fair-Hire Sentinel will rescue qualified candidates who may be rejected.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">📊 Monitoring Dashboard</h1>
              <p className="text-gray-400 mt-1">Real-time monitoring of ATS screening processes</p>
            </div>
            <button
              onClick={startAnalysis}
              disabled={analyzing}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Activity className="w-5 h-5" />
              {analyzing ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
              <div className="text-sm text-gray-400 mb-2">Total Candidates</div>
              <div className="text-3xl font-bold text-white">{homeData?.metrics?.[0]?.value || pendingResumes.length}</div>
              <div className="text-sm text-green-400 mt-1">{homeData?.metrics?.[0]?.delta || '+12'}</div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
              <div className="text-sm text-gray-400 mb-2">ATS Rejections</div>
              <div className="text-3xl font-bold text-red-400">{homeData?.metrics?.[1]?.value || '88'}</div>
              <div className="text-sm text-green-400 mt-1">{homeData?.metrics?.[1]?.delta || '35%'}</div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
              <div className="text-sm text-gray-400 mb-2">Rescued Candidates</div>
              <div className="text-3xl font-bold text-amber-400">{homeData?.metrics?.[2]?.value || '12'}</div>
              <div className="text-sm text-green-400 mt-1">{homeData?.metrics?.[2]?.delta || '+5'}</div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
              <div className="text-sm text-gray-400 mb-2">Rescue Rate</div>
              <div className="text-3xl font-bold text-cyan-400">8.5%</div>
              <div className="text-sm text-green-400 mt-1">+2.3% improvement</div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
              <div className="text-sm text-gray-400 mb-2">System Health</div>
              <div className="text-3xl font-bold text-green-400">98%</div>
              <div className="text-sm text-gray-400 mt-1">All systems operational</div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* New Resumes to Analyze */}
            <div className="lg:col-span-2 bg-gray-900 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-cyan-400" />
                  Candidate CVs Ready for Analysis
                </h2>
                <span className="bg-cyan-900/30 border border-cyan-700 text-cyan-400 text-xs font-semibold px-3 py-1 rounded-full">
                  {pendingResumes.length} Loaded
                </span>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8 text-gray-400">Loading CVs...</div>
                ) : pendingResumes.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-lg">
                    <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium mb-2">No CVs found</p>
                    <p className="text-sm text-gray-500">Add CV files to the sample_cvs folder or use upload panel</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {pendingResumes.map((resume) => (
                        <div key={resume.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800 hover:border-cyan-500/30 transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-cyan-900/30 to-purple-900/30 rounded-full flex items-center justify-center">
                                <FileText className="w-5 h-5 text-cyan-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white text-sm">{resume.name}</h3>
                                <p className="text-xs text-gray-400">{resume.position}</p>
                              </div>
                            </div>
                            <button className="p-1.5 hover:bg-cyan-900/30 rounded transition-colors">
                              <Eye className="w-4 h-4 text-cyan-400" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="px-2 py-1 bg-gray-700/50 rounded text-gray-400">Age: {resume.age}</span>
                            <span className="px-2 py-1 bg-gray-700/50 rounded text-gray-400">{resume.gender}</span>
                            {resume.source === 'file_upload' && (
                              <span className="px-2 py-1 bg-cyan-900/30 border border-cyan-700/30 rounded text-cyan-400">📁 File</span>
                            )}
                          </div>
                          {resume.filename && (
                            <p className="text-xs text-gray-500 mt-2 truncate">📄 {resume.filename}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-center text-sm text-gray-500">
                      <p>💡 Click "Run Analysis" above to start ML-powered bias detection</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Recruiter Upload Panel */}
            <div className="lg:col-span-1">
              <RecruiterUploadPanel />
            </div>
          </div>

          {/* ATS Screening Results Section */}
          <div className="grid grid-cols-1 gap-6">
            {/* ATS Screening & Analysis */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="w-6 h-6 text-purple-400" />
                  ATS Screening & Analysis
                </h2>
                <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>

              <div className="space-y-3">
                {atsScreening.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No screening data yet</p>
                    <p className="text-sm mt-1">Run analysis to see results here</p>
                  </div>
                ) : (
                  atsScreening.map((item) => (
                    <div key={item.id} className={`border rounded-lg p-4 ${item.status === 'rejected' && item.flagged
                        ? 'bg-red-950/20 border-red-700/50'
                        : item.status === 'passed'
                          ? 'bg-green-950/20 border-green-700/50'
                          : 'bg-gray-800/50 border-gray-700'
                      }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.status === 'rejected' ? 'bg-red-900/30' : 'bg-green-900/30'
                            }`}>
                            {item.status === 'rejected' ? (
                              <XCircle className="w-5 h-5 text-red-400" />
                            ) : (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{item.name}</h3>
                            <p className="text-xs text-gray-400">{item.position}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${item.status === 'rejected' ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'
                          }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="ml-13 space-y-2">
                        <p className="text-sm text-gray-300">
                          <span className="text-gray-500">Reason:</span> {item.reason}
                        </p>
                        {item.similarity && (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-yellow-400 font-medium">
                              Fair-Hire detected {item.similarity} semantic similarity - Candidate flagged for rescue
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>ID: {item.id}</span>
                          <span>•</span>
                          <span>Age: {item.age}</span>
                        </div>
                      </div>

                      {item.flagged && (
                        <div className="mt-3 flex gap-2">
                          <button className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-xs font-medium">
                            Review Candidate
                          </button>
                          <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs font-medium">
                            See Details
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {atsScreening.length > 0 && (
                <div className="mt-4 p-3 bg-gray-800 border border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Analysis Progress:</span>
                    <span className="text-white font-medium">2/3 completed</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${Math.round((atsScreening.length / 3) * 100)}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}

export default Dashboard;
