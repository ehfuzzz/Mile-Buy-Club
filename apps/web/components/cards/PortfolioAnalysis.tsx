'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CreditCard, TrendingUp, AlertCircle, CheckCircle, Target } from 'lucide-react';

interface PortfolioAnalysisProps {
  userCards?: any[];
  gaps?: any[];
  totalValue?: number;
  averageScore?: number;
}

export function PortfolioAnalysis({ 
  userCards = [], 
  gaps = [], 
  totalValue = 0, 
  averageScore = 0 
}: PortfolioAnalysisProps) {
  // Mock data for demonstration
  const mockData = {
    userCards: [
      { name: 'Chase Sapphire Preferred', category: 'Travel', value: 750 },
      { name: 'Amex Gold', category: 'Dining', value: 600 },
      { name: 'Chase Freedom Unlimited', category: 'General', value: 300 }
    ],
    gaps: [
      { program: 'United', importance: 'high', reason: 'No United-specific card' },
      { program: 'Marriott', importance: 'medium', reason: 'Missing hotel program' },
      { program: 'Delta', importance: 'low', reason: 'Limited Delta coverage' }
    ],
    totalValue: 1650,
    averageScore: 85,
    coverage: 75
  };

  const data = userCards.length > 0 ? { userCards, gaps, totalValue, averageScore, coverage: 75 } : mockData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Portfolio Value */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${data.totalValue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Annual value from your cards
          </p>
        </CardContent>
      </Card>

      {/* Average Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.averageScore}/100</div>
          <div className="mt-2">
            <Progress value={data.averageScore} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Program Coverage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Program Coverage</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.coverage}%</div>
          <p className="text-xs text-muted-foreground">
            Major programs covered
          </p>
        </CardContent>
      </Card>

      {/* Gaps Identified */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gaps Identified</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.gaps.length}</div>
          <p className="text-xs text-muted-foreground">
            Missing programs
          </p>
        </CardContent>
      </Card>

      {/* Current Cards */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Your Cards</CardTitle>
          <CardDescription>
            {data.userCards.length} cards in your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.userCards.map((card, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{card.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {card.category}
                  </Badge>
                </div>
                <span className="text-sm font-medium text-green-600">
                  ${card.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Program Gaps */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Program Gaps</CardTitle>
          <CardDescription>
            Missing programs in your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.gaps.map((gap, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">{gap.program}</span>
                  <Badge 
                    variant={gap.importance === 'high' ? 'destructive' : 
                            gap.importance === 'medium' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {gap.importance}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {gap.reason}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
