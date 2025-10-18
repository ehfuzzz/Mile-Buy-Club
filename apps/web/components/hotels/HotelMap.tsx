'use client';

export default function HotelMap({ hotels }: { hotels: any[] }) {
  return (
    <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 text-lg">Map View</p>
        <p className="text-gray-500 text-sm mt-2">{hotels.length} hotels shown on map</p>
        <p className="text-xs text-gray-400 mt-4">
          Map integration with Mapbox or Google Maps would go here
        </p>
      </div>
    </div>
  );
}
