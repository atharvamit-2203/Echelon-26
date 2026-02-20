'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Trash2, Eye, Filter } from 'lucide-react';
import Navbar from '@/components/Navbar';

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
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    // Poll for new alerts every 10 seconds
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const [homeRes, rescueRes] = await Promise.all([
        fetch('http://localhost:8000/api/home'),
        fetch('http://localhost:8000/api/rescue-alerts')
      ]);
      
      const homeData = await homeRes.json();
      const rescueData = await rescueRes.json();
      
      const combinedAlerts: Alert[] = [];
      
      // Add alerts from home API
      if (homeData.alerts) {
        homeData.alerts.forEach((alert: any, index: number) => {
          // Extract numeric value from affected field if possible
          let affectedCount = 0;
          if (alert.affected) {
            const match = alert.affected.match(/\d+/);
            affectedCount = match ? parseInt(match[0]) : 0;
          }
          
          // If no count provided, calculate from rescue data
          if (affectedCount === 0 && rescueData.rescue_alerts) {
            affectedCount = rescueData.rescue_alerts.reduce(
              (sum: number, a: any) => sum + (a.candidates?.length || 0), 
              0
            );
          }
          
          // Enhanced recommendations based on alert type
          let recommendations = [];
          if (alert.title.includes('Age-Based Bias') || alert.title.includes('Age')) {
            recommendations = [
              '🔍 Audit Rejection Criteria: Review decision factors for candidates with 10+ years experience',
              '📊 Analyze Experience Value: High experience should be an asset, not a liability',
              '🔄 Review Rejected Profiles: Manually assess experienced candidates who were filtered out',
              '⚙️ Update Scoring Algorithm: Ensure experience is weighted positively in ATS scoring',
              '📈 Monitor Age Groups: Track acceptance rates across different age demographics'
            ];
          } else if (alert.title.includes('Skill') || alert.biased_skills) {
            const skills = alert.biased_skills ? alert.biased_skills.join(', ').split(',').map((s: string) => s.trim().substring(0, 20)).join(', ') : 'certain skills';
            recommendations = [
              `🎯 Keyword Expansion: Add semantic equivalents for skills like "${skills}"`,
              '📊 Skill Taxonomy Review: Update ATS to recognize experience-level terminology variations',
              '🔍 Semantic Matching: Implement fuzzy matching to catch equivalent skill descriptions',
              '⚙️ Experience Weighting: Ensure senior-level skill descriptions are not penalized',
              `📋 Affected Skills: ${skills}`
            ];
          } else if (alert.title.includes('Gender')) {
            recommendations = [
              '🔍 Implement Gender-Blind Screening: Remove gender indicators from initial review',
              '📊 Audit Gendered Language: Check ATS for keywords that correlate with gender',
              '⚖️ Review Rejection Reasons: Analyze if certain terms are gender-biased',
              '📈 Monitor Gender Metrics: Track acceptance rates by gender demographics',
              '🎯 Bias Training: Educate hiring team on gender bias awareness'
            ];
          } else if (alert.title.includes('Talent Rescue') || alert.title.includes('Rescue Opportunity')) {
            recommendations = [
              '👥 Review High-Potential Candidates: Manually assess rejected candidates with strong qualifications',
              '🔍 Analyze Rejection Patterns: Identify why qualified candidates are being filtered out',
              '📊 Semantic Matching: Implement fuzzy matching to catch equivalent skills and experience',
              '🎯 Lower False Rejection Rate: Adjust ATS thresholds to reduce qualified candidate rejections'
            ];
          } else if (alert.recommendations) {
            // Use recommendations from backend if available
            recommendations = alert.recommendations;
          } else if (alert.recommendation) {
            recommendations = [alert.recommendation];
          } else {
            // Default recommendations
            recommendations = [
              '🔍 Review affected candidates for potential bias patterns',
              '📊 Analyze hiring data for demographic disparities',
              '⚙️ Update ATS configuration to ensure fair evaluation'
            ];
          }
          
          combinedAlerts.push({
            id: `home-${index}`,
            type: alert.type === 'warning' ? 'warning' : 'bias',
            title: alert.title,
            description: alert.description,
            severity: alert.type === 'warning' ? 'high' : 'critical',
            timestamp: new Date().toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            }),
            resolved: false,
            affectedCandidates: affectedCount,
            recommendations: recommendations
          });
        });
      }
      
      // Add rescue alerts
      if (rescueData.rescue_alerts) {
        rescueData.rescue_alerts.forEach((alert: any, index: number) => {
          // Handle peer comparison bias alerts (similar CVs, different outcomes)
          if (alert.type === 'peer_comparison_bias' && alert.peer_cases) {
            combinedAlerts.push({
              id: `peer-${index}`,
              type: 'bias',
              title: alert.title || '⚠️ Disparate Treatment: Similar Candidates, Different Outcomes',
              description: alert.description || 'Candidates with similar qualifications received different screening outcomes',
              severity: 'critical',
              timestamp: new Date().toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              }),
              resolved: false,
              affectedCandidates: alert.peer_cases.length,
              recommendations: [
                '🔍 Review Comparison Cases: Examine each pair of similar candidates with different outcomes',
                '📊 Analyze Score Differences: Compare ATS and semantic scores between candidate pairs',
                '👥 Check Demographics: Identify if demographic factors correlate with different outcomes',
                '⚖️ Verify Decision Criteria: Ensure screening decisions are based on merit, not demographics',
                '🎯 Standardize Evaluation: Implement consistent scoring rubrics across all candidates',
                '📈 Monitor Future Comparisons: Track similar candidates to prevent future disparate treatment',
                '🔔 Flag Similar Cases: Set up alerts when similar candidates receive different treatment',
                '📚 Train Hiring Team: Educate on unconscious bias and fair evaluation practices',
                `📋 Detailed Cases:\n${alert.peer_cases.map((c: any, i: number) => 
                  `   ${i+1}. ${c.candidate_1.name} (${c.candidate_1.status}, ${c.candidate_1.ats_score}%) vs ${c.candidate_2.name} (${c.candidate_2.status}, ${c.candidate_2.ats_score}%) - ${c.description}`
                ).join('\n')}`
              ]
            });
          } else {
            // Regular rescue alerts
            combinedAlerts.push({
              id: `rescue-${index}`,
              type: 'bias',
              title: alert.title || '🚨 Bias Alert: Qualified Candidate Needs Rescue',
              description: alert.description || 'A qualified candidate was rejected by ATS',
              severity: 'critical',
              timestamp: new Date().toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              }),
              resolved: false,
              affectedCandidates: alert.candidates?.length || 1,
              recommendations: [
                '👤 Review Candidate Profiles: Immediately assess semantic match scores for rescued candidates',
                '📞 Fast-Track Interview: Schedule manual interviews for candidates with >85% semantic match',
                '🔍 Investigate Root Cause: Analyze why ATS rejected these high-potential candidates',
                '⚙️ Update Keyword Requirements: Modify ATS to accept semantic equivalents identified in analysis',
                '📊 Audit Similar Cases: Search for other rejected candidates with similar profiles',
                '🎯 Implement Semantic Matching: Integrate AI-powered semantic analysis into ATS workflow',
                '👥 Review Demographics: Check if rescued candidates share common demographic patterns',
                '📈 Track Long-term: Monitor career success of rescued vs. traditionally accepted candidates',
                '🔔 Set Preventive Alerts: Configure real-time notifications for future similar rejections',
                '📚 Train Hiring Team: Educate recruiters on semantic matching and bias prevention'
              ]
            });
          }
        });
      }
      
      // Show only real alerts from APIs
      setAlerts(combinedAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

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

                {/* Expanded Details - Always show recommendations */}
                {alert.recommendations && alert.recommendations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h4 className="font-bold mb-3 text-lg flex items-center gap-2">
                      📋 Recommended Actions:
                      <span className="text-xs font-normal text-slate-400">
                        ({alert.recommendations.length} action items)
                      </span>
                    </h4>
                    <ul className="space-y-3">
                      {alert.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex gap-3 text-sm bg-slate-800/30 p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
                          <span className="text-cyan-400 font-bold shrink-0 text-base">{idx + 1}.</span>
                          <span className="leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Quick Action Buttons */}
                    <div className="mt-4 flex gap-3 flex-wrap">
                      <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors">
                        📊 Export Action Plan
                      </button>
                      <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">
                        📧 Email to Team
                      </button>
                      <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">
                        📅 Schedule Review
                      </button>
                    </div>
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
  );
}
