'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatSriLankanPhone, normalizeSriLankanPhone } from '@/lib/phone';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setLoading(true);
    setError('');

    try {
      const normalized = normalizeSriLankanPhone(phone);

      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalized }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send OTP');
        return;
      }

      router.push(`/verify?phone=${normalized}`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 p-6">
      <div className="mt-12 flex-1">
        <h2 className="mb-2 text-3xl font-bold text-slate-800">Welcome</h2>
        <p className="mb-8 text-slate-500">Enter your mobile number to continue</p>

        <div className="mb-6 flex items-center space-x-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-lg font-bold text-slate-500">+94</span>
          <div className="mx-2 h-6 w-px bg-slate-300" />
          <input
            type="tel"
            className="flex-1 text-xl font-medium text-slate-800 outline-none placeholder:text-slate-400"
            placeholder="77 123 4567"
            value={formatSriLankanPhone(phone)}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className="flex w-full items-center justify-center rounded-2xl bg-emerald-500 p-4 text-lg font-bold text-white shadow-lg shadow-emerald-200 transition-transform active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? 'Sending OTP...' : 'Continue'}
        </button>

        <p className="mt-8 text-center text-sm text-slate-400">
          By continuing you agree to our Terms & Privacy Policy
        </p>

        <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">
          OTP messages are sent through Twilio. Configure valid Twilio credentials in environment variables before testing sign in.
        </div>
      </div>
    </div>
  );
}