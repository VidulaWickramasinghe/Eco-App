import { NextRequest, NextResponse } from 'next/server';
import { normalizeSriLankanPhone } from '@/lib/phone';

function getFirebaseApiKey() {
  return process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAPU7msqtNr_PisMje0sKV_yeCmLu_7H04';
}

async function verifyFirebaseIdToken(idToken: string) {
  const apiKey = getFirebaseApiKey();

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    }
  );

  if (!response.ok) {
    throw new Error('Invalid Firebase token.');
  }

  const data = await response.json();
  const user = data?.users?.[0];

  if (!user) {
    throw new Error('Firebase user not found.');
  }

  return user;
}

export async function POST(req: NextRequest) {
  try {
    const { idToken, phone } = await req.json();

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'Missing Firebase ID token.' }, { status: 400 });
    }

    const user = await verifyFirebaseIdToken(idToken);
    const normalizedFromToken = normalizeSriLankanPhone(user.phoneNumber || '');
    const normalizedFromClient = normalizeSriLankanPhone(phone || '');

    if (!normalizedFromToken) {
      return NextResponse.json({ error: 'Token does not include a phone number.' }, { status: 401 });
    }

    if (normalizedFromClient && normalizedFromClient !== normalizedFromToken) {
      return NextResponse.json({ error: 'Phone number mismatch.' }, { status: 401 });
    }

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

    response.cookies.set('ec_user_phone', normalizedFromToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
