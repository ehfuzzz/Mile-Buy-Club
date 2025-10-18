'use client';

import { useState, useCallback } from 'react';
import { Search, MapPin, Calendar, Users, Filter, Zap } from 'lucide-react';
import ActivityCard from '@/components/activities/ActivityCard';
import ActivityFilters from '@/components/activities/ActivityFilters';

interface ActivitySearchFilters {
  destination: string;
  date: Date | null;
  endDate: Date | null;
  guests: number;
  category: string[];
  priceMin: number;
  priceMax: number;
  rating: number;
}

export default function ActivitiesPage() {
  const [searchFilters, setSearchFilters] = useState<ActivitySearchFilters>({
    destination: '',
    date: null,
    endDate: null,
    guests: 1,
    category: [],
    priceMin: 0,
    priceMax: 500,
    rating: 0,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchFilters.destination || !searchFilters.date) {
      alert('Please fill in destination and date');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/activities/search', {
      //   method: 'POST',
      //   body: JSON.stringify(searchFilters),
      // });
      // const data = await response.json();
      // setActivities(data.results);

      // Mock data
      setActivities([
        {
          id: '1',
          name: 'Sunset Catamaran Cruise',
          category: 'Water Sports',
          image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
          rating: 4.9,
          reviews: 834,
          price: 89,
          duration: '3 hours',
          groupSize: '2-50',
          highlights: ['Sunset views', 'Snacks included', 'Professional crew'],
          includedPoints: 500,
          affiliate: true,
        },
        {
          id: '2',
          name: 'Hiking Adventure',
          category: 'Tours',
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
          rating: 4.7,
          reviews: 612,
          price: 45,
          duration: '4 hours',
          groupSize: '1-15',
          highlights: ['Scenic trails', 'Experienced guide', 'Lunch included'],
          includedPoints: 200,
          affiliate: true,
        },
        {
          id: '3',
          name: 'Scuba Diving',
          category: 'Water Sports',
          image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
          rating: 4.8,
          reviews: 456,
          price: 120,
          duration: '5 hours',
          groupSize: '2-8',
          highlights: ['Certification included', 'Marine life', 'Equipment provided'],
          includedPoints: 600,
          affiliate: true,
        },
        {
          id: '4',
          name: 'Spa Day Package',
          category: 'Wellness',
          image: 'https://images.unsplash.com/photo-1544161515-81aae3ff8b47?w=400',
          rating: 4.9,
          reviews: 723,
          price: 250,
          duration: '4 hours',
          groupSize: '1-4',
          highlights: ['Massage', 'Facial', 'Steam room'],
          includedPoints: 1000,
          affiliate: true,
        },
      ]);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchFilters]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="sticky top-0 z-40 bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            {/* Destination */}
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Where?"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchFilters.destination}
                onChange={(e) =>
                  setSearchFilters({ ...searchFilters, destination: e.target.value })
                }
              />
            </div>

            {/* Date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="date"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onChange={(e) =>
                  setSearchFilters({
                    ...searchFilters,
                    date: e.target.value ? new Date(e.target.value) : null,
                  })
                }
              />
            </div>

            {/* Duration */}
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="date"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onChange={(e) =>
                  setSearchFilters({
                    ...searchFilters,
                    endDate: e.target.value ? new Date(e.target.value) : null,
                  })
                }
              />
            </div>

            {/* Guests */}
            <div className="relative">
              <Users className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchFilters.guests}
                onChange={(e) =>
                  setSearchFilters({ ...searchFilters, guests: parseInt(e.target.value) })
                }
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'Person' : 'People'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            >
              <Search className="w-5 h-5" />
              {isLoading ? 'Searching...' : 'Search Activities'}
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <ActivityFilters
            filters={searchFilters}
            onFiltersChange={setSearchFilters}
            onClose={() => setShowFilters(false)}
          />
        )}
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!hasSearched ? (
          <div className="text-center py-12">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-xl text-gray-600">Search for activities to get started</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-6">
              {activities.length} activities found
              {searchFilters.destination && ` in ${searchFilters.destination}`}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
