import { NextRequest, NextResponse } from 'next/server';
import { signSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validUsername || !validPassword) {
    return NextResponse.json(
      { ok: false, error: 'Admin credentials are not configured on the server.' },
      { status: 500 }
    );
  }

  if (username === validUsername && password === validPassword) {
    const token = await signSession({ role: 'admin' }, '12h');
    const res = NextResponse.json({ ok: true });
    res.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    });
    return res;
  }

  return NextResponse.json({ ok: false, error: 'Invalid username or password' }, { status: 401 });
}
