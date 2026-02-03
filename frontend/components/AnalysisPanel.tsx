"""
Updated Analysis Panel with WebSocket integration
"""
'use client';

import { useState } from 'react';
import { useAnalyzeBatch, useTaskStatus } from '@/hooks/useQueries';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Play, Loader2, CheckCircle } from 'lucide-react';

export default function AnalysisPanel() {
    const [jobDescription, setJobDescription] = useState('');
    const [taskId, setTaskId] = useState<string | null>(null);
    const { latestNotification } = useWebSocket();

    const analyzeMutation = useAnalyzeBatch();
    const { data: taskStatus } = useTaskStatus(taskId);

    const handleAnalyze = async () => {
        if (!jobDescription.trim()) {
            alert('Please enter a job description');
            return;
        }

        try {
            const result = await analyzeMutation.mutateAsync({
                jobDescription,
                asyncMode: true
            });

            if (result.task_id) {
                setTaskId(result.task_id);
            }
        } catch (error) {
            console.error('Analysis failed:', error);
        }
    };

    const isAnalyzing = analyzeMutation.isPending ||
        taskStatus?.status === 'PENDING' ||
        taskStatus?.status === 'STARTED' ||
        (latestNotification?.type === 'analysis_progress');

    const analysisComplete = latestNotification?.type === 'analysis_complete';

    return (
        <Card>
            <CardHeader>
                <CardTitle>Batch Analysis</CardTitle>
                <CardDescription>
                    Analyze all CVs against a job description with real-time updates
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    placeholder="Enter job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={6}
                    disabled={isAnalyzing}
                />

                <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !jobDescription.trim()}
                    className="w-full"
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : analysisComplete ? (
                        <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Analysis Complete
                        </>
                    ) : (
                        <>
                            <Play className="mr-2 h-4 w-4" />
                            Start Analysis
                        </>
                    )}
                </Button>

                {/* Real-time progress from WebSocket */}
                {latestNotification?.type === 'analysis_progress' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="font-medium text-blue-900">
                                Progress: {latestNotification.data.current} / {latestNotification.data.total}
                            </span>
                            <span className="text-blue-700">
                                {latestNotification.data.percentage}%
                            </span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2.5">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${latestNotification.data.percentage}%` }}
                            />
                        </div>
                        <p className="text-xs text-blue-700 mt-2">
                            Rescued: {latestNotification.data.rescued_count} candidates
                        </p>
                    </div>
                )}

                {/* Analysis complete summary */}
                {latestNotification?.type === 'analysis_complete' && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-2">✅ Analysis Complete!</h4>
                        <div className="space-y-1 text-sm text-green-800">
                            <p>Total Analyzed: {latestNotification.data.total_analyzed}</p>
                            <p>Candidates Rescued: {latestNotification.data.rescued_count}</p>
                            <p>Average ATS Score: {latestNotification.data.average_ats_score?.toFixed(1)}%</p>
                        </div>
                    </div>
                )}

                {/* Bias alerts */}
                {latestNotification?.type === 'bias_alert' && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                            ⚠️ Bias Detected
                        </h4>
                        <p className="text-sm text-yellow-800">
                            {latestNotification.data.message}
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                            Check the Bias Analysis tab for details
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
