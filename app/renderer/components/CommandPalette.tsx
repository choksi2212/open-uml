import React, { useState, useEffect, useRef } from 'react';

export interface PaletteAction {
  id: string;
  label: string;
  run: () => void;
  keys?: string;
}

interface CommandPaletteProps {
  theme: 'dark' | 'light';
  actions: PaletteAction[];
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ theme, actions, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const runAction = (action: PaletteAction) => {
    onClose();
    // Let the palette unmount before the action potentially opens dialogs.
    setTimeout(() => action.run(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) runAction(filtered[activeIndex]);
    }
  };

  useEffect(() => {
    const item = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const panelClass = theme === 'dark'
    ? 'bg-dark-surface border-dark-border text-gray-100'
    : 'bg-white border-gray-300 text-gray-900';

  return (
    <div
      className="fixed inset-0 flex items-start justify-center pt-[15vh] z-50 bg-black/40"
      onKeyDown={handleKeyDown}
      onClick={onClose}
    >
      <div
        className={`w-[520px] max-w-[90vw] rounded-lg border shadow-2xl overflow-hidden ${panelClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a command..."
          className={`w-full px-4 py-3 outline-none border-b ${
            theme === 'dark' ? 'bg-dark-surface border-dark-border placeholder-gray-500' : 'bg-white border-gray-200 placeholder-gray-400'
          }`}
        />
        <div ref={listRef} className="max-h-[320px] overflow-y-auto py-1">
          {filtered.length === 0 && (
            <div className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              No matching command
            </div>
          )}
          {filtered.map((action, i) => (
            <button
              key={action.id}
              className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center gap-3 ${
                i === activeIndex
                  ? theme === 'dark' ? 'bg-slate-600/60' : 'bg-gray-100'
                  : ''
              }`}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => runAction(action)}
            >
              <span>{action.label}</span>
              {action.keys && (
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {action.keys}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className={`px-4 py-2 text-xs border-t flex gap-4 ${theme === 'dark' ? 'border-dark-border text-gray-500' : 'border-gray-200 text-gray-400'}`}>
          <span>&uarr;&darr; navigate</span>
          <span>&crarr; run</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
