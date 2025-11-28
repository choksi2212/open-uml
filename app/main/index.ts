import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { spawn } from 'child_process';
import { join } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0B1120',
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Get paths for bundled resources
function getPlantUMLPath(): string {
  if (isDev) {
    return join(__dirname, '../../app/plantuml/plantuml.jar');
  }
  return join(process.resourcesPath, 'plantuml', 'plantuml.jar');
}

function getJREPath(): string {
  if (isDev) {
    const devPath = process.platform === 'win32'
      ? join(__dirname, '../../app/plantuml/jre/bin/java.exe')
      : join(__dirname, '../../app/plantuml/jre/bin/java');
    return devPath;
  }
  const platform = process.platform;
  const jreDir = join(process.resourcesPath, 'plantuml', 'jre');
  
  return platform === 'win32'
    ? join(jreDir, 'bin', 'java.exe')
    : join(jreDir, 'bin', 'java');
}

// IPC: Render PlantUML diagram
ipcMain.handle('render-diagram', async (_, { source, format = 'svg' }) => {
  return new Promise((resolve) => {
    const plantumlJar = getPlantUMLPath();
    const javaPath = getJREPath();

    if (!existsSync(plantumlJar)) {
      resolve({
        ok: false,
        error: {
          line: 0,
          shortMessage: 'PlantUML not found',
          details: `PlantUML JAR not found at: ${plantumlJar}`,
        },
      });
      return;
    }

    if (!existsSync(javaPath)) {
      resolve({
        ok: false,
        error: {
          line: 0,
          shortMessage: 'Java runtime not found',
          details: `JRE not found at: ${javaPath}`,
        },
      });
      return;
    }

    const args = ['-jar', plantumlJar, `-t${format}`, '-pipe', '-charset', 'UTF-8'];
    const javaProcess = spawn(javaPath, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = Buffer.alloc(0);
    let stderr = '';

    javaProcess.stdout.on('data', (data: Buffer) => {
      stdout = Buffer.concat([stdout, data]);
    });

    javaProcess.stderr.on('data', (data: Buffer) => {
      stderr += data.toString('utf-8');
    });

    javaProcess.on('close', (code) => {
      if (code === 0 && stdout.length > 0) {
        const base64 = stdout.toString('base64');
        const mimeType = format === 'svg' ? 'image/svg+xml' : 'image/png';
        const dataUri = `data:${mimeType};base64,${base64}`;
        
        resolve({
          ok: true,
          format,
          data: dataUri,
        });
      } else {
        // Parse error from stderr
        const lineMatch = stderr.match(/line\s*[:=]\s*(\d+)/i);
        const line = lineMatch ? parseInt(lineMatch[1], 10) : 0;
        
        // Extract error message
        const errorLines = stderr.split('\n').filter(line => 
          line.trim() && !line.includes('java') && !line.includes('at ')
        );
        const shortMessage = errorLines[0] || 'Rendering failed';
        
        resolve({
          ok: false,
          error: {
            line,
            shortMessage: shortMessage.trim(),
            details: stderr,
          },
        });
      }
    });

    javaProcess.on('error', (error) => {
      resolve({
        ok: false,
        error: {
          line: 0,
          shortMessage: 'Process error',
          details: error.message,
        },
      });
    });

    // Send source to stdin
    javaProcess.stdin.write(source, 'utf-8');
    javaProcess.stdin.end();
  });
});

// IPC: Export diagram
ipcMain.handle('export-diagram', async (_, { data, format, defaultPath }) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: defaultPath || `diagram.${format}`,
    filters: [
      { name: format.toUpperCase(), extensions: [format] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (result.canceled) {
    return { canceled: true };
  }

  try {
    // Extract base64 data from data URI
    const base64Data = data.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    await writeFile(result.filePath!, buffer);
    return { canceled: false, path: result.filePath };
  } catch (error: any) {
    return { canceled: false, error: error.message };
  }
});

// IPC: Open file
ipcMain.handle('open-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'PlantUML Files', extensions: ['puml', 'plantuml', 'pu'] },
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }

  try {
    const content = await readFile(result.filePaths[0], 'utf-8');
    return { canceled: false, content, path: result.filePaths[0] };
  } catch (error: any) {
    return { canceled: false, error: error.message };
  }
});

// IPC: Save file
ipcMain.handle('save-file', async (_, { content, defaultPath }) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: defaultPath || 'diagram.puml',
    filters: [
      { name: 'PlantUML Files', extensions: ['puml'] },
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (result.canceled) {
    return { canceled: true };
  }

  try {
    await writeFile(result.filePath!, content, 'utf-8');
    return { canceled: false, path: result.filePath };
  } catch (error: any) {
    return { canceled: false, error: error.message };
  }
});

