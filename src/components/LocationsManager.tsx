'use client';

import { useState, useEffect } from 'react';
import { Location } from '@/lib/types';

export default function LocationsManager({ userId, token }: { userId: string; token: string }) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [newLocation, setNewLocation] = useState({ name: '', city: '', latitude: '', longitude: '' });
  const [loading, setLoading] = useState(false);

  const fetchLocations = async () => {
    const res = await fetch(`/api/locations?user_id=${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (data.success) setLocations(data.data);
  };

  useEffect(() => {
    fetchLocations();
  }, [userId, token]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/locations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...newLocation,
        user_id: userId,
        latitude: parseFloat(newLocation.latitude) || 0,
        longitude: parseFloat(newLocation.longitude) || 0,
      }),
    });
    setNewLocation({ name: '', city: '', latitude: '', longitude: '' });
    await fetchLocations();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/locations/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    fetchLocations();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Your Locations</h3>

      {/* Add Location Form */}
      <form onSubmit={handleAdd} className="grid gap-4 p-4 border rounded bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 sm:grid-cols-2">
        <input placeholder="Label (e.g. Home)" className="p-2 border rounded" required value={newLocation.name} onChange={e => setNewLocation({ ...newLocation, name: e.target.value })} />
        <input placeholder="City" className="p-2 border rounded" required value={newLocation.city} onChange={e => setNewLocation({ ...newLocation, city: e.target.value })} />
        <input placeholder="Latitude" type="number" step="any" className="p-2 border rounded" value={newLocation.latitude} onChange={e => setNewLocation({ ...newLocation, latitude: e.target.value })} />
        <input placeholder="Longitude" type="number" step="any" className="p-2 border rounded" value={newLocation.longitude} onChange={e => setNewLocation({ ...newLocation, longitude: e.target.value })} />
        <button type="submit" disabled={loading} className="col-span-2 py-2 text-white bg-green-600 rounded hover:bg-green-700">
          {loading ? 'Adding...' : 'Add Location'}
        </button>
      </form>

      {/* Locations List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((loc) => (
          <div key={loc.id} className="p-4 border rounded shadow-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 flex justify-between items-start">
            <div>
              <h4 className="font-bold">{loc.name}</h4>
              <p className="text-sm text-zinc-500">{loc.city}</p>
              <p className="text-xs font-mono text-zinc-400">{loc.latitude}, {loc.longitude}</p>
            </div>
            <button onClick={() => loc.id && handleDelete(loc.id)} className="text-red-500 hover:text-red-700">
              Delete
            </button>
          </div>
        ))}
        {locations.length === 0 && <p className="text-zinc-500">No locations added yet.</p>}
      </div>
    </div>
  );
}