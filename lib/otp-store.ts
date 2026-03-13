import { createHash, randomInt, timingSafeEqual } from 'crypto';

type OtpRecord = {
  phone: string;
  codeHash: string;
  expiresAt: number;
  maxUses: number;
  usedCount: number;
  attempts: number;
};

const otpStore = new Map<string, OtpRecord>();

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_MAX_USES = 2;
const OTP_MAX_ATTEMPTS = 5;

function hashCode(code: string) {
  return createHash('sha256').update(code).digest('hex');
}

function getOtpKey(phone: string) {
  return `otp:${phone}`;
}

function cleanupExpired() {
  const now = Date.now();
  for (const [key, record] of otpStore.entries()) {
    if (record.expiresAt <= now) {
      otpStore.delete(key);
    }
  }
}

export function generateOtpCode() {
  return randomInt(100000, 1000000).toString();
}

export function saveOtp(phone: string, code: string) {
  cleanupExpired();
  const key = getOtpKey(phone);
  otpStore.set(key, {
    phone,
    codeHash: hashCode(code),
    expiresAt: Date.now() + OTP_TTL_MS,
    maxUses: OTP_MAX_USES,
    usedCount: 0,
    attempts: 0,
  });
}

export function verifyOtp(phone: string, code: string) {
  cleanupExpired();
  const key = getOtpKey(phone);
  const record = otpStore.get(key);

  if (!record) {
    return { ok: false as const, error: 'OTP session expired. Please request a new code.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return { ok: false as const, error: 'OTP expired. Please request a new code.' };
  }

  if (record.usedCount >= record.maxUses) {
    otpStore.delete(key);
    return { ok: false as const, error: 'OTP usage limit reached. Please request a new code.' };
  }

  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    otpStore.delete(key);
    return { ok: false as const, error: 'Too many invalid attempts. Please request a new code.' };
  }

  const incomingHash = Buffer.from(hashCode(code), 'utf8');
  const storedHash = Buffer.from(record.codeHash, 'utf8');
  const matches =
    incomingHash.length === storedHash.length &&
    timingSafeEqual(incomingHash, storedHash);

  if (!matches) {
    record.attempts += 1;
    otpStore.set(key, record);
    return { ok: false as const, error: 'Invalid verification code.' };
  }

  record.usedCount += 1;
  otpStore.set(key, record);

  if (record.usedCount >= record.maxUses) {
    otpStore.delete(key);
  }

  return { ok: true as const };
}
