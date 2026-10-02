import {
  FileText,
  FolderOpen,
  Save,
  Play,
  Download,
  FileType,
  Copy,
  Sun,
  Moon,
  Command,
} from 'lucide-react';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { Select } from './ui/Select';
import { Separator } from './ui/Separator';
import { Tooltip } from './ui/Tooltip';
import wordmarkLight from '../../assets/_wordmark-light.svg';
import wordmarkDark from '../../assets/_wordmark-dark.svg';

interface TopBarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onRender: () => void;
  onExport: () => void;
  onExportPdf: () => void;
  onCopyImage: () => void;
  onThemeToggle: () => void;
  onPaletteOpen: () => void;
  theme: 'dark' | 'light';
  canExport: boolean;
  isRendering: boolean;
  isDirty: boolean;
  format: 'svg' | 'png';
  onFormatChange: (format: 'svg' | 'png') => void;
}

export function TopBar({
  onNew,
  onOpen,
  onSave,
  onRender,
  onExport,
  onExportPdf,
  onCopyImage,
  onThemeToggle,
  onPaletteOpen,
  theme,
  canExport,
  isRendering,
  isDirty,
  format,
  onFormatChange,
}: TopBarProps) {
  return (
    <header
      className="
        flex items-center justify-between
        h-12 pl-4 pr-3
        border-b border-border
        bg-bg-elevated
        shrink-0
      "
    >
      {/* Left: full brand wordmark (mark + text, themed). SVG scales
         cleanly so the wordmark stays sharp at any width. h-8 makes the
         mark legible - at smaller sizes the 1.5% stroke becomes hairline. */}
      <div className="flex items-center min-w-0">
        <img
          src={theme === 'dark' ? wordmarkDark : wordmarkLight}
          alt="Open UML"
          className="h-8 w-auto shrink-0 select-none"
          draggable={false}
          height={32}
        />
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-0.5">
        <Tooltip content="New" shortcut="Ctrl+N">
          <IconButton icon={<FileText className="h-4 w-4" />} label="New" size="sm" onClick={onNew} />
        </Tooltip>
        <Tooltip content="Open file" shortcut="Ctrl+O">
          <IconButton icon={<FolderOpen className="h-4 w-4" />} label="Open" size="sm" onClick={onOpen} />
        </Tooltip>
        <Tooltip content="Save" shortcut="Ctrl+S">
          <IconButton
            icon={<Save className="h-4 w-4" />}
            label="Save"
            size="sm"
            onClick={onSave}
            active={isDirty}
          />
        </Tooltip>

        <Separator />

        <Tooltip content="Render diagram" shortcut="Ctrl+Shift+R">
          <Button
            variant={isRendering ? 'secondary' : 'primary'}
            size="sm"
            onClick={onRender}
            disabled={isRendering}
            leftIcon={isRendering ? undefined : <Play className="h-3.5 w-3.5 fill-current" />}
            loading={isRendering}
          >
            {isRendering ? 'Rendering' : 'Render'}
          </Button>
        </Tooltip>

        <Tooltip content="Preview format">
          <Select value={format} onChange={(e) => onFormatChange(e.target.value as 'svg' | 'png')}>
            <option value="svg">SVG</option>
            <option value="png">PNG</option>
          </Select>
        </Tooltip>

        <Separator />

        <Tooltip content="Export diagram" shortcut="Ctrl+Shift+G">
          <Button
            variant="secondary"
            size="sm"
            onClick={onExport}
            disabled={!canExport}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Export
          </Button>
        </Tooltip>
        <Tooltip content="Export as PDF">
          <Button
            variant="secondary"
            size="sm"
            onClick={onExportPdf}
            disabled={!canExport}
            leftIcon={<FileType className="h-3.5 w-3.5" />}
          >
            PDF
          </Button>
        </Tooltip>
        <Tooltip content="Copy image to clipboard" shortcut="Ctrl+Shift+C">
          <Button
            variant="secondary"
            size="sm"
            onClick={onCopyImage}
            disabled={!canExport}
            leftIcon={<Copy className="h-3.5 w-3.5" />}
          >
            Copy
          </Button>
        </Tooltip>

        <Separator />

        <Tooltip content="Command palette" shortcut="Ctrl+Shift+K">
          <IconButton
            icon={<Command className="h-4 w-4" />}
            label="Command palette"
            size="sm"
            onClick={onPaletteOpen}
          />
        </Tooltip>

        <Tooltip content={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
          <IconButton
            icon={theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            label="Toggle theme"
            size="sm"
            onClick={onThemeToggle}
          />
        </Tooltip>
      </div>
    </header>
  );
}
