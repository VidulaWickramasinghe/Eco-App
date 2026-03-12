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

3. Configure Firebase Web Auth values in `.env.local`:

   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`

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

- OTP is sent using **Firebase Phone Authentication** from the client.
- Invisible reCAPTCHA is used by Firebase before sending OTP.
- OTP verification signs in the Firebase user and then creates an app session cookie via `/api/auth/firebase-session`.
- The app validates Sri Lankan phone input and sends as E.164 format (`+94XXXXXXXXX`).

## Vercel deployment checklist

Set these Environment Variables in Vercel Project Settings:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`

Then redeploy.
