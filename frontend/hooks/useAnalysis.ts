import { useState, useCallback } from 'react';
import api from '@/lib/api';

export function useAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [results, setResults] = useState<any>(null);

  const startAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisStatus('running');
    
    try {
      const response = await api.startBatchAnalysis();
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Poll for status updates
      const pollInterval = setInterval(async () => {
        try {
          const status = await api.getAnalysisStatus();
          
          if (status.status === 'completed') {
            clearInterval(pollInterval);
            setAnalysisStatus('completed');
            setResults(status);
            setIsAnalyzing(false);
          } else if (status.error) {
            clearInterval(pollInterval);
            setAnalysisStatus('error');
            setIsAnalyzing(false);
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 2000);

      // Timeout after 60 seconds
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isAnalyzing) {
          setAnalysisStatus('completed');
          setIsAnalyzing(false);
        }
      }, 60000);

    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisStatus('error');
      setIsAnalyzing(false);
    }
  }, [isAnalyzing]);

  const reset = useCallback(() => {
    setIsAnalyzing(false);
    setAnalysisStatus('idle');
    setResults(null);
  }, []);

  return {
    isAnalyzing,
    analysisStatus,
    results,
    startAnalysis,
    reset
  };
}
