'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';

export function CardFilters() {
  const [filters, setFilters] = useState({
    annualFee: [0, 1000],
    signupBonus: [0, 100000],
    category: [] as string[],
    issuer: [] as string[],
    transferPartners: [] as string[],
    bestFor: [] as string[]
  });

  const categories = ['Travel', 'Dining', 'General', 'Airline', 'Hotel', 'Cashback'];
  const issuers = ['Chase', 'American Express', 'Capital One', 'Citi', 'Wells Fargo'];
  const transferPartners = ['United', 'Delta', 'American', 'Southwest', 'Marriott', 'Hilton', 'Hyatt'];
  const bestFor = ['travel', 'dining', 'flexible-points', 'airline-specific', 'hotel-specific', 'credits'];

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      category: checked 
        ? [...prev.category, category]
        : prev.category.filter(c => c !== category)
    }));
  };

  const handleIssuerChange = (issuer: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      issuer: checked 
        ? [...prev.issuer, issuer]
        : prev.issuer.filter(i => i !== issuer)
    }));
  };

  const handleTransferPartnerChange = (partner: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      transferPartners: checked 
        ? [...prev.transferPartners, partner]
        : prev.transferPartners.filter(p => p !== partner)
    }));
  };

  const handleBestForChange = (tag: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      bestFor: checked 
        ? [...prev.bestFor, tag]
        : prev.bestFor.filter(t => t !== tag)
    }));
  };

  const clearFilters = () => {
    setFilters({
      annualFee: [0, 1000],
      signupBonus: [0, 100000],
      category: [],
      issuer: [],
      transferPartners: [],
      bestFor: []
    });
  };

  const activeFiltersCount = [
    ...filters.category,
    ...filters.issuer,
    ...filters.transferPartners,
    ...filters.bestFor
  ].length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>
        <CardDescription>
          Refine your card recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Annual Fee Range */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Annual Fee Range</label>
          <div className="px-3">
            <Slider
              value={filters.annualFee}
              onValueChange={(value) => setFilters(prev => ({ ...prev, annualFee: value }))}
              max={1000}
              step={25}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>${filters.annualFee[0]}</span>
              <span>${filters.annualFee[1]}</span>
            </div>
          </div>
        </div>

        {/* Signup Bonus Range */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Signup Bonus Range</label>
          <div className="px-3">
            <Slider
              value={filters.signupBonus}
              onValueChange={(value) => setFilters(prev => ({ ...prev, signupBonus: value }))}
              max={100000}
              step={5000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{filters.signupBonus[0].toLocaleString()}</span>
              <span>{filters.signupBonus[1].toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Category</label>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.category.includes(category)}
                  onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                />
                <label
                  htmlFor={`category-${category}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Issuer */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Issuer</label>
          <div className="space-y-2">
            {issuers.map((issuer) => (
              <div key={issuer} className="flex items-center space-x-2">
                <Checkbox
                  id={`issuer-${issuer}`}
                  checked={filters.issuer.includes(issuer)}
                  onCheckedChange={(checked) => handleIssuerChange(issuer, checked as boolean)}
                />
                <label
                  htmlFor={`issuer-${issuer}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {issuer}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Transfer Partners */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Transfer Partners</label>
          <div className="space-y-2">
            {transferPartners.map((partner) => (
              <div key={partner} className="flex items-center space-x-2">
                <Checkbox
                  id={`partner-${partner}`}
                  checked={filters.transferPartners.includes(partner)}
                  onCheckedChange={(checked) => handleTransferPartnerChange(partner, checked as boolean)}
                />
                <label
                  htmlFor={`partner-${partner}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {partner}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Best For */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Best For</label>
          <div className="space-y-2">
            {bestFor.map((tag) => (
              <div key={tag} className="flex items-center space-x-2">
                <Checkbox
                  id={`bestfor-${tag}`}
                  checked={filters.bestFor.includes(tag)}
                  onCheckedChange={(checked) => handleBestForChange(tag, checked as boolean)}
                />
                <label
                  htmlFor={`bestfor-${tag}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {tag.replace('-', ' ')}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Sort By</label>
          <Select defaultValue="recommendation">
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommendation">Recommendation Score</SelectItem>
              <SelectItem value="signup-bonus">Signup Bonus</SelectItem>
              <SelectItem value="annual-fee">Annual Fee</SelectItem>
              <SelectItem value="value">Value</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Apply Filters */}
        <Button className="w-full" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
}
