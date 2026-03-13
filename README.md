# Eco-App

A Next.js application for eco collection workflows, including phone-based OTP authentication.

## Requirements

- Node.js 20+
- npm 10+
- Firebase project with **Phone Authentication** enabled

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Verify Firebase config values in `.env.local`:

   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

   Notes:
   - `.env.example` is only a template and is not loaded at runtime.
   - Restart `npm run dev` after env changes.
   - In Firebase Console, add your Vercel domain to **Authentication → Settings → Authorized domains**.
   - Enable **Phone** provider in **Authentication → Sign-in method**.

4. Run the app:

   ```bash
   npm run dev
   ```

## Build

```bash
npm run build
npm run start
```

## OTP Authentication (Firebase)

- OTP is sent using **Firebase Phone Authentication** from the login screen.
- Invisible reCAPTCHA is used by Firebase before sending OTP.
- OTP verification happens on the verify screen; after success the app posts Firebase ID token to `/api/auth/firebase-session`.
- `/api/auth/firebase-session` verifies the Firebase ID token signature/claims against Google public certs and then sets app session cookies.
- Legacy OTP endpoints (`/api/auth/send-otp`, `/api/auth/check-otp`) are deprecated.

## Vercel deployment checklist

Set these Environment Variables in Vercel Project Settings:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Then redeploy.


## Notes on Firebase Admin SDK

If you use Firebase Admin SDK locally, do not commit `serviceAccountKey.json`.
Use environment variables in hosting (e.g., Vercel) instead.
