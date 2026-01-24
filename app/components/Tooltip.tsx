'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();

      // Calculate position
      const tooltipLeft = rect.left + rect.width / 2;

      // If tooltip would overflow at top, show at bottom
      if (rect.top < 100) {
        setPosition('bottom');
        setCoords({ top: rect.bottom + 8, left: tooltipLeft });
      } else {
        setPosition('top');
        setCoords({ top: rect.top - 8, left: tooltipLeft });
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
          className={`fixed -translate-x-1/2 ${
            position === 'top' ? '-translate-y-full' : ''
          }`}
          style={{
            top: coords.top,
            left: coords.left,
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        >
          <div className="relative">
            <div
              className="text-[#EAEFF9] text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl whitespace-normal"
              style={{
                background: '#1C2130',
                border: '1px solid #2D334D',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                maxWidth: '200px'
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
