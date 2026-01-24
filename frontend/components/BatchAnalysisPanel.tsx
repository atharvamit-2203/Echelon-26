'use client';

import { useState } from 'react';
import { Play, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function BatchAnalysisPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [results, setResults] = useState<any>(null);

  const startBatchAnalysis = async () => {
    setIsRunning(true);
    setStatus('processing');
    
    try {
      const response = await fetch('http://localhost:8000/api/start-batch-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
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

  const pollAnalysisStatus = async () => {
    const maxPolls = 30; // 30 seconds max
    let polls = 0;
    
    const poll = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/analysis-status');
        const data = await response.json();
        
        if (data.status === 'completed') {
          setStatus('completed');
          setResults(data);
          setIsRunning(false);
          return;
        }
        
        polls++;
        if (polls < maxPolls) {
          setTimeout(poll, 1000); // Poll every second
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

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default:
        return <Play className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'processing':
        return 'Running ATS Analysis...';
      case 'completed':
        return 'Analysis Complete';
      case 'error':
        return 'Analysis Failed';
      default:
        return 'Ready to Start';
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-medium text-white">{getStatusText()}</h3>
            <p className="text-sm text-gray-400">
              {status === 'processing' && 'Analyzing CVs, detecting bias, and rescuing candidates...'}
              {status === 'completed' && 'All processes completed successfully'}
              {status === 'idle' && 'Click to start comprehensive ATS analysis'}
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
          {isRunning ? 'Processing...' : 'Start Batch Analysis'}
        </button>
      </div>

      {status === 'processing' && (
        <div className="mt-4 space-y-2">
          <div className="text-sm font-medium text-gray-300">Analysis Progress:</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>ATS Screening Simulation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>Bias Pattern Detection</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Semantic Analysis & Candidate Rescue</span>
            </div>
          </div>
        </div>
      )}

      {status === 'completed' && results && (
        <div className="mt-4 bg-green-900/20 border border-green-700/50 rounded-lg p-3">
          <h4 className="font-medium text-green-400 mb-2">Analysis Results</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-gray-300">
              <span className="text-gray-500">Active Alerts:</span>
              <span className="ml-2 font-medium text-white">{results.active_alerts}</span>
            </div>
            <div className="text-gray-300">
              <span className="text-gray-500">Last Updated:</span>
              <span className="ml-2 font-medium text-white">
                {results.last_updated ? new Date(results.last_updated.seconds * 1000).toLocaleTimeString() : 'Just now'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}