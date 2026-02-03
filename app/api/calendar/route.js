import { NextResponse } from 'next/server';
import { getTodayEvents, getUpcomingEvents } from '@/lib/calendar';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'today';
    const days = parseInt(searchParams.get('days') || '7');
    
    let events = [];
    
    if (type === 'today') {
      events = await getTodayEvents();
    } else if (type === 'upcoming') {
      events = await getUpcomingEvents(days);
    }
    
    return NextResponse.json({
      success: true,
      events,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Calendar API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
