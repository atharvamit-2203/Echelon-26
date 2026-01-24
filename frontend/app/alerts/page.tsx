'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Trash2, Eye, Filter } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Alert {
  id: string;
  type: 'bias' | 'warning' | 'info';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  resolved: boolean;
  affectedCandidates?: number;
  recommendations?: string[];
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'bias',
      title: 'Age Discrimination Detected',
      description: 'Selection rate disparity exceeds Four-Fifths threshold for 45+ candidates',
      severity: 'critical',
      timestamp: '2 hours ago',
      resolved: false,
      affectedCandidates: 12,
      recommendations: [
        'Review filtering criteria for age-related keywords',
        'Audit recent rejections of experienced candidates',
        'Consider semantic matching for alternative qualifications'
      ]
    },
    {
      id: '2',
      type: 'bias',
      title: 'Keyword Toxicity Alert',
      description: '"Sales Cloud" acting as brand barrier, rejecting 60% of qualified CRM experts',
      severity: 'high',
      timestamp: '4 hours ago',
      resolved: false,
      affectedCandidates: 8,
      recommendations: [
        'Add semantic synonyms (Oracle, HubSpot, Salesforce)',
        'Implement fuzzy matching for technology keywords',
        'Manually review rejected candidates with similar skills'
      ]
    },
    {
      id: '3',
      type: 'warning',
      title: 'Data Drift Detected',
      description: 'Filter behavior has changed significantly over the past week',
      severity: 'medium',
      timestamp: '1 day ago',
      resolved: false,
      recommendations: [
        'Investigate recent ATS configuration changes',
        'Compare current filters with baseline settings'
      ]
    },
    {
      id: '4',
      type: 'info',
      title: 'System Rebalance Complete',
      description: 'Filters have been rebalanced to reduce demographic bias',
      severity: 'low',
      timestamp: '3 days ago',
      resolved: true,
      recommendations: []
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unresolved' | 'critical'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unresolved') return !alert.resolved;
    if (filter === 'critical') return alert.severity === 'critical' && !alert.resolved;
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-950 border-red-500 text-red-400';
      case 'high':
        return 'bg-orange-950 border-orange-500 text-orange-400';
      case 'medium':
        return 'bg-yellow-950 border-yellow-500 text-yellow-400';
      default:
        return 'bg-blue-950 border-blue-500 text-blue-400';
    }
  };

  const getSeverityIcon = (severity: string, resolved: boolean) => {
    if (resolved) {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
    if (severity === 'critical' || severity === 'high') {
      return <AlertTriangle className="w-5 h-5 text-red-400" />;
    }
    return <Clock className="w-5 h-5 text-yellow-400" />;
  };

  const handleResolve = (id: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, resolved: !alert.resolved } : alert
    ));
  };

  const handleDelete = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Bias Alerts</h1>
          <p className="text-slate-400">Monitor and manage detected biases in your hiring process</p>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 flex gap-3 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4 inline mr-2" />
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('unresolved')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'unresolved'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Active ({alerts.filter(a => !a.resolved).length})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'critical'
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            Critical ({alerts.filter(a => a.severity === 'critical' && !a.resolved).length})
          </button>

        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No alerts to display</h3>
              <p className="text-slate-400">Great job! All detected biases have been resolved.</p>
            </div>
          ) : (
            filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className={`border-l-4 rounded-lg p-6 backdrop-blur-xl ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    {getSeverityIcon(alert.severity, alert.resolved)}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold">{alert.title}</h3>
                        {alert.resolved && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">
                            Resolved
                          </span>
                        )}
                        <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs font-medium rounded capitalize">
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-sm opacity-90 mb-2">{alert.description}</p>
                      <p className="text-xs opacity-75">{alert.timestamp}</p>

                      {alert.affectedCandidates && (
                        <div className="mt-3 text-sm">
                          <span className="font-medium">Affected Candidates:</span> {alert.affectedCandidates}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setExpandedId(expandedId === alert.id ? null : alert.id)}
                      className="p-2 hover:bg-white/10 rounded-lg transition"
                      title="View details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        alert.resolved
                          ? 'bg-green-600/30 text-green-400 hover:bg-green-600/40'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {alert.resolved ? 'Mark Active' : 'Resolve'}
                    </button>
                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                      title="Delete alert"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === alert.id && alert.recommendations && alert.recommendations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h4 className="font-bold mb-3">Recommended Actions:</h4>
                    <ul className="space-y-2">
                      {alert.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex gap-3 text-sm">
                          <span className="text-cyan-400 font-bold">{idx + 1}.</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="text-sm text-slate-400 mb-2">Total Alerts</div>
            <div className="text-3xl font-bold">{alerts.length}</div>
          </div>
          <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-6">
            <div className="text-sm text-slate-400 mb-2">Critical Issues</div>
            <div className="text-3xl font-bold text-red-400">
              {alerts.filter(a => a.severity === 'critical' && !a.resolved).length}
            </div>
          </div>
          <div className="bg-yellow-950/30 border border-yellow-500/30 rounded-xl p-6">
            <div className="text-sm text-slate-400 mb-2">Active Alerts</div>
            <div className="text-3xl font-bold text-yellow-400">
              {alerts.filter(a => !a.resolved).length}
            </div>
          </div>
          <div className="bg-green-950/30 border border-green-500/30 rounded-xl p-6">
            <div className="text-sm text-slate-400 mb-2">Resolved</div>
            <div className="text-3xl font-bold text-green-400">
              {alerts.filter(a => a.resolved).length}
            </div>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}