"""
Comprehensive Bias Analysis Component
"""
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info, TrendingDown, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface BiasAlert {
    type: string;
    category: string;
    severity: string;
    disparity: number;
    favored_group: string;
    disadvantaged_group: string;
    details: string;
    recommendation: string;
    affected_candidates?: number;
}

export default function ComprehensiveBiasAnalysis() {
    const [loading, setLoading] = useState(false);
    const [biasData, setBiasData] = useState<any>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const fetchBiasAnalysis = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8000/api/v1/bias/comprehensive');
            setBiasData(response.data);
        } catch (error) {
            console.error('Failed to fetch bias analysis:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-300';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
            case 'high':
                return <AlertTriangle className="h-5 w-5" />;
            case 'medium':
                return <Info className="h-5 w-5" />;
            case 'low':
                return <TrendingDown className="h-5 w-5" />;
            default:
                return <CheckCircle className="h-5 w-5" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Comprehensive Bias Analysis</CardTitle>
                            <CardDescription>
                                Analyzing bias across all parameters: Gender, Age, Location, Education, Experience, Role, Domain, Skills
                            </CardDescription>
                        </div>
                        <Button onClick={fetchBiasAnalysis} disabled={loading}>
                            {loading ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Run Analysis
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {biasData && (
                <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold">{biasData.total_biases_detected}</div>
                                <p className="text-xs text-muted-foreground">Total Biases Detected</p>
                            </CardContent>
                        </Card>

                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-red-700">{biasData.critical_biases}</div>
                                <p className="text-xs text-red-600">Critical Biases</p>
                            </CardContent>
                        </Card>

                        <Card className="border-orange-200 bg-orange-50">
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-orange-700">{biasData.high_biases}</div>
                                <p className="text-xs text-orange-600">High Severity</p>
                            </CardContent>
                        </Card>

                        <Card className="border-yellow-200 bg-yellow-50">
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-yellow-700">{biasData.medium_biases}</div>
                                <p className="text-xs text-yellow-600">Medium Severity</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Categories with Bias */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Categories with Detected Bias</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {biasData.categories_with_bias.map((category: string) => (
                                    <Badge
                                        key={category}
                                        variant="outline"
                                        className="cursor-pointer hover:bg-gray-100"
                                        onClick={() => setSelectedCategory(category)}
                                    >
                                        {category}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bias Alerts */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Detailed Bias Alerts</CardTitle>
                            <CardDescription>
                                {selectedCategory
                                    ? `Showing biases for: ${selectedCategory}`
                                    : 'Showing all detected biases (sorted by severity)'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {biasData.bias_alerts
                                    .filter((bias: BiasAlert) =>
                                        !selectedCategory || bias.category === selectedCategory
                                    )
                                    .map((bias: BiasAlert, index: number) => (
                                        <div
                                            key={index}
                                            className={`p-4 rounded-lg border-2 ${getSeverityColor(bias.severity)}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getSeverityIcon(bias.severity)}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            {bias.category}
                                                        </Badge>
                                                        <Badge
                                                            className={`text-xs ${bias.severity === 'critical' ? 'bg-red-600' :
                                                                    bias.severity === 'high' ? 'bg-orange-600' :
                                                                        bias.severity === 'medium' ? 'bg-yellow-600' :
                                                                            'bg-blue-600'
                                                                }`}
                                                        >
                                                            {bias.severity.toUpperCase()}
                                                        </Badge>
                                                    </div>

                                                    <h4 className="font-semibold mb-1">{bias.details}</h4>

                                                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                                        <div>
                                                            <span className="font-medium">Favored Group:</span> {bias.favored_group}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Disadvantaged:</span> {bias.disadvantaged_group}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Disparity:</span> {(bias.disparity * 100).toFixed(1)}%
                                                        </div>
                                                        {bias.affected_candidates && (
                                                            <div>
                                                                <span className="font-medium">Affected:</span> {bias.affected_candidates} candidates
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mt-2 p-2 bg-white/50 rounded text-sm">
                                                        <span className="font-medium">💡 Recommendation:</span> {bias.recommendation}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            {biasData.bias_alerts.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                                    <p>No biases detected! Your hiring process appears fair.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {!biasData && !loading && (
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Info className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground mb-4">
                                Click "Run Analysis" to detect biases across all parameters
                            </p>
                            <p className="text-sm text-muted-foreground">
                                This will analyze: Gender, Age, Location, Education, Experience, Role, Domain, and Skills
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
