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
  
  saveFile: (content: string, defaultPath?: string): Promise<FileOperationResult> =>
    ipcRenderer.invoke('save-file', { content, defaultPath }),
});

declare global {
  interface Window {
    electronAPI: {
      renderDiagram: (request: RenderDiagramRequest) => Promise<RenderDiagramResponse>;
      exportDiagram: (request: ExportDiagramRequest) => Promise<FileOperationResult>;
      openFile: () => Promise<FileOperationResult>;
      saveFile: (content: string, defaultPath?: string) => Promise<FileOperationResult>;
    };
  }
}

