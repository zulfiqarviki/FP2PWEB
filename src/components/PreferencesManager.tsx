'use client';

import { useState, useEffect } from 'react';
import { UserPreference } from '@/lib/types';

export default function PreferencesManager({ userId }: { userId: string }) {
  const [prefId, setPrefId] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserPreference>({
    user_id: userId,
    enable_notifications: false,
    temperature_unit: 'celsius',
    theme: 'light',
    language: 'en'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      const res = await fetch(`/api/preferences?user_id=${userId}`);
      const json = await res.json();
      if (json.success && json.data && json.data.length > 0) {
        setSettings(json.data[0]);
        setPrefId(json.data[0].id);
      }
    };
    fetchPrefs();
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    const method = prefId ? 'PUT' : 'POST';
    const url = prefId ? `/api/preferences/${prefId}` : '/api/preferences';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    alert('Preferences saved!');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h3 className="text-xl font-bold">User Preferences</h3>
      <div className="p-6 space-y-4 border rounded bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        
        <div className="flex items-center justify-between">
          <label className="font-medium">Enable Notifications</label>
          <input 
            type="checkbox" 
            checked={settings.enable_notifications}
            onChange={e => setSettings({...settings, enable_notifications: e.target.checked})}
            className="w-5 h-5"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Temperature Unit</label>
          <select 
            className="w-full p-2 border rounded bg-zinc-50 dark:bg-zinc-800"
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
            className="w-full p-2 border rounded bg-zinc-50 dark:bg-zinc-800"
            value={settings.theme}
            onChange={e => setSettings({...settings, theme: e.target.value as any})}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full py-2 mt-4 font-bold text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}