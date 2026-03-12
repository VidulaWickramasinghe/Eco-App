import React from 'react';

export default function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md mx-auto h-screen bg-black sm:py-4 sm:px-4 font-sans text-gray-800">
      <div className="w-full h-full bg-[#F5F7F8] relative overflow-hidden sm:rounded-[40px] shadow-2xl flex flex-col border-4 border-black">
        <div className="h-6 w-full bg-transparent absolute top-0 z-50 flex justify-between items-center px-6 pt-2 pointer-events-none">
          <span className="text-xs font-bold text-gray-400">9:41</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full border border-gray-400"></div>
            <div className="w-3 h-3 rounded-full border border-gray-400 bg-gray-400"></div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative mt-6">{children}</div>
      </div>
    </div>
  );
}
