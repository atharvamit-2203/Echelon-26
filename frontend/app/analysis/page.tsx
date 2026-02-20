"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Notification from "../../components/Notification";

interface Candidate {
  name: string;
  age: number;
  experience: number;
  ats_score: number;
  semantic_score: number;
  status: string;
  gender?: string;
  candidateId?: string;
}

interface BiasIndicator {
  candidate?: string;
  candidateId?: string;
  biased_terms?: string[];
  bias_score?: number;
  age?: number;
  experience?: number;
  status?: string;
}

interface FairnessIssue {
  type: string;
  candidates?: string[];
  similarity?: number;
  issue?: string;
  demographic_factor?: string;
  ages?: number[];
  statuses?: string[];
}

interface MLAnalysis {
  ok: boolean;
  bias_indicators: string[];
  bias_score: number;
  detailed_results?: BiasIndicator[];
  analyzed_count?: number;
  rejected_with_bias?: number;
}

interface FairnessAnalysis {
  ok: boolean;
  fairness_score: number;
  issues: string[];
  score: number;
  detailed_issues?: FairnessIssue[];
  analyzed_pairs?: number;
  unfair_cases?: number;
  candidates_analyzed?: Candidate[];
}

interface AnalysisResult {
  biasDetected: boolean;
  details?: string;
  mlAnalysis?: MLAnalysis;
  fairnessAnalysis?: FairnessAnalysis;
}

type TabType = "scatter" | "drift" | "clustering" | "breakdown";

export default function AnalysisPage() {
  const router = useRouter();
  const params = useSearchParams();
  const autorun = params.get("autorun") === "1";
  const [status, setStatus] = useState<"idle"|"running"|"completed"|"error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showNotif, setShowNotif] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("scatter");

  useEffect(() => {
    // Load cached analysis result for instant page load.
    const cachedResult = localStorage.getItem("analysis_result_cache");
    if (cachedResult) {
      try {
        const parsed = JSON.parse(cachedResult) as AnalysisResult;
        setResult(parsed);
        setStatus("completed");
      } catch {
        localStorage.removeItem("analysis_result_cache");
      }
    }
  }, []);

  useEffect(() => {
    // Run analysis only when explicitly requested (from Dashboard).
    if (autorun && status === "idle" && !result) {
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autorun]);

  const runAnalysis = async () => {
    setStatus("running");
    setError(null);
    try {
      const res = await fetch("/api/run-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "dashboard" })
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data: AnalysisResult = await res.json();
      setResult(data);
      localStorage.setItem("analysis_result_cache", JSON.stringify(data));
      setStatus("completed");
      if (data.biasDetected) {
        setShowNotif(true);
      }
    } catch (e: any) {
      setError(e?.message || "Unknown error");
      setStatus("error");
    }
  };

  const mlAnalysis = result?.mlAnalysis;
  const fairnessAnalysis = result?.fairnessAnalysis;
  const candidates = fairnessAnalysis?.candidates_analyzed || [];
  
  // Debug logging
  useEffect(() => {
    if (candidates.length > 0) {
      console.log('📊 Analysis Data Received:');
      console.log('  - Total candidates:', candidates.length);
      console.log('  - Sample candidate:', candidates[0]);
      console.log('  - Rejected:', candidates.filter(c => c.status === 'rejected').length);
      console.log('  - Accepted:', candidates.filter(c => c.status !== 'rejected').length);
    }
  }, [candidates]);
  
  // Calculate bias score
  const biasScore = result?.mlAnalysis?.bias_score || 0;
  
  // Separate rejected and accepted candidates
  const rejectedCandidates = candidates.filter(c => c.status === 'rejected');
  const acceptedCandidates = candidates.filter(c => c.status !== 'rejected');

  return (
    <div className="min-h-screen bg-black text-gray-100 px-6 py-10">
      {showNotif && (
        <Notification
          type="warning"
          title="Bias Detected"
          message={result?.details || "Potential bias indicators found. Click to review alerts."}
          onClose={() => setShowNotif(false)}
          onClick={() => router.push("/alerts")}
          duration={10000}
        />
      )}

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white">Analysis</h1>
        <p className="text-gray-400 mt-1">ML-powered comprehensive bias detection and fairness analysis.</p>

        {/* Status Bar */}
        <div className="mt-6 bg-gray-900 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Status</p>
              <h2 className="text-xl font-semibold text-white">
                {status === "idle" && "Ready"}
                {status === "running" && "Running ML Analysis..."}
                {status === "completed" && "Completed"}
                {status === "error" && "Error"}
              </h2>
            </div>
            <button
              onClick={runAnalysis}
              disabled={status === "running"}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 rounded-lg text-white font-semibold transition-colors"
            >
              {status === "running" ? "Analyzing..." : "Run Analysis"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <p className="text-red-400">⚠ {error}</p>
          </div>
        )}

        {status === "completed" && result && (
          <>
            {/* Tabs */}
            <div className="mt-8 flex gap-2 border-b border-gray-700">
              <button
                onClick={() => setActiveTab("scatter")}
                className={`px-4 py-2 font-semibold transition-colors ${
                  activeTab === "scatter"
                    ? "border-b-2 border-cyan-500 text-cyan-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                📊 Scatter Analysis
              </button>
              <button
                onClick={() => setActiveTab("drift")}
                className={`px-4 py-2 font-semibold transition-colors ${
                  activeTab === "drift"
                    ? "border-b-2 border-cyan-500 text-cyan-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                📉 Algorithm Drift
              </button>
              <button
                onClick={() => setActiveTab("clustering")}
                className={`px-4 py-2 font-semibold transition-colors ${
                  activeTab === "clustering"
                    ? "border-b-2 border-cyan-500 text-cyan-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                🎯 Clustering
              </button>
              <button
                onClick={() => setActiveTab("breakdown")}
                className={`px-4 py-2 font-semibold transition-colors ${
                  activeTab === "breakdown"
                    ? "border-b-2 border-cyan-500 text-cyan-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                📋 Breakdown
              </button>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {/* Scatter Analysis Tab */}
              {activeTab === "scatter" && (
                <div className="space-y-6">
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Scatter Plot: ATS Score vs Semantic Score</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Each dot represents a candidate. Position shows their ATS score (horizontal) vs semantic match score (vertical).
                    </p>
                    <div className="relative h-[500px] bg-gray-800 rounded-lg p-6">
                      {/* Simple scatter plot visualization */}
                      <div className="relative h-full">
                        {/* Y-axis label */}
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-semibold text-gray-300">
                          Semantic Score (%)
                        </div>
                        {/* X-axis label */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm font-semibold text-gray-300">
                          ATS Score (%)
                        </div>
                        
                        {/* Y-axis scale */}
                        <div className="absolute left-12 top-0 bottom-12 flex flex-col justify-between text-xs text-gray-500">
                          <span>100</span>
                          <span>75</span>
                          <span>50</span>
                          <span>25</span>
                          <span>0</span>
                        </div>
                        
                        {/* X-axis scale */}
                        <div className="absolute left-12 right-0 bottom-2 flex justify-between text-xs text-gray-500">
                          <span>0</span>
                          <span>25</span>
                          <span>50</span>
                          <span>75</span>
                          <span>100</span>
                        </div>
                        
                        {/* Plot area with grid */}
                        <div className="ml-16 mr-4 h-full pb-12 relative border-l-2 border-b-2 border-gray-600">
                          {/* Grid lines */}
                          {[0, 25, 50, 75, 100].map((val) => (
                            <div key={`h${val}`} className="absolute left-0 right-0 border-t border-gray-700/30" style={{ bottom: `${val}%` }} />
                          ))}
                          {[0, 25, 50, 75, 100].map((val) => (
                            <div key={`v${val}`} className="absolute top-0 bottom-0 border-l border-gray-700/30" style={{ left: `${val}%` }} />
                          ))}
                          
                          {/* Bias zone indicator */}
                          <div className="absolute top-0 bottom-[50%] left-0 right-[50%] bg-yellow-500/5 border border-yellow-500/20 rounded">
                            <span className="absolute top-2 left-2 text-xs text-yellow-400">High Bias Risk Zone</span>
                          </div>
                          
                          {/* Data points */}
                          {candidates.map((candidate, idx) => {
                            const x = Math.min(100, Math.max(0, candidate.ats_score)); // percentage
                            const y = 100 - (candidate.semantic_score * 100); // invert for top-down
                            const isRejected = candidate.status === 'rejected';
                            const isBiasZone = x < 50 && y > 50;
                            return (
                              <div
                                key={idx}
                                className="absolute group z-10"
                                style={{
                                  left: `${x}%`,
                                  top: `${y}%`,
                                  transform: 'translate(-50%, -50%)'
                                }}
                              >
                                <div
                                  className={`w-4 h-4 rounded-full cursor-pointer border-2 transition-all ${
                                    isRejected 
                                      ? 'bg-red-500 border-red-300 shadow-lg shadow-red-500/50' 
                                      : 'bg-green-500 border-green-300 shadow-lg shadow-green-500/50'
                                  } hover:scale-150`}
                                  title={candidate.name}
                                />
                                <div className="absolute hidden group-hover:block bg-gray-900 border-2 border-gray-600 rounded-lg p-3 text-xs whitespace-nowrap z-20 left-6 top-0 shadow-xl">
                                  <p className="font-bold text-white mb-1">{candidate.name}</p>
                                  <p className="text-gray-300">ATS: {candidate.ats_score}%</p>
                                  <p className="text-gray-300">Semantic: {(candidate.semantic_score * 100).toFixed(0)}%</p>
                                  <p className="text-gray-300">Age: {candidate.age} | Exp: {candidate.experience}y</p>
                                  <p className={`font-semibold mt-1 ${isRejected ? 'text-red-400' : 'text-green-400'}`}>
                                    Status: {candidate.status}
                                  </p>
                                  {isBiasZone && isRejected && (
                                    <p className="text-yellow-400 text-xs mt-1">⚠ In bias risk zone!</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-8 text-sm justify-center">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-300 shadow-lg shadow-red-500/50"/>
                        <span className="text-gray-300">Rejected ({rejectedCandidates.length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-300 shadow-lg shadow-green-500/50"/>
                        <span className="text-gray-300">Accepted ({acceptedCandidates.length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-yellow-500/10 border border-yellow-500/30"/>
                        <span className="text-gray-300">High Bias Risk Zone</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Algorithm Drift Tab */}
              {activeTab === "drift" && (
                <div className="space-y-6">
                  {/* Drift metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                      <p className="text-gray-400 text-sm">Drift Score</p>
                      <p className="text-3xl font-bold text-yellow-400">{(result.mlAnalysis?.bias_score || 0).toFixed(2)}</p>
                      <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-yellow-500"
                          style={{ width: `${Math.min(100, (result.mlAnalysis?.bias_score || 0) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                      <p className="text-gray-400 text-sm">False Rejections</p>
                      <p className="text-3xl font-bold text-red-400">{mlAnalysis?.rejected_with_bias || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">High semantic match but rejected</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                      <p className="text-gray-400 text-sm">Fairness Gap</p>
                      <p className="text-3xl font-bold text-cyan-400">
                        {fairnessAnalysis ? (1 - fairnessAnalysis.fairness_score).toFixed(2) : "0.00"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">1.0 = maximum unfairness</p>
                    </div>
                  </div>

                  {/* Rejection Rate by Age Group */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Rejection Rate by Age Group</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Shows potential algorithmic bias drift based on age demographics
                    </p>
                    <div className="h-[300px] flex items-end gap-8 px-8">
                      {(() => {
                        // Group candidates by age
                        const ageGroups = [
                          { label: '20-30', min: 20, max: 30 },
                          { label: '31-40', min: 31, max: 40 },
                          { label: '41-50', min: 41, max: 50 },
                          { label: '51+', min: 51, max: 100 }
                        ];
                        
                        const groupData = ageGroups.map(group => {
                          const inGroup = candidates.filter(c => c.age >= group.min && c.age <= group.max);
                          const rejected = inGroup.filter(c => c.status === 'rejected').length;
                          const total = inGroup.length;
                          const rejectionRate = total > 0 ? (rejected / total) * 100 : 0;
                          return { ...group, total, rejected, rejectionRate };
                        });
                        
                        const maxRate = Math.max(...groupData.map(g => g.rejectionRate), 50);
                        
                        return (
                          <>
                            {groupData.map((group, idx) => (
                              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                <div className="relative w-full flex flex-col items-center">
                                  <div 
                                    className="w-full bg-gradient-to-t from-red-500 to-red-300 rounded-t-lg transition-all hover:scale-105 cursor-pointer shadow-lg"
                                    style={{ height: `${(group.rejectionRate / maxRate) * 200}px` }}
                                    title={`${group.rejected}/${group.total} rejected`}
                                  >
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-red-600 px-2 py-1 rounded">
                                      {group.rejectionRate.toFixed(0)}%
                                    </div>
                                  </div>
                                </div>
                                <div className="text-center mt-2">
                                  <p className="text-sm font-semibold text-gray-300">{group.label}</p>
                                  <p className="text-xs text-gray-500">{group.total} candidates</p>
                                </div>
                              </div>
                            ))}
                          </>
                        );
                      })()}
                    </div>
                    <div className="mt-8 text-center text-sm text-gray-400">
                      ⚠ Significant difference in rejection rates may indicate algorithmic bias
                    </div>
                  </div>

                  {/* Bias Score Trend */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Detected Bias Patterns</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      AI-detected bias patterns in the screening process
                    </p>
                    
                    {/* Skill-Based Bias Section */}
                    {fairnessAnalysis?.biased_skills && fairnessAnalysis.biased_skills.length > 0 && (
                      <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                          <span>⚠️</span> Skill-Based Bias Detected
                        </h4>
                        <p className="text-gray-300 text-sm mb-3">
                          The following skills show abnormally high rejection rates, suggesting keyword bias:
                        </p>
                        <div className="space-y-2">
                          {fairnessAnalysis.biased_skills.slice(0, 5).map((skill: any, idx: number) => (
                            <div key={idx} className="bg-gray-800/50 rounded p-3 flex justify-between items-center">
                              <div>
                                <span className="text-white font-semibold capitalize">{skill.skill}</span>
                                <span className="text-gray-400 text-sm ml-2">({skill.count} candidates)</span>
                              </div>
                              <div className="text-right">
                                <div className="text-red-400 font-bold">{(skill.rejection_rate * 100).toFixed(0)}% rejected</div>
                                <div className="w-32 bg-gray-700 rounded-full h-2 mt-1">
                                  <div 
                                    className="h-2 rounded-full bg-red-500"
                                    style={{ width: `${skill.rejection_rate * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 text-xs text-gray-400">
                          💡 Tip: These skills may represent valuable experience that ATS is not recognizing. Consider semantic matching.
                        </div>
                      </div>
                    )}
                    
                    {/* Age/Experience Bias Section */}
                    <div className="h-[250px] relative">
                      {/* Mock trend line - in real implementation, this would show historical data */}
                      <div className="absolute inset-0 flex items-end gap-1 px-4">
                        {[0.15, 0.22, 0.28, 0.35, 0.42, 0.38, 0.45, 0.52, 0.48, 0.55].map((score, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-full bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t hover:scale-105 transition-all"
                              style={{ height: `${score * 200}px` }}
                            />
                            {idx === 9 && (
                              <div className="absolute top-0 right-0 text-xs bg-yellow-600 text-white px-2 py-1 rounded">
                                Current: {(biasScore * 100).toFixed(0)}%
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-600" />
                      <div className="absolute bottom-0 left-4 text-xs text-gray-500">Week 1</div>
                      <div className="absolute bottom-0 right-4 text-xs text-gray-500">Week 10</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Clustering Tab */}
              {activeTab === "clustering" && (
                <div className="space-y-6">
                  {/* Experience-based clustering */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Candidate Distribution by Experience</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Bubble size = number of candidates, Color = rejection rate
                    </p>
                    <div className="h-[350px] flex items-center justify-center gap-12">
                      {(() => {
                        const expGroups = [
                          { label: '0-3y', min: 0, max: 3 },
                          { label: '4-7y', min: 4, max: 7 },
                          { label: '8-12y', min: 8, max: 12 },
                          { label: '13+y', min: 13, max: 100 }
                        ];
                        
                        const groupData = expGroups.map(group => {
                          const inGroup = candidates.filter(c => c.experience >= group.min && c.experience <= group.max);
                          const rejected = inGroup.filter(c => c.status === 'rejected').length;
                          const total = inGroup.length;
                          const rejectionRate = total > 0 ? (rejected / total) : 0;
                          return { ...group, total, rejected, rejectionRate };
                        });
                        
                        const maxSize = Math.max(...groupData.map(g => g.total), 1);
                        
                        return groupData.map((group, idx) => {
                          const size = 80 + (group.total / maxSize) * 120; // 80-200px
                          const colorIntensity = Math.floor(group.rejectionRate * 100);
                          const bgColor = group.rejectionRate > 0.5 ? `bg-red-${Math.min(9, Math.max(4, Math.floor(colorIntensity / 20) + 4))}00` : 
                                          group.rejectionRate > 0.3 ? 'bg-orange-500' : 'bg-green-500';
                          
                          return (
                            <div key={idx} className="flex flex-col items-center gap-3 group cursor-pointer">
                              <div 
                                className={`rounded-full ${bgColor} shadow-2xl flex flex-col items-center justify-center transition-all hover:scale-110`}
                                style={{ width: `${size}px`, height: `${size}px` }}
                              >
                                <p className="text-white font-bold text-2xl">{group.total}</p>
                                <p className="text-white/80 text-xs">candidates</p>
                                <p className="text-white font-semibold text-sm mt-1">{(group.rejectionRate * 100).toFixed(0)}%</p>
                                <p className="text-white/70 text-xs">rejected</p>
                              </div>
                              <p className="text-gray-300 font-semibold">{group.label}</p>
                              <div className="hidden group-hover:block absolute bg-gray-900 border-2 border-gray-600 rounded-lg p-3 text-xs z-20 mt-2 shadow-xl">
                                <p className="text-white font-bold mb-1">{group.label} Experience</p>
                                <p className="text-gray-300">Total: {group.total}</p>
                                <p className="text-red-400">Rejected: {group.rejected}</p>
                                <p className="text-green-400">Accepted: {group.total - group.rejected}</p>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Skill-based clustering */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Skill Clusters & Bias Detection</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Groups with disproportionate rejection rates indicate potential bias
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                      {/* High Experience Cluster */}
                      <div className="bg-gray-800 border-2 border-red-500/30 rounded-lg p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-red-400 text-lg">⚠ High Experience (10+ years)</h4>
                          <span className="text-xs px-3 py-1 bg-red-900/30 text-red-300 rounded-full font-semibold">
                            Bias Alert
                          </span>
                        </div>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Rejection Rate</span>
                            <span className="text-red-400 font-bold">
                              {((rejectedCandidates.filter(c => c.experience >= 10).length / Math.max(1, candidates.filter(c => c.experience >= 10).length)) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-3">
                            <div 
                              className="h-3 rounded-full bg-gradient-to-r from-red-600 to-red-400"
                              style={{ width: `${(rejectedCandidates.filter(c => c.experience >= 10).length / Math.max(1, candidates.filter(c => c.experience >= 10).length)) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="space-y-2 mb-3">
                          {candidates.filter(c => c.experience >= 10).slice(0, 4).map((candidate, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-gray-900 p-2 rounded">
                              <span className="text-sm text-gray-300 truncate">{candidate.name}</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                candidate.status === 'rejected' 
                                  ? 'bg-red-900/30 text-red-400' 
                                  : 'bg-green-900/30 text-green-400'
                              }`}>
                                {candidate.status === 'rejected' ? 'Rejected' : 'Accepted'}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          Total in cluster: {candidates.filter(c => c.experience >= 10).length}
                        </p>
                      </div>

                      {/* Mid Experience Cluster */}
                      <div className="bg-gray-800 border-2 border-green-500/30 rounded-lg p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-green-400 text-lg">✓ Mid Experience (4-9 years)</h4>
                          <span className="text-xs px-3 py-1 bg-green-900/30 text-green-300 rounded-full font-semibold">
                            Fair
                          </span>
                        </div>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Rejection Rate</span>
                            <span className="text-green-400 font-bold">
                              {((rejectedCandidates.filter(c => c.experience >= 4 && c.experience < 10).length / Math.max(1, candidates.filter(c => c.experience >= 4 && c.experience < 10).length)) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-3">
                            <div 
                              className="h-3 rounded-full bg-gradient-to-r from-green-600 to-green-400"
                              style={{ width: `${(rejectedCandidates.filter(c => c.experience >= 4 && c.experience < 10).length / Math.max(1, candidates.filter(c => c.experience >= 4 && c.experience < 10).length)) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="space-y-2 mb-3">
                          {candidates.filter(c => c.experience >= 4 && c.experience < 10).slice(0, 4).map((candidate, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-gray-900 p-2 rounded">
                              <span className="text-sm text-gray-300 truncate">{candidate.name}</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                candidate.status === 'rejected' 
                                  ? 'bg-red-900/30 text-red-400' 
                                  : 'bg-green-900/30 text-green-400'
                              }`}>
                                {candidate.status === 'rejected' ? 'Rejected' : 'Accepted'}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          Total in cluster: {candidates.filter(c => c.experience >= 4 && c.experience < 10).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Breakdown Tab */}
              {activeTab === "breakdown" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Rejected Candidates */}
                    <div>
                      <h3 className="text-xl font-bold text-red-400 mb-4">❌ Rejected Candidates</h3>
                      <div className="space-y-3">
                        {rejectedCandidates.length > 0 ? rejectedCandidates.map((candidate, idx) => (
                          <div key={idx} className="bg-gradient-to-r from-red-900/20 to-transparent border border-red-900/50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-white">{candidate.name}</h4>
                                <p className="text-xs text-gray-400">Missing keywords</p>
                              </div>
                              <button className="px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-white text-sm font-semibold">
                                🚨 RESCUE
                              </button>
                            </div>
                            <div className="text-xs text-gray-500">
                              <p>ATS: {candidate.ats_score} | Sem: {(candidate.semantic_score * 100).toFixed(0)} | Code: {Math.floor(candidate.semantic_score * 90)} | {candidate.experience}y exp</p>
                            </div>
                          </div>
                        )) : (
                          <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
                            No rejected candidates found
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Accepted Candidates */}
                    <div>
                      <h3 className="text-xl font-bold text-green-400 mb-4">✅ Accepted Candidates</h3>
                      <div className="space-y-3">
                        {acceptedCandidates.length > 0 ? acceptedCandidates.map((candidate, idx) => (
                          <div key={idx} className="bg-gradient-to-r from-green-900/20 to-transparent border border-green-900/50 rounded-lg p-4">
                            <div className="mb-2">
                              <h4 className="font-semibold text-white">{candidate.name}</h4>
                            </div>
                            <div className="text-xs text-gray-500">
                              <p>ATS: {candidate.ats_score} | Sem: {(candidate.semantic_score * 100).toFixed(0)} | Code: {Math.floor(candidate.semantic_score * 90)} | {candidate.experience}y exp</p>
                            </div>
                          </div>
                        )) : (
                          <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
                            No accepted candidates found
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Summary Statistics</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-gray-800 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Total Analyzed</p>
                        <p className="text-2xl font-bold text-white">{candidates.length}</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Rejected</p>
                        <p className="text-2xl font-bold text-red-400">{rejectedCandidates.length}</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Accepted</p>
                        <p className="text-2xl font-bold text-green-400">{acceptedCandidates.length}</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Rejection Rate</p>
                        <p className="text-2xl font-bold text-yellow-400">
                          {candidates.length > 0 ? ((rejectedCandidates.length / candidates.length) * 100).toFixed(0) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
