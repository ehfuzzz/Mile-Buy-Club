'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronRight } from 'lucide-react';
import TripCard from '@/components/trip-board/TripCard';
import TripColumn from '@/components/trip-board/TripColumn';

interface Trip {
  id: string;
  title: string;
  status: 'planned' | 'booked' | 'in_progress' | 'completed';
  destination: string;
  startDate: string;
  endDate: string;
  flights: number;
  hotels: number;
  activities: number;
}

const mockTrips: Trip[] = [
  {
    id: '1',
    title: 'Hawaii Adventure',
    status: 'planned',
    destination: 'Honolulu, HI',
    startDate: '2025-12-20',
    endDate: '2025-12-27',
    flights: 2,
    hotels: 1,
    activities: 3,
  },
  {
    id: '2',
    title: 'Japan Winter',
    status: 'booked',
    destination: 'Tokyo, Japan',
    startDate: '2026-01-15',
    endDate: '2026-02-01',
    flights: 2,
    hotels: 3,
    activities: 5,
  },
  {
    id: '3',
    title: 'European Summer',
    status: 'in_progress',
    destination: 'Paris, France',
    startDate: '2025-07-01',
    endDate: '2025-07-21',
    flights: 2,
    hotels: 5,
    activities: 8,
  },
  {
    id: '4',
    title: 'Caribbean Cruise',
    status: 'completed',
    destination: 'Caribbean',
    startDate: '2025-04-10',
    endDate: '2025-04-17',
    flights: 2,
    hotels: 0,
    activities: 4,
  },
];

const columns = [
  { id: 'planned', title: 'Planned', color: 'blue' },
  { id: 'booked', title: 'Booked', color: 'purple' },
  { id: 'in_progress', title: 'In Progress', color: 'amber' },
  { id: 'completed', title: 'Completed', color: 'green' },
];

export default function TripBoardPage() {
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [draggedTrip, setDraggedTrip] = useState<Trip | null>(null);

  const groupedTrips = columns.reduce(
    (acc, column) => {
      acc[column.id] = trips.filter((trip) => trip.status === column.id);
      return acc;
    },
    {} as Record<string, Trip[]>
  );

  const handleDragStart = (trip: Trip) => {
    setDraggedTrip(trip);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (columnId: string) => {
    if (!draggedTrip) return;

    setTrips(
      trips.map((trip) =>
        trip.id === draggedTrip.id
          ? { ...trip, status: columnId as Trip['status'] }
          : trip
      )
    );
    setDraggedTrip(null);
  };

  const handleDeleteTrip = (tripId: string) => {
    setTrips(trips.filter((trip) => trip.id !== tripId));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trip Board</h1>
            <p className="text-gray-600 mt-1">Organize and track your travel plans</p>
          </div>
          <button
            onClick={() => setShowNewTripModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Plus className="w-5 h-5" />
            New Trip
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Trips</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{trips.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Planned</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {trips.filter((t) => t.status === 'planned').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">
              {trips.filter((t) => t.status === 'in_progress').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {trips.filter((t) => t.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <TripColumn
              key={column.id}
              column={column}
              trips={groupedTrips[column.id] || []}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
              onDragStart={handleDragStart}
              onDeleteTrip={handleDeleteTrip}
            />
          ))}
        </div>
      </div>

      {/* New Trip Modal */}
      {showNewTripModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Trip</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Handle form submission
                setShowNewTripModal(false);
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Trip Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Summer Vacation"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Destination
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Paris, France"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewTripModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
