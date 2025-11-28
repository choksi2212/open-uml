import React from 'react';
import { RenderDiagramResponse } from '../../preload';

interface ErrorPanelProps {
  error: RenderDiagramResponse['error'];
  isOpen: boolean;
  onToggle: () => void;
  theme: 'dark' | 'light';
}

const ErrorPanel: React.FC<ErrorPanelProps> = ({ error, isOpen, onToggle, theme }) => {
  if (!error) return null;

  return (
    <div className={`
      border-t transition-all duration-300
      ${theme === 'dark' ? 'bg-dark-surface border-dark-border' : 'bg-red-50 border-red-200'}
      ${isOpen ? 'max-h-64' : 'max-h-12'}
      overflow-hidden
    `}>
      <button
        onClick={onToggle}
        className={`
          w-full px-4 py-2 flex items-center justify-between
          ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-red-100'}
          transition-colors
        `}
      >
        <div className="flex items-center gap-2">
          <span className={`
            text-sm font-medium
            ${theme === 'dark' ? 'text-orange-400' : 'text-red-600'}
          `}>
            ⚠️ Error
          </span>
          {error.line > 0 && (
            <span className={`
              text-xs
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Line {error.line}
            </span>
          )}
          <span className={`
            text-sm
            ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
          `}>
            {error.shortMessage}
          </span>
        </div>
        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          {isOpen ? '▼' : '▶'}
        </span>
      </button>
      
      {isOpen && (
        <div className={`
          px-4 pb-4 pt-2
          ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
        `}>
          <pre className={`
            text-xs font-mono whitespace-pre-wrap overflow-auto
            ${theme === 'dark' ? 'bg-dark-bg text-gray-400' : 'bg-white text-gray-800'}
            p-3 rounded border
            ${theme === 'dark' ? 'border-dark-border' : 'border-red-200'}
          `}>
            {error.details}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ErrorPanel;

