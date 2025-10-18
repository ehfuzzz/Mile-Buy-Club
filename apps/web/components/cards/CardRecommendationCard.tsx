'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, CreditCard, TrendingUp, Shield, Award, Plus, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardRecommendationCardProps {
  card: {
    id: string;
    name: string;
    issuer: string;
    annualFee: number;
    signupBonus: number;
    bonusValue: number;
    category: string;
    rating: number;
    recommendationScore: number;
    reason: string;
    benefits: string[];
    transferPartners: string[];
    bestFor: string[];
  };
  userCards: any[];
  onAddCard: (cardId: string) => void;
  onViewDetails: (cardId: string) => void;
}

export function CardRecommendationCard({ 
  card, 
  userCards, 
  onAddCard, 
  onViewDetails 
}: CardRecommendationCardProps) {
  const isOwned = userCards.some(userCard => userCard.id === card.id);
  const scoreColor = card.recommendationScore >= 90 ? 'bg-green-500' : 
                    card.recommendationScore >= 80 ? 'bg-yellow-500' : 
                    card.recommendationScore >= 70 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      {/* Score Badge */}
      <div className="absolute top-4 right-4">
        <Badge 
          className={cn(
            "text-white font-bold",
            scoreColor
          )}
        >
          {card.recommendationScore}
        </Badge>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg leading-tight">{card.name}</CardTitle>
            <CardDescription className="text-sm">{card.issuer}</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-500 fill-current" />
            <span className="text-sm font-medium">{card.rating}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {card.signupBonus.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Signup Bonus</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              ${card.annualFee}
            </div>
            <div className="text-xs text-muted-foreground">Annual Fee</div>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Value: ${card.bonusValue}</span>
          </div>
          <p className="text-sm text-muted-foreground">{card.reason}</p>
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Key Benefits</h4>
          <div className="flex flex-wrap gap-1">
            {card.benefits.slice(0, 3).map((benefit, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {benefit}
              </Badge>
            ))}
            {card.benefits.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{card.benefits.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Transfer Partners */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Transfer Partners</h4>
          <div className="flex flex-wrap gap-1">
            {card.transferPartners.slice(0, 3).map((partner, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {partner}
              </Badge>
            ))}
            {card.transferPartners.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{card.transferPartners.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Best For */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Best For</h4>
          <div className="flex flex-wrap gap-1">
            {card.bestFor.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag.replace('-', ' ')}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewDetails(card.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Details
          </Button>
          {!isOwned ? (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onAddCard(card.id)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Card
            </Button>
          ) : (
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1"
              disabled
            >
              <Shield className="h-4 w-4 mr-1" />
              Owned
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
