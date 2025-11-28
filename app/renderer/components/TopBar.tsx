import React from 'react';
import logoMark from '../../assets/open_uml_logo.png';

interface TopBarProps {
  onNew: () => void;
  onRender: () => void;
  onExport: (format?: 'svg' | 'png') => void;
  onOpen: () => void;
  onSave: () => void;
  onThemeToggle: () => void;
  theme: 'dark' | 'light';
  canExport: boolean;
  isRendering: boolean;
  format: 'svg' | 'png';
  onFormatChange: (format: 'svg' | 'png') => void;
}

const TopBar: React.FC<TopBarProps> = ({
  onNew,
  onRender,
  onExport,
  onOpen,
  onSave,
  onThemeToggle,
  theme,
  canExport,
  isRendering,
  format,
  onFormatChange,
}) => {
  const buttonClass = `
    px-4 py-2 rounded-md text-sm font-medium transition-colors
    ${theme === 'dark'
      ? 'bg-dark-surface text-gray-200 hover:bg-slate-600'
      : 'bg-white text-gray-700 hover:bg-gray-100'
    }
    border border-gray-300 dark:border-dark-border
  `;

  const disabledClass = 'opacity-50 cursor-not-allowed';

  return (
    <div className={`
      flex items-center justify-between px-6 py-4 border-b
      ${theme === 'dark' ? 'bg-dark-surface border-dark-border' : 'bg-white border-gray-200'}
    `}>
      <div className="flex items-center gap-3">
        <div className="logo-chip">
          <img src={logoMark} alt="Open UML logo" className="h-9 w-9 object-contain" />
        </div>
        <h1 className={`
          text-3xl font-black tracking-tight leading-none app-title ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          <span className="app-title-accent">Open</span> <span className="opacity-80">UML</span>
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onNew}
          className={buttonClass}
          title="New Diagram (Ctrl+N)"
        >
          New
        </button>
        
        <button
          onClick={onOpen}
          className={buttonClass}
          title="Open File"
        >
          Open
        </button>
        
        <button
          onClick={onSave}
          className={buttonClass}
          title="Save File (Ctrl+S)"
        >
          Save
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-dark-border mx-1" />

        <button
          onClick={onRender}
          disabled={isRendering}
          className={`${buttonClass} ${isRendering ? disabledClass : ''}`}
          title="Render Diagram (Ctrl+R)"
        >
          {isRendering ? 'Rendering...' : 'Render'}
        </button>

        <select
          value={format}
          onChange={(e) => onFormatChange(e.target.value as 'svg' | 'png')}
          className={`
            ${buttonClass} cursor-pointer
            ${theme === 'dark' ? 'bg-dark-surface' : 'bg-white'}
          `}
        >
          <option value="svg">SVG</option>
          <option value="png">PNG</option>
        </select>

        <button
          onClick={() => onExport()}
          disabled={!canExport}
          className={`${buttonClass} ${!canExport ? disabledClass : ''}`}
          title="Export Diagram"
        >
          Export
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-dark-border mx-1" />

        <button
          onClick={onThemeToggle}
          className={buttonClass}
          title="Toggle Theme (Ctrl+T)"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
};

export default TopBar;

