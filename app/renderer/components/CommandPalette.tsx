import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { cn } from '../lib/cn';

export interface PaletteAction {
  id: string;
  label: string;
  run: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  actions: PaletteAction[];
  onClose: () => void;
}

export function CommandPalette({ actions, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));
  const safeActive = Math.min(activeIndex, Math.max(0, filtered.length - 1));

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const runAction = (action: PaletteAction) => {
    onClose();
    setTimeout(() => action.run(), 0);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const action = filtered[safeActive];
      if (action) runAction(action);
    }
  };

  useEffect(() => {
    const item = listRef.current?.children[safeActive] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [safeActive]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/40 animate-fade-in"
      onKeyDown={handleKey}
      onClick={onClose}
    >
      <div
        className={cn(
          'w-[520px] max-w-[90vw] rounded-md overflow-hidden',
          'bg-bg-elevated border border-border shadow-overlay',
          'animate-scale-in',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3 h-10 border-b border-border">
          <Search className="h-4 w-4 text-fg-subtle shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-fg-subtle"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] rounded border border-border text-fg-subtle">
            esc
          </kbd>
        </div>
        <div ref={listRef} className="max-h-[320px] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-3 py-4 text-sm text-fg-subtle text-center">No matching command</div>
          ) : (
            filtered.map((action, i) => (
              <button
                key={action.id}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm flex justify-between items-center gap-3',
                  i === safeActive ? 'bg-surface-1' : 'hover:bg-surface-1',
                )}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => runAction(action)}
              >
                <span>{action.label}</span>
                {action.shortcut && (
                  <kbd className="px-1.5 py-0.5 text-[10px] rounded border border-border text-fg-subtle font-mono">
                    {action.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>
        <div className="px-3 py-1.5 text-[11px] border-t border-border text-fg-subtle flex gap-3">
          <span>↑↓ navigate</span>
          <span>↵ run</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
