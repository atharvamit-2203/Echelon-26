"""
Updated Bias Analysis with loading states
"""
'use client';

import { useBiasAnalysis } from '@/hooks/useQueries';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function BiasAnalysis() {
    const { data, isLoading, refetch } = useBiasAnalysis();
    const { latestNotification } = useWebSocket();

    // Auto-refetch when analysis completes
    if (latestNotification?.type === 'analysis_complete') {
        setTimeout(() => refetch(), 1000);
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-2" />
                        <p className="text-sm text-muted-foreground">Loading bias analysis...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data || Object.keys(data?.by_gender || {}).length === 0) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <AlertTriangle className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                        <p className="text-sm text-muted-foreground">
                            No bias analysis data available yet.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Run an analysis first to see bias metrics.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Prepare data for gender chart
    const genderData = Object.entries(data?.by_gender || {}).map(([gender, stats]: [string, any]) => ({
        gender,
        count: stats.count,
        avgScore: stats.avg_ats_score,
        shortlistRate: (stats.shortlist_rate * 100).toFixed(1)
    }));

    // Prepare data for age group chart
    const ageData = Object.entries(data?.by_age_group || {}).map(([group, stats]: [string, any]) => ({
        ageGroup: group,
        count: stats.count,
        shortlistRate: (stats.shortlist_rate * 100).toFixed(1)
    }));

    return (
        <div className="space-y-6">
            {/* Bias Alert Banner */}
            {latestNotification?.type === 'bias_alert' && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-yellow-900">Recent Bias Alert</h4>
                                <p className="text-sm text-yellow-800 mt-1">
                                    {latestNotification.data.message}
                                </p>
                                <p className="text-xs text-yellow-700 mt-1">
                                    Impact: {latestNotification.data.impact} |
                                    Type: {latestNotification.data.bias_type}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Gender Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle>Gender Distribution & Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={genderData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="gender" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" name="Total Candidates" />
                            <Bar dataKey="shortlistRate" fill="#82ca9d" name="Shortlist Rate (%)" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Age Group Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle>Age Group Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={ageData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="ageGroup" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" name="Total Candidates" />
                            <Bar dataKey="shortlistRate" fill="#ffc658" name="Shortlist Rate (%)" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
