import { NextResponse } from 'next/server';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, error: '비밀번호를 입력해주세요' },
        { status: 400 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: '비밀번호가 올바르지 않습니다' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken();

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: '로그인 성공'
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: '로그인 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
