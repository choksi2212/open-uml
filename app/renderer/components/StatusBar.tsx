import { FileCode, Clock, MapPin, Hash } from 'lucide-react';
import { Badge } from './ui/Badge';

interface StatusBarProps {
  theme: 'dark' | 'light';
  filePath: string | null;
  isDirty: boolean;
  cursorPosition: { line: number; column: number };
  diagramType: string | null;
  renderMs: number | null;
  diagramCount: number | null;
  totalDiagrams: number;
}

export function StatusBar({
  filePath,
  isDirty,
  cursorPosition,
  diagramType,
  renderMs,
  diagramCount,
  totalDiagrams,
}: StatusBarProps) {
  const fileName = filePath ? filePath.split(/[\\/]/).pop() : 'untitled.puml';

  return (
    <footer
      className="
        flex items-center justify-between
        h-6 px-3
        border-t border-border
        bg-bg-elevated text-fg-muted text-[11px] no-select
        shrink-0
      "
    >
      <div className="flex items-center gap-3 truncate">
        <span className="flex items-center gap-1.5 truncate">
          <FileCode className="h-3 w-3 text-fg-subtle shrink-0" />
          <span className="truncate">{fileName}</span>
          {isDirty && <span className="text-accent shrink-0" title="Unsaved changes">•</span>}
        </span>
        {diagramType && <Badge tone="accent">{diagramType}</Badge>}
        {totalDiagrams > 1 && (
          <span className="flex items-center gap-1">
            <Hash className="h-3 w-3" />
            {diagramCount ?? 0} / {totalDiagrams}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {renderMs !== null && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {renderMs} ms
          </span>
        )}
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </span>
        <span className="hidden md:inline text-fg-subtle">Ctrl+Shift+K for commands</span>
      </div>
    </footer>
  );
}
