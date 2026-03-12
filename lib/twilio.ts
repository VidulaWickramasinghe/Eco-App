function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Add it to .env.local and restart the server.`
    );
  }
  return value;
}

export async function sendOtpSms(phone: string, otp: string) {
  const sid = requireEnv('TWILIO_ACCOUNT_SID');
  const token = requireEnv('TWILIO_AUTH_TOKEN');
  const from = process.env.TWILIO_PHONE_NUMBER;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

  if (!from && !messagingServiceSid) {
    throw new Error(
      'Missing Twilio sender configuration. Set TWILIO_PHONE_NUMBER or TWILIO_MESSAGING_SERVICE_SID in .env.local and restart the server.'
    );
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function sendOtpSms(phone: string, otp: string) {
  const sid = requireEnv('TWILIO_ACCOUNT_SID');
  const token = requireEnv('TWILIO_AUTH_TOKEN');
  const from = requireEnv('TWILIO_PHONE_NUMBER');

  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const body = new URLSearchParams({
    To: `+94${phone}`,
    Body: `Your EcoCollect verification code is ${otp}`,
  });

  if (from) {
    body.set('From', from);
  }

  if (messagingServiceSid) {
    body.set('MessagingServiceSid', messagingServiceSid);
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Twilio error: ${errorText}`);
  }

  return { ok: true, mode: 'twilio' as const };
}
