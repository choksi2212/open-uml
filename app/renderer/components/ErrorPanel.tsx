import { ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { RenderDiagramResponse } from '../../preload';
import { cn } from '../lib/cn';

interface ErrorPanelProps {
  error: RenderDiagramResponse['error'];
  isOpen: boolean;
  onToggle: () => void;
}

export function ErrorPanel({ error, isOpen, onToggle }: ErrorPanelProps) {
  if (!error) return null;

  return (
    <div
      className={cn(
        'border-t border-border bg-bg-elevated transition-all duration-200',
        isOpen ? 'max-h-64' : 'max-h-9',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full h-9 px-3 flex items-center justify-between hover:bg-surface-1 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="h-3.5 w-3.5 text-warn shrink-0" />
          <span className="text-xs font-medium text-warn">Render error</span>
          {error.line > 0 && (
            <span className="text-[11px] text-fg-muted">Line {error.line}</span>
          )}
          <span className="text-xs text-fg-muted truncate">{error.shortMessage}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5 text-fg-subtle shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-fg-subtle shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="px-3 pb-3">
          <pre className="text-[11px] font-mono whitespace-pre-wrap overflow-auto p-2.5 rounded border border-border bg-surface-1 text-fg-muted max-h-48">
            {error.details}
          </pre>
        </div>
      )}
    </div>
  );
}
