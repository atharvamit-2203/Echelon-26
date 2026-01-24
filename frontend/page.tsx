"use client"
import { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { ShieldAlert, UserCheck, TrendingUp, Target, AlertTriangle, Sparkles } from 'lucide-react';

interface Candidate {
  id: number;
  name: string;
  atsScore: number;
  semanticScore: number;
  codingScore: number;
  actualPotential: number;
  status: string;
  reason: string;
  keywords: string;
  yearsExp: number;
  education: string;
  isRescued: boolean;
  driftScore: number;
  skillGap: number;
  // 👇 ADD THESE NEW FIELDS
  confidence?: {
    confidenceScore: number;
    confidenceLevel: string;
    factors: string[];
  } | null;
  roi?: {
    interviewCost: number;
    expectedValue: string;
    roi: string;
    recommendation: string;
  } | null;
  percentileVsAccepted?: string;
  betterThan?: string;
}

interface Metrics {
  rescueRate: string;
  rescueCount: number;
  rejectedCount: number;
  acceptedCount: number;
  avgRescuedCoding: string;
  avgAcceptedCoding: string;
  codingDelta: string;
  avgRescuedPotential: string;
  avgDrift: string;
  falseNegativeCost: string;
}

export default function Dashboard() {
  const [data, setData] = useState<Candidate[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [threshold, setThreshold] = useState(80);
  const [showRescued, setShowRescued] = useState(true);
  const [activeTab, setActiveTab] = useState('scatter');
  const [driftTimeline, setDriftTimeline] = useState([]);
  const [percentileData, setPercentileData] = useState<Candidate[]>([]);
  const [skillGaps, setSkillGaps] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/candidates?threshold=${threshold}`)
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('Error fetching candidates:', err));

    fetch(`http://localhost:5000/api/metrics?threshold=${threshold}`)
      .then(res => res.json())
      .then(setMetrics)
      .catch(err => console.error('Error fetching metrics:', err));

    fetch('http://localhost:5000/api/drift-timeline')
      .then(res => res.json())
      .then(setDriftTimeline)
      .catch(err => console.error('Error fetching drift timeline:', err));

    fetch(`http://localhost:5000/api/percentile-analysis?threshold=${threshold}`)
      .then(res => res.json())
      .then(setPercentileData)
      .catch(err => console.error('Error fetching percentiles:', err));
      
    fetch('http://localhost:5000/api/skill-gaps')
      .then(res => res.json())
      .then(setSkillGaps)
      .catch(err => console.error('Error fetching skill gaps:', err));
  }, [threshold]);

  const rejected = data.filter(c => c.status === 'rejected');
  const accepted = data.filter(c => c.status === 'accepted');
  const rescued = data.filter(c => c.isRescued);

  const scatterData = data.map(c => ({
    ...c,
    colorGroup: showRescued && c.isRescued ? 'rescued' : c.status
  }));

  const COLORS = {
    accepted: '#10b981',
    rejected: '#64748b',
    rescued: '#f59e0b'
  };

  const reasonCounts = rejected.reduce((acc, c) => {
    acc[c.reason] = (acc[c.reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(reasonCounts).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#10b981'];

  const comparisonData = [
    { group: 'Accepted', score: metrics ? parseFloat(metrics.avgAcceptedCoding) : 0 },
    { group: 'Rescued', score: metrics ? parseFloat(metrics.avgRescuedCoding) : 0 },
    { 
      group: 'Other Rejected', 
      score: rejected.filter(c => !c.isRescued).length > 0
        ? rejected.filter(c => !c.isRescued).reduce((sum, c) => sum + c.codingScore, 0) / rejected.filter(c => !c.isRescued).length
        : 0
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 pointer-events-none" />
      
      <div className="relative z-10 p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="mb-8 bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              ATS Bias Detection System
            </h1>
          </div>
          <p className="text-slate-400 text-lg ml-15">
            Identifying and rescuing high-potential candidates lost to keyword filtering
          </p>
        </header>

        {/* Controls */}
        <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-xl shadow-xl mb-8 border border-slate-700/50">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold mb-3 text-slate-300">
                Rescue Threshold: <span className="text-purple-400">{threshold}</span>
              </label>
              <input 
                type="range" 
                min="60" 
                max="95" 
                step="5"
                value={threshold} 
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                style={{
                  background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(168, 85, 247) ${((threshold - 60) / 35) * 100}%, rgb(51, 65, 85) ${((threshold - 60) / 35) * 100}%, rgb(51, 65, 85) 100%)`
                }}
              />
            </div>
            <div className="flex items-center gap-3 bg-slate-700/50 px-4 py-3 rounded-lg">
              <input 
                type="checkbox" 
                id="showRescued"
                checked={showRescued}
                onChange={(e) => setShowRescued(e.target.checked)}
                className="w-5 h-5 cursor-pointer accent-purple-500"
              />
              <label htmlFor="showRescued" className="text-sm font-semibold cursor-pointer flex items-center gap-2">
                <span>✨</span> Highlight Rescued Candidates
              </label>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <KpiCard 
              title="Rescue Rate" 
              value={`${metrics.rescueRate}%`}
              subtitle={`${metrics.rescueCount}/${metrics.rejectedCount} candidates`}
              icon={<UserCheck className="w-5 h-5" />} 
              gradient="from-blue-500 to-cyan-500"
            />
            <KpiCard 
              title="Avg Coding (Rescued)" 
              value={metrics.avgRescuedCoding}
              subtitle={`${parseFloat(metrics.codingDelta) > 0 ? '+' : ''}${metrics.codingDelta} vs accepted`}
              icon={<TrendingUp className="w-5 h-5" />} 
              gradient="from-green-500 to-emerald-500"
            />
            <KpiCard 
              title="Avg Potential" 
              value={metrics.avgRescuedPotential}
              subtitle="High performers"
              icon={<Target className="w-5 h-5" />} 
              gradient="from-purple-500 to-pink-500"
            />
            <KpiCard 
              title="Algorithm Drift" 
              value={`${metrics.avgDrift} pts`}
              subtitle="Points gap"
              icon={<AlertTriangle className="w-5 h-5" />} 
              gradient="from-orange-500 to-amber-500"
            />
            <KpiCard 
              title="False Negative Cost" 
              value={`${metrics.falseNegativeCost}%`}
              subtitle="of quality talent"
              icon={<ShieldAlert className="w-5 h-5" />} 
              gradient="from-red-500 to-rose-500"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50">
          <div className="border-b border-slate-700/50 bg-slate-900/30">
            <div className="flex overflow-x-auto">
              {[
                { id: 'scatter', label: '📊 Scatter', icon: '📊' },
                { id: 'drift', label: '📉 Drift', icon: '📉' },
                { id: 'clustering', label: '🎨 Clustering', icon: '🎨' },
                { id: 'breakdown', label: '📋 Breakdown', icon: '📋' },
                { id: 'confidence', label: '🎯 Confidence', icon: '🎯' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-b-2 border-purple-400 text-purple-300' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 lg:p-8">
            {/* Scatter Tab */}
            {activeTab === 'scatter' && (
              <div>
                <h3 className="text-2xl font-bold mb-6 text-slate-100">ATS Score vs Actual Potential</h3>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/30">
                  <ResponsiveContainer width="100%" height={500}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis 
                        type="number" 
                        dataKey="atsScore" 
                        name="ATS Score" 
                        label={{ value: 'ATS Score (Keyword Match)', position: 'bottom', offset: 0, fill: '#94a3b8' }}
                        domain={[25, 100]}
                        stroke="#64748b"
                        tick={{ fill: '#94a3b8' }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="actualPotential" 
                        name="Actual Potential"
                        label={{ value: 'Actual Potential', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                        domain={[55, 95]}
                        stroke="#64748b"
                        tick={{ fill: '#94a3b8' }}
                      />
                      <ZAxis type="number" dataKey="driftScore" range={[50, 400]} name="Drift" />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #475569',
                          borderRadius: '8px',
                          color: '#e2e8f0'
                        }}
                        content={({ payload }) => {
                          if (payload && payload.length > 0) {
                            const data = payload[0].payload as Candidate;
                            return (
                              <div className="bg-slate-800 p-3 border border-slate-600 rounded-lg shadow-xl">
                                <div className="font-semibold text-slate-100 mb-2">{data.name}</div>
                                <div className="text-sm text-slate-300 space-y-1">
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
                      <Legend wrapperStyle={{ color: '#94a3b8' }} />
                      {Object.entries(
                        scatterData.reduce((acc, d) => {
                          if (!acc[d.colorGroup]) acc[d.colorGroup] = [];
                          acc[d.colorGroup].push(d);
                          return acc;
                        }, {} as Record<string, Candidate[]>)
                      ).map(([group, items]) => (
                        <Scatter
                          key={group}
                          name={group === 'accepted' ? 'Accepted by ATS' : group === 'rescued' ? 'Should Be Rescued' : 'Rejected by ATS'}
                          data={items}
                          fill={COLORS[group as keyof typeof COLORS]}
                        />
                      ))}
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                
                {metrics && (
                  <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <p className="text-sm text-blue-200">
                      💡 <strong className="text-blue-100">Insight:</strong> {metrics.rescueCount} candidates were rejected by ATS but have skills exceeding the threshold of {threshold}. 
                      Their average coding score ({metrics.avgRescuedCoding}) is {metrics.codingDelta} points compared to accepted candidates.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Drift Tab */}
            {activeTab === 'drift' && (
              <div>
                <h3 className="text-2xl font-bold mb-6 text-slate-100">Algorithm Drift Over Time</h3>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/30">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={driftTimeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                      <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #475569',
                          borderRadius: '8px',
                          color: '#e2e8f0'
                        }}
                      />
                      <Legend wrapperStyle={{ color: '#94a3b8' }} />
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
                </div>
                <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                  <p className="text-sm text-orange-200">
                    ⚠️ <strong className="text-orange-100">Drift Alert:</strong> As ATS keyword requirements become stricter over time, they increasingly diverge from actual candidate capabilities.
                  </p>
                </div>
              </div>
            )}

{/* Clustering Tab */}
            {activeTab === 'clustering' && (
              <div>
                <h3 className="text-2xl font-bold mb-6 text-slate-100">Rejected Candidate Clustering by Skills</h3>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/30 mb-6">
                  <h4 className="text-lg font-semibold mb-4 text-slate-200">Clustering Rejected Candidates by Rejection Reason</h4>
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis 
                        type="number" 
                        dataKey="semanticScore" 
                        name="Semantic Match Score"
                        label={{ value: 'Semantic Match Score', position: 'bottom', offset: 0, fill: '#94a3b8' }}
                        stroke="#64748b"
                        tick={{ fill: '#94a3b8' }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="codingScore" 
                        name="Coding Ability Score"
                        label={{ value: 'Coding Ability Score', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                        stroke="#64748b"
                        tick={{ fill: '#94a3b8' }}
                      />
                      <ZAxis type="number" dataKey="yearsExp" range={[50, 400]} name="Years Exp" />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #475569',
                          borderRadius: '8px',
                          color: '#e2e8f0'
                        }}
                        content={({ payload }) => {
                          if (payload && payload.length > 0) {
                            const data = payload[0].payload as Candidate;
                            return (
                              <div className="bg-slate-800 p-3 border border-slate-600 rounded-lg shadow-xl">
                                <div className="font-semibold text-slate-100 mb-2">{data.name}</div>
                                <div className="text-sm text-slate-300 space-y-1">
                                  <div>Reason: <span className="text-purple-400">{data.reason}</span></div>
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
                      <Legend wrapperStyle={{ color: '#94a3b8' }} />
                      {Object.entries(
                        rejected.reduce((acc, c) => {
                          if (!acc[c.reason]) acc[c.reason] = [];
                          acc[c.reason].push(c);
                          return acc;
                        }, {} as Record<string, Candidate[]>)
                      ).map(([reason, items], index) => (
                        <Scatter
                          key={reason}
                          name={reason}
                          data={items}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/30">
                    <h4 className="font-semibold mb-4 text-lg text-slate-100">Rejection Reasons</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: '1px solid #475569',
                            borderRadius: '8px',
                            color: '#e2e8f0'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/30">
                    <h4 className="font-semibold mb-4 text-lg text-slate-100">Coding Score Comparison</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis 
                          dataKey="group"
                          stroke="#64748b"
                          tick={{ fill: '#94a3b8' }}
                        />
                        <YAxis 
                          stroke="#64748b"
                          tick={{ fill: '#94a3b8' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: '1px solid #475569',
                            borderRadius: '8px',
                            color: '#e2e8f0'
                          }}
                        />
                        <Bar dataKey="score" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Breakdown Tab */}
            {activeTab === 'breakdown' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-xl mb-4 text-slate-100">❌ Rejected Candidates</h4>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {rejected.sort((a, b) => b.actualPotential - a.actualPotential).map(c => (
                      <div 
                        key={c.id}
                        className={`p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                          c.isRescued 
                            ? 'bg-gradient-to-br from-amber-900/30 to-amber-800/20 border-amber-500/50' 
                            : 'bg-slate-800/50 border-slate-700/50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-semibold text-slate-100">{c.name}</div>
                          {c.isRescued && (
                            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                              ✨ RESCUE
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-400 mb-2">{c.reason}</div>
                        <div className="text-xs text-slate-500 font-mono bg-slate-900/50 p-2 rounded">
                          ATS: {c.atsScore} | Sem: {c.semanticScore} | Code: {c.codingScore} | {c.yearsExp}y exp
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-xl mb-4 text-slate-100">✅ Accepted Candidates</h4>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {accepted.sort((a, b) => b.actualPotential - a.actualPotential).map(c => (
                      <div 
                        key={c.id}
                        className="p-4 rounded-xl border-2 bg-gradient-to-br from-green-900/30 to-emerald-800/20 border-green-500/50 transition-all hover:scale-[1.02]"
                      >
                        <div className="font-semibold mb-2 text-slate-100">{c.name}</div>
                        <div className="text-xs text-slate-500 font-mono bg-slate-900/50 p-2 rounded">
                          ATS: {c.atsScore} | Sem: {c.semanticScore} | Code: {c.codingScore} | {c.yearsExp}y exp
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
{/* Confidence Analysis Tab */}
            {activeTab === 'confidence' && (
              <div>
                <h3 className="text-2xl font-bold mb-6 text-slate-100">Rescue Confidence Analysis</h3>
                
                {percentileData.length > 0 ? (
                  <div className="space-y-4">
                    {percentileData.map(candidate => (
                      <div 
                        key={candidate.id}
                        className={`p-6 rounded-xl border-2 transition-all hover:scale-[1.01] ${
                          candidate.confidence?.confidenceLevel === 'High' 
                            ? 'bg-gradient-to-br from-green-900/30 to-emerald-800/20 border-green-500/50'
                            : candidate.confidence?.confidenceLevel === 'Medium'
                            ? 'bg-gradient-to-br from-yellow-900/30 to-amber-800/20 border-yellow-500/50'
                            : 'bg-gradient-to-br from-red-900/30 to-rose-800/20 border-red-500/50'
                        }`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          {/* Candidate Info */}
                          <div>
                            <h4 className="font-bold text-lg text-slate-100 mb-2">{candidate.name}</h4>
                            <div className="text-sm text-slate-400 space-y-1">
                              <div>Reason: {candidate.reason}</div>
                              <div>Experience: {candidate.yearsExp}y</div>
                              <div>Education: {candidate.education}</div>
                            </div>
                          </div>
                          
                          {/* Confidence Score */}
                          <div>
                            <h5 className="font-semibold mb-2 text-purple-400">Confidence</h5>
                            <div className="text-3xl font-bold mb-2">
                              {candidate.confidence?.confidenceScore}
                              <span className="text-sm text-slate-400">/100</span>
                            </div>
                            <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                              candidate.confidence?.confidenceLevel === 'High' ? 'bg-green-500/20 text-green-300' :
                              candidate.confidence?.confidenceLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {candidate.confidence?.confidenceLevel} Confidence
                            </div>
                            <div className="mt-2 text-xs text-slate-400">
                              {candidate.confidence?.factors.map((factor, idx) => (
                                <div key={idx}>• {factor}</div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Percentile Ranking */}
                          <div>
                            <h5 className="font-semibold mb-2 text-blue-400">Ranking</h5>
                            <div className="text-3xl font-bold mb-2 text-blue-300">
                              Top {100 - parseInt(candidate.percentileVsAccepted || '0')}%
                            </div>
                            <div className="text-sm text-slate-400">
                              Better than {candidate.betterThan}
                            </div>
                            <div className="mt-2 text-xs text-slate-500 font-mono bg-slate-900/50 p-2 rounded">
                              Semantic: {candidate.semanticScore} | Coding: {candidate.codingScore}
                            </div>
                          </div>
                          
                          {/* ROI Analysis */}
                          <div>
                            <h5 className="font-semibold mb-2 text-amber-400">ROI</h5>
                            <div className="text-3xl font-bold mb-2 text-amber-300">
                              {candidate.roi?.roi}%
                            </div>
                            <div className="text-sm text-slate-400 mb-2">
                              Expected Value: {candidate.roi?.expectedValue}
                            </div>
                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                              candidate.roi?.recommendation === 'Strong candidate' 
                                ? 'bg-green-500/20 text-green-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {candidate.roi?.recommendation}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-12">
                    No rescued candidates at this threshold
                  </div>
                )}
              </div>
            )}

        {/* Rescued Candidates Spotlight */}
        {rescued.length > 0 && (
          <div className="mt-8 bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 lg:p-8 border border-slate-700/50">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-100">
              <span className="text-2xl">✨</span> Rescued Candidate Spotlight
            </h3>
            <div className="space-y-3">
              {rescued.map(candidate => (
                <details key={candidate.id} className="group bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden">
                  <summary className="cursor-pointer p-4 font-semibold hover:bg-slate-700/30 transition-colors flex items-center justify-between text-slate-100">
                    <span>{candidate.name} - {candidate.reason}</span>
                    <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="p-6 bg-slate-800/30 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-700/50">
                    <div>
                      <h5 className="font-semibold mb-3 text-purple-400">Scores</h5>
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">ATS:</span>
                          <span className="text-red-400">{candidate.atsScore} ❌</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Semantic:</span>
                          <span className="text-green-400">{candidate.semanticScore} ✅</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Coding:</span>
                          <span className="text-green-400">{candidate.codingScore} ✅</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t border-slate-700">
                          <span className="text-slate-300">Potential:</span>
                          <span className="text-purple-400">{candidate.actualPotential.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-3 text-blue-400">Background</h5>
                      <div className="text-sm space-y-2 text-slate-300">
                        <div>Experience: <span className="text-blue-300">{candidate.yearsExp} years</span></div>
                        <div>Education: <span className="text-blue-300">{candidate.education}</span></div>
                        <div>Drift Score: <span className="text-orange-300">{candidate.driftScore.toFixed(1)}</span></div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-3 text-amber-400">Analysis</h5>
                      <div className="text-sm mb-3 text-slate-300">{candidate.keywords}</div>
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2 shadow-lg">
                        ✅ ADD TO INTERVIEW LIST
                      </div>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Actionable Insights */}
        {metrics && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <InsightCard 
              title="💡 False Negative Impact"
              content={`${metrics.rescueCount} qualified candidates are being systematically excluded. This represents ${metrics.falseNegativeCost}% of your potential quality hires.`}
              gradient="from-blue-500/20 to-cyan-500/20"
              borderColor="border-blue-500/50"
            />
            <InsightCard 
              title="⚠️ Algorithm Drift"
              content={`Average drift score of ${metrics.avgDrift} points suggests ATS criteria are increasingly misaligned with actual candidate capabilities.`}
              gradient="from-orange-500/20 to-amber-500/20"
              borderColor="border-orange-500/50"
            />
            <InsightCard 
              title="✅ Optimization"
              content={`By rescuing these candidates, you could increase your quality hire pool by ${((metrics.rescueCount / metrics.acceptedCount) * 100).toFixed(0)}% without additional sourcing costs.`}
              gradient="from-green-500/20 to-emerald-500/20"
              borderColor="border-green-500/50"
            />
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
        );
      }

      interface KpiCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
}

function KpiCard({ title, value, subtitle, icon, gradient }: KpiCardProps) {
  return (
    <div className={`bg-gradient-to-br ${gradient} backdrop-blur-xl p-6 rounded-xl shadow-xl border border-slate-700/50 hover:scale-105 transition-transform`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-slate-300 font-semibold">{title}</div>
        <div className="p-2 rounded-lg bg-white/10">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-slate-300">{subtitle}</div>
    </div>
  );
}

interface InsightCardProps {
  title: string;
  content: string;
  gradient: string;
  borderColor: string;
}

function InsightCard({ title, content, gradient, borderColor }: InsightCardProps) {
  return (
    <div className={`bg-gradient-to-br ${gradient} backdrop-blur-xl p-6 rounded-xl border-2 ${borderColor} hover:scale-105 transition-transform`}>
      <h4 className="font-bold text-lg mb-3 text-slate-100">{title}</h4>
      <p className="text-sm text-slate-300">{content}</p>
    </div>
  );
}