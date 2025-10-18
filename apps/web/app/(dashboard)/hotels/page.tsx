'use client';

import { useState, useCallback } from 'react';
import { Search, MapPin, Calendar, Users, Filter } from 'lucide-react';
import HotelCard from '@/components/hotels/HotelCard';
import HotelFilters from '@/components/hotels/HotelFilters';
import HotelMap from '@/components/hotels/HotelMap';

interface HotelSearchFilters {
  destination: string;
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number;
  priceMin: number;
  priceMax: number;
  minRating: number;
  amenities: string[];
  loyaltyPrograms: string[];
}

export default function HotelsPage() {
  const [searchFilters, setSearchFilters] = useState<HotelSearchFilters>({
    destination: '',
    checkIn: null,
    checkOut: null,
    guests: 1,
    priceMin: 0,
    priceMax: 1000,
    minRating: 0,
    amenities: [],
    loyaltyPrograms: [],
  });

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [hotels, setHotels] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchFilters.destination || !searchFilters.checkIn || !searchFilters.checkOut) {
      alert('Please fill in destination and dates');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/hotels/search', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(searchFilters),
      // });
      // const data = await response.json();
      // setHotels(data.results);

      // Mock data for now
      setHotels([
        {
          id: '1',
          name: 'Luxury Beachfront Resort',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
          rating: 4.8,
          reviews: 2456,
          pricePerNight: 250,
          location: 'Honolulu, HI',
          programs: ['Marriott Bonvoy', 'Elite Status'],
          amenities: ['Pool', 'Spa', 'Restaurant', 'Free WiFi'],
          freeCancellation: true,
          affiliate: true,
        },
        {
          id: '2',
          name: 'Downtown City Hotel',
          image: 'https://images.unsplash.com/photo-1470113716159-e389f8712fda?w=400',
          rating: 4.5,
          reviews: 1823,
          pricePerNight: 150,
          location: 'Downtown, HI',
          programs: ['Hilton Honors'],
          amenities: ['Business Center', 'Gym', 'Restaurant'],
          freeCancellation: false,
          affiliate: true,
        },
        {
          id: '3',
          name: 'Budget Friendly Inn',
          image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
          rating: 4.2,
          reviews: 945,
          pricePerNight: 80,
          location: 'Outskirts, HI',
          programs: ['IHG Rewards'],
          amenities: ['Free WiFi', 'Breakfast'],
          freeCancellation: true,
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
                placeholder="Where to?"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchFilters.destination}
                onChange={(e) =>
                  setSearchFilters({ ...searchFilters, destination: e.target.value })
                }
              />
            </div>

            {/* Check-in Date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="date"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) =>
                  setSearchFilters({
                    ...searchFilters,
                    checkIn: e.target.value ? new Date(e.target.value) : null,
                  })
                }
              />
            </div>

            {/* Check-out Date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="date"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) =>
                  setSearchFilters({
                    ...searchFilters,
                    checkOut: e.target.value ? new Date(e.target.value) : null,
                  })
                }
              />
            </div>

            {/* Guests */}
            <div className="relative">
              <Users className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchFilters.guests}
                onChange={(e) =>
                  setSearchFilters({ ...searchFilters, guests: parseInt(e.target.value) })
                }
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              <Search className="w-5 h-5" />
              {isLoading ? 'Searching...' : 'Search Hotels'}
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>

            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg border ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg border ${
                  viewMode === 'map'
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                Map
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <HotelFilters
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
            <p className="text-xl text-gray-600">Search for hotels to get started</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div>
            <p className="text-gray-600 mb-4">{hotels.length} hotels found</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          </div>
        ) : (
          <HotelMap hotels={hotels} />
        )}
      </div>
    </div>
  );
}
