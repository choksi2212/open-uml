import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Browser-preview shim: when running outside Electron (e.g. the dev
// preview server, or a static deploy), window.electronAPI is undefined
// and the renderer would crash. Inject a no-op stub so the UI is at
// least viewable for design review. Production builds in Electron
// always have the real preload-supplied API and this branch never runs.
if (typeof window !== 'undefined' && !window.electronAPI) {
  const noop = () => {};
  const noopAsync = <T,>(value: T) => () => Promise.resolve(value);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).electronAPI = {
    renderDiagram: noopAsync({ ok: false, error: { line: 0, shortMessage: 'Preview mode', details: 'PlantUML rendering disabled in browser preview.' } }),
    exportDiagram: noopAsync({ canceled: true }),
    exportPdf: noopAsync({ canceled: true }),
    copyImage: () => Promise.resolve({ ok: false, error: 'Preview mode' }),
    openFile: noopAsync({ canceled: true }),
    saveFile: noopAsync({ canceled: true }),
    saveAsFile: noopAsync({ canceled: true }),
    checkUpdates: () => Promise.resolve({ ok: false }),
    onMenuAction: noop,
    onRecentFileOpened: noop,
    onOsOpenedFile: noop,
    readFileByPath: noopAsync({ canceled: true }),
    openExternal: () => Promise.resolve(),
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
