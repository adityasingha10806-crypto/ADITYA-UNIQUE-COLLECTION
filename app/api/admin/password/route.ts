import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password || typeof password !== 'string' || password.length < 4) {
    return NextResponse.json(
      { ok: false, error: 'Password must be at least 4 characters.' },
      { status: 400 }
    );
  }

  const hash = await bcrypt.hash(password, 10);
  await kv.set('gallery_password_hash', hash);

  return NextResponse.json({ ok: true });
}
