import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import bcrypt from 'bcryptjs';
import { signSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  const hash = await kv.get<string>('gallery_password_hash');

  if (!hash) {
    return NextResponse.json(
      { ok: false, error: 'No gallery password has been set yet. Ask the admin to set one first.' },
      { status: 400 }
    );
  }

  const match = await bcrypt.compare(password || '', hash);

  if (!match) {
    return NextResponse.json({ ok: false, error: 'Incorrect password' }, { status: 401 });
  }

  const token = await signSession({ role: 'gallery' }, '24h');
  const res = NextResponse.json({ ok: true });
  res.cookies.set('gallery_session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  return res;
}
