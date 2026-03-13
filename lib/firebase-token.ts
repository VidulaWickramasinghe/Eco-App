import { createVerify } from 'crypto';

type FirebaseTokenClaims = {
  aud: string;
  iss: string;
  sub: string;
  exp: number;
  iat: number;
  auth_time?: number;
  phone_number?: string;
  [key: string]: unknown;
};

type GoogleCertsResponse = Record<string, string>;

type CachedCerts = {
  certs: GoogleCertsResponse;
  expiresAt: number;
};

const GOOGLE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

let certsCache: CachedCerts | null = null;

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
}

function parseMaxAge(cacheControl: string | null) {
  if (!cacheControl) return 60 * 60;
  const match = cacheControl.match(/max-age=(\d+)/);
  if (!match) return 60 * 60;
  return Number(match[1]);
}

async function getGoogleCerts() {
  const now = Date.now();
  if (certsCache && certsCache.expiresAt > now) {
    return certsCache.certs;
  }

  const response = await fetch(GOOGLE_CERTS_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to load Google certs for Firebase token verification.');
  }

  const certs = (await response.json()) as GoogleCertsResponse;
  const maxAge = parseMaxAge(response.headers.get('cache-control'));

  certsCache = {
    certs,
    expiresAt: now + maxAge * 1000,
  };

  return certs;
}

function validateClaims(claims: FirebaseTokenClaims, projectId: string) {
  const now = Math.floor(Date.now() / 1000);

  if (claims.aud !== projectId) {
    throw new Error('Invalid Firebase token audience.');
  }

  const expectedIssuer = `https://securetoken.google.com/${projectId}`;
  if (claims.iss !== expectedIssuer) {
    throw new Error('Invalid Firebase token issuer.');
  }

  if (!claims.sub || claims.sub.length === 0) {
    throw new Error('Invalid Firebase token subject.');
  }

  if (claims.exp <= now) {
    throw new Error('Firebase token expired.');
  }

  if (claims.iat > now) {
    throw new Error('Invalid Firebase token issued-at time.');
  }

  if (claims.auth_time && claims.auth_time > now) {
    throw new Error('Invalid Firebase token auth_time.');
  }
}

export async function verifyFirebaseIdToken(idToken: string, projectId: string) {
  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed Firebase token.');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = JSON.parse(decodeBase64Url(encodedHeader)) as { alg: string; kid?: string };
  const claims = JSON.parse(decodeBase64Url(encodedPayload)) as FirebaseTokenClaims;

  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('Unsupported Firebase token format.');
  }

  const certs = await getGoogleCerts();
  const cert = certs[header.kid];
  if (!cert) {
    throw new Error('Firebase token key ID is not recognized.');
  }

  const verifier = createVerify('RSA-SHA256');
  verifier.update(`${encodedHeader}.${encodedPayload}`);
  verifier.end();

  const signature = Buffer.from(encodedSignature.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  const isValidSignature = verifier.verify(cert, signature);

  if (!isValidSignature) {
    throw new Error('Firebase token signature is invalid.');
  }

  validateClaims(claims, projectId);
  return claims;
}
