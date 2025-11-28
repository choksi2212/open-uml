import { contextBridge, ipcRenderer } from 'electron';

export interface RenderDiagramRequest {
  source: string;
  format?: 'svg' | 'png';
}

export interface RenderDiagramResponse {
  ok: boolean;
  format?: string;
  data?: string;
  error?: {
    line: number;
    shortMessage: string;
    details: string;
  };
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

contextBridge.exposeInMainWorld('electronAPI', {
  renderDiagram: (request: RenderDiagramRequest): Promise<RenderDiagramResponse> =>
    ipcRenderer.invoke('render-diagram', request),
  
  exportDiagram: (request: ExportDiagramRequest): Promise<FileOperationResult> =>
    ipcRenderer.invoke('export-diagram', request),
  
  openFile: (): Promise<FileOperationResult> =>
    ipcRenderer.invoke('open-file'),
  
  saveFile: (content: string, defaultPath?: string, useExistingPath?: boolean): Promise<FileOperationResult> =>
    ipcRenderer.invoke('save-file', { content, defaultPath, useExistingPath }),
  
  saveAsFile: (content: string, defaultPath?: string): Promise<FileOperationResult> =>
    ipcRenderer.invoke('save-as-file', { content, defaultPath }),
  
  onMenuAction: (callback: (action: string) => void) => {
    const handler = (_: any, action: string) => callback(action);
    ipcRenderer.on('menu-action', handler);
    return () => {
      ipcRenderer.removeListener('menu-action', handler);
    };
  },
  
  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke('open-external', url),
});

declare global {
  interface Window {
    electronAPI: {
      renderDiagram: (request: RenderDiagramRequest) => Promise<RenderDiagramResponse>;
      exportDiagram: (request: ExportDiagramRequest) => Promise<FileOperationResult>;
      openFile: () => Promise<FileOperationResult>;
      saveFile: (content: string, defaultPath?: string, useExistingPath?: boolean) => Promise<FileOperationResult>;
      saveAsFile: (content: string, defaultPath?: string) => Promise<FileOperationResult>;
      onMenuAction: (callback: (action: string) => void) => () => void;
      openExternal: (url: string) => Promise<void>;
    };
  }
}

