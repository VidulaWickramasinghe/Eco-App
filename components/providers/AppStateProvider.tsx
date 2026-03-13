'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DEFAULT_COLLECTION, DEFAULT_HISTORY, DEFAULT_USER } from '@/lib/constants';
import { PRICING, PICKUP_TIME_SLOTS } from '@/lib/constants';
import type {
  CollectionItem,
  HistoryItem,
  PricingKey,
  SubScreen,
  Tab,
  UserProfile,
} from '@/types/app';
import { useLanguage } from '@/components/providers/LanguageProvider';

type AppStateContextType = {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  subScreen: SubScreen;
  setSubScreen: (value: SubScreen) => void;
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  collection: CollectionItem[];
  setCollection: (items: CollectionItem[]) => void;
  history: HistoryItem[];
  setHistory: (items: HistoryItem[]) => void;
  tempCategory: PricingKey | null;
  setTempCategory: (value: PricingKey | null) => void;
  tempQuantity: string;
  setTempQuantity: (value: string) => void;
  totalCollectionValue: number;
  totalItemsCount: number;
  selectedPickupTime: string;
  setSelectedPickupTime: (value: string) => void;
  withdrawAmount: string;
  setWithdrawAmount: (value: string) => void;
  handleAddItem: () => void;
  handleRequestPickup: () => void;
  handleWithdraw: () => void;
  resetAddFlow: () => void;
};

const AppStateContext = createContext<AppStateContextType | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<Tab>('HOME');
  const [subScreen, setSubScreen] = useState<SubScreen>(null);

  const [user, setUser] = useState<UserProfile>({
    ...DEFAULT_USER,
    language,
  });

  const [collection, setCollection] = useState<CollectionItem[]>(DEFAULT_COLLECTION);
  const [history, setHistory] = useState<HistoryItem[]>(DEFAULT_HISTORY);

  const [tempCategory, setTempCategory] = useState<PricingKey | null>(null);
  const [tempQuantity, setTempQuantity] = useState('');
  const [selectedPickupTime, setSelectedPickupTime] = useState(PICKUP_TIME_SLOTS[0]);
  const [withdrawAmount, setWithdrawAmount] = useState(String(DEFAULT_USER.walletBalance));

  const userWithLanguage = useMemo(() => ({ ...user, language }), [user, language]);

  const totalCollectionValue = collection.reduce(
    (sum, item) => sum + item.estimatedValue,
    0
  );

  const totalItemsCount = collection.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  );

  const resetAddFlow = useCallback(() => {
    setTempCategory(null);
    setTempQuantity('');
  }, []);

  const handleAddItem = useCallback(() => {
    if (!tempCategory || !tempQuantity || Number.isNaN(Number(tempQuantity))) return;
    const quantity = Number(tempQuantity);
    if (quantity <= 0) return;

    const rate = PRICING[tempCategory].rate;

    const newItem: CollectionItem = {
      id: Date.now(),
      category: tempCategory,
      quantity,
      estimatedValue: quantity * rate,
    };

    setCollection((prev) => [...prev, newItem]);
    resetAddFlow();
    setSubScreen(null);
  }, [tempCategory, tempQuantity, resetAddFlow]);

  const handleRequestPickup = useCallback(() => {
    if (collection.length === 0) return;

    const pickupAmount = totalCollectionValue;
    const pickupId = Date.now().toString().slice(-4);
    const today = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    setHistory((prev) => [
      {
        id: pickupId,
        date: today,
        amount: pickupAmount,
        type: 'pickup',
      },
      ...prev,
    ]);

    setUser((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance + pickupAmount,
    }));

    setCollection([]);
    setSubScreen('TRACKING');
  }, [collection.length, totalCollectionValue]);

  const handleWithdraw = useCallback(() => {
    const amount = Number(withdrawAmount);

    if (!amount || amount <= 0 || amount > user.walletBalance) return;

    const id = `W-${Date.now().toString().slice(-4)}`;
    const today = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    setHistory((prev) => [
      { id, date: today, amount: -amount, type: 'withdraw' },
      ...prev,
    ]);

    setUser((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance - amount,
    }));

    setWithdrawAmount('0');
    setSubScreen(null);
  }, [user.walletBalance, withdrawAmount]);

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      subScreen,
      setSubScreen,
      user: userWithLanguage,
      setUser,
      collection,
      setCollection,
      history,
      setHistory,
      tempCategory,
      setTempCategory,
      tempQuantity,
      setTempQuantity,
      totalCollectionValue,
      totalItemsCount,
      selectedPickupTime,
      setSelectedPickupTime,
      withdrawAmount,
      setWithdrawAmount,
      handleAddItem,
      handleRequestPickup,
      handleWithdraw,
      resetAddFlow,
    }),
    [
      activeTab,
      subScreen,
      userWithLanguage,
      collection,
      history,
      tempCategory,
      tempQuantity,
      totalCollectionValue,
      totalItemsCount,
      selectedPickupTime,
      withdrawAmount,
      handleAddItem,
      handleRequestPickup,
      handleWithdraw,
      resetAddFlow,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used inside AppStateProvider');
  }
  return ctx;
}
