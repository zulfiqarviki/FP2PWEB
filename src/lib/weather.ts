/**
 * Weather Service for Laundry Drying Index
 * Integrates with OpenWeatherMap API to fetch weather data
 * This service calculates drying conditions based on weather parameters
 */

export interface WeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  cloudiness: number;
  description: string;
  uv_index?: number;
  precipitation?: number;
  timestamp: string;
}

export interface DryingIndexResult {
  drying_index: number; // 0-100, higher = better for drying
  conditions: string;
  recommendations: string[];
  optimal_for_drying: boolean;
  factors: {
    temperature_factor: number;
    humidity_factor: number;
    wind_factor: number;
    cloudiness_factor: number;
    uv_factor?: number;
  };
}

const OPENWEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';
const APPID_PARAM = 'APPID'; // OpenWeatherMap uses APPID instead of appid

/**
 * Fetch weather data for a specific location (by coordinates)
 * @param latitude - Location latitude
 * @param longitude - Location longitude
 * @returns Weather data including temperature, humidity, wind speed, etc.
 */
export async function getWeatherByCoordinates(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    throw new Error('OpenWeather API key not configured');
  }

  try {
    const url = `${OPENWEATHER_API_BASE}/weather?lat=${latitude}&lon=${longitude}&units=metric&APPID=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      temperature: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      cloudiness: data.clouds.all,
      description: data.weather[0].description,
      precipitation: data.rain?.['1h'] || 0,
      timestamp: new Date(data.dt * 1000).toISOString(),
    };
  } catch (error: any) {
    console.error('Error fetching weather:', error);
    throw new Error(`Failed to fetch weather data: ${error.message}`);
  }
}

/**
 * Fetch weather data by city name
 * @param city - City name
 * @returns Weather data including temperature, humidity, wind speed, etc.
 */
export async function getWeatherByCity(city: string): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    throw new Error('OpenWeather API key not configured');
  }

  try {
    const url = `${OPENWEATHER_API_BASE}/weather?q=${city}&units=metric&APPID=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenWeatherMap API Response:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(`Weather API error (${response.status}): ${errorData?.message || response.statusText}`);
    }

    const data = await response.json();

    return {
      temperature: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      cloudiness: data.clouds.all,
      description: data.weather[0].description,
      precipitation: data.rain?.['1h'] || 0,
      timestamp: new Date(data.dt * 1000).toISOString(),
    };
  } catch (error: any) {
    console.error('Error fetching weather by city:', error);
    throw new Error(`Failed to fetch weather data: ${error.message}`);
  }
}

/**
 * Calculate drying index based on weather conditions
 * Considers: temperature, humidity, wind speed, cloudiness
 * 
 * Algorithm:
 * - Temperature: Optimal between 25-35°C (factor: 0-100)
 * - Humidity: Lower is better, optimal < 60% (factor: 0-100)
 * - Wind Speed: Optimal 5-15 km/h (factor: 0-100)
 * - Cloudiness: Lower is better (factor: 0-100)
 * - UV Index: Higher is better for disinfection (factor: 0-100)
 */
export function calculateDryingIndex(weather: WeatherData): DryingIndexResult {
  // Temperature factor (25-35°C is optimal)
  const temperatureFactor = calculateTemperatureFactor(weather.temperature);

  // Humidity factor (lower is better, optimal < 60%)
  const humidityFactor = calculateHumidityFactor(weather.humidity);

  // Wind factor (5-15 km/h is optimal)
  const windFactor = calculateWindFactor(weather.wind_speed);

  // Cloudiness factor (lower is better)
  const cloudinessAlternative = calculateCloudinessAlternative(weather.cloudiness);

  // UV factor (estimated from time of day - simplified for now)
  const uvFactor = 50; // Default moderate UV

  // Calculate weighted average
  const weights = {
    temperature: 0.25,
    humidity: 0.35,
    wind: 0.25,
    cloudiness: 0.15,
  };

  const dryingIndex =
    temperatureFactor * weights.temperature +
    humidityFactor * weights.humidity +
    windFactor * weights.wind +
    cloudinessAlternative * weights.cloudiness;

  // Determine conditions and recommendations
  const conditions = getConditionsDescription(dryingIndex);
  const recommendations = getRecommendations(
    dryingIndex,
    weather,
    temperatureFactor,
    humidityFactor,
    windFactor
  );

  const optimalForDrying = dryingIndex >= 70;

  return {
    drying_index: Math.round(dryingIndex),
    conditions,
    recommendations,
    optimal_for_drying: optimalForDrying,
    factors: {
      temperature_factor: Math.round(temperatureFactor),
      humidity_factor: Math.round(humidityFactor),
      wind_factor: Math.round(windFactor),
      cloudiness_factor: Math.round(cloudinessAlternative),
      uv_factor: Math.round(uvFactor),
    },
  };
}

function calculateTemperatureFactor(temp: number): number {
  // Optimal range: 25-35°C
  if (temp >= 25 && temp <= 35) {
    return 100;
  } else if (temp >= 20 && temp < 25) {
    return 60 + (temp - 20) * 8; // 60 at 20°C, 100 at 25°C
  } else if (temp > 35 && temp <= 40) {
    return 100 - (temp - 35) * 20; // 100 at 35°C, 0 at 40°C
  } else if (temp < 20) {
    return Math.max(0, 20 + temp * 2);
  } else {
    return Math.max(0, 100 - (temp - 40) * 5);
  }
}

function calculateHumidityFactor(humidity: number): number {
  // Lower humidity is better for drying
  // Optimal: < 60%
  if (humidity <= 40) {
    return 100;
  } else if (humidity <= 60) {
    return 100 - (humidity - 40) * 1.5; // Gradual decrease
  } else if (humidity <= 80) {
    return 70 - (humidity - 60) * 1; // Further decrease
  } else {
    return Math.max(0, 50 - (humidity - 80) * 0.5);
  }
}

function calculateWindFactor(windSpeed: number): number {
  // Wind speed in km/h, optimal: 5-15 km/h
  // Convert from m/s if needed: windSpeed is in m/s from API
  const windKmh = windSpeed * 3.6;

  if (windKmh <= 0) {
    return 20; // No wind, very low factor
  } else if (windKmh >= 5 && windKmh <= 15) {
    return 100; // Optimal range
  } else if (windKmh < 5) {
    return 20 + (windKmh / 5) * 80; // 20 to 100
  } else if (windKmh > 15 && windKmh <= 25) {
    return 100 - (windKmh - 15) * 5; // 100 to 50
  } else {
    return Math.max(0, 50 - (windKmh - 25) * 2);
  }
}

function calculateCloudinessAlternative(cloudiness: number): number {
  // Cloudiness is 0-100%, lower is better
  // 0% = 100 factor, 100% = 0 factor
  return Math.max(0, 100 - cloudiness);
}

function getConditionsDescription(index: number): string {
  if (index >= 80) {
    return 'Excellent drying conditions';
  } else if (index >= 60) {
    return 'Good drying conditions';
  } else if (index >= 40) {
    return 'Fair drying conditions';
  } else if (index >= 20) {
    return 'Poor drying conditions';
  } else {
    return 'Very poor drying conditions';
  }
}

function getRecommendations(
  index: number,
  weather: WeatherData,
  tempFactor: number,
  humidityFactor: number,
  windFactor: number
): string[] {
  const recommendations: string[] = [];

  // Temperature recommendations
  if (tempFactor < 50) {
    if (weather.temperature < 20) {
      recommendations.push('Temperature is too low. Consider drying indoors with ventilation.');
    } else if (weather.temperature > 40) {
      recommendations.push('Temperature is too high. Drying may be too fast and uneven.');
    }
  }

  // Humidity recommendations
  if (humidityFactor < 50) {
    if (weather.humidity > 80) {
      recommendations.push('Very high humidity. Drying will be significantly slower.');
    } else if (weather.humidity > 60) {
      recommendations.push('High humidity detected. Allow extra drying time.');
    }
  }

  // Wind recommendations
  if (windFactor < 40) {
    if (weather.wind_speed < 0.5) {
      recommendations.push('Very calm conditions. Wind speed is too low for optimal drying.');
    } else if (weather.wind_speed > 9) {
      recommendations.push('Very strong wind. Secure laundry to prevent damage or loss.');
    }
  }

  // Precipitation
  if (weather.precipitation && weather.precipitation > 0) {
    recommendations.push('Rain or precipitation expected. Consider indoor drying.');
  }

  // General recommendations based on index
  if (index >= 80) {
    recommendations.push('Perfect time to dry laundry outside!');
  } else if (index >= 60) {
    recommendations.push('Good conditions. Laundry will dry efficiently.');
  } else if (index < 30) {
    recommendations.push('Not ideal for outdoor drying. Consider using a dryer or wait for better conditions.');
  }

  return recommendations.length > 0
    ? recommendations
    : ['Current conditions are acceptable for drying laundry.'];
}
