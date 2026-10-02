import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/cn';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: 'top' | 'bottom';
  shortcut?: string;
}

export function Tooltip({ content, children, side = 'bottom', shortcut }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<number>();

  const show = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setOpen(true), 250);
  };

  const hide = () => {
    clearTimeout(timeoutRef.current);
    setOpen(false);
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  // Clone the child to attach hover handlers without forcing a particular element
  const trigger = React.cloneElement(children, {
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
  } as any);

  return (
    <span className="relative inline-flex">
      {trigger}
      {open && (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute left-1/2 -translate-x-1/2 z-50',
            'px-2 py-1 rounded-md text-xs font-medium',
            'bg-[var(--fg)] text-[var(--bg)]',
            'shadow-lg border border-[var(--border)]',
            'whitespace-nowrap flex items-center gap-2',
            side === 'bottom' ? 'top-[calc(100%+6px)]' : 'bottom-[calc(100%+6px)]',
            'animate-in fade-in',
          )}
        >
          {content}
          {shortcut && (
            <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-black/20 dark:bg-white/20 font-mono">
              {shortcut}
            </kbd>
          )}
        </span>
      )}
    </span>
  );
}
