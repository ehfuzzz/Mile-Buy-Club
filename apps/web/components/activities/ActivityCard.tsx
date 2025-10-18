'use client';

import { useState } from 'react';
import { Star, Clock, Users, Heart, ChevronRight } from 'lucide-react';
// import Link from 'next/link';

interface ActivityCardProps {
  activity: {
    id: string;
    name: string;
    category: string;
    image: string;
    rating: number;
    reviews: number;
    price: number;
    duration: string;
    groupSize: string;
    highlights: string[];
    includedPoints: number;
    affiliate: boolean;
  };
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <img
          src={activity.image}
          alt={activity.name}
          className="w-full h-full object-cover"
        />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          {activity.category}
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow hover:shadow-lg"
        >
          <Heart
            className="w-5 h-5"
            fill={isFavorite ? 'red' : 'none'}
            color={isFavorite ? 'red' : 'gray'}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{activity.name}</h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4"
                fill={i < Math.floor(activity.rating) ? '#fbbf24' : 'none'}
                color={i < Math.floor(activity.rating) ? '#fbbf24' : '#d1d5db'}
              />
            ))}
          </div>
          <span className="text-sm font-medium">{activity.rating}</span>
          <span className="text-xs text-gray-500">({activity.reviews})</span>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{activity.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{activity.groupSize} people</span>
          </div>
        </div>

        {/* Highlights */}
        <div className="flex flex-wrap gap-1 mb-3">
          {activity.highlights.slice(0, 2).map((highlight) => (
            <span key={highlight} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
              {highlight}
            </span>
          ))}
        </div>

        {/* Price & Points */}
        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">${activity.price}</div>
          <div className="text-sm text-gray-600">
            + {activity.includedPoints} points
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-medium">
            Details
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
            Book Now
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Add to Trip */}
        <button className="w-full mt-2 px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium">
          Add to Trip
        </button>
      </div>
    </div>
  );
}
