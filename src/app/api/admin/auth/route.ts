import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const validPwd = process.env.ADMIN_PASSWORD || 'ironetch2026';

    if (password === validPwd) {
      const response = NextResponse.json({ success: true });
      // Set secure HTTP-only cookie
      response.cookies.set('ironetch_admin', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 24 hours
      });
      return response;
    }

    return NextResponse.json({ error: 'Invalid Control Center authorization code.' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('ironetch_admin');
  return response;
}
