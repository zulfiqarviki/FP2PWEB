export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Location {
  id?: string;
  user_id: string;
  name: string;
  city: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WeatherAlert {
  id?: string;
  user_id: string;
  location_id: string;
  alert_type: string;
  message: string;
  severity?: 'low' | 'medium' | 'high';
  is_read?: boolean;
  expires_at?: string;
  created_at?: string;
}

export interface UserPreference {
  id?: string;
  user_id: string;
  enable_notifications?: boolean;
  notification_time?: string;
  temperature_unit?: 'celsius' | 'fahrenheit';
  language?: 'id' | 'en';
  theme?: 'light' | 'dark';
  created_at?: string;
  updated_at?: string;
}