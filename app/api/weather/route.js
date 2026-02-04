import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
    const lat = process.env.NEXT_PUBLIC_WEATHER_LAT || '37.5665';
    const lon = process.env.NEXT_PUBLIC_WEATHER_LON || '126.9780';

    if (!apiKey || apiKey === 'your_openweathermap_api_key') {
      return NextResponse.json({
        success: false,
        error: 'Weather API key not configured',
      });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`;

    const response = await fetch(url, {
      next: { revalidate: 600 }, // 10분 캐시
    });

    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    const data = await response.json();

    const weatherData = {
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      city: data.name,
    };

    return NextResponse.json({
      success: true,
      data: weatherData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Weather API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
