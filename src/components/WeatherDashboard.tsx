'use client';

import { useState, useEffect } from 'react';

interface WeatherDashboardProps {
  userId: string;
  token: string;
}

export default function WeatherDashboard({ userId, token }: WeatherDashboardProps) {
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State untuk menyimpan unit suhu pilihan user (Default Celsius)
  const [tempUnit, setTempUnit] = useState<'celsius' | 'fahrenheit'>('celsius');

  //Fetch Data Cuaca & Preferensi secara bersamaan
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [weatherRes, prefsRes] = await Promise.all([
          fetch('/api/weather/locations', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`/api/preferences?user_id=${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          })
        ]);

        const weatherJson = await weatherRes.json();
        const prefsJson = await prefsRes.json();

        // Handle Weather Data
        if (weatherJson.success) {
          setWeatherData(weatherJson.data || []);
        } else {
          if (weatherJson.message === 'No locations found for this user') {
            setWeatherData([]);
          } else {
            setError(weatherJson.error || 'Failed to load weather data');
          }
        }

        // Handle Preferences Data
        if (prefsJson.success && prefsJson.data && prefsJson.data.length > 0) {
          const userPref = prefsJson.data[0];
          if (userPref.temperature_unit) {
            setTempUnit(userPref.temperature_unit);
          }
        }

      } catch (err) {
        console.error(err);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, token]);

  //Helper: Fungsi Konversi Suhu
  const formatTemp = (celsius: number) => {
    if (tempUnit === 'fahrenheit') {
      const fahrenheit = (celsius * 9 / 5) + 32;
      return `${Math.round(fahrenheit)}°F`;
    }
    return `${Math.round(celsius)}°C`;
  };

  // Helper untuk warna score drying index
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getCardBorder = (score: number) => {
    if (score >= 80) return 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10';
    if (score >= 60) return 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/10';
    if (score >= 40) return 'border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/10';
    return 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10';
  };

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading weather data...</div>;

  if (error) return <div className="p-4 text-red-500 bg-red-100 rounded">{error}</div>;

  if (!weatherData || weatherData.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-2">No locations monitored yet.</p>
        <p className="text-sm text-zinc-500">Go to the <strong>Manage Locations</strong> tab to add a city.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {weatherData.map((item, index) => {
        if (!item || !item.location) return null;

        const { location, weather, drying_index } = item;
        const key = location.id || index;

        if (item.error) {
            return (
                <div key={key} className="p-6 border rounded-lg border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900">
                    <h3 className="text-lg font-bold">{location.name || 'Unknown Location'}</h3>
                    <p className="text-sm text-zinc-500 mb-2">{location.city}</p>
                    <div className="p-3 bg-white dark:bg-black rounded border border-red-100 dark:border-red-800">
                      <p className="text-red-500 text-xs font-mono">{item.error}</p>
                    </div>
                </div>
            )
        }

        const score = drying_index?.drying_index || 0;
        const condition = drying_index?.conditions || 'Unknown';
        const recommendation = drying_index?.recommendations?.[0] || 'No data available';

        return (
          <div 
            key={key} 
            className={`p-6 border rounded-xl shadow-sm transition-all hover:shadow-md ${getCardBorder(score)}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{location.name}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{location.city}</p>
              </div>
              
   
              <div className="text-right flex flex-col items-end">
                <div className="flex items-baseline">
                    <span className={`text-4xl font-black ${getScoreColor(score)}`}>
                    {score}
                    </span>
                    <span className="text-sm font-medium text-zinc-400 ml-1">/100</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Drying Index</p>
              </div>
              {/* --------------------------------------------------- */}
            </div>

            <div className="mb-4">
              <p className="font-medium text-lg">{condition}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
                {recommendation}
              </p>
            </div>

            {weather && (
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-zinc-200/50 dark:border-zinc-700/50">
                <div>
                  <p className="text-xs text-zinc-500">Temperature</p>
                  <p className="font-semibold">{formatTemp(weather.temperature || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Humidity</p>
                  <p className="font-semibold">{weather.humidity || 0}%</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Wind</p>
                  <p className="font-semibold">{weather.wind_speed || 0} m/s</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Clouds</p>
                  <p className="font-semibold">{weather.cloudiness || 0}%</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}