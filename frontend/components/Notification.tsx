'use client';

import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NotificationProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  onClick?: () => void;
}

export default function Notification({ type, title, message, duration = 5000, onClose, onClick }: NotificationProps) {
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
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <AlertTriangle className="w-5 h-5 text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />
  };

  const bgColors = {
    success: 'bg-green-900/30 border-green-700',
    error: 'bg-red-900/30 border-red-700',
    warning: 'bg-yellow-900/30 border-yellow-700',
    info: 'bg-blue-900/30 border-blue-700'
  };

  const textColors = {
    success: 'text-green-300',
    error: 'text-red-300',
    warning: 'text-yellow-300',
    info: 'text-blue-300'
  };

  return (
    <div 
      onClick={onClick}
      className={`fixed top-20 right-4 z-40 max-w-md w-full border rounded-lg shadow-2xl p-4 ${bgColors[type]} ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''} animate-slide-in`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="flex-1">
          {title && <h4 className={`font-semibold ${textColors[type]}`}>{title}</h4>}
          <p className={`text-sm ${title ? 'mt-1' : ''} ${textColors[type]}`}>{message}</p>
          {onClick && (
            <p className="text-xs mt-2 text-gray-400">Click to view details →</p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
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
