import { NextRequest, NextResponse } from 'next/server';
import { isValidSriLankanPhone, normalizeSriLankanPhone } from '@/lib/phone';
import { generateOtpCode, saveOtp } from '@/lib/otp-store';
import { sendOtpSms } from '@/lib/twilio';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    const normalized = normalizeSriLankanPhone(phone || '');

    if (!isValidSriLankanPhone(normalized)) {
      return NextResponse.json(
        { error: 'Please enter a valid Sri Lankan mobile number' },
        { status: 400 }
      );
    }

    const otp = generateOtpCode();
    saveOtp(normalized, otp);
    await sendOtpSms(normalized, otp);

    return NextResponse.json({
      ok: true,
      message: 'OTP sent successfully',
      expiresInSeconds: 300,
      maxUses: 2,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send OTP';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
