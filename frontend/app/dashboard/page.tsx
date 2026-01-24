"use client";

import React, { useState } from 'react';
import { FileText, AlertTriangle, CheckCircle, XCircle, Clock, Activity, Download, Eye } from 'lucide-react';
import BatchAnalysisPanel from '../../components/BatchAnalysisPanel';
import Navbar from '../../components/Navbar';

const Dashboard = () => {
  const [selectedResume, setSelectedResume] = useState(null);

  const pendingResumes = [
    { id: 'R-2401', name: 'Michael Rodriguez', position: 'Senior Sales Manager', uploadedAt: '2 mins ago', status: 'pending', age: '48', gender: 'Male' },
    { id: 'R-2402', name: 'Jennifer Wu', position: 'CRM Specialist', uploadedAt: '5 mins ago', status: 'pending', age: '42', gender: 'Female' },
    { id: 'R-2403', name: 'David Thompson', position: 'Business Analyst', uploadedAt: '8 mins ago', status: 'pending', age: '35', gender: 'Male' },
    { id: 'R-2404', name: 'Sarah Martinez', position: 'Marketing Director', uploadedAt: '12 mins ago', status: 'pending', age: '51', gender: 'Female' },
    { id: 'R-2405', name: 'James Park', position: 'Account Executive', uploadedAt: '15 mins ago', status: 'pending', age: '29', gender: 'Male' },
  ];

  const atsScreening = [
    { id: 'R-2398', name: 'Lisa Chen', position: 'Sales Director', status: 'rejected', reason: 'Missing keyword: "KPI"', similarity: '94%', flagged: true, age: '46' },
    { id: 'R-2399', name: 'Robert Johnson', position: 'CRM Manager', status: 'rejected', reason: 'Missing keyword: "Sales Cloud"', similarity: '91%', flagged: true, age: '44' },
    { id: 'R-2400', name: 'Emily Davis', position: 'Business Development', status: 'passed', reason: 'All criteria met', similarity: null, flagged: false, age: '32' },
  ];

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Navbar />
      <div className="px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">📊 Monitoring Dashboard</h1>
        <p className="text-gray-400 mt-1">Real-time monitoring of ATS screening processes</p>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
          <div className="text-sm text-gray-400 mb-2">Candidates Screened Today</div>
          <div className="text-3xl font-bold text-white">47</div>
          <div className="text-sm text-green-400 mt-1">+12 from yesterday</div>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
          <div className="text-sm text-gray-400 mb-2">Bias Alerts</div>
          <div className="text-3xl font-bold text-red-400">3</div>
          <div className="text-sm text-green-400 mt-1">-1 from yesterday</div>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Resumes to Analyze */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-cyan-400" />
              New Resumes to Analyze
            </h2>
            <span className="bg-cyan-900/30 border border-cyan-700 text-cyan-400 text-xs font-semibold px-3 py-1 rounded-full">
              {pendingResumes.length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {pendingResumes.map((resume) => (
              <div key={resume.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{resume.name}</h3>
                        <p className="text-xs text-gray-400">{resume.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 ml-13">
                      <span>ID: {resume.id}</span>
                      <span>•</span>
                      <span>{resume.uploadedAt}</span>
                      <span>•</span>
                      <span>Age: {resume.age}</span>
                      <span>•</span>
                      <span>{resume.gender}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-xs font-medium flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Preview
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-200">
                      <span className="text-lg">⋮</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <BatchAnalysisPanel />
          </div>
        </div>

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
            {atsScreening.map((item) => (
              <div key={item.id} className={`border rounded-lg p-4 ${
                item.status === 'rejected' && item.flagged 
                  ? 'bg-red-950/20 border-red-700/50' 
                  : item.status === 'passed'
                  ? 'bg-green-950/20 border-green-700/50'
                  : 'bg-gray-800/50 border-gray-700'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.status === 'rejected' ? 'bg-red-900/30' : 'bg-green-900/30'
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
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    item.status === 'rejected' ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'
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
            ))}
          </div>

          <div className="mt-4 p-3 bg-gray-800 border border-gray-700 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Analysis Progress:</span>
              <span className="text-white font-medium">2/3 completed</span>
            </div>
            <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
              <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '66%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-400" />
          Recent Activity
        </h2>
        <div className="space-y-3">
          <ActivityItem time="10:45 AM" event="Bias Alert" detail="Age bias detected in 'KPI' filter" type="alert" />
          <ActivityItem time="10:32 AM" event="Candidate Rescued" detail="Sarah Chen (ID: 1847) rescued" type="success" />
          <ActivityItem time="10:15 AM" event="Screening Complete" detail="Batch #234 processed" type="info" />
          <ActivityItem time="9:58 AM" event="Bias Alert" detail="Gender bias in 'Leadership' keyword" type="alert" />
          <ActivityItem time="9:42 AM" event="Candidate Rescued" detail="Michael Rodriguez (ID: 2401) flagged for review" type="success" />
          <ActivityItem time="9:30 AM" event="System Update" detail="Semantic matching algorithm updated" type="info" />
        </div>
      </div>
      </div>
    </div>
  );
};

function ActivityItem({ time, event, detail, type }: { time: string; event: string; detail: string; type: string }) {
  const getIcon = () => {
    switch(type) {
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Activity className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="flex items-start gap-4 p-3 hover:bg-gray-800/50 rounded-lg transition-colors">
      <div className="text-sm text-gray-500 w-20 flex-shrink-0">{time}</div>
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="flex-1">
        <div className="font-semibold text-white">{event}</div>
        <div className="text-sm text-gray-400">{detail}</div>
      </div>
    </div>
  );
}

export default Dashboard;
