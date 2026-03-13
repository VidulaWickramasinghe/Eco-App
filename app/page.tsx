'use client';

import { useEffect, useState } from 'react';
import SplashScreen from '@/components/screens/SplashScreen';
import LanguageScreen from '@/components/screens/LanguageScreen';

export default function Page() {
  const [screen, setScreen] = useState<'SPLASH' | 'LANG'>('SPLASH');

  useEffect(() => {
    const timer = setTimeout(() => setScreen('LANG'), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (screen === 'SPLASH') return <SplashScreen />;
  return <LanguageScreen />;
}