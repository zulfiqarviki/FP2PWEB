import { NextRequest, NextResponse } from 'next/server';
import { getWeatherByCity, getWeatherByCoordinates, calculateDryingIndex } from '@/lib/weather';

/**
 * GET /api/weather?city=Jakarta
 * GET /api/weather?latitude=-6.2088&longitude=106.8456
 * 
 * Returns weather data and drying index for a location
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');

    // Validate parameters
    if (!city && (!latitude || !longitude)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either city name or coordinates (latitude, longitude) are required',
        },
        { status: 400 }
      );
    }

    let weatherData;

    try {
      if (city) {
        // Fetch by city name
        weatherData = await getWeatherByCity(city);
      } else {
        // Fetch by coordinates
        const lat = parseFloat(latitude!);
        const lon = parseFloat(longitude!);

        if (isNaN(lat) || isNaN(lon)) {
          return NextResponse.json(
            { success: false, error: 'Invalid latitude or longitude values' },
            { status: 400 }
          );
        }

        weatherData = await getWeatherByCoordinates(lat, lon);
      }
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Calculate drying index
    const dryingResult = calculateDryingIndex(weatherData);

    return NextResponse.json(
      {
        success: true,
        data: {
          weather: weatherData,
          drying_index: dryingResult,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Weather API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Weather API failed' },
      { status: 500 }
    );
  }
}
