'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Settings,
  Zap,
  Shield
} from 'lucide-react';

interface RateLimitData {
  current: number;
  limit: number;
  resetTime: number;
  windowMs: number;
  type: 'api' | 'watcher' | 'search' | 'notification';
}

interface RateLimitIndicatorProps {
  rateLimit: RateLimitData;
  onRefresh?: () => void;
  showDetails?: boolean;
  className?: string;
}

export function RateLimitIndicator({ 
  rateLimit, 
  onRefresh, 
  showDetails = false,
  className 
}: RateLimitIndicatorProps) {
  const [timeUntilReset, setTimeUntilReset] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const percentage = (rateLimit.current / rateLimit.limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  useEffect(() => {
    const updateTimeUntilReset = () => {
      const now = Date.now();
      const resetTime = rateLimit.resetTime;
      const timeLeft = Math.max(0, resetTime - now);
      setTimeUntilReset(timeLeft);
    };

    updateTimeUntilReset();
    const interval = setInterval(updateTimeUntilReset, 1000);

    return () => clearInterval(interval);
  }, [rateLimit.resetTime]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getStatusIcon = () => {
    if (isAtLimit) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    } else if (isNearLimit) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    } else {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusBadge = () => {
    if (isAtLimit) {
      return <Badge variant="destructive">At Limit</Badge>;
    } else if (isNearLimit) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Near Limit</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-100 text-green-800">Normal</Badge>;
    }
  };

  const getTypeLabel = () => {
    switch (rateLimit.type) {
      case 'api':
        return 'API Calls';
      case 'watcher':
        return 'Watcher Runs';
      case 'search':
        return 'Search Requests';
      case 'notification':
        return 'Notifications';
      default:
        return 'Requests';
    }
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-sm font-medium">
              {getTypeLabel()} Rate Limit
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          {rateLimit.current} of {rateLimit.limit} requests used
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Usage</span>
            <span className="font-medium">
              {rateLimit.current} / {rateLimit.limit}
            </span>
          </div>
          <Progress 
            value={percentage} 
            className={`h-2 ${
              isAtLimit ? 'bg-red-100' : 
              isNearLimit ? 'bg-yellow-100' : 
              'bg-green-100'
            }`}
          />
        </div>

        {timeUntilReset > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Resets in {formatTime(timeUntilReset)}</span>
          </div>
        )}

        {isAtLimit && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You've reached the rate limit. Please wait for the reset time or upgrade your plan for higher limits.
            </AlertDescription>
          </Alert>
        )}

        {isNearLimit && !isAtLimit && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              You're approaching the rate limit. Consider upgrading your plan for higher limits.
            </AlertDescription>
          </Alert>
        )}

        {showDetails && (
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span>Window Size</span>
              <span className="font-medium">
                {Math.floor(rateLimit.windowMs / 1000 / 60)} minutes
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Reset Time</span>
              <span className="font-medium">
                {new Date(rateLimit.resetTime).toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Rate limit dashboard component
export function RateLimitDashboard() {
  const [rateLimits, setRateLimits] = useState<RateLimitData[]>([
    {
      current: 45,
      limit: 100,
      resetTime: Date.now() + 30 * 60 * 1000, // 30 minutes
      windowMs: 60 * 60 * 1000, // 1 hour
      type: 'api'
    },
    {
      current: 8,
      limit: 10,
      resetTime: Date.now() + 15 * 60 * 1000, // 15 minutes
      windowMs: 60 * 60 * 1000, // 1 hour
      type: 'watcher'
    },
    {
      current: 12,
      limit: 50,
      resetTime: Date.now() + 45 * 60 * 1000, // 45 minutes
      windowMs: 60 * 60 * 1000, // 1 hour
      type: 'search'
    },
    {
      current: 3,
      limit: 20,
      resetTime: Date.now() + 20 * 60 * 1000, // 20 minutes
      windowMs: 60 * 60 * 1000, // 1 hour
      type: 'notification'
    }
  ]);

  const handleRefresh = async () => {
    // Simulate API call to refresh rate limit data
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, this would fetch fresh data from the API
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rate Limits</h2>
          <p className="text-muted-foreground">
            Monitor your API usage and rate limits
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {rateLimits.map((rateLimit, index) => (
          <RateLimitIndicator
            key={index}
            rateLimit={rateLimit}
            onRefresh={handleRefresh}
            showDetails={true}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Rate Limit Information
          </CardTitle>
          <CardDescription>
            Understanding how rate limits work and how to manage them
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">API Calls</h4>
              <p className="text-sm text-muted-foreground">
                Standard API requests for searching deals, managing watchers, and accessing user data.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Watcher Runs</h4>
              <p className="text-sm text-muted-foreground">
                Automated searches performed by your watchers to find matching deals.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Search Requests</h4>
              <p className="text-sm text-muted-foreground">
                Manual searches performed through the search interface.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Notifications</h4>
              <p className="text-sm text-muted-foreground">
                Push notifications and email alerts sent to users.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
