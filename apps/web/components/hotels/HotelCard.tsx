'use client';

import { useState } from 'react';
import { Star, MapPin, Heart, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface HotelCardProps {
  hotel: {
    id: string;
    name: string;
    image: string;
    rating: number;
    reviews: number;
    pricePerNight: number;
    location: string;
    programs: string[];
    amenities: string[];
    freeCancellation: boolean;
    affiliate: boolean;
  };
}

export default function HotelCard({ hotel }: HotelCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Image Carousel */}
      <div className="relative h-48 bg-gray-200 overflow-hidden group">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />

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

        {/* Affiliate Badge */}
        {hotel.affiliate && (
          <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium">
            Partner Deal
          </div>
        )}

        {/* Free Cancellation Badge */}
        {hotel.freeCancellation && (
          <div className="absolute bottom-3 left-3 bg-green-500 text-white px-3 py-1 rounded text-sm font-medium">
            Free Cancellation
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Hotel Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{hotel.name}</h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-600 mb-2">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{hotel.location}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4"
                fill={i < Math.floor(hotel.rating) ? 'gold' : 'none'}
                color={i < Math.floor(hotel.rating) ? 'gold' : 'gray'}
              />
            ))}
          </div>
          <span className="text-sm font-medium">{hotel.rating}</span>
          <span className="text-xs text-gray-500">({hotel.reviews} reviews)</span>
        </div>

        {/* Programs */}
        <div className="flex flex-wrap gap-1 mb-3">
          {hotel.programs.slice(0, 2).map((program) => (
            <span key={program} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {program}
            </span>
          ))}
          {hotel.programs.length > 2 && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              +{hotel.programs.length - 2}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mb-4">
          <span className="text-2xl font-bold text-gray-900">${hotel.pricePerNight}</span>
          <span className="text-gray-600 text-sm">/night</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-medium">
            Details
          </button>
          <Link
            href={`/dashboard/hotels/${hotel.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Book Now
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Add to Trip */}
        <button className="w-full mt-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium">
          Add to Trip
        </button>
      </div>
    </div>
  );
}
