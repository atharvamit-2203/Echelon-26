'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Briefcase, TrendingUp, Award, CheckCircle, Clock, XCircle, AlertCircle, Shield } from 'lucide-react';

interface Application {
  candidateId: string;
  jobTitle: string;
  fileName: string;
  status: string;
  uploadedAt: string;
  atsScore?: number;
  rescueReason?: string;
  suggestedPosition?: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  pending: { label: 'Pending Review', color: 'text-gray-700', bgColor: 'bg-gray-100', icon: Clock },
  under_review: { label: 'Under Review', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: AlertCircle },
  analyzing: { label: 'Analyzing', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: TrendingUp },
  shortlisted: { label: 'Shortlisted', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  selected: { label: 'Selected ✨', color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: Award },
  rescued: { label: 'Rescued 🎯', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: Shield },
  rejected: { label: 'Not Selected', color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle },
};

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/user/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchApplications(parsedUser.email);
  }, []);

  const fetchApplications = async (userId: string) => {
    try {
      // For now, fetch all CVs and filter by userId on frontend
      // This is a temporary solution until backend is running
      const response = await fetch(`/api/user/applications?userId=${encodeURIComponent(userId)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) {
        console.error('Failed to fetch applications');
        setApplications([]);
        return;
      }
      
      const data = await response.json();
      console.log('Fetched applications:', data);
      setApplications(Array.isArray(data.applications) ? data.applications : []);
    } catch (error) {
      console.error('Error:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    if (!Array.isArray(applications)) {
      return { total: 0, inReview: 0, successRate: '-' };
    }
    const total = applications.length;
    const inReview = applications.filter(a => ['under_review', 'analyzing', 'pending'].includes(a.status)).length;
    const selected = applications.filter(a => ['selected', 'shortlisted', 'rescued'].includes(a.status)).length;
    const successRate = total > 0 ? ((selected / total) * 100).toFixed(0) : '-';
    return { total, inReview, successRate };
  };

  const stats = getStats();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Fair-Hire</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
                <img className="h-9 w-9 rounded-full ring-2 ring-blue-500" src={user?.picture} alt={user?.name} />
                <span className="font-medium text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={() => {
                  localStorage.clear();
                  router.push('/');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Review</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.inReview}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.successRate}{stats.successRate !== '-' && '%'}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">My Applications</h2>
            <button
              onClick={() => router.push('/user/apply')}
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium"
            >
              <Upload className="h-4 w-4 mr-2" />
              New Application
            </button>
          </div>

          {!Array.isArray(applications) || applications.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-500 mb-6">Start your journey by submitting your first application</p>
              <button
                onClick={() => router.push('/user/apply')}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Upload className="h-4 w-4 mr-2" />
                Submit Application
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                const config = statusConfig[app.status] || statusConfig.pending;
                const StatusIcon = config.icon;
                return (
                  <div key={app.candidateId} className="p-5 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all bg-gradient-to-r from-white to-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-lg">
                          <Briefcase className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <p className="font-semibold text-gray-900 text-lg">{app.jobTitle}</p>
                            <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${config.bgColor} ${config.color}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {config.label}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 mt-2">
                            <p className="text-sm text-gray-500">
                              <FileText className="h-3.5 w-3.5 inline mr-1" />
                              {app.fileName}
                            </p>
                            <p className="text-sm text-gray-400">
                              {new Date(app.uploadedAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </p>
                            {app.atsScore && (
                              <p className="text-sm font-medium text-blue-600">
                                Score: {app.atsScore.toFixed(0)}%
                              </p>
                            )}
                          </div>
                          {app.rescueReason && (
                            <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                              <p className="text-xs text-orange-700">
                                <Shield className="h-3 w-3 inline mr-1" />
                                <span className="font-semibold">Rescued:</span> {app.rescueReason}
                              </p>
                            </div>
                          )}
                          {app.suggestedPosition && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-xs text-blue-700">
                                <Briefcase className="h-3 w-3 inline mr-1" />
                                <span className="font-semibold">AI Suggested Position:</span> {app.suggestedPosition}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}