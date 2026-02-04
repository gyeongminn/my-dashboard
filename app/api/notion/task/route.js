import { NextResponse } from 'next/server';
import { createTask, updateTask } from '@/lib/notion';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 작업 생성
export async function POST(request) {
  try {
    const data = await request.json();

    if (!data.title) {
      return NextResponse.json(
        { success: false, error: '작업명은 필수입니다' },
        { status: 400 }
      );
    }

    const task = await createTask(data);

    return NextResponse.json({
      success: true,
      data: task,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API Error (Create Task):', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 작업 수정
export async function PATCH(request) {
  try {
    const { id, ...data } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: '작업 ID가 필요합니다' },
        { status: 400 }
      );
    }

    const task = await updateTask(id, data);

    return NextResponse.json({
      success: true,
      data: task,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API Error (Update Task):', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
