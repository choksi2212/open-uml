import { useState, useEffect, useCallback, useRef, KeyboardEvent as ReactKeyboardEvent, useMemo } from 'react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import ErrorPanel from './components/ErrorPanel';
import TopBar from './components/TopBar';
import CommandPalette from './components/CommandPalette';
import StatusBar from './components/StatusBar';
import { TEMPLATES, Template } from './templates';
import { RenderDiagramResponse, DiagramRenderPayload } from '../preload';

const DEFAULT_TEMPLATE = `@startuml
Alice -> Bob: Hello
Bob -> Alice: Hi there!
@enduml`;

function App() {
  const [source, setSource] = useState<string>(() => {
    const saved = localStorage.getItem('openuml_last_source');
    return saved || DEFAULT_TEMPLATE;
  });
  const [previewData, setPreviewData] = useState<string | null>(null);
  const [multiDiagrams, setMultiDiagrams] = useState<DiagramRenderPayload[] | null>(null);
  const [activeDiagram, setActiveDiagram] = useState(0);
  const [error, setError] = useState<RenderDiagramResponse['error'] | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderMs, setRenderMs] = useState<number | null>(null);
  const [format, setFormat] = useState<'svg' | 'png'>('svg');
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [diagramType, setDiagramType] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('openuml_theme') as 'dark' | 'light' | null;
    return saved || 'dark';
  });
  const [errorPanelOpen, setErrorPanelOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  // Editor settings, persisted: word wrap, minimap, font size.
  const [editorSettings, setEditorSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('openuml_editor_settings') || '{}');
      return {
        wordWrap: saved.wordWrap ?? 'off',
        minimap: saved.minimap ?? true,
        fontSize: saved.fontSize ?? 14,
      };
    } catch {
      return { wordWrap: 'off', minimap: true, fontSize: 14 };
    }
  });
  const renderTimeoutRef = useRef<NodeJS.Timeout>();
  const [isReady, setIsReady] = useState(false);
  const [paneRatio, setPaneRatio] = useState(52);
  const [isResizing, setIsResizing] = useState(false);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  // Save source to localStorage
  useEffect(() => {
    localStorage.setItem('openuml_last_source', source);
  }, [source]);

  // Persist editor settings
  useEffect(() => {
    localStorage.setItem('openuml_editor_settings', JSON.stringify(editorSettings));
  }, [editorSettings]);

  // Apply theme
  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('theme-dark', isDark);
    document.body.classList.toggle('theme-light', !isDark);
    localStorage.setItem('openuml_theme', theme);
  }, [theme]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isResizing) return;
    const handleMove = (event: MouseEvent) => {
      if (!workspaceRef.current) return;
      const bounds = workspaceRef.current.getBoundingClientRect();
      const next = ((event.clientX - bounds.left) / bounds.width) * 100;
      const clamped = Math.min(75, Math.max(30, next));
      setPaneRatio(clamped);
    };
    const stop = () => setIsResizing(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', stop);
    window.addEventListener('mouseleave', stop);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('mouseleave', stop);
    };
  }, [isResizing]);

  const handleResizerKey = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setPaneRatio(prev => Math.max(30, prev - 2));
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setPaneRatio(prev => Math.min(75, prev + 2));
    }
  };

  const renderDiagram = useCallback(async (umlSource: string) => {
    if (!umlSource.trim()) {
      setPreviewData(null);
      setMultiDiagrams(null);
      setError(null);
      return;
    }

    setIsRendering(true);
    setError(null);

    try {
      const response = await window.electronAPI.renderDiagram({
        source: umlSource,
        format,
      });

      setRenderMs(response.renderMs ?? null);

      if (response.diagrams && response.diagrams.length > 0) {
        // Multi-diagram file: every block rendered separately.
        setMultiDiagrams(response.diagrams);
        const active = response.diagrams[Math.min(activeDiagram, response.diagrams.length - 1)];
        if (active?.ok && active.data) {
          setPreviewData(active.data);
          setError(active.error ? active.error : null);
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
        setErrorPanelOpen(false);
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
        details: err.message || 'Unknown error occurred',
      });
      setPreviewData(null);
      setMultiDiagrams(null);
      setErrorPanelOpen(true);
    } finally {
      setIsRendering(false);
    }
  }, [format, activeDiagram]);

  // Debounced render
  useEffect(() => {
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    renderTimeoutRef.current = setTimeout(() => {
      renderDiagram(source);
    }, 300);

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [source, renderDiagram]);

  // Switching the active diagram tab re-shows its payload without re-rendering.
  useEffect(() => {
    if (multiDiagrams && multiDiagrams.length > 0) {
      const active = multiDiagrams[Math.min(activeDiagram, multiDiagrams.length - 1)];
      if (active?.ok && active.data) {
        setPreviewData(active.data);
        setError(null);
      } else {
        setPreviewData(null);
        setError(active?.error ?? null);
      }
    }
  }, [activeDiagram]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track the diagram type from the source's @startXXX directive.
  useEffect(() => {
    const m = source.match(/^\s*@start([a-z]+)/im);
    setDiagramType(m ? m[1].toLowerCase() : null);
  }, [source]);

  const handleNew = useCallback(() => {
    setSource(DEFAULT_TEMPLATE);
    setCurrentFilePath(null);
    setPreviewData(null);
    setMultiDiagrams(null);
    setError(null);
    setErrorPanelOpen(false);
    setActiveDiagram(0);
  }, []);

  const handleOpen = useCallback(async () => {
    const result = await window.electronAPI.openFile();
    if (!result.canceled && result.content) {
      setSource(result.content);
      setCurrentFilePath(result.path || null);
      setActiveDiagram(0);
      setError(null);
      setErrorPanelOpen(false);
    } else if (result.error) {
      alert(`Open failed: ${result.error}`);
    }
  }, []);

  const handleSave = useCallback(async () => {
    const result = await window.electronAPI.saveFile(source, currentFilePath || undefined, !!currentFilePath);
    if (!result.canceled && result.path) {
      setCurrentFilePath(result.path);
    } else if (result.error) {
      alert(`Save failed: ${result.error}`);
    }
  }, [source, currentFilePath]);

  const handleSaveAs = useCallback(async () => {
    const result = await window.electronAPI.saveAsFile(source, currentFilePath || undefined);
    if (!result.canceled && result.path) {
      setCurrentFilePath(result.path);
    } else if (result.error) {
      alert(`Save As failed: ${result.error}`);
    }
  }, [source, currentFilePath]);

  const handleExport = useCallback(async (exportFormat?: 'svg' | 'png') => {
    if (!previewData) return;

    const targetFormat = exportFormat || format;
    const result = await window.electronAPI.exportDiagram({
      data: previewData,
      format: targetFormat,
      defaultPath: `diagram.${targetFormat}`,
    });

    if (result.error) {
      alert(`Export failed: ${result.error}`);
    }
  }, [previewData, format]);

  const handleExportPdf = useCallback(async () => {
    const result = await window.electronAPI.exportPdf(source, currentFilePath?.replace(/\.(puml|txt|pu)$/i, '.pdf') || 'diagram.pdf');
    if (result.error) {
      alert(`PDF export failed: ${result.error}`);
    }
  }, [source, currentFilePath]);

  const handleCopyImage = useCallback(async () => {
    if (!previewData) return;
    const result = await window.electronAPI.copyImage(previewData, format);
    if (!result.ok) {
      alert(`Copy failed: ${result.error}`);
    }
  }, [previewData, format]);

  const applyTemplate = useCallback((tpl: Template) => {
    setSource(tpl.source);
    setPaletteOpen(false);
    setActiveDiagram(0);
    setError(null);
    setErrorPanelOpen(false);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const commandPaletteActions = useMemo(() => ([
    { id: 'new', label: 'New File', run: handleNew, keys: 'Ctrl+N' },
    { id: 'save', label: 'Save', run: handleSave, keys: 'Ctrl+S' },
    { id: 'render', label: 'Render Diagram', run: () => renderDiagram(source), keys: 'Ctrl+Shift+R' },
    { id: 'export-svg', label: 'Export as SVG', run: () => handleExport('svg'), keys: 'Ctrl+Shift+G' },
    { id: 'export-png', label: 'Export as PNG', run: () => handleExport('png'), keys: 'Ctrl+Shift+P' },
    { id: 'export-pdf', label: 'Export as PDF', run: handleExportPdf, keys: '' },
    { id: 'copy-image', label: 'Copy Image to Clipboard', run: handleCopyImage, keys: 'Ctrl+Shift+C' },
    { id: 'toggle-theme', label: 'Toggle Theme', run: toggleTheme, keys: '' },
    { id: 'toggle-wrap', label: editorSettings.wordWrap === 'on' ? 'Disable Word Wrap' : 'Enable Word Wrap', run: () => setEditorSettings((s: any) => ({ ...s, wordWrap: s.wordWrap === 'on' ? 'off' : 'on' })), keys: '' },
    { id: 'toggle-minimap', label: editorSettings.minimap ? 'Hide Minimap' : 'Show Minimap', run: () => setEditorSettings((s: any) => ({ ...s, minimap: !s.minimap })), keys: '' },
    { id: 'font-up', label: 'Increase Font Size', run: () => setEditorSettings((s: any) => ({ ...s, fontSize: Math.min(28, s.fontSize + 1) })), keys: '' },
    { id: 'font-down', label: 'Decrease Font Size', run: () => setEditorSettings((s: any) => ({ ...s, fontSize: Math.max(10, s.fontSize - 1) })), keys: '' },
    { id: 'check-updates', label: 'Check for Updates', run: async () => {
      const info = await window.electronAPI.checkUpdates();
      if (info.ok && info.updateAvailable) {
        if (confirm(`Update available: ${info.latest} (you have ${info.current}). Open the release page?`)) {
          window.electronAPI.openExternal(info.url!);
        }
      } else if (info.ok) {
        alert(`You are up to date (${info.current}).`);
      } else {
        alert('Could not check for updates.');
      }
    }, keys: '' },
    ...TEMPLATES.map((tpl) => ({
      id: `template-${tpl.name}`,
      label: `Template: ${tpl.name}`,
      run: () => applyTemplate(tpl),
      keys: '',
    })),
  ]), [handleNew, handleSave, handleExport, handleExportPdf, handleCopyImage, renderDiagram, source, editorSettings, applyTemplate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+P opens the command palette unless already claimed by PNG export
      // (CmdOrCtrl+Shift+P is Export PNG in menus; palette uses Ctrl+P plain in
      // monaco-free zones and Ctrl+Shift+K here to avoid the clash).
      if (e.ctrlKey && e.shiftKey && (e.key === 'K' || e.key === 'k')) {
        e.preventDefault();
        setPaletteOpen(o => !o);
      }
      if (e.ctrlKey && e.key === 'n' && !e.shiftKey) {
        e.preventDefault();
        handleNew();
      }
      if (e.ctrlKey && e.key === 's' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        handleSaveAs();
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        renderDiagram(source);
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        handleExport('svg');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        handleExport('png');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        handleCopyImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNew, handleSave, handleSaveAs, handleExport, handleCopyImage, renderDiagram, source]);

  // Menu actions
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
          renderDiagram(source);
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
  }, [handleNew, handleOpen, handleSave, handleSaveAs, handleExport, handleExportPdf, handleCopyImage, renderDiagram, source]);

  // Recent files opened from the menu.
  useEffect(() => {
    const cleanup = window.electronAPI.onRecentFileOpened(({ content, path }) => {
      setSource(content);
      setCurrentFilePath(path);
      setActiveDiagram(0);
      setError(null);
      setErrorPanelOpen(false);
    });
    return cleanup;
  }, []);

  return (
    <div className={`app-shell ${theme === 'dark' ? 'theme-dark' : 'theme-light'} ${isReady ? 'app-shell--ready' : ''}`}>
      <div className="app-ambient app-ambient--one" />
      <div className="app-ambient app-ambient--two" />
      <div className="app-surface">
        <TopBar
          onNew={handleNew}
          onRender={() => renderDiagram(source)}
          onExport={handleExport}
          onExportPdf={handleExportPdf}
          onCopyImage={handleCopyImage}
          onOpen={handleOpen}
          onSave={handleSave}
          onThemeToggle={toggleTheme}
          onPaletteOpen={() => setPaletteOpen(true)}
          theme={theme}
          canExport={!!previewData}
          isRendering={isRendering}
          format={format}
          onFormatChange={setFormat}
        />
        
        <div className="workspace" aria-label="Editor and preview workspace">
          <div
            className="workspace-grid"
            ref={workspaceRef}
            style={{
              gridTemplateColumns: `calc(${paneRatio}% - 6px) 12px calc(${100 - paneRatio}% - 6px)`
            }}
          >
            <div className="app-pane">
              <Editor
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
            <button
              type="button"
              className={`app-resizer ${isResizing ? 'is-active' : ''}`}
              onMouseDown={() => setIsResizing(true)}
              onKeyDown={handleResizerKey}
              aria-label="Resize panes"
              aria-orientation="vertical"
              role="separator"
              tabIndex={0}
            />
            <div className="app-pane">
              <Preview
                data={previewData}
                isRendering={isRendering}
                format={format}
                theme={theme}
                diagrams={multiDiagrams}
                activeDiagram={activeDiagram}
                onSelectDiagram={setActiveDiagram}
              />
            </div>
          </div>
        </div>

        <StatusBar
          theme={theme}
          filePath={currentFilePath}
          cursorPosition={cursorPosition}
          diagramType={diagramType}
          renderMs={renderMs}
          diagramCount={multiDiagrams?.length ?? null}
        />

        {error && (
          <ErrorPanel
            error={error}
            isOpen={errorPanelOpen}
            onToggle={() => setErrorPanelOpen(!errorPanelOpen)}
            theme={theme}
          />
        )}

        {paletteOpen && (
          <CommandPalette
            theme={theme}
            actions={commandPaletteActions}
            onClose={() => setPaletteOpen(false)}
          />
        )}
      </div>

      <footer className="app-footer">
        <p className="footer-heading">
          Created for Students by <span>Manas Choksi</span>
        </p>
        <div className="footer-links">
          <button
            onClick={() => window.electronAPI.openExternal('https://www.github.com/choksi2212')}
            className="footer-link"
            title="GitHub"
          >
            <svg className="footer-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>GitHub</span>
          </button>
          <button
            onClick={() => window.electronAPI.openExternal('https://www.linkedin.com/in/manas-choksi')}
            className="footer-link"
            title="LinkedIn"
          >
            <svg className="footer-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <span>LinkedIn</span>
          </button>
          <button
            onClick={() => window.electronAPI.openExternal('https://www.instagram.com/manas_choksi_22')}
            className="footer-link"
            title="Instagram"
          >
            <svg className="footer-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>Instagram</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
