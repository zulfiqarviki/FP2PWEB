'use client';

import { useState, useEffect } from 'react';
import { UserPreference } from '@/lib/types';

export default function PreferencesManager({ userId, token }: { userId: string; token: string }) {
  const [prefId, setPrefId] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserPreference>({
    user_id: userId,
    enable_notifications: false,
    temperature_unit: 'celsius',
    theme: 'light',
    language: 'en',
  });
  const [saving, setSaving] = useState(false);

  const applyThemeVisuals = (themeMode: string) => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await fetch(`/api/preferences?user_id=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const json = await res.json();
        
        if (json.success && json.data && json.data.length > 0) {
          const prefs = json.data[0];
          setSettings(prefs);
          setPrefId(prefs.id);
          applyThemeVisuals(prefs.theme || 'light');
        } else {
          const savedTheme = localStorage.getItem('app-theme');
          if (savedTheme) {
            setSettings(prev => ({ ...prev, theme: savedTheme as any }));
            applyThemeVisuals(savedTheme);
          } else {
            setSettings(prev => ({ ...prev, theme: 'light' }));
            applyThemeVisuals('light');
            localStorage.setItem('app-theme', 'light');
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPrefs();
  }, [userId, token]);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setSettings({ ...settings, theme: newTheme });
  };

  const handleSave = async () => {
    setSaving(true);
    const method = prefId ? 'PUT' : 'POST';
    const url = prefId ? `/api/preferences/${prefId}` : '/api/preferences';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (data.success) {
        if (!prefId && data.data?.id) {
          setPrefId(data.data.id);
        }
        
        if (settings.theme) {
          localStorage.setItem('app-theme', settings.theme);
          applyThemeVisuals(settings.theme);
          window.dispatchEvent(new Event('theme-changed'));
        }

        alert('Preferences saved!');
      } else {
        alert('Failed to save preferences: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error saving preferences');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h3 className="text-xl font-bold">User Preferences</h3>
      <div className="p-6 space-y-4 border rounded bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <div>
          <label className="block mb-1 text-sm font-medium">Temperature Unit</label>
          <select 
            className="w-full p-2 border rounded bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
            value={settings.temperature_unit}
            onChange={e => setSettings({...settings, temperature_unit: e.target.value as any})}
          >
            <option value="celsius">Celsius</option>
            <option value="fahrenheit">Fahrenheit</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">App Theme</label>
          <select 
            className="w-full p-2 border rounded bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
            value={settings.theme}
            onChange={e => handleThemeChange(e.target.value as 'light' | 'dark')}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full py-2 mt-4 font-bold text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}