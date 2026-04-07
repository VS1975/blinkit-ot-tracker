import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, password } = body;

    // Hardcoded credentials
    const VALID_ID = 'user_blinkit';
    const VALID_PASSWORD = 'Blinkit';

    if (id === VALID_ID && password === VALID_PASSWORD) {
      const response = NextResponse.json(
        { success: true, message: 'Login successful' },
        { status: 200 }
      );
      
      // Set session cookie
      response.cookies.set('admin_session', 'valid', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
