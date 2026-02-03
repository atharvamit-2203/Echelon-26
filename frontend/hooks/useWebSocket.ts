'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface Notification {
    type: string;
    timestamp: string;
    severity?: string;
    data: any;
}

export function useWebSocket(url: string = 'ws://localhost:8000/api/v1/ws') {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

    const connect = useCallback(() => {
        try {
            const ws = new WebSocket(url);

            ws.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);

                // Send heartbeat every 30 seconds
                const heartbeat = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(new Date().toISOString());
                    }
                }, 30000);

                ws.onclose = () => {
                    clearInterval(heartbeat);
                };
            };

            ws.onmessage = (event) => {
                try {
                    const notification: Notification = JSON.parse(event.data);

                    // Ignore pong messages
                    if (notification.type === 'pong') return;

                    setNotifications(prev => [...prev, notification]);
                    setLatestNotification(notification);

                    // Show browser notification for important alerts
                    if (notification.type === 'bias_alert' || notification.type === 'candidate_rescued') {
                        if ('Notification' in window && Notification.permission === 'granted') {
                            new Notification('Fair-Hire Alert', {
                                body: notification.data.message,
                                icon: '/favicon.ico'
                            });
                        }
                    }
                } catch (error) {
                    console.error('Failed to parse notification:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            ws.onclose = () => {
                console.log('WebSocket disconnected');
                setIsConnected(false);

                // Attempt to reconnect after 3 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log('Attempting to reconnect...');
                    connect();
                }, 3000);
            };

            wsRef.current = ws;
        } catch (error) {
            console.error('Failed to connect to WebSocket:', error);
        }
    }, [url]);

    useEffect(() => {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [connect]);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
        setLatestNotification(null);
    }, []);

    return {
        notifications,
        latestNotification,
        isConnected,
        clearNotifications
    };
}
