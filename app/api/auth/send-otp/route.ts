import { NextRequest, NextResponse } from 'next/server';
import { isValidSriLankanPhone, normalizeSriLankanPhone } from '@/lib/phone';
import { sendOtpSms } from '@/lib/twilio';

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    const normalized = normalizeSriLankanPhone(phone);

    if (!isValidSriLankanPhone(normalized)) {
      return NextResponse.json(
        { error: 'Please enter a valid Sri Lankan mobile number' },
        { status: 400 }
      );
    }

    const otp = generateOtp();
    await sendOtpSms(normalized, otp);

    const response = NextResponse.json({
      ok: true,
      message: 'OTP sent successfully',
    });

    response.cookies.set('ec_otp', otp, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 5 * 60,
      path: '/',
    });

    response.cookies.set('ec_phone_tmp', normalized, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 5 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to send OTP';

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}