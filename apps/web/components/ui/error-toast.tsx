'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastProvider, ToastViewport } from '@/components/ui/toast';
import { AlertTriangle, X, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, toast.duration || 5000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
}

function ToastComponent({ toast }: { toast: ToastData }) {
  const { removeToast } = useToast();

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <Toast
      className={cn(
        'border p-4 shadow-lg rounded-lg max-w-sm w-full',
        getBackgroundColor()
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn('font-medium text-sm', getTextColor())}>
            {toast.title}
          </div>
          {toast.description && (
            <div className={cn('text-sm mt-1', getTextColor())}>
              {toast.description}
            </div>
          )}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className={cn(
                'text-sm font-medium mt-2 hover:underline',
                getTextColor()
              )}
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => removeToast(toast.id)}
          className={cn(
            'flex-shrink-0 p-1 rounded-full hover:bg-black/10',
            getTextColor()
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Toast>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <>
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} />
      ))}
    </>
  );
}

// Convenience functions
export function useErrorToast() {
  const { addToast } = useToast();

  return {
    showError: (title: string, description?: string, action?: { label: string; onClick: () => void }) => {
      addToast({
        type: 'error',
        title,
        description,
        action,
        duration: 7000
      });
    }
  };
}

export function useSuccessToast() {
  const { addToast } = useToast();

  return {
    showSuccess: (title: string, description?: string) => {
      addToast({
        type: 'success',
        title,
        description,
        duration: 3000
      });
    }
  };
}

export function useWarningToast() {
  const { addToast } = useToast();

  return {
    showWarning: (title: string, description?: string) => {
      addToast({
        type: 'warning',
        title,
        description,
        duration: 5000
      });
    }
  };
}

export function useInfoToast() {
  const { addToast } = useToast();

  return {
    showInfo: (title: string, description?: string) => {
      addToast({
        type: 'info',
        title,
        description,
        duration: 4000
      });
    }
  };
}
