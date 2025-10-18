'use client';

import { ChevronDown } from 'lucide-react';

interface HotelFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
}

export default function HotelFilters({
  filters,
  onFiltersChange,
  onClose,
}: HotelFiltersProps) {
  const amenitiesList = [
    'Pool',
    'Spa',
    'Gym',
    'Restaurant',
    'Free WiFi',
    'Business Center',
    'Breakfast',
    'Parking',
  ];

  const loyaltyPrograms = [
    'Marriott Bonvoy',
    'Hilton Honors',
    'IHG Rewards',
    'Hyatt World',
    'Best Western Rewards',
  ];

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Price per Night: ${filters.priceMin} - ${filters.priceMax}
            </label>
            <input
              type="range"
              min="0"
              max="1000"
              value={filters.priceMax}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  priceMax: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Minimum Rating
            </label>
            <select
              value={filters.minRating}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  minRating: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value={0}>Any Rating</option>
              <option value={3}>3+ Stars</option>
              <option value={4}>4+ Stars</option>
              <option value={5}>5 Stars</option>
            </select>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Amenities
            </label>
            <div className="space-y-1">
              {amenitiesList.slice(0, 3).map((amenity) => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...filters.amenities, amenity]
                        : filters.amenities.filter((a: string) => a !== amenity);
                      onFiltersChange({ ...filters, amenities: updated });
                    }}
                    className="rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Loyalty Programs */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Loyalty Programs
            </label>
            <div className="space-y-1">
              {loyaltyPrograms.slice(0, 3).map((program) => (
                <label key={program} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.loyaltyPrograms.includes(program)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...filters.loyaltyPrograms, program]
                        : filters.loyaltyPrograms.filter((p: string) => p !== program);
                      onFiltersChange({ ...filters, loyaltyPrograms: updated });
                    }}
                    className="rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">{program}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 items-end">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Apply
            </button>
            <button
              onClick={() => {
                onFiltersChange({
                  priceMin: 0,
                  priceMax: 1000,
                  minRating: 0,
                  amenities: [],
                  loyaltyPrograms: [],
                });
              }}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
