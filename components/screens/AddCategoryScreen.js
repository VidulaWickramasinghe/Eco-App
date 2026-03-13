'use client';

import { X } from 'lucide-react';
import { PRICING } from '@/lib/constants';
import { useAppState } from '@/components/providers/AppStateProvider';

export default function AddCategoryScreen() {
  const { setSubScreen, setTempCategory } = useAppState();

  return (
    <div className="slide-up absolute inset-0 z-50 flex flex-col bg-slate-50">
      <div className="flex items-center border-b border-slate-200 bg-white p-4">
        <button
          onClick={() => setSubScreen(null)}
          className="mr-2 rounded-full bg-slate-100 p-2 text-slate-600"
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold text-slate-800">Add Item</h2>
      </div>

      <div className="overflow-y-auto p-4">
        <p className="mb-6 font-medium text-slate-500">Choose material category</p>

        <div className="grid grid-cols-2 gap-4">
          {Object.entries(PRICING).map(([key, data]) => (
            <button
              key={key}
              onClick={() => {
                setTempCategory(key);
                setSubScreen('ADD_DETAILS');
              }}
              className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-emerald-500 hover:bg-emerald-50"
            >
              <span className="mb-3 text-5xl">{data.icon}</span>
              <span className="text-center font-bold leading-tight text-slate-700">
                {data.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
