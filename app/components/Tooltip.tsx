'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();

      // If tooltip would overflow at top, show at bottom
      if (rect.top < 100) {
        setPosition('bottom');
      } else {
        setPosition('top');
      }
    }
  }, [isVisible]);

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}

      {isVisible && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 z-50 ${
            position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          <div className="relative">
            <div className="bg-[#1C2130] text-[#EAEFF9] text-xs px-3 py-2 rounded-lg shadow-lg border border-[#2D334D] max-w-xs whitespace-normal">
              {content}
            </div>
            {/* Arrow */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 ${
                position === 'top'
                  ? 'top-full border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#2D334D]'
                  : 'bottom-full border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-[#2D334D]'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Info icon for tooltips
 */
export function TooltipIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 text-[#64748B] hover:text-[#EAEFF9] transition-colors cursor-help"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
