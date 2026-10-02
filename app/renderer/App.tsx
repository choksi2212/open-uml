import { useState, useEffect, useCallback, useRef, useMemo, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { CodeEditor } from './components/Editor';
import { Preview } from './components/Preview';
import { ErrorPanel } from './components/ErrorPanel';
import { TopBar } from './components/TopBar';
import { CommandPalette } from './components/CommandPalette';
import { StatusBar } from './components/StatusBar';
import { PaletteAction } from './components/CommandPalette';
import { TEMPLATES, Template } from './templates';
import { DiagramRenderPayload, RenderDiagramResponse } from '../preload';
import {
  APP_NAME,
  PANE_RATIO_DEFAULT,
  PANE_RATIO_MAX,
  PANE_RATIO_MIN,
  PANE_RATIO_STEP,
  RENDER_DEBOUNCE_MS,
  STORAGE,
} from './lib/constants';

const DEFAULT_TEMPLATE = `@startuml
Alice -> Bob: Hello
Bob -> Alice: Hi there!
@enduml`;

function App() {
  // --- Persistent state ----------------------------------------------------
  const [source, setSource] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE.SOURCE) || DEFAULT_TEMPLATE;
    } catch {
      return DEFAULT_TEMPLATE;
    }
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem(STORAGE.THEME) as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [editorSettings, setEditorSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE.EDITOR) || '{}');
      return {
        wordWrap: saved.wordWrap ?? 'off',
        minimap: saved.minimap ?? true,
        fontSize: saved.fontSize ?? 14,
      };
    } catch {
      return { wordWrap: 'off', minimap: true, fontSize: 14 };
    }
  });

  const [paneRatio, setPaneRatio] = useState<number>(() => {
    const v = Number(localStorage.getItem(STORAGE.PANE_RATIO));
    return Number.isFinite(v) && v >= PANE_RATIO_MIN && v <= PANE_RATIO_MAX ? v : PANE_RATIO_DEFAULT;
  });

  // --- Session state -------------------------------------------------------
  const [previewData, setPreviewData] = useState<string | null>(null);
  const [multiDiagrams, setMultiDiagrams] = useState<DiagramRenderPayload[] | null>(null);
  const [activeDiagram, setActiveDiagram] = useState(0);
  const [error, setError] = useState<RenderDiagramResponse['error'] | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderMs, setRenderMs] = useState<number | null>(null);
  const [format, setFormat] = useState<'svg' | 'png'>('svg');
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [diagramType, setDiagramType] = useState<string | null>(null);
  const [errorPanelOpen, setErrorPanelOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [savedSource, setSavedSource] = useState<string>(() => source);

  // --- Refs ----------------------------------------------------------------
  const renderTimeoutRef = useRef<number>();
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const sourceRef = useRef(source);
  sourceRef.current = source;
  const currentFilePathRef = useRef(currentFilePath);
  currentFilePathRef.current = currentFilePath;

  // --- Persistence effects -------------------------------------------------
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE.SOURCE, source);
    } catch {
      /* quota */
    }
  }, [source]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE.THEME, theme);
    } catch {
      /* */
    }
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE.EDITOR, JSON.stringify(editorSettings));
    } catch {
      /* */
    }
  }, [editorSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE.PANE_RATIO, String(paneRatio));
    } catch {
      /* */
    }
  }, [paneRatio]);

  // Dirty tracking.
  useEffect(() => {
    setIsDirty(source !== savedSource);
  }, [source, savedSource]);

  // Resize handle.
  const [isResizing, setIsResizing] = useState(false);
  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent) => {
      if (!workspaceRef.current) return;
      const bounds = workspaceRef.current.getBoundingClientRect();
      const next = ((e.clientX - bounds.left) / bounds.width) * 100;
      setPaneRatio(Math.min(PANE_RATIO_MAX, Math.max(PANE_RATIO_MIN, next)));
    };
    const stop = () => setIsResizing(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', stop);
    window.addEventListener('mouseleave', stop);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('mouseleave', stop);
    };
  }, [isResizing]);

  const handleResizerKey = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setPaneRatio((p) => Math.max(PANE_RATIO_MIN, p - PANE_RATIO_STEP));
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setPaneRatio((p) => Math.min(PANE_RATIO_MAX, p + PANE_RATIO_STEP));
    }
    if (e.key === 'Home') {
      e.preventDefault();
      setPaneRatio(PANE_RATIO_DEFAULT);
    }
  };

  // --- Diagram type detection ---------------------------------------------
  useEffect(() => {
    const m = source.match(/^\s*@start([a-z]+)/im);
    setDiagramType(m ? m[1].toLowerCase() : null);
  }, [source]);

  // --- Rendering ----------------------------------------------------------
  const renderDiagram = useCallback(
    async (umlSource: string) => {
      if (!umlSource.trim()) {
        setPreviewData(null);
        setMultiDiagrams(null);
        setError(null);
        setRenderMs(null);
        return;
      }
      setIsRendering(true);
      setError(null);
      try {
        const response = await window.electronAPI.renderDiagram({ source: umlSource, format });
        setRenderMs(response.renderMs ?? null);

        if (response.diagrams && response.diagrams.length > 0) {
          setMultiDiagrams(response.diagrams);
          const active = response.diagrams[Math.min(activeDiagram, response.diagrams.length - 1)];
          if (active?.ok && active.data) {
            setPreviewData(active.data);
            setError(null);
          } else {
            setPreviewData(null);
            setError(active?.error ?? null);
            setErrorPanelOpen(true);
          }
          return;
        }

        if (response.ok && response.data) {
          setPreviewData(response.data);
          setMultiDiagrams(null);
          setError(null);
        } else if (response.error) {
          setError(response.error);
          setPreviewData(null);
          setMultiDiagrams(null);
          setErrorPanelOpen(true);
        }
      } catch (err: any) {
        setError({
          line: 0,
          shortMessage: 'Rendering error',
          details: err?.message || 'Unknown error',
        });
        setPreviewData(null);
        setMultiDiagrams(null);
        setErrorPanelOpen(true);
      } finally {
        setIsRendering(false);
      }
    },
    [format, activeDiagram],
  );

  // Debounced render on source change.
  useEffect(() => {
    if (renderTimeoutRef.current) clearTimeout(renderTimeoutRef.current);
    renderTimeoutRef.current = window.setTimeout(() => {
      renderDiagram(source);
    }, RENDER_DEBOUNCE_MS);
    return () => {
      if (renderTimeoutRef.current) clearTimeout(renderTimeoutRef.current);
    };
  }, [source, renderDiagram]);

  // Switching tabs re-shows without re-rendering.
  useEffect(() => {
    if (!multiDiagrams || multiDiagrams.length === 0) return;
    const active = multiDiagrams[Math.min(activeDiagram, multiDiagrams.length - 1)];
    if (active?.ok && active.data) {
      setPreviewData(active.data);
      setError(null);
    } else {
      setPreviewData(null);
      setError(active?.error ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDiagram]);

  // --- File ops ------------------------------------------------------------
  const handleNew = useCallback(() => {
    if (isDirty && !window.confirm('Discard unsaved changes?')) return;
    setSource(DEFAULT_TEMPLATE);
    setSavedSource(DEFAULT_TEMPLATE);
    setCurrentFilePath(null);
    setPreviewData(null);
    setMultiDiagrams(null);
    setError(null);
    setErrorPanelOpen(false);
    setActiveDiagram(0);
  }, [isDirty]);

  const handleOpen = useCallback(async () => {
    const result = await window.electronAPI.openFile();
    if (result.canceled) return;
    if (result.error) {
      window.alert(`Open failed: ${result.error}`);
      return;
    }
    if (result.content !== undefined) {
      setSource(result.content);
      setSavedSource(result.content);
      setCurrentFilePath(result.path || null);
      setActiveDiagram(0);
      setError(null);
      setErrorPanelOpen(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    const result = await window.electronAPI.saveFile(source, currentFilePath || undefined, !!currentFilePath);
    if (result.canceled) return;
    if (result.error) {
      window.alert(`Save failed: ${result.error}`);
      return;
    }
    if (result.path) {
      setCurrentFilePath(result.path);
      setSavedSource(source);
    }
  }, [source, currentFilePath]);

  const handleSaveAs = useCallback(async () => {
    const result = await window.electronAPI.saveAsFile(source, currentFilePath || undefined);
    if (result.canceled) return;
    if (result.error) {
      window.alert(`Save As failed: ${result.error}`);
      return;
    }
    if (result.path) {
      setCurrentFilePath(result.path);
      setSavedSource(source);
    }
  }, [source, currentFilePath]);

  const handleExport = useCallback(
    async (exportFormat?: 'svg' | 'png') => {
      if (!previewData) return;
      const targetFormat = exportFormat || format;
      const result = await window.electronAPI.exportDiagram({
        data: previewData,
        format: targetFormat,
        defaultPath: `${(currentFilePath || 'diagram').split(/[\\/]/).pop()?.replace(/\.[^.]+$/, '') || 'diagram'}.${targetFormat}`,
      });
      if (result.error) window.alert(`Export failed: ${result.error}`);
    },
    [previewData, format, currentFilePath],
  );

  const handleExportPdf = useCallback(async () => {
    const base = currentFilePath?.replace(/\.(puml|txt|pu)$/i, '') || 'diagram';
    const result = await window.electronAPI.exportPdf(source, `${base}.pdf`);
    if (result.error) window.alert(`PDF export failed: ${result.error}`);
  }, [source, currentFilePath]);

  const handleCopyImage = useCallback(async () => {
    if (!previewData) return;
    const result = await window.electronAPI.copyImage(previewData, format);
    if (!result.ok) window.alert(`Copy failed: ${result.error}`);
  }, [previewData, format]);

  const applyTemplate = useCallback((tpl: Template) => {
    if (isDirty && !window.confirm('Discard unsaved changes?')) return;
    setSource(tpl.source);
    setSavedSource(tpl.source);
    setPaletteOpen(false);
    setActiveDiagram(0);
    setError(null);
    setErrorPanelOpen(false);
  }, [isDirty]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  // --- Drag and drop ------------------------------------------------------
  useEffect(() => {
    const onDragOver = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes('Files')) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    };
    const onDrop = async (e: DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer?.files?.[0];
      if (!file) return;
      // Electron sets a non-standard `path` on File objects dropped from
      // the OS; if it's missing we can't resolve the file.
      const filePath = (file as unknown as { path?: string }).path;
      if (!filePath) return;
      if (isDirty && !window.confirm(`Discard unsaved changes and open ${file.name}?`)) return;
      const result = await window.electronAPI.readFileByPath(filePath);
      if (result.error) {
        window.alert(`Open failed: ${result.error}`);
        return;
      }
      if (result.content !== undefined) {
        setSource(result.content);
        setSavedSource(result.content);
        setCurrentFilePath(result.path || null);
        setActiveDiagram(0);
        setError(null);
        setErrorPanelOpen(false);
      }
    };
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('drop', onDrop);
    };
  }, [isDirty]);

  // --- Command palette actions --------------------------------------------
  const commandPaletteActions: PaletteAction[] = useMemo(() => {
    return [
      { id: 'new', label: 'New file', shortcut: 'Ctrl+N', run: handleNew },
      { id: 'open', label: 'Open file', shortcut: 'Ctrl+O', run: handleOpen },
      { id: 'save', label: 'Save', shortcut: 'Ctrl+S', run: handleSave },
      { id: 'save-as', label: 'Save as', shortcut: 'Ctrl+Shift+S', run: handleSaveAs },
      {
        id: 'render',
        label: 'Render diagram',
        shortcut: 'Ctrl+Shift+R',
        run: () => renderDiagram(sourceRef.current),
      },
      { id: 'export-svg', label: 'Export as SVG', shortcut: 'Ctrl+Shift+G', run: () => handleExport('svg') },
      { id: 'export-png', label: 'Export as PNG', shortcut: 'Ctrl+Shift+P', run: () => handleExport('png') },
      { id: 'export-pdf', label: 'Export as PDF', run: handleExportPdf },
      { id: 'copy-image', label: 'Copy image to clipboard', shortcut: 'Ctrl+Shift+C', run: handleCopyImage },
      { id: 'toggle-theme', label: 'Toggle theme', run: toggleTheme },
      {
        id: 'toggle-wrap',
        label: editorSettings.wordWrap === 'on' ? 'Disable word wrap' : 'Enable word wrap',
        run: () =>
          setEditorSettings((s: any) => ({ ...s, wordWrap: s.wordWrap === 'on' ? 'off' : 'on' })),
      },
      {
        id: 'toggle-minimap',
        label: editorSettings.minimap ? 'Hide minimap' : 'Show minimap',
        run: () => setEditorSettings((s: any) => ({ ...s, minimap: !s.minimap })),
      },
      {
        id: 'font-up',
        label: 'Increase font size',
        run: () => setEditorSettings((s: any) => ({ ...s, fontSize: Math.min(28, s.fontSize + 1) })),
      },
      {
        id: 'font-down',
        label: 'Decrease font size',
        run: () => setEditorSettings((s: any) => ({ ...s, fontSize: Math.max(10, s.fontSize - 1) })),
      },
      {
        id: 'check-updates',
        label: 'Check for updates',
        run: async () => {
          const info = await window.electronAPI.checkUpdates();
          if (info.ok && info.updateAvailable) {
            if (window.confirm(`Update available: ${info.latest} (you have ${info.current}). Open the release page?`)) {
              window.electronAPI.openExternal(info.url!);
            }
          } else if (info.ok) {
            window.alert(`You are up to date (${info.current}).`);
          } else {
            window.alert('Could not check for updates.');
          }
        },
      },
      ...TEMPLATES.map<PaletteAction>((tpl) => ({
        id: `template-${tpl.name}`,
        label: `Template: ${tpl.name}`,
        run: () => applyTemplate(tpl),
      })),
    ];
    // Intentionally omit `source` from deps - read via ref to avoid rebuilding on every keystroke.
  }, [handleNew, handleOpen, handleSave, handleSaveAs, handleExport, handleExportPdf, handleCopyImage, renderDiagram, toggleTheme, editorSettings, applyTemplate]);

  // --- Keyboard shortcuts --------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cmd = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const key = e.key.toLowerCase();

      // Always: Ctrl+Shift+K opens the palette.
      if (cmd && shift && key === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      if (cmd && !shift && key === 'n') {
        e.preventDefault();
        handleNew();
      } else if (cmd && !shift && key === 's') {
        e.preventDefault();
        handleSave();
      } else if (cmd && shift && key === 's') {
        e.preventDefault();
        handleSaveAs();
      } else if (cmd && shift && key === 'r') {
        e.preventDefault();
        renderDiagram(sourceRef.current);
      } else if (cmd && shift && key === 'g') {
        e.preventDefault();
        handleExport('svg');
      } else if (cmd && shift && key === 'p') {
        e.preventDefault();
        handleExport('png');
      } else if (cmd && shift && key === 'c') {
        e.preventDefault();
        handleCopyImage();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleNew, handleSave, handleSaveAs, handleExport, handleCopyImage, renderDiagram]);

  // --- Menu actions from the native menu ---------------------------------
  useEffect(() => {
    const cleanup = window.electronAPI.onMenuAction((action: string) => {
      switch (action) {
        case 'new':
          handleNew();
          break;
        case 'open':
          handleOpen();
          break;
        case 'save':
          handleSave();
          break;
        case 'save-as':
          handleSaveAs();
          break;
        case 'render':
          renderDiagram(sourceRef.current);
          break;
        case 'export-svg':
          handleExport('svg');
          break;
        case 'export-png':
          handleExport('png');
          break;
        case 'export-pdf':
          handleExportPdf();
          break;
        case 'copy-image':
          handleCopyImage();
          break;
      }
    });
    return cleanup;
  }, [handleNew, handleOpen, handleSave, handleSaveAs, handleExport, handleExportPdf, handleCopyImage, renderDiagram]);

  // --- Recent files from the native menu ---------------------------------
  useEffect(() => {
    return window.electronAPI.onRecentFileOpened(({ content, path }) => {
      if (isDirty && !window.confirm('Discard unsaved changes?')) return;
      setSource(content);
      setSavedSource(content);
      setCurrentFilePath(path);
      setActiveDiagram(0);
      setError(null);
      setErrorPanelOpen(false);
    });
  }, [isDirty]);

  // --- Files opened from the OS (double-click .puml, "Open With", argv) ---
  useEffect(() => {
    return window.electronAPI.onOsOpenedFile(({ content, path }) => {
      if (isDirty && !window.confirm('Discard unsaved changes?')) return;
      setSource(content);
      setSavedSource(content);
      setCurrentFilePath(path);
      setActiveDiagram(0);
      setError(null);
      setErrorPanelOpen(false);
    });
  }, [isDirty]);

  return (
    <div
      className="flex flex-col h-screen w-screen bg-bg text-fg"
      style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
    >
      <TopBar
        onNew={handleNew}
        onOpen={handleOpen}
        onSave={handleSave}
        onRender={() => renderDiagram(sourceRef.current)}
        onExport={() => handleExport()}
        onExportPdf={handleExportPdf}
        onCopyImage={handleCopyImage}
        onThemeToggle={toggleTheme}
        onPaletteOpen={() => setPaletteOpen(true)}
        theme={theme}
        canExport={!!previewData}
        isRendering={isRendering}
        isDirty={isDirty}
        format={format}
        onFormatChange={setFormat}
      />

      <div className="flex-1 min-h-0 flex" ref={workspaceRef}>
        {/* Editor pane */}
        <div
          className="min-w-0 h-full flex flex-col"
          style={{ width: `calc(${paneRatio}% - 6px)` }}
        >
          <CodeEditor
            value={source}
            onChange={setSource}
            error={error}
            theme={theme}
            wordWrap={editorSettings.wordWrap}
            minimap={editorSettings.minimap}
            fontSize={editorSettings.fontSize}
            onCursorPosition={(line, column) => setCursorPosition({ line, column })}
          />
        </div>

        {/* Resizer */}
        <button
          type="button"
          aria-label="Resize editor and preview"
          aria-orientation="vertical"
          role="separator"
          tabIndex={0}
          onMouseDown={() => setIsResizing(true)}
          onKeyDown={handleResizerKey}
          onDoubleClick={() => setPaneRatio(PANE_RATIO_DEFAULT)}
          className={`
            w-[12px] h-full shrink-0 cursor-col-resize
            bg-transparent border-x border-border
            transition-colors duration-150
            hover:bg-accent/10
            ${isResizing ? 'bg-accent/15' : ''}
            focus:outline-none focus-visible:bg-accent/20
          `}
        />

        {/* Preview pane */}
        <div
          className="min-w-0 h-full flex flex-col"
          style={{ width: `calc(${100 - paneRatio}% - 6px)` }}
        >
          <Preview
            data={previewData}
            isRendering={isRendering}
            format={format}
            diagrams={multiDiagrams}
            activeDiagram={activeDiagram}
            onSelectDiagram={setActiveDiagram}
          />
        </div>
      </div>

      <StatusBar
        theme={theme}
        filePath={currentFilePath}
        isDirty={isDirty}
        cursorPosition={cursorPosition}
        diagramType={diagramType}
        renderMs={renderMs}
        diagramCount={multiDiagrams ? activeDiagram + 1 : null}
        totalDiagrams={multiDiagrams?.length ?? 0}
      />

      {error && (
        <ErrorPanel
          error={error}
          isOpen={errorPanelOpen}
          onToggle={() => setErrorPanelOpen((o) => !o)}
        />
      )}

      {paletteOpen && (
        <CommandPalette
          actions={commandPaletteActions}
          onClose={() => setPaletteOpen(false)}
        />
      )}

      <span className="sr-only">{APP_NAME}</span>
    </div>
  );
}

export default App;
