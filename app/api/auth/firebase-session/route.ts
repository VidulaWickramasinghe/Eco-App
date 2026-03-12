import { NextRequest, NextResponse } from 'next/server';
import { normalizeSriLankanPhone } from '@/lib/phone';

export async function POST(req: NextRequest) {
  try {
    const { idToken, phone } = await req.json();

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'Missing Firebase ID token.' }, { status: 400 });
    }

    const normalized = normalizeSriLankanPhone(phone || '');

    const response = NextResponse.json({
      ok: true,
      message: 'Authenticated with Firebase',
    });

    response.cookies.set('ec_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    if (normalized) {
      response.cookies.set('ec_user_phone', normalized, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });
    }

    return response;
  } catch {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
