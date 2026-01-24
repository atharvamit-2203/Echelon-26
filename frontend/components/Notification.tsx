'use client';

import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NotificationProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

export default function Notification({ type, title, message, duration = 5000, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertTriangle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md w-full border rounded-lg shadow-lg p-4 ${bgColors[type]} animate-slide-in`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="flex-1">
          <h4 className={`font-semibold ${textColors[type]}`}>{title}</h4>
          <p className={`text-sm mt-1 ${textColors[type]}`}>{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className={`flex-shrink-0 ${textColors[type]} hover:opacity-70`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Hook to manage notifications
export function useNotification() {
  const [notification, setNotification] = useState<NotificationProps | null>(null);

  const showNotification = (props: Omit<NotificationProps, 'onClose'>) => {
    setNotification({
      ...props,
      onClose: () => setNotification(null)
    });
  };

  const NotificationComponent = notification ? <Notification {...notification} /> : null;

  return { showNotification, NotificationComponent };
}
