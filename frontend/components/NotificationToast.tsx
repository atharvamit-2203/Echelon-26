'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { X, AlertTriangle, CheckCircle, Info, TrendingUp } from 'lucide-react';

export default function NotificationToast() {
    const { latestNotification, isConnected } = useWebSocket();
    const [visible, setVisible] = useState(false);
    const [notification, setNotification] = useState<any>(null);

    useEffect(() => {
        if (latestNotification) {
            setNotification(latestNotification);
            setVisible(true);

            // Auto-hide after 5 seconds
            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [latestNotification]);

    if (!visible || !notification) return null;

    const getIcon = () => {
        switch (notification.type) {
            case 'bias_alert':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'candidate_rescued':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'analysis_complete':
                return <CheckCircle className="h-5 w-5 text-blue-500" />;
            case 'analysis_progress':
                return <TrendingUp className="h-5 w-5 text-blue-500" />;
            default:
                return <Info className="h-5 w-5 text-gray-500" />;
        }
    };

    const getBackgroundColor = () => {
        switch (notification.type) {
            case 'bias_alert':
                return 'bg-yellow-50 border-yellow-200';
            case 'candidate_rescued':
                return 'bg-green-50 border-green-200';
            case 'analysis_complete':
                return 'bg-blue-50 border-blue-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className={`max-w-md rounded-lg border-2 shadow-lg p-4 ${getBackgroundColor()}`}>
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                        {getIcon()}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                            {notification.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </p>
                        <p className="mt-1 text-sm text-gray-700">
                            {notification.data?.message || 'No message available'}
                        </p>

                        {notification.type === 'analysis_progress' && notification.data && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                    <span>{notification.data.current || 0} / {notification.data.total || 0}</span>
                                    <span>{notification.data.percentage || 0}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${notification.data.percentage || 0}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setVisible(false)}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {!isConnected && (
                    <div className="mt-2 text-xs text-red-600">
                        ⚠️ Disconnected - Reconnecting...
                    </div>
                )}
            </div>
        </div>
    );
}
