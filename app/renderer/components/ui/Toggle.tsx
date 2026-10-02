import { cn } from '../../lib/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

const sizeMap = {
  sm: { track: 'w-7 h-4', thumb: 'h-3 w-3', translate: 'translate-x-3' },
  md: { track: 'w-9 h-5', thumb: 'h-4 w-4', translate: 'translate-x-4' },
} as const;

export function Toggle({ checked, onChange, label, size = 'md', disabled }: ToggleProps) {
  const s = sizeMap[size];
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        s.track,
        'relative inline-flex shrink-0 cursor-pointer rounded-full border border-transparent',
        'transition-colors duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg)]',
        checked ? 'bg-[var(--accent)]' : 'bg-[var(--surface-3)]',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <span
        className={cn(
          s.thumb,
          'pointer-events-none inline-block transform rounded-full bg-white shadow',
          'transition-transform duration-200',
          'translate-y-0.5 translate-x-0.5',
          checked && s.translate,
        )}
      />
    </button>
  );
}
