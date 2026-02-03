import { NextResponse } from 'next/server';
import { getTasks, getRoutines } from '@/lib/notion';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    let data = {};

    if (type === 'all' || type === 'tasks') {
      // 대기, 진행중, 보류 작업
      const activeTasks = await getTasks({
        filter: {
          or: [
            { property: '상태', select: { equals: '📥 대기' } },
            { property: '상태', select: { equals: '⏳ 진행중' } },
            { property: '상태', select: { equals: '📦 보류' } },
          ],
        },
      });

      // 최근 완료 작업
      const completedTasks = await getTasks({
        filter: {
          property: '상태',
          select: { equals: '✅ 완료' },
        },
        sorts: [{ property: '완료일', direction: 'descending' }],
      });

      data.tasks = {
        waiting: activeTasks.filter(t => t.status === '📥 대기'),
        inProgress: activeTasks.filter(t => t.status === '⏳ 진행중'),
        onHold: activeTasks.filter(t => t.status === '📦 보류'),
        completed: completedTasks.slice(0, 5),
      };
    }

    if (type === 'all' || type === 'routines') {
      data.routines = await getRoutines();
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
