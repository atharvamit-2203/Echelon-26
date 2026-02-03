'use client';

import { useState, useEffect } from 'react';
import CVUploadForm from '../../components/CVUploadForm';
import CVFileUpload from '../../components/CVFileUpload';

interface CV {
  candidateId: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  experience: number;
  skills: string[];
  education: string;
  location: string;
  currentRole: string;
  expectedSalary: string;
  status: 'under_review' | 'shortlisted' | 'rejected' | 'rescued';
  uploadedAt: Date;
}

interface RecruitingManager {
  name: string;
  email: string;
  company: string;
  experience: number;
  department: string;
}

export default function CVManagement() {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [managers, setManagers] = useState<RecruitingManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cvsResponse, managersResponse] = await Promise.all([
        fetch('http://localhost:8000/api/cvs'),
        fetch('http://localhost:8000/api/recruiting-managers')
      ]);
      
      const cvsData = await cvsResponse.json();
      const managersData = await managersResponse.json();
      
      setCvs(cvsData.cvs || []);
      setManagers(managersData.managers || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisStatus('Starting analysis...');
    
    try {
      const response = await fetch('http://localhost:8000/api/start-batch-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        // Immediately redirect to analytics page with live progress
        window.location.href = '/analytics?analyzing=true';
      } else {
        setAnalyzing(false);
        setAnalysisStatus('Error: Analysis failed to start');
        alert('Failed to start analysis. Please check the backend server.');
      }
    } catch (error) {
      console.error('Error starting analysis:', error);
      setAnalysisStatus('Error: Could not connect to backend');
      setAnalyzing(false);
      alert('Error starting analysis. Please ensure backend is running on port 8000.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'rescued': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">CV Management</h1>
        <button
          onClick={startAnalysis}
          disabled={analyzing || cvs.length === 0}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Start ATS Analysis
            </>
          )}
        </button>
      </div>
      
      {analysisStatus && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-medium">{analysisStatus}</p>
        </div>
      )}
      
      {/* File Upload */}
      <CVFileUpload onSuccess={fetchData} />
      
      {/* Add CV Form */}
      <CVUploadForm onSuccess={fetchData} />
      
      {/* CVs Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Candidate CVs ({cvs.length})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skills</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cvs.map((cv, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cv.candidateId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{cv.name}</div>
                      <div className="text-sm text-gray-500">{cv.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cv.currentRole}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cv.experience} years</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cv.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cv.skills?.slice(0, 2).join(', ')}
                    {cv.skills?.length > 2 && '...'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(cv.status)}`}>
                      {cv.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recruiting Managers Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recruiting Managers from Indian Companies ({managers.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {managers.map((manager, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg">{manager.name}</h3>
              <p className="text-sm text-blue-600 font-medium">{manager.company}</p>
              <p className="text-sm text-gray-500">{manager.email}</p>
              <p className="text-sm text-gray-500">{manager.experience} years experience</p>
              <p className="text-xs text-gray-400 mt-2">{manager.department}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}