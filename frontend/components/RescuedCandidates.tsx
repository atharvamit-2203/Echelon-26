"""
Rescued candidates list component
"""
'use client';

import { useRescuedCandidates } from '@/hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

export default function RescuedCandidates() {
    const { data, isLoading } = useRescuedCandidates(50);

    if (isLoading) {
        return <div>Loading rescued candidates...</div>;
    }

    const candidates = data?.candidates || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    Rescued Candidates ({data?.total_rescued || 0})
                </CardTitle>
            </CardHeader>
            <CardContent>
                {candidates.length === 0 ? (
                    <p className="text-muted-foreground">No rescued candidates yet</p>
                ) : (
                    <div className="space-y-4">
                        {candidates.map((candidate: any) => (
                            <div
                                key={candidate.candidateId}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex-1">
                                    <h3 className="font-semibold">{candidate.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        ID: {candidate.candidateId}
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                        {candidate.skills?.slice(0, 3).map((skill: string) => (
                                            <Badge key={skill} variant="secondary">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">ATS:</span>{' '}
                                        <span className="font-semibold">{candidate.atsScore}%</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Semantic:</span>{' '}
                                        <span className="font-semibold">
                                            {(candidate.semanticScore * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
