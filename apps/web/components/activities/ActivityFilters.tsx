'use client';

interface ActivityFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
}

export default function ActivityFilters({
  filters,
  onFiltersChange,
  onClose,
}: ActivityFiltersProps) {
  const categories = [
    'Water Sports',
    'Tours',
    'Wellness',
    'Adventure',
    'Cultural',
    'Food & Wine',
  ];

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Price: ${filters.priceMin} - ${filters.priceMax}
            </label>
            <input
              type="range"
              min="0"
              max="500"
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

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Minimum Rating
            </label>
            <select
              value={filters.rating}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  rating: parseInt(e.target.value),
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

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Categories
            </label>
            <div className="space-y-1">
              {categories.slice(0, 3).map((cat) => (
                <label key={cat} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.category.includes(cat)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...filters.category, cat]
                        : filters.category.filter((c: string) => c !== cat);
                      onFiltersChange({ ...filters, category: updated });
                    }}
                    className="rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 items-end">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              Apply
            </button>
            <button
              onClick={() => {
                onFiltersChange({
                  category: [],
                  priceMin: 0,
                  priceMax: 500,
                  rating: 0,
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
