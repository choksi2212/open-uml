import React from 'react';
import { cn } from '../../lib/cn';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string; // required for a11y - screen readers + tooltip
  size?: 'sm' | 'md';
  active?: boolean;
}

const sizeClass = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { className, icon, label, size = 'md', active, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-md border',
        'transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg)]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        active
          ? 'bg-[var(--surface-2)] text-[var(--fg)] border-[var(--border)]'
          : 'bg-transparent text-[var(--fg-muted)] border-transparent hover:bg-[var(--surface-1)] hover:text-[var(--fg)]',
        sizeClass[size],
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );
});
