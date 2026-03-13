import { NextRequest, NextResponse } from 'next/server';
import { normalizeSriLankanPhone } from '@/lib/phone';
import { verifyOtp } from '@/lib/otp-store';

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();
    const normalized = normalizeSriLankanPhone(phone || '');

    if (!code || String(code).length !== 6) {
      return NextResponse.json({ error: 'Please enter a valid 6-digit code.' }, { status: 400 });
    }

    const result = verifyOtp(normalized, String(code));
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const response = NextResponse.json({
      ok: true,
      message: 'Phone verified successfully',
    });

    response.cookies.set('ec_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    response.cookies.set('ec_user_phone', normalized, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
