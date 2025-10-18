'use client';

interface TripCardProps {
  trip: any;
}

export default function TripCard({ trip }: TripCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-gray-900">{trip.title}</h3>
      <p className="text-sm text-gray-600 mt-1">{trip.destination}</p>
    </div>
  );
}
