import React from 'react';
import { cn } from '../../lib/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        'h-8 px-2 pr-7 rounded-md border text-sm font-medium',
        'bg-[var(--surface-1)] text-[var(--fg)] border-[var(--border)]',
        'hover:bg-[var(--surface-2)] cursor-pointer appearance-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg)]',
        'bg-[length:14px_14px] bg-[position:right_6px_center] bg-no-repeat',
        // tiny inline chevron via background image (svg as data url)
        "bg-[url('data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'><polyline points='6 9 12 15 18 9'/></svg>')]",
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  );
});
