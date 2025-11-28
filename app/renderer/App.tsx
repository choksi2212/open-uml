import { useState, useEffect, useCallback, useRef, KeyboardEvent as ReactKeyboardEvent } from 'react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import ErrorPanel from './components/ErrorPanel';
import TopBar from './components/TopBar';
import { RenderDiagramResponse } from '../preload';

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
  const [error, setError] = useState<RenderDiagramResponse['error'] | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [format, setFormat] = useState<'svg' | 'png'>('svg');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('openuml_theme') as 'dark' | 'light' | null;
    return saved || 'dark';
  });
  const [errorPanelOpen, setErrorPanelOpen] = useState(false);
  const renderTimeoutRef = useRef<NodeJS.Timeout>();
  const [isReady, setIsReady] = useState(false);
  const [paneRatio, setPaneRatio] = useState(52);
  const [isResizing, setIsResizing] = useState(false);
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  // Save source to localStorage
  useEffect(() => {
    localStorage.setItem('openuml_last_source', source);
  }, [source]);

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

      if (response.ok && response.data) {
        setPreviewData(response.data);
        setError(null);
        setErrorPanelOpen(false);
      } else if (response.error) {
        setError(response.error);
        setPreviewData(null);
        setErrorPanelOpen(true);
      }
    } catch (err: any) {
      setError({
        line: 0,
        shortMessage: 'Rendering error',
        details: err.message || 'Unknown error occurred',
      });
      setPreviewData(null);
      setErrorPanelOpen(true);
    } finally {
      setIsRendering(false);
    }
  }, [format]);

  // Debounced render
  useEffect(() => {
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    renderTimeoutRef.current = setTimeout(() => {
      renderDiagram(source);
    }, 700);

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [source, renderDiagram]);

  const handleNew = () => {
    setSource(DEFAULT_TEMPLATE);
    setPreviewData(null);
    setError(null);
    setErrorPanelOpen(false);
  };

  const handleExport = async () => {
    if (!previewData) return;

    const result = await window.electronAPI.exportDiagram({
      data: previewData,
      format,
      defaultPath: `diagram.${format}`,
    });

    if (result.error) {
      alert(`Export failed: ${result.error}`);
    }
  };

  const handleOpen = async () => {
    const result = await window.electronAPI.openFile();
    if (!result.canceled && result.content) {
      setSource(result.content);
      setError(null);
      setErrorPanelOpen(false);
    } else if (result.error) {
      alert(`Open failed: ${result.error}`);
    }
  };

  const handleSave = async () => {
    const result = await window.electronAPI.saveFile(source);
    if (result.error) {
      alert(`Save failed: ${result.error}`);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`app-shell ${theme === 'dark' ? 'theme-dark' : 'theme-light'} ${isReady ? 'app-shell--ready' : ''}`}>
      <div className="app-ambient app-ambient--one" />
      <div className="app-ambient app-ambient--two" />
      <div className="app-surface">
        <TopBar
          onNew={handleNew}
          onRender={() => renderDiagram(source)}
          onExport={handleExport}
          onOpen={handleOpen}
          onSave={handleSave}
          onThemeToggle={toggleTheme}
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
              />
            </div>
          </div>
        </div>

        {error && (
          <ErrorPanel
            error={error}
            isOpen={errorPanelOpen}
            onToggle={() => setErrorPanelOpen(!errorPanelOpen)}
            theme={theme}
          />
        )}
      </div>

      <footer className="app-footer">
        <p className="footer-heading">
          Crafted with care by <span>Manas Choksi</span>
        </p>
        <div className="footer-links">
          <a href="https://www.github.com/choksi2212" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/manas-choksi" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href="https://www.instagram.com/manas_choksi_22" target="_blank" rel="noreferrer">
            Instagram
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;

