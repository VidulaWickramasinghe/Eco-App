# Eco-App

A Next.js application for eco collection workflows, including phone-based OTP authentication.

## Requirements

- Node.js 20+
- npm 10+
- A Twilio account with either an SMS-capable phone number or Messaging Service
- A Twilio account with an SMS-capable phone number

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables and configure your Twilio credentials:

   ```bash
   cp .env.example .env.local
   ```

   Required variables:

   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - One sender option: `TWILIO_PHONE_NUMBER` **or** `TWILIO_MESSAGING_SERVICE_SID`

   > `.env.example` is only a template and is not loaded by Next.js at runtime.
   > Put real values in `.env.local` and restart `npm run dev` after changes.

3. Run the app:

   - `TWILIO_PHONE_NUMBER`

3. Run the app:

   ```bash
   npm run dev
   ```

## Build

```bash
npm run build
npm run start
```

## OTP Authentication

OTP delivery uses the Twilio REST API from `app/api/auth/send-otp`.

- The app validates Sri Lankan mobile numbers in `94XXXXXXXXX` format (without `+94` in user input).
- OTP codes are generated server-side and sent via Twilio SMS.
- OTP verification is handled by `app/api/auth/check-otp`.

If Twilio credentials are missing or invalid, the API returns an error so issues are visible during setup instead of falling back to mock OTP codes.
