'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  Activity
} from 'lucide-react';
import { useState } from 'react';

export function SystemHealth() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock system health data
  const systemMetrics = {
    uptime: 99.9,
    responseTime: 145,
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 38,
    databaseConnections: 23,
    activeUsers: 892,
    errorRate: 0.02
  };

  const services = [
    {
      name: 'API Server',
      status: 'healthy',
      uptime: 99.9,
      responseTime: 145,
      lastCheck: '2024-10-18T10:30:00Z'
    },
    {
      name: 'Database',
      status: 'healthy',
      uptime: 99.8,
      responseTime: 23,
      lastCheck: '2024-10-18T10:30:00Z'
    },
    {
      name: 'Redis Cache',
      status: 'healthy',
      uptime: 99.9,
      responseTime: 8,
      lastCheck: '2024-10-18T10:30:00Z'
    },
    {
      name: 'Job Queue',
      status: 'warning',
      uptime: 98.5,
      responseTime: 234,
      lastCheck: '2024-10-18T10:30:00Z'
    },
    {
      name: 'Email Service',
      status: 'healthy',
      uptime: 99.7,
      responseTime: 156,
      lastCheck: '2024-10-18T10:30:00Z'
    },
    {
      name: 'Notification Service',
      status: 'error',
      uptime: 95.2,
      responseTime: 1200,
      lastCheck: '2024-10-18T10:30:00Z'
    }
  ];

  const alerts = [
    {
      id: '1',
      type: 'warning',
      title: 'High CPU Usage',
      description: 'CPU usage has been above 80% for the last 15 minutes',
      timestamp: '2024-10-18T10:15:00Z'
    },
    {
      id: '2',
      type: 'error',
      title: 'Notification Service Down',
      description: 'Push notification service is not responding to health checks',
      timestamp: '2024-10-18T09:45:00Z'
    },
    {
      id: '3',
      type: 'info',
      title: 'Database Maintenance Scheduled',
      description: 'Database maintenance is scheduled for tonight at 2:00 AM',
      timestamp: '2024-10-18T08:00:00Z'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-500">Healthy</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Activity className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health</h2>
          <p className="text-muted-foreground">
            Monitor system performance, service status, and resource usage
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.uptime}%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.responseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Average API response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.cpuUsage}%</div>
            <Progress value={systemMetrics.cpuUsage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.memoryUsage}%</div>
            <Progress value={systemMetrics.memoryUsage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>
            Current status of all system services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Uptime: {service.uptime}% • Response: {service.responseTime}ms
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(service.status)}
                  <div className="text-xs text-muted-foreground">
                    {new Date(service.lastCheck).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
          <CardDescription>
            Current system alerts and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : 'default'}>
                <div className="flex items-start gap-2">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <AlertDescription>
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {alert.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
            <CardDescription>
              Current system resource utilization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>CPU Usage</span>
                <span>{systemMetrics.cpuUsage}%</span>
              </div>
              <Progress value={systemMetrics.cpuUsage} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Memory Usage</span>
                <span>{systemMetrics.memoryUsage}%</span>
              </div>
              <Progress value={systemMetrics.memoryUsage} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Disk Usage</span>
                <span>{systemMetrics.diskUsage}%</span>
              </div>
              <Progress value={systemMetrics.diskUsage} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Status</CardTitle>
            <CardDescription>
              Database performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">Active Connections</span>
              <span className="font-medium">{systemMetrics.databaseConnections}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Query Response Time</span>
              <span className="font-medium">23ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Cache Hit Rate</span>
              <span className="font-medium">94.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Error Rate</span>
              <span className="font-medium text-red-500">{systemMetrics.errorRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
