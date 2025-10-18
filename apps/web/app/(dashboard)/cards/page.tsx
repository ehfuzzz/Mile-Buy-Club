'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardRecommendationCard } from '@/components/cards/CardRecommendationCard';
import { PortfolioAnalysis } from '@/components/cards/PortfolioAnalysis';
import { CardFilters } from '@/components/cards/CardFilters';
import { CreditCard, TrendingUp, Star, Award } from 'lucide-react';

export default function CardRecommendationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Card Recommendations</h1>
          <p className="text-muted-foreground">
            Discover the best credit cards for your travel goals and spending patterns
          </p>
        </div>
        <Button className="gap-2">
          <CreditCard className="h-4 w-4" />
          Add Card to Portfolio
        </Button>
      </div>

      {/* Portfolio Analysis */}
      <PortfolioAnalysis />

      {/* Filters and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <CardFilters />
        </div>

        {/* Recommendations */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Recommendations */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-semibold">Top Recommendations</h2>
              <Badge variant="secondary">Based on your portfolio</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CardRecommendationCard
                card={{
                  id: '1',
                  name: 'Chase Sapphire Preferred',
                  issuer: 'Chase',
                  annualFee: 95,
                  signupBonus: 60000,
                  bonusValue: 750,
                  category: 'Travel',
                  rating: 4.8,
                  recommendationScore: 95,
                  reason: 'Fills gap in flexible points, high signup bonus',
                  benefits: ['2x on travel & dining', 'Transfer partners', 'Travel protections'],
                  transferPartners: ['United', 'Southwest', 'Hyatt', 'Marriott'],
                  bestFor: ['travel', 'dining', 'flexible-points']
                }}
                userCards={[]}
                onAddCard={() => {}}
                onViewDetails={() => {}}
              />
              <CardRecommendationCard
                card={{
                  id: '2',
                  name: 'American Express Gold Card',
                  issuer: 'American Express',
                  annualFee: 250,
                  signupBonus: 60000,
                  bonusValue: 600,
                  category: 'Dining',
                  rating: 4.6,
                  recommendationScore: 88,
                  reason: 'Excellent dining rewards, monthly credits',
                  benefits: ['4x on dining', '3x on flights', '$120 dining credit'],
                  transferPartners: ['Delta', 'Hilton', 'Marriott'],
                  bestFor: ['dining', 'travel', 'credits']
                }}
                userCards={[]}
                onAddCard={() => {}}
                onViewDetails={() => {}}
              />
            </div>
          </div>

          {/* Gap Analysis */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-semibold">Fill Your Gaps</h2>
              <Badge variant="outline">Missing programs</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CardRecommendationCard
                card={{
                  id: '3',
                  name: 'United Explorer Card',
                  issuer: 'Chase',
                  annualFee: 95,
                  signupBonus: 50000,
                  bonusValue: 500,
                  category: 'Airline',
                  rating: 4.2,
                  recommendationScore: 82,
                  reason: 'Fills United gap, good for United flyers',
                  benefits: ['2x on United purchases', 'Free checked bag', 'Priority boarding'],
                  transferPartners: ['United'],
                  bestFor: ['united', 'airline-specific']
                }}
                userCards={[]}
                onAddCard={() => {}}
                onViewDetails={() => {}}
              />
              <CardRecommendationCard
                card={{
                  id: '4',
                  name: 'Marriott Bonvoy Boundless',
                  issuer: 'Chase',
                  annualFee: 95,
                  signupBonus: 75000,
                  bonusValue: 600,
                  category: 'Hotel',
                  rating: 4.4,
                  recommendationScore: 78,
                  reason: 'Fills Marriott gap, good hotel program',
                  benefits: ['6x on Marriott', 'Free night annually', 'Elite status'],
                  transferPartners: ['Marriott'],
                  bestFor: ['marriott', 'hotel-specific']
                }}
                userCards={[]}
                onAddCard={() => {}}
                onViewDetails={() => {}}
              />
            </div>
          </div>

          {/* All Cards */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-green-500" />
              <h2 className="text-xl font-semibold">All Available Cards</h2>
              <Badge variant="outline">8 cards</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Additional cards would be rendered here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
