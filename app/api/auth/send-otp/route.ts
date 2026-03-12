import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error:
        'This endpoint is deprecated. OTP is now sent from the client via Firebase Phone Authentication.',
    },
    { status: 410 }
  );
}
