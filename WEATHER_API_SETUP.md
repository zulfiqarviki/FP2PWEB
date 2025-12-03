# Weather API Integration Guide

## Overview

This backend integrates with **OpenWeatherMap API** to provide real-time weather data and calculate a **Laundry Drying Index** (0-100) based on weather conditions. The drying index helps users determine optimal times for outdoor laundry drying.

## Setup Instructions

### 1. Get OpenWeatherMap API Key

1. Go to https://openweathermap.org/api
2. Sign up for a free account
3. Navigate to **API keys** section
4. Copy your API key (you'll get one by default, or create a new one)

### 2. Add Environment Variable

Add the following to your `.env.local` file:

```env
OPENWEATHER_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual OpenWeatherMap API key.

### 3. Restart Dev Server

```bash
npm run dev
```

## API Endpoints

### 1. Get Weather by City Name

**Endpoint:** `GET /api/weather?city=Jakarta`

**Parameters:**
- `city` (string, required): City name (e.g., "Jakarta", "New York")

**Response:**
```json
{
  "success": true,
  "data": {
    "weather": {
      "temperature": 28.5,
      "feels_like": 30.2,
      "humidity": 75,
      "wind_speed": 4.2,
      "cloudiness": 40,
      "description": "partly cloudy",
      "precipitation": 0,
      "timestamp": "2025-12-03T10:30:00.000Z"
    },
    "drying_index": {
      "drying_index": 65,
      "conditions": "Good drying conditions",
      "recommendations": [
        "Good conditions. Laundry will dry efficiently."
      ],
      "optimal_for_drying": true,
      "factors": {
        "temperature_factor": 100,
        "humidity_factor": 50,
        "wind_factor": 75,
        "cloudiness_factor": 60,
        "uv_factor": 50
      }
    }
  }
}
```

### 2. Get Weather by Coordinates

**Endpoint:** `GET /api/weather?latitude=-6.2088&longitude=106.8456`

**Parameters:**
- `latitude` (number, required): Latitude coordinate
- `longitude` (number, required): Longitude coordinate

**Response:** Same as city endpoint

### 3. Get Weather for All User Locations

**Endpoint:** `GET /api/weather/locations`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "location": {
        "id": "loc-123",
        "name": "Home",
        "city": "Jakarta",
        "latitude": -6.2088,
        "longitude": 106.8456
      },
      "weather": { ... },
      "drying_index": { ... },
      "timestamp": "2025-12-03T10:30:00.000Z"
    },
    {
      "location": {
        "id": "loc-456",
        "name": "Office",
        "city": "Bandung",
        "latitude": -6.9147,
        "longitude": 107.6098
      },
      "weather": { ... },
      "drying_index": { ... },
      "timestamp": "2025-12-03T10:30:00.000Z"
    }
  ]
}
```

## Drying Index Calculation

The drying index (0-100) is calculated based on four weather factors:

### Factors:

1. **Temperature Factor (25% weight)**
   - Optimal range: 25-35°C
   - Score: 0-100

2. **Humidity Factor (35% weight)**
   - Optimal: < 60%
   - Lower humidity = better for drying
   - Score: 0-100

3. **Wind Speed Factor (25% weight)**
   - Optimal range: 5-15 km/h
   - No wind or excessive wind = poor drying
   - Score: 0-100

4. **Cloudiness Factor (15% weight)**
   - Lower cloudiness = faster UV-based drying
   - Score: 0-100

### Formula:
```
Drying Index = 
  (Temperature Factor × 0.25) + 
  (Humidity Factor × 0.35) + 
  (Wind Factor × 0.25) + 
  (Cloudiness Factor × 0.15)
```

### Index Ranges:

- **80-100**: Excellent drying conditions ✅
- **60-79**: Good drying conditions ✅
- **40-59**: Fair drying conditions ⚠️
- **20-39**: Poor drying conditions ❌
- **0-19**: Very poor drying conditions ❌❌

## Testing the API

### Using Postman

1. **Get weather by city:**
   ```
   GET http://localhost:3000/api/weather?city=Jakarta
   ```

2. **Get weather by coordinates:**
   ```
   GET http://localhost:3000/api/weather?latitude=-6.2088&longitude=106.8456
   ```

3. **Get weather for all user locations (requires authentication):**
   ```
   GET http://localhost:3000/api/weather/locations
   Headers: Authorization: Bearer <your_jwt_token>
   ```

### Using cURL

```bash
# Get weather by city
curl "http://localhost:3000/api/weather?city=Jakarta"

# Get weather by coordinates
curl "http://localhost:3000/api/weather?latitude=-6.2088&longitude=106.8456"

# Get weather for user locations (with token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/weather/locations"
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common error codes:
- **400**: Bad request (missing or invalid parameters)
- **401**: Unauthorized (missing or invalid JWT token)
- **500**: Server error (API configuration or external service failure)

## Important Notes

- The free tier of OpenWeatherMap has rate limits (60 calls/minute for free)
- API responses are cached by weather services, so expect data to be 10-30 minutes old
- For production, consider implementing response caching to reduce API calls
- Wind speed is received in m/s and converted to km/h in the calculations
- All timestamps are in ISO 8601 format (UTC)

## Weather Service Architecture

```
src/lib/weather.ts
├── getWeatherByCoordinates()      - Fetch weather by lat/lon
├── getWeatherByCity()              - Fetch weather by city name
├── calculateDryingIndex()          - Calculate drying score
└── Helper functions
    ├── calculateTemperatureFactor()
    ├── calculateHumidityFactor()
    ├── calculateWindFactor()
    ├── calculateCloudinessAlternative()
    ├── getConditionsDescription()
    └── getRecommendations()

app/api/weather/route.ts           - Main weather endpoint
app/api/weather/locations/route.ts - Multi-location weather endpoint
```

## Future Enhancements

- [ ] Add historical weather data caching in database
- [ ] Implement weather alerts for extreme conditions
- [ ] Add support for forecast data (next 5 days)
- [ ] Add response caching to reduce API calls
- [ ] Add weather data logging for user insights
- [ ] Support for multiple weather providers (fallback)
- [ ] Add UV index calculations
- [ ] Add pollen data integration

## Support

For issues with the weather API integration, check:
1. `.env.local` has `OPENWEATHER_API_KEY` set correctly
2. OpenWeatherMap account is active and API key is valid
3. Rate limits haven't been exceeded
4. Network connectivity to OpenWeatherMap service
5. Check console logs for detailed error messages
