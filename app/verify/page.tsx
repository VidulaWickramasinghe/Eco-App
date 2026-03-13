import { Suspense } from 'react';
import OTPScreen from '@/components/screens/OTPScreen';

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <OTPScreen />
    </Suspense>
  );
}
