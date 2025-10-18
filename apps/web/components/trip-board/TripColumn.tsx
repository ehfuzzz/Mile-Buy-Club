'use client';

interface TripColumnProps {
  column: { id: string; title: string; color: string };
  trips: any[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragStart: (trip: any) => void;
  onDeleteTrip: (tripId: string) => void;
}

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-200',
  purple: 'bg-purple-50 border-purple-200',
  amber: 'bg-amber-50 border-amber-200',
  green: 'bg-green-50 border-green-200',
};

export default function TripColumn({
  column,
  trips,
  onDragOver,
  onDrop,
  onDragStart,
  onDeleteTrip,
}: TripColumnProps) {
  return (
    <div
      className={`rounded-lg border-2 p-4 min-h-96 ${colorClasses[column.color]}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {column.title}
        <span className="ml-2 text-sm font-normal text-gray-600">({trips.length})</span>
      </h2>

      <div className="space-y-3">
        {trips.map((trip) => (
          <div
            key={trip.id}
            draggable
            onDragStart={() => onDragStart(trip)}
            className="bg-white rounded-lg shadow p-4 cursor-move hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{trip.title}</h3>
              <button
                onClick={() => onDeleteTrip(trip.id)}
                className="text-gray-400 hover:text-red-500"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-3">{trip.destination}</p>

            <div className="text-xs text-gray-500 mb-3">
              {new Date(trip.startDate).toLocaleDateString()} →{' '}
              {new Date(trip.endDate).toLocaleDateString()}
            </div>

            <div className="flex gap-2 text-xs">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                ✈ {trip.flights}
              </span>
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                🏨 {trip.hotels}
              </span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                🎯 {trip.activities}
              </span>
            </div>
          </div>
        ))}

        {trips.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No trips here yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
