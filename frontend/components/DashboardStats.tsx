"""
Dashboard component using new hooks
"""
'use client';

import { useDashboard, useAnalysisStatistics } from '@/hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileCheck, AlertTriangle, TrendingUp } from 'lucide-react';

export default function DashboardStats() {
    const { data: dashboard, isLoading: dashboardLoading } = useDashboard();
    const { data: analysisStats, isLoading: statsLoading } = useAnalysisStatistics();

    if (dashboardLoading || statsLoading) {
        return <div>Loading dashboard...</div>;
    }

    const overview = dashboard?.overview || {};
    const metrics = dashboard?.analysis_metrics || {};

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total CVs */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total CVs</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{overview.total_cvs || 0}</div>
                    <p className="text-xs text-muted-foreground">
                        {overview.pending || 0} pending analysis
                    </p>
                </CardContent>
            </Card>

            {/* Analyzed */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Analyzed</CardTitle>
                    <FileCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{overview.analyzed || 0}</div>
                    <p className="text-xs text-muted-foreground">
                        {overview.analysis_rate?.toFixed(1) || 0}% completion rate
                    </p>
                </CardContent>
            </Card>

            {/* Rescued */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rescued</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.rescued_count || 0}</div>
                    <p className="text-xs text-muted-foreground">
                        Saved from ATS rejection
                    </p>
                </CardContent>
            </Card>

            {/* Average Score */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg ATS Score</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {metrics.average_ats_score?.toFixed(1) || 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Semantic: {(metrics.average_semantic_score * 100)?.toFixed(1) || 0}%
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
