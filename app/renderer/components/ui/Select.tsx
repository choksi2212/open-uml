import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Optional class for the chevron icon (defaults to fg-muted). */
  chevronClassName?: string;
}

/**
 * Themed <select>. Renders a Lucide chevron overlay rather than the
 * native one (the native chevron can't be themed and clashes with the
 * chevron-over-text offset that the OS draws). The native <select>
 * popover itself is still OS-rendered - that's a deliberate trade-off;
 * a fully custom dropdown would lose mobile / keyboard accessibility.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, chevronClassName, ...rest },
  ref,
) {
  return (
    <div className="relative inline-block">
      <select
        ref={ref}
        className={cn(
          'h-8 pl-2 pr-8 rounded-md border text-sm font-medium appearance-none',
          'bg-[var(--surface-1)] text-[var(--fg)] border-[var(--border)]',
          'hover:bg-[var(--surface-2)] cursor-pointer',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg)]',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        className={cn(
          'pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-fg-muted',
          chevronClassName,
        )}
        aria-hidden
      />
    </div>
  );
});
