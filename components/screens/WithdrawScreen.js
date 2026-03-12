'use client';

import { CheckCircle2, CreditCard, Phone, X } from 'lucide-react';
import { useAppState } from '@/components/providers/AppStateProvider';

export default function WithdrawScreen() {
  const {
    user,
    withdrawAmount,
    setWithdrawAmount,
    handleWithdraw,
    setSubScreen,
  } = useAppState();

  // Added safety fallback for user balance
  const maxBalance = user?.walletBalance || 0;

  const invalidAmount =
    !withdrawAmount ||
    Number(withdrawAmount) <= 0 ||
    Number(withdrawAmount) > maxBalance;

  return (
    <div className="slide-up absolute inset-0 z-50 flex flex-col bg-slate-50">
      <div className="flex items-center border-b border-slate-200 bg-white p-4">
        <button onClick={() => setSubScreen(null)} className="mr-2 text-slate-600">
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold text-slate-800">Withdraw Funds</h2>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-800">
          <p className="mb-1 font-medium">Available Balance</p>
          <p className="text-4xl font-extrabold">Rs. {maxBalance}</p>
        </div>

        <label className="mb-2 block text-sm font-bold text-slate-700">
          Amount to Withdraw
        </label>

        <div className="relative mb-8">
          <span className="absolute left-4 top-4 text-xl font-bold text-slate-500">Rs.</span>
          <input
            type="number"
            className="w-full rounded-2xl border-2 border-slate-200 bg-white p-4 pl-14 text-2xl font-bold outline-none focus:border-emerald-500"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            max={maxBalance}
          />
        </div>

        <label className="mb-3 block text-sm font-bold text-slate-700">
          Transfer Destination
        </label>

        <div className="mb-8 space-y-3">
          <label className="flex cursor-pointer items-center rounded-2xl border-2 border-emerald-500 bg-white p-4">
            <input
              type="radio"
              name="dest"
              className="h-5 w-5 text-emerald-500 focus:ring-emerald-500"
              defaultChecked
            />
            <CreditCard className="mx-3 text-emerald-600" />
            <div>
              <span className="block font-bold text-slate-800">Bank Account</span>
              <span className="text-xs text-slate-500">**** 4567</span>
            </div>
            <CheckCircle2 className="ml-auto text-emerald-500" />
          </label>

          <label className="flex cursor-pointer items-center rounded-2xl border-2 border-slate-200 bg-white p-4">
            <input
              type="radio"
              name="dest"
              className="h-5 w-5 text-emerald-500 focus:ring-emerald-500"
            />
            <Phone className="mx-3 text-slate-400" />
            <span className="font-bold text-slate-700">Mobile Wallet (eZ Cash)</span>
          </label>
        </div>

        {invalidAmount && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
            Enter a valid amount between 1 and {maxBalance}.
          </div>
        )}

        <button
          onClick={handleWithdraw}
          disabled={invalidAmount}
          className="mt-auto w-full rounded-2xl bg-emerald-500 p-4 text-lg font-bold text-white shadow-lg transition-transform active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Confirm Withdrawal
        </button>
      </div>
    </div>
  );
}
