import { contextBridge, ipcRenderer } from 'electron';

export interface RenderDiagramRequest {
  source: string;
  format?: 'svg' | 'png';
}

export interface DiagramError {
  line: number;
  shortMessage: string;
  details: string;
}

export interface DiagramRenderPayload {
  ok: boolean;
  format?: string;
  data?: string;
  error?: DiagramError;
  renderMs?: number;
}

export interface RenderDiagramResponse extends DiagramRenderPayload {
  /** Present when the source contains more than one @startXXX block. */
  diagrams?: DiagramRenderPayload[];
}

export interface ExportDiagramRequest {
  data: string;
  format: 'svg' | 'png';
  defaultPath?: string;
}

export interface FileOperationResult {
  canceled: boolean;
  content?: string;
  path?: string;
  error?: string;
}

export interface UpdateInfo {
  ok: boolean;
  current?: string;
  latest?: string;
  updateAvailable?: boolean;
  url?: string;
}

contextBridge.exposeInMainWorld('electronAPI', {
  renderDiagram: (request: RenderDiagramRequest): Promise<RenderDiagramResponse> =>
    ipcRenderer.invoke('render-diagram', request),

  exportDiagram: (request: ExportDiagramRequest): Promise<FileOperationResult> =>
    ipcRenderer.invoke('export-diagram', request),

  exportPdf: (source: string, defaultPath?: string): Promise<FileOperationResult> =>
    ipcRenderer.invoke('export-pdf', { source, defaultPath }),

  copyImage: (data: string, format: 'svg' | 'png'): Promise<{ ok: boolean; error?: string }> =>
    ipcRenderer.invoke('copy-image', { data, format }),

  openFile: (): Promise<FileOperationResult> =>
    ipcRenderer.invoke('open-file'),

  saveFile: (content: string, defaultPath?: string, useExistingPath?: boolean): Promise<FileOperationResult> =>
    ipcRenderer.invoke('save-file', { content, defaultPath, useExistingPath }),

  saveAsFile: (content: string, defaultPath?: string): Promise<FileOperationResult> =>
    ipcRenderer.invoke('save-as-file', { content, defaultPath }),

  checkUpdates: (): Promise<UpdateInfo> =>
    ipcRenderer.invoke('check-updates'),

  onMenuAction: (callback: (action: string) => void) => {
    const handler = (_: any, action: string) => callback(action);
    ipcRenderer.on('menu-action', handler);
    return () => {
      ipcRenderer.removeListener('menu-action', handler);
    };
  },

  onRecentFileOpened: (callback: (payload: { content: string; path: string }) => void) => {
    const handler = (_: any, payload: { content: string; path: string }) => callback(payload);
    ipcRenderer.on('recent-file-opened', handler);
    return () => {
      ipcRenderer.removeListener('recent-file-opened', handler);
    };
  },

  onOsOpenedFile: (callback: (payload: { content: string; path: string }) => void) => {
    const handler = (_: any, payload: { content: string; path: string }) => callback(payload);
    ipcRenderer.on('open-file-from-os', handler);
    return () => {
      ipcRenderer.removeListener('open-file-from-os', handler);
    };
  },

  readFileByPath: (filePath: string): Promise<FileOperationResult> =>
    ipcRenderer.invoke('read-file-by-path', filePath),

  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke('open-external', url),
});

declare global {
  interface Window {
    electronAPI: {
      renderDiagram: (request: RenderDiagramRequest) => Promise<RenderDiagramResponse>;
      exportDiagram: (request: ExportDiagramRequest) => Promise<FileOperationResult>;
      exportPdf: (source: string, defaultPath?: string) => Promise<FileOperationResult>;
      copyImage: (data: string, format: 'svg' | 'png') => Promise<{ ok: boolean; error?: string }>;
      openFile: () => Promise<FileOperationResult>;
      saveFile: (content: string, defaultPath?: string, useExistingPath?: boolean) => Promise<FileOperationResult>;
      saveAsFile: (content: string, defaultPath?: string) => Promise<FileOperationResult>;
      checkUpdates: () => Promise<UpdateInfo>;
      onMenuAction: (callback: (action: string) => void) => () => void;
      onRecentFileOpened: (callback: (payload: { content: string; path: string }) => void) => () => void;
      onOsOpenedFile: (callback: (payload: { content: string; path: string }) => void) => () => void;
      readFileByPath: (filePath: string) => Promise<FileOperationResult>;
      openExternal: (url: string) => Promise<void>;
    };
  }
}
