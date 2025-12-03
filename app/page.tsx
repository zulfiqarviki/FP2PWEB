'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AuthForm from '@/components/AuthForm';
import LocationsManager from '@/components/LocationsManager';
import PreferencesManager from '@/components/PreferencesManager';

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('locations');
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserId(null);
  };

  
  useEffect(() => {
    if (userId) {
      fetch(`/api/alerts?user_id=${userId}&is_read=false`)
        .then(res => res.json())
        .then(data => {
          if(data.success) setAlerts(data.data);
        });
    }
  }, [userId]);

  if (!userId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
        <AuthForm onLogin={setUserId} />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Laundry Index</h1>
          <button onClick={handleLogout} className="text-sm font-medium text-red-500 hover:text-red-600">
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Alerts Banner */}
        {alerts.length > 0 && (
          <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-2">Active Alerts</h3>
            <ul className="list-disc pl-5 space-y-1">
              {alerts.map((alert: any) => (
                <li key={alert.id} className="text-amber-700 dark:text-amber-300">
                  {alert.message} ({alert.severity})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6">
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'locations' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Locations
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'preferences' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Preferences
          </button>
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {activeTab === 'locations' && <LocationsManager userId={userId} />}
          {activeTab === 'preferences' && <PreferencesManager userId={userId} />}
        </div>
      </main>
    </div>
  );
}