"""
Extended React Query hooks for new services
"""
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analysisApi, reportsApi } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';

// Analysis Hooks
export function useAnalyzeSingle() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ candidateId, jobDescription, notify }: {
            candidateId: string;
            jobDescription: string;
            notify?: boolean;
        }) => analysisApi.analyzeSingle(candidateId, jobDescription, notify),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cvs'] });
            queryClient.invalidateQueries({ queryKey: ['analysis-statistics'] });
        },
    });
}

export function useAnalyzeBatch() {
    const queryClient = useQueryClient();
    const { setAnalysisRunning } = useAppStore();

    return useMutation({
        mutationFn: ({ jobDescription, candidateIds, asyncMode }: {
            jobDescription: string;
            candidateIds?: string[];
            asyncMode?: boolean;
        }) => analysisApi.analyzeBatch(jobDescription, candidateIds, asyncMode),
        onSuccess: () => {
            setAnalysisRunning(true);
            queryClient.invalidateQueries({ queryKey: ['cvs'] });
        },
    });
}

export function useAnalysisStatistics() {
    return useQuery({
        queryKey: ['analysis-statistics'],
        queryFn: () => analysisApi.getStatistics(),
        staleTime: 60000, // 1 minute
    });
}

export function useTaskStatus(taskId: string | null) {
    return useQuery({
        queryKey: ['task-status', taskId],
        queryFn: () => analysisApi.getTaskStatus(taskId!),
        enabled: !!taskId,
        refetchInterval: 2000, // Poll every 2 seconds
    });
}

// Reports Hooks
export function useDashboard() {
    return useQuery({
        queryKey: ['dashboard'],
        queryFn: () => reportsApi.getDashboard(),
        staleTime: 30000, // 30 seconds
        refetchInterval: 60000, // Refetch every minute
    });
}

export function useBiasAnalysis() {
    return useQuery({
        queryKey: ['bias-analysis'],
        queryFn: () => reportsApi.getBiasAnalysis(),
        staleTime: 300000, // 5 minutes
    });
}

export function useRescuedCandidates(limit: number = 100) {
    return useQuery({
        queryKey: ['rescued-candidates', limit],
        queryFn: () => reportsApi.getRescuedCandidates(limit),
        staleTime: 60000, // 1 minute
    });
}

export function usePerformanceMetrics(days: number = 7) {
    return useQuery({
        queryKey: ['performance-metrics', days],
        queryFn: () => reportsApi.getPerformanceMetrics(days),
        staleTime: 300000, // 5 minutes
    });
}
