'use client';

import { ReactNode } from 'react';
import { Leaf, Wallet } from 'lucide-react';
import { usePathname } from 'next/navigation';
import BottomNav from '@/components/app/BottomNav';
import { useAppState } from '@/components/providers/AppStateProvider';
import AddCategoryScreen from '@/components/screens/AddCategoryScreen';
import AddDetailScreen from '@/components/screens/AddDetailScreen';
import ScannerScreen from '@/components/screens/ScannerScreen';
import RequestPickupScreen from '@/components/screens/RequestPickupScreen';
import TrackingScreen from '@/components/screens/TrackingScreen';
import WithdrawScreen from '@/components/screens/WithdrawScreen';

const pageTitles: Record<string, string> = {
  '/home': 'EcoCollect',
  '/collection': 'EcoCollect',
  '/wallet': 'EcoCollect',
  '/profile': 'EcoCollect',
};

export default function MobileFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { subScreen, user } = useAppState();

  return (
    <div className="flex min-h-screen w-full justify-center bg-black sm:items-center">
      <div className="relative flex h-[100dvh] w-full max-w-md flex-col overflow-hidden border-8 border-slate-900 bg-slate-50 font-sans shadow-2xl sm:h-[850px] sm:rounded-[40px]">
        <div className="z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 pb-2 pt-6 shadow-sm">
          <div className="flex items-center space-x-2">
            <Leaf size={24} className="text-emerald-500" />
            <span className="tracking-tight text-lg font-bold text-slate-800">
              {pageTitles[pathname] || 'EcoCollect'}
            </span>
          </div>

          <div className="flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
            <Wallet size={14} className="mr-1" /> Rs. {user?.walletBalance || 0}
          </div>
        </div>

        <div className="flex-1 overflow-hidden">{children}</div>

        <BottomNav />

        {subScreen === 'ADD_CATEGORY' && <AddCategoryScreen />}
        {subScreen === 'ADD_DETAILS' && <AddDetailScreen />}
        {subScreen === 'SCANNER' && <ScannerScreen />}
        {subScreen === 'REQUEST_PICKUP' && <RequestPickupScreen />}
        {subScreen === 'TRACKING' && <TrackingScreen />}
        {subScreen === 'WITHDRAW' && <WithdrawScreen />}
      </div>
    </div>
  );
}
