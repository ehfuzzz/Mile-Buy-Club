'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, TrendingDown, Target, Calendar, Download } from 'lucide-react';
import { useState } from 'react';

export function RevenueTracking() {
  const [timeRange, setTimeRange] = useState('30d');

  // Mock revenue data
  const revenueData = {
    total: 12580,
    growth: 12.5,
    target: 15000,
    affiliate: 8900,
    subscription: 3680,
    transactions: 234
  };

  const monthlyData = [
    { month: 'Jan', revenue: 8500, transactions: 156 },
    { month: 'Feb', revenue: 9200, transactions: 178 },
    { month: 'Mar', revenue: 10800, transactions: 201 },
    { month: 'Apr', revenue: 11200, transactions: 189 },
    { month: 'May', revenue: 11800, transactions: 215 },
    { month: 'Jun', revenue: 12580, transactions: 234 }
  ];

  const topAffiliates = [
    { name: 'Booking.com', revenue: 3200, commission: 8.5, bookings: 45 },
    { name: 'Expedia', revenue: 2800, commission: 7.2, bookings: 38 },
    { name: 'Hotels.com', revenue: 1900, commission: 6.8, bookings: 28 },
    { name: 'United Airlines', revenue: 1000, commission: 5.5, bookings: 15 }
  ];

  const recentTransactions = [
    {
      id: 'TXN-001',
      user: 'john.doe@example.com',
      amount: 45.50,
      type: 'affiliate',
      source: 'Booking.com',
      date: '2024-10-18T10:30:00Z',
      status: 'completed'
    },
    {
      id: 'TXN-002',
      user: 'jane.smith@example.com',
      amount: 29.99,
      type: 'subscription',
      source: 'Premium Plan',
      date: '2024-10-18T09:15:00Z',
      status: 'completed'
    },
    {
      id: 'TXN-003',
      user: 'bob.johnson@example.com',
      amount: 32.75,
      type: 'affiliate',
      source: 'Expedia',
      date: '2024-10-18T08:45:00Z',
      status: 'pending'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'affiliate':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Affiliate</Badge>;
      case 'subscription':
        return <Badge variant="outline" className="border-green-500 text-green-500">Subscription</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Revenue Tracking</h2>
          <p className="text-muted-foreground">
            Monitor revenue streams, track performance, and analyze trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueData.total.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {revenueData.growth > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={revenueData.growth > 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(revenueData.growth)}%
              </span>
              from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Target</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueData.target.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {Math.round((revenueData.total / revenueData.target) * 100)}% of target
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Affiliate Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueData.affiliate.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {Math.round((revenueData.affiliate / revenueData.total) * 100)}% of total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueData.subscription.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {Math.round((revenueData.subscription / revenueData.total) * 100)}% of total
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Affiliates */}
        <Card>
          <CardHeader>
            <CardTitle>Top Affiliate Partners</CardTitle>
            <CardDescription>
              Revenue by affiliate partner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Bookings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topAffiliates.map((affiliate, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{affiliate.name}</TableCell>
                    <TableCell>${affiliate.revenue.toLocaleString()}</TableCell>
                    <TableCell>{affiliate.commission}%</TableCell>
                    <TableCell>{affiliate.bookings}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest revenue transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{transaction.id}</span>
                      {getTypeBadge(transaction.type)}
                      {getStatusBadge(transaction.status)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {transaction.user} • {transaction.source}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">${transaction.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>
            Monthly revenue over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((month, _index) => (
              <div key={month.month} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 text-sm font-medium">{month.month}</div>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ 
                          width: `${(month.revenue / Math.max(...monthlyData.map(m => m.revenue))) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">${month.revenue.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{month.transactions} transactions</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
