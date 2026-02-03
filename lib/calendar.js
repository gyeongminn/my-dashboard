import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

function getAuth() {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    SCOPES
  );
  return auth;
}

export async function getCalendarEvents(timeMin, timeMax) {
  try {
    const auth = getAuth();
    const calendar = google.calendar({ version: 'v3', auth });
    
    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax,
      maxResults: 20,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    return (response.data.items || []).map(event => ({
      id: event.id,
      title: event.summary || '(제목 없음)',
      description: event.description,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      isAllDay: !event.start?.dateTime,
      location: event.location,
      htmlLink: event.htmlLink,
      status: event.status,
    }));
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}

export async function getTodayEvents() {
  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();
  
  return getCalendarEvents(startOfDay, endOfDay);
}

export async function getUpcomingEvents(days = 7) {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);
  
  return getCalendarEvents(now.toISOString(), future.toISOString());
}
