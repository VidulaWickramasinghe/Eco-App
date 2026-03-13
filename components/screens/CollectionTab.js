'use client';

import { Plus, Trash2 } from 'lucide-react';
import { PRICING } from '@/lib/constants';
import { useAppState } from '@/components/providers/AppStateProvider';

export default function CollectionTab() {
  const { collection, totalCollectionValue, setSubScreen } = useAppState();

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 pb-24">
      <h2 className="mb-6 mt-2 text-2xl font-bold text-slate-800">My Collection</h2>

      {collection.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
            <Trash2 size={32} className="text-slate-400" />
          </div>

          <h3 className="mb-2 text-lg font-bold text-slate-700">No items yet</h3>
          <p className="mb-6 text-slate-500">
            Start adding your recyclables to earn rewards.
          </p>

          <button
            onClick={() => setSubScreen('ADD_CATEGORY')}
            className="rounded-full bg-emerald-500 px-6 py-3 font-bold text-white shadow-md"
          >
            Add Recyclables
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 space-y-3">
            {collection.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{PRICING[item.category].icon}</div>

                  <div>
                    <p className="font-bold text-slate-800">
                      {PRICING[item.category].name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.quantity} {PRICING[item.category].unit}
                      {item.quantity > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-emerald-600">Rs. {item.estimatedValue}</p>
                  <p className="text-xs text-slate-400">Est. Value</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <span className="font-bold text-emerald-800">Estimated Total:</span>
            <span className="text-xl font-extrabold text-emerald-700">
              Rs. {totalCollectionValue}
            </span>
          </div>

          <button
            onClick={() => setSubScreen('ADD_CATEGORY')}
            className="flex w-full items-center justify-center space-x-2 rounded-2xl bg-slate-900 p-4 text-lg font-bold text-white shadow-lg"
          >
            <Plus size={20} />
            <span>Add More Items</span>
          </button>
        </>
      )}
    </div>
  );
}