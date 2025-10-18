'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 
      className={cn(
        'animate-spin text-muted-foreground',
        sizeClasses[size],
        className
      )} 
    />
  );
}

interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function LoadingButton({ 
  loading, 
  children, 
  className, 
  disabled, 
  onClick 
}: LoadingButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors',
        'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
}

interface LoadingCardProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  skeleton?: React.ReactNode;
}

export function LoadingCard({ 
  loading, 
  children, 
  className, 
  skeleton 
}: LoadingCardProps) {
  if (loading) {
    return (
      <div className={cn('p-6', className)}>
        {skeleton || <LoadingSkeleton />}
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
    </div>
  );
}

interface LoadingTableProps {
  loading: boolean;
  children: React.ReactNode;
  rows?: number;
  columns?: number;
}

export function LoadingTable({ 
  loading, 
  children, 
  rows = 5, 
  columns = 4 
}: LoadingTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-4">
            {Array.from({ length: columns }).map((_, j) => (
              <div
                key={j}
                className="h-4 bg-gray-200 rounded animate-pulse flex-1"
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return <>{children}</>;
}

interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ 
  loading, 
  children, 
  message = 'Loading...', 
  className 
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface LoadingPageProps {
  message?: string;
  className?: string;
}

export function LoadingPage({ 
  message = 'Loading...', 
  className 
}: LoadingPageProps) {
  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center bg-gray-50',
      className
    )}>
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900">{message}</p>
      </div>
    </div>
  );
}

interface LoadingInlineProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
}

export function LoadingInline({ 
  loading, 
  children, 
  className 
}: LoadingInlineProps) {
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </div>
  );
}

interface LoadingRefreshProps {
  loading: boolean;
  onRefresh: () => void;
  className?: string;
}

export function LoadingRefresh({ 
  loading, 
  onRefresh, 
  className 
}: LoadingRefreshProps) {
  return (
    <button
      onClick={onRefresh}
      disabled={loading}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md',
        'bg-white border border-gray-300 hover:bg-gray-50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
      {loading ? 'Refreshing...' : 'Refresh'}
    </button>
  );
}

// Hook for managing loading states
export function useLoadingState(initialState = false) {
  const [loading, setLoading] = React.useState(initialState);

  const startLoading = React.useCallback(() => {
    setLoading(true);
  }, []);

  const stopLoading = React.useCallback(() => {
    setLoading(false);
  }, []);

  const withLoading = React.useCallback(async <T>(
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    try {
      startLoading();
      return await asyncFn();
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    loading,
    startLoading,
    stopLoading,
    withLoading
  };
}
