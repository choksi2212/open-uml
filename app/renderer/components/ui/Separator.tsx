import React from 'react';
import { cn } from '../../lib/cn';

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

export function Separator({ orientation = 'vertical', className, ...rest }: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'bg-[var(--border)] shrink-0',
        orientation === 'vertical' ? 'w-px h-5 mx-1' : 'h-px w-full my-1',
        className,
      )}
      {...rest}
    />
  );
}
