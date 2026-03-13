# Eco-App

A Next.js application with OTP authentication for Sri Lankan mobile numbers.

## Requirements

- Node.js 20+
- npm 10+
- Twilio account with SMS capability

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Configure Twilio in `.env.local`:

   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - one sender option:
     - `TWILIO_PHONE_NUMBER`, or
     - `TWILIO_MESSAGING_SERVICE_SID` (must start with `MG`)

4. Run the app:

   ```bash
   npm run dev
   ```

## Build

```bash
npm run build
npm run start
```

## OTP Flow (Server-generated OTP)

- `POST /api/auth/send-otp`
  - Generates a 6-digit OTP
  - Hashes OTP before storing in memory
  - Expires in 5 minutes
  - Allows maximum 2 successful uses
  - Sends OTP via Twilio SMS

- `POST /api/auth/check-otp`
  - Validates OTP with constant-time comparison
  - Enforces expiry, max uses, and invalid attempt limit
  - Sets `ec_session` and `ec_user_phone` cookies on success

## Notes

- This implementation avoids Firebase API key issues by using direct server-side OTP send + verify.
- In-memory OTP store is suitable for a single-instance deployment. For multi-instance production, move OTP storage to Redis/PostgreSQL.
