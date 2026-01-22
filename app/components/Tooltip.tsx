'use client';

import { useState } from 'react';

interface TooltipProps {
  text: string;
}

export default function Tooltip({ text }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="w-5 h-5 rounded-full bg-[#00ffa7]/20 hover:bg-[#00ffa7]/30 flex items-center justify-center text-[#00ffa7] text-xs font-bold transition-colors"
      >
        ?
      </button>

      {isVisible && (
        <div className="absolute right-0 top-8 z-50 w-64 p-3 bg-[#0a1420] border-2 border-[#00ffa7] rounded-lg shadow-2xl animate-fade-in">
          <div className="text-xs text-gray-300 leading-relaxed">
            {text}
          </div>
          <div className="absolute -top-2 right-2 w-4 h-4 bg-[#0a1420] border-t-2 border-l-2 border-[#00ffa7] transform rotate-45" />
        </div>
      )}
    </div>
  );
}
