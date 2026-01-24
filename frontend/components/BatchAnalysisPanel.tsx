'use client';

import { useState, useEffect } from 'react';
import { Play, Clock, CheckCircle, AlertTriangle, Shield, Search, Users } from 'lucide-react';

export default function BatchAnalysisPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [results, setResults] = useState<any>(null);
  const [rescueAlert, setRescueAlert] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const analysisSteps = [
    { icon: Search, label: 'ATS Screening Simulation', description: 'Simulating broken keyword filters' },
    { icon: Shield, label: 'Bias Smoke Detector', description: 'Detecting discrimination patterns' },
    { icon: Users, label: 'Semantic Rescuer', description: 'Finding qualified rejected candidates' },
    { icon: AlertTriangle, label: 'Recruiter Alert', description: 'Generating rescue notifications' }
  ];

  const startBatchAnalysis = async () => {
    setIsRunning(true);
    setStatus('processing');
    setCurrentStep(0);
    
    try {
      const response = await fetch('http://localhost:8000/api/start-batch-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Simulate step progression
        simulateStepProgression();
        // Poll for status updates
        pollAnalysisStatus();
      } else {
        setStatus('error');
        setIsRunning(false);
      }
    } catch (error) {
      console.error('Error starting batch analysis:', error);
      setStatus('error');
      setIsRunning(false);
    }
  };

  const simulateStepProgression = () => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= analysisSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  const pollAnalysisStatus = async () => {
    const maxPolls = 30;
    let polls = 0;
    
    const poll = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/analysis-status');
        const data = await response.json();
        
        if (data.status === 'completed') {
          setStatus('completed');
          setResults(data);
          setIsRunning(false);
          
          // Check for rescue alerts
          fetchRescueAlerts();
          return;
        }
        
        polls++;
        if (polls < maxPolls) {
          setTimeout(poll, 1000);
        } else {
          setStatus('completed');
          setIsRunning(false);
        }
      } catch (error) {
        console.error('Error polling status:', error);
        setStatus('error');
        setIsRunning(false);
      }
    };
    
    poll();
  };

  const fetchRescueAlerts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/rescue-alerts');
      const data = await response.json();
      if (data.rescue_alerts && data.rescue_alerts.length > 0) {
        setRescueAlert(data.rescue_alerts[0]);
      }
    } catch (error) {
      console.error('Error fetching rescue alerts:', error);
    }
  };

  const rescueCandidate = async (candidateId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/rescue-candidate/${candidateId}`, {
        method: 'POST'
      });
      if (response.ok) {
        // Refresh alerts
        fetchRescueAlerts();
      }
    } catch (error) {
      console.error('Error rescuing candidate:', error);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default:
        return <Shield className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'processing':
        return 'Fair-Hire Sentinel Active';
      case 'completed':
        return 'Analysis Complete - Candidates Rescued!';
      case 'error':
        return 'Analysis Failed';
      default:
        return 'Fair-Hire Sentinel Ready';
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Analysis Panel */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-medium text-white">{getStatusText()}</h3>
              <p className="text-sm text-gray-400">
                {status === 'processing' && 'Solving the "AI Rejected a Genius" problem...'}
                {status === 'completed' && 'Bias detected and qualified candidates rescued from trash'}
                {status === 'idle' && 'AI-powered safety layer for your ATS system'}
                {status === 'error' && 'Something went wrong. Please try again.'}
              </p>
            </div>
          </div>
          
          <button
            onClick={startBatchAnalysis}
            disabled={isRunning}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isRunning
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-700 text-white'
            }`}
          >
            {isRunning ? 'Analyzing...' : 'Start Fair-Hire Sentinel'}
          </button>
        </div>

        {status === 'processing' && (
          <div className="mt-4 space-y-3">
            <div className="text-sm font-medium text-gray-300">Fair-Hire Sentinel Components:</div>
            <div className="space-y-2">
              {analysisSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div key={index} className={`flex items-center gap-3 p-2 rounded ${
                    isActive ? 'bg-blue-900/30 border border-blue-700/50' : 'bg-gray-800/50'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      isCompleted ? 'text-green-400' : isActive ? 'text-blue-400 animate-pulse' : 'text-gray-500'
                    }`} />
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${
                        isActive ? 'text-white' : 'text-gray-400'
                      }`}>{step.label}</div>
                      <div className="text-xs text-gray-500">{step.description}</div>
                    </div>
                    {isCompleted && <CheckCircle className="w-4 h-4 text-green-400" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {status === 'completed' && results && (
          <div className="mt-4 bg-green-900/20 border border-green-700/50 rounded-lg p-3">
            <h4 className="font-medium text-green-400 mb-2">✅ Fair-Hire Sentinel Results</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-gray-300">
                <span className="text-gray-500">Bias Alerts:</span>
                <span className="ml-2 font-medium text-white">{results.active_alerts}</span>
              </div>
              <div className="text-gray-300">
                <span className="text-gray-500">Last Scan:</span>
                <span className="ml-2 font-medium text-white">
                  {results.last_updated ? new Date(results.last_updated.seconds * 1000).toLocaleTimeString() : 'Just now'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rescue Alert Panel */}
      {rescueAlert && (
        <div className="bg-red-900/20 border-2 border-red-500 rounded-lg p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 mt-1 animate-bounce" />
            <div className="flex-1">
              <h3 className="font-bold text-red-400 text-lg">{rescueAlert.title}</h3>
              <p className="text-red-300 mt-1">{rescueAlert.description}</p>
              
              {rescueAlert.candidates && rescueAlert.candidates.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-sm font-medium text-red-300">Rescued Candidates:</div>
                  {rescueAlert.candidates.map((candidate: any, index: number) => (
                    <div key={index} className="bg-red-900/30 rounded p-2 border border-red-700/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">{candidate.name}</div>
                          <div className="text-sm text-red-300">
                            {Math.round(candidate.semantic_score * 100)}% skill match - {candidate.rescue_reason}
                          </div>
                          <div className="text-xs text-gray-400">Originally rejected: {candidate.original_rejection}</div>
                        </div>
                        <button
                          onClick={() => rescueCandidate(candidate.candidateId)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                        >
                          Rescue Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}