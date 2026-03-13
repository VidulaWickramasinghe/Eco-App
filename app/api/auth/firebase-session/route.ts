import { NextRequest, NextResponse } from 'next/server';
import { normalizeSriLankanPhone } from '@/lib/phone';
import { verifyFirebaseIdToken } from '@/lib/firebase-token';

function getFirebaseProjectId() {
  return process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'ecocollect-37816';
}

export async function POST(req: NextRequest) {
  try {
    const { idToken, phone } = await req.json();

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'Missing Firebase ID token.' }, { status: 400 });
    }

    const projectId = getFirebaseProjectId();
    const claims = await verifyFirebaseIdToken(idToken, projectId);

    const normalizedFromToken = normalizeSriLankanPhone(String(claims.phone_number || ''));
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
