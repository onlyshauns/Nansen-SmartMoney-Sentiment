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
      style={{ cursor: 'help' }}
    >
      {children}

      {isVisible && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 ${
            position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
          style={{
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        >
          <div className="relative">
            <div
              className="text-[#EAEFF9] text-xs px-3 py-2 rounded-lg shadow-xl max-w-xs whitespace-normal"
              style={{
                background: '#1C2130',
                border: '1px solid #2D334D',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
              }}
            >
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
 * Question mark icon for tooltips
 */
export function TooltipIcon() {
  return (
    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#2D334D] border border-[#3D445D] text-[#A4ACC4] hover:text-[#EAEFF9] hover:bg-[#3D445D] transition-all cursor-help">
      <span className="text-[10px] font-bold leading-none">?</span>
    </div>
  );
}
