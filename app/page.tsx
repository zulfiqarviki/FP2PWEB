'use client';

import { useState, useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import LocationsManager from '@/components/LocationsManager';
import PreferencesManager from '@/components/PreferencesManager';
import WeatherDashboard from '@/components/WeatherDashboard';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // Default tab dashboard
  const [isLoading, setIsLoading] = useState(true);

  // 1. Cek Token & User ID saat pertama kali load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUserId = localStorage.getItem('userId');
    
    if (savedToken && savedUserId) {
      setToken(savedToken);
      setUserId(savedUserId);
    }
    setIsLoading(false);
  }, []);

  // 2. Logika Tema (Dark Mode)
  useEffect(() => {
    const applyTheme = () => {
      // Default ke light jika belum ada settingan
      let savedTheme = localStorage.getItem('app-theme') || 'light';
      
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    const handleThemeChange = () => applyTheme();
    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  // Fungsi Login
  const handleLogin = (newToken: string, newUserId: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
    setToken(newToken);
    setUserId(newUserId);
  };

  // Fungsi Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken(null);
    setUserId(null);
    setActiveTab('dashboard');
  };

  // Loading Screen Sederhana
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black text-zinc-500">Loading...</div>;
  }

  // Tampilkan Form Login jika belum masuk
  if (!token || !userId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4 transition-colors duration-300">
        <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold text-center mb-8 text-zinc-800 dark:text-zinc-100">Laundry Drying Index</h1>
            <AuthForm onLogin={handleLogin} />
        </div>
      </main>
    );
  }

  // Tampilkan Dashboard jika sudah masuk
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* Simple Icon */}
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
            <h1 className="text-xl font-bold">Laundry Index</h1>
          </div>
          <button 
            onClick={handleLogout} 
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex space-x-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl mb-8 w-fit border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'locations'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Manage Locations
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'preferences'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Preferences
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'dashboard' && (
            <div>
                <h2 className="text-2xl font-bold mb-6">Current Conditions</h2>
                <WeatherDashboard userId={userId} token={token} />
            </div>
          )}
          
          {activeTab === 'locations' && (
            <LocationsManager userId={userId} token={token} />
          )}
          
          {activeTab === 'preferences' && (
            <PreferencesManager userId={userId} token={token} />
          )}
        </div>
      </main>
    </div>
  );
}