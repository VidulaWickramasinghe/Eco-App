'use client';

import { ShieldCheck, ChevronLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { sendFirebaseOtp, verifyFirebaseOtp } from '@/lib/firebase-web';

export default function OTPScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';
  const maskedPhone = useMemo(() => {
    if (phone.length < 9) return '77 XXX XXXX';
    return `${phone.slice(0, 2)} ${phone.slice(2, 5)} ${phone.slice(5, 9)}`;
  }, [phone]);

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = clean;
    setOtp(next);

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verify = async () => {
    const code = otp.join('');
    setLoading(true);
    setError('');

    try {
      const { idToken, phone: verifiedPhone } = await verifyFirebaseOtp(code);
      const res = await fetch('/api/auth/firebase-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, phone: verifiedPhone }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create session');
        return;
      }

      router.push('/home');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify OTP';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError('');

    try {
      await sendFirebaseOtp(`+94${phone}`, 'recaptcha-container-verify');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resend OTP';
      setError(message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 p-6">
      <button
        onClick={() => router.push('/login')}
        className="mb-6 mt-4 text-slate-500 hover:text-slate-800"
      >
        <ChevronLeft size={28} />
      </button>

      <div className="flex-1">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <ShieldCheck size={32} className="text-blue-600" />
        </div>

        <h2 className="mb-2 text-3xl font-bold text-slate-800">Verify Phone</h2>
        <p className="mb-8 text-slate-500">Code sent to +94 {maskedPhone}</p>

        <div className="mb-8 flex justify-between gap-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e.key)}
              className="h-14 w-12 rounded-xl border border-slate-300 bg-white text-center text-2xl font-bold shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="-"
            />
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        <button
          onClick={verify}
          disabled={loading}
          className="mb-6 w-full rounded-2xl bg-emerald-500 p-4 text-lg font-bold text-white shadow-lg shadow-emerald-200 transition-transform active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>

        <div className="text-center">
          <button onClick={resend} className="font-medium text-emerald-600 hover:underline">
            Resend Code
          </button>
        </div>
      </div>

      <div id="recaptcha-container-verify" />
    </div>
  );
}
