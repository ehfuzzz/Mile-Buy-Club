import { RateLimitDashboard } from '@/components/ui/rate-limit-indicator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Zap, 
  Shield, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

export default function RateLimitsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rate Limits</h1>
          <p className="text-muted-foreground">
            Monitor and manage your API usage and rate limits
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Rate Limit Dashboard */}
      <RateLimitDashboard />

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="limits">Current Limits</TabsTrigger>
          <TabsTrigger value="upgrade">Upgrade Plan</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  How Rate Limits Work
                </CardTitle>
                <CardDescription>
                  Understanding rate limiting in Mile Buy Club
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Sliding Window</p>
                      <p className="text-xs text-muted-foreground">
                        Rate limits reset every hour based on your usage
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Per-User Limits</p>
                      <p className="text-xs text-muted-foreground">
                        Each user has their own rate limit counters
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Different Types</p>
                      <p className="text-xs text-muted-foreground">
                        API calls, watchers, searches, and notifications have separate limits
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Best Practices
                </CardTitle>
                <CardDescription>
                  Tips for managing your rate limits effectively
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Monitor Usage</p>
                      <p className="text-xs text-muted-foreground">
                        Keep an eye on your usage to avoid hitting limits
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Optimize Watchers</p>
                      <p className="text-xs text-muted-foreground">
                        Use fewer, more specific watchers instead of many broad ones
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Upgrade When Needed</p>
                      <p className="text-xs text-muted-foreground">
                        Consider upgrading your plan for higher limits
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Current Limits Tab */}
        <TabsContent value="limits" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>API Calls</CardTitle>
                <CardDescription>
                  Standard API requests for searching deals and managing data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Usage</span>
                    <span className="font-medium">45 / 100</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Resets in 30 minutes</span>
                    <span>Free Plan</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Watcher Runs</CardTitle>
                <CardDescription>
                  Automated searches performed by your watchers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Usage</span>
                    <span className="font-medium">8 / 10</span>
                  </div>
                  <Progress value={80} className="h-2 bg-yellow-100" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Resets in 15 minutes</span>
                    <span>Free Plan</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Search Requests</CardTitle>
                <CardDescription>
                  Manual searches through the search interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Usage</span>
                    <span className="font-medium">12 / 50</span>
                  </div>
                  <Progress value={24} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Resets in 45 minutes</span>
                    <span>Free Plan</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Push notifications and email alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Usage</span>
                    <span className="font-medium">3 / 20</span>
                  </div>
                  <Progress value={15} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Resets in 20 minutes</span>
                    <span>Free Plan</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Upgrade Plan Tab */}
        <TabsContent value="upgrade" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Free Plan</CardTitle>
                <CardDescription>Current plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">API Calls</span>
                    <Badge variant="outline">100/hour</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Watcher Runs</span>
                    <Badge variant="outline">10/hour</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Search Requests</span>
                    <Badge variant="outline">50/hour</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Notifications</span>
                    <Badge variant="outline">20/hour</Badge>
                  </div>
                </div>
                <Button disabled className="w-full">
                  Current Plan
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Pro Plan
                  <Badge className="bg-blue-500">Recommended</Badge>
                </CardTitle>
                <CardDescription>$29/month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">API Calls</span>
                    <Badge variant="default" className="bg-green-500">500/hour</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Watcher Runs</span>
                    <Badge variant="default" className="bg-green-500">50/hour</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Search Requests</span>
                    <Badge variant="default" className="bg-green-500">200/hour</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Notifications</span>
                    <Badge variant="default" className="bg-green-500">100/hour</Badge>
                  </div>
                </div>
                <Button className="w-full">
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enterprise Plan</CardTitle>
                <CardDescription>Contact sales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">API Calls</span>
                    <Badge variant="default" className="bg-purple-500">Unlimited</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Watcher Runs</span>
                    <Badge variant="default" className="bg-purple-500">Unlimited</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Search Requests</span>
                    <Badge variant="default" className="bg-purple-500">Unlimited</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Notifications</span>
                    <Badge variant="default" className="bg-purple-500">Unlimited</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
