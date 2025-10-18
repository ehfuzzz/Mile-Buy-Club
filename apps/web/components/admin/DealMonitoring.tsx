'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, TrendingUp, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { useState } from 'react';

export function DealMonitoring() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock deal data
  const deals = [
    {
      id: '1',
      route: 'LAX → JFK',
      airline: 'United',
      cabin: 'Business',
      price: 1200,
      miles: 50000,
      cpp: 2.4,
      value: 95,
      status: 'active',
      foundAt: '2024-10-18T10:30:00Z',
      expiresAt: '2024-10-25T10:30:00Z',
      watchers: 23,
      bookings: 3
    },
    {
      id: '2',
      route: 'SFO → LHR',
      airline: 'British Airways',
      cabin: 'First',
      price: 2500,
      miles: 80000,
      cpp: 3.1,
      value: 98,
      status: 'hot',
      foundAt: '2024-10-18T09:15:00Z',
      expiresAt: '2024-10-22T09:15:00Z',
      watchers: 45,
      bookings: 7
    },
    {
      id: '3',
      route: 'ORD → NRT',
      airline: 'ANA',
      cabin: 'Business',
      price: 1800,
      miles: 60000,
      cpp: 3.0,
      value: 92,
      status: 'expired',
      foundAt: '2024-10-17T14:20:00Z',
      expiresAt: '2024-10-18T14:20:00Z',
      watchers: 18,
      bookings: 2
    }
  ];

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.airline.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'hot':
        return <Badge variant="destructive" className="bg-red-500">Hot Deal</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getValueBadge = (value: number) => {
    if (value >= 95) return <Badge variant="default" className="bg-green-500">Excellent</Badge>;
    if (value >= 85) return <Badge variant="default" className="bg-yellow-500">Good</Badge>;
    if (value >= 70) return <Badge variant="default" className="bg-orange-500">Fair</Badge>;
    return <Badge variant="secondary">Poor</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Deal Monitoring</h2>
          <p className="text-muted-foreground">
            Monitor active deals, track performance, and manage alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button size="sm">
            <AlertCircle className="h-4 w-4 mr-2" />
            Create Alert
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search deals by route or airline..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="hot">Hot Deals</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Deals ({filteredDeals.length})</CardTitle>
          <CardDescription>
            Current deals being monitored by the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Airline</TableHead>
                <TableHead>Cabin</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Miles</TableHead>
                <TableHead>CPP</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Watchers</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Found</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell className="font-medium">{deal.route}</TableCell>
                  <TableCell>{deal.airline}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{deal.cabin}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span className="font-medium">{deal.price.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{deal.miles.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{deal.cpp}</span>
                  </TableCell>
                  <TableCell>
                    {getValueBadge(deal.value)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(deal.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{deal.watchers}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="font-medium">{deal.bookings}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(deal.foundAt).toLocaleDateString()}</div>
                      <div className="text-muted-foreground">
                        {new Date(deal.foundAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Deal Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deals.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently monitored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hot Deals</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deals.filter(d => d.status === 'hot').length}
            </div>
            <p className="text-xs text-muted-foreground">
              High-value opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Watchers</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deals.reduce((sum, deal) => sum + deal.watchers, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Active watchers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deals.reduce((sum, deal) => sum + deal.bookings, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Successful bookings
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
