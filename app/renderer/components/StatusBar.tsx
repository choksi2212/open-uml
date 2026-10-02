import React from 'react';

interface StatusBarProps {
  theme: 'dark' | 'light';
  filePath: string | null;
  cursorPosition: { line: number; column: number };
  diagramType: string | null;
  renderMs: number | null;
  diagramCount: number | null;
}

const StatusBar: React.FC<StatusBarProps> = ({ theme, filePath, cursorPosition, diagramType, renderMs, diagramCount }) => {
  const barClass = theme === 'dark'
    ? 'bg-dark-surface border-dark-border text-gray-400'
    : 'bg-white border-gray-200 text-gray-500';

  const fileName = filePath ? filePath.split(/[\\/]/).pop() : 'untitled.puml';

  return (
    <div className={`flex items-center justify-between px-4 py-1 border-t text-xs select-none ${barClass}`}>
      <div className="flex items-center gap-4 truncate">
        <span title={filePath || 'Not saved yet'}>{fileName}</span>
        {diagramType && (
          <span className={`px-1.5 py-0.5 rounded ${theme === 'dark' ? 'bg-slate-700/70 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
            {diagramType}
          </span>
        )}
        {diagramCount !== null && diagramCount > 1 && (
          <span>{diagramCount} diagrams</span>
        )}
      </div>
      <div className="flex items-center gap-4 shrink-0">
        {renderMs !== null && <span>rendered in {renderMs} ms</span>}
        <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
        <span>Ctrl+Shift+K commands</span>
      </div>
    </div>
  );
};

export default StatusBar;
