import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getWeatherByCity, calculateDryingIndex } from '@/lib/weather';
import { getTokenFromHeader, verifyToken } from '@/lib/jwt';


export async function GET(request: NextRequest) {
  try {
    
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = getTokenFromHeader(authHeader);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Invalid token format' },
        { status: 401 }
      );
    }

   
    const decoded = verifyToken(token);
    
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    

    const userId = decoded.id;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

   
    const { data: locations, error: locationsError } = await adminClient
      .from('locations')
      .select('id, user_id, name, city, latitude, longitude')
      .eq('user_id', userId);

    if (locationsError) throw locationsError;

    if (!locations || locations.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: [],
          message: 'No locations found for this user',
        },
        { status: 200 }
      );
    }

   
    const weatherResults = await Promise.all(
      locations.map(async (location: any) => {
        try {
          const weatherData = await getWeatherByCity(location.city);
          const dryingResult = calculateDryingIndex(weatherData);

          return {
            location: {
              id: location.id,
              name: location.name,
              city: location.city,
              latitude: location.latitude,
              longitude: location.longitude,
            },
            weather: weatherData,
            drying_index: dryingResult,
            timestamp: new Date().toISOString(),
          };
        } catch (error: any) {
          
          return {
            location: {
              id: location.id,
              name: location.name,
              city: location.city,
            },
            error: error.message || 'Failed to fetch weather',
            timestamp: new Date().toISOString(),
          };
        }
      })
    );

    return NextResponse.json(
      {
        success: true,
        data: weatherResults,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Weather Locations API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch weather for locations' },
      { status: 500 }
    );
  }
}