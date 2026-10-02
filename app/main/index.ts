import { app, BrowserWindow, ipcMain, dialog, Menu, shell, clipboard, nativeImage } from 'electron';
import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { createWriteStream } from 'fs';
import {
  splitDiagrams,
  parsePlantumlError,
  looksLikeErrorImage,
  DiagramRenderResult,
} from './plantuml-parser';

let mainWindow: BrowserWindow | null = null;
let currentFilePath: string | null = null;

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

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Drain any files that the OS asked us to open before the window was ready.
  mainWindow.webContents.once('did-finish-load', () => {
    while (pendingFileOpen.length > 0) {
      const next = pendingFileOpen.shift()!;
      sendFileToRenderer(next);
    }
  });
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

// Get paths for bundled resources
function getPlantUMLPath(): string {
  if (isDev) {
    return join(__dirname, '../../app/plantuml/plantuml.jar');
  }
  return join(process.resourcesPath, 'plantuml', 'plantuml.jar');
}

// The JRE is platform-specific and lives in a per-OS folder (jre-win on
// Windows, jre-mac on macOS) that the build script populates before
// electron-builder packs it. v1.0.1 and earlier shipped the Windows JRE
// inside the macOS DMG, which is why macOS reported the app as damaged.
function getJREDir(): string {
  const folder = process.platform === 'win32' ? 'jre-win' : 'jre-mac';
  if (isDev) {
    return join(__dirname, '../../app/plantuml', folder);
  }
  return join(process.resourcesPath, 'plantuml', folder);
}

function getJREPath(): string {
  const dir = getJREDir();
  if (process.platform === 'win32') {
    return join(dir, 'bin', 'java.exe');
  }
  return join(dir, 'bin', 'java');
}

// The bundled fat jar ships jlatexmath but not the optional companions its
// manifest lists (batik, fop, xmlgraphics). Drop plantuml-pdf.jar next to
// plantuml.jar and the JVM resolves it through the manifest Class-Path: that
// is what makes <math> formulas render instead of crashing with
// ClassNotFoundException (formulas worked on planttext.com but not here).
function getLibClasspath(): string[] {
  const jarDir = dirname(getPlantUMLPath());
  const companions = [join(jarDir, 'plantuml-pdf.jar')];
  return companions.filter((p) => existsSync(p));
}

// renderOne renders a single diagram block through the bundled JRE.
function renderOne(block: string, format: 'svg' | 'png'): Promise<DiagramRenderResult> {
  return new Promise((resolve) => {
    const plantumlJar = getPlantUMLPath();
    const javaPath = getJREPath();

    if (!existsSync(plantumlJar)) {
      resolve({
        ok: false,
        error: { line: 0, shortMessage: 'PlantUML not found', details: `PlantUML JAR not found at: ${plantumlJar}` },
      });
      return;
    }
    if (!existsSync(javaPath)) {
      resolve({
        ok: false,
        error: { line: 0, shortMessage: 'Java runtime not found', details: `JRE not found at: ${javaPath}` },
      });
      return;
    }

    // -jar ignores -cp, so build the classpath explicitly and run the main
    // class, keeping the companion jar on it for <math>/PDF support.
    const classpath = [plantumlJar, ...getLibClasspath()].join(process.platform === 'win32' ? ';' : ':');
    const args = ['-cp', classpath, 'net.sourceforge.plantuml.Run', `-t${format}`, '-pipe', '-charset', 'UTF-8'];
    const javaProcess = spawn(javaPath, args, { stdio: ['pipe', 'pipe', 'pipe'] });

    let stdout = Buffer.alloc(0);
    let stderr = '';

    javaProcess.stdout.on('data', (data: Buffer) => {
      stdout = Buffer.concat([stdout, data]);
    });
    javaProcess.stderr.on('data', (data: Buffer) => {
      stderr += data.toString('utf-8');
    });

    javaProcess.on('close', (code) => {
      if (code === 0 && stdout.length > 0 && !looksLikeErrorImage(stdout)) {
        const base64 = stdout.toString('base64');
        const mimeType = format === 'svg' ? 'image/svg+xml' : 'image/png';
        resolve({ ok: true, format, data: `data:${mimeType};base64,${base64}` });
      } else {
        resolve({ ok: false, error: parsePlantumlError(stderr, stdout) });
      }
    });

    javaProcess.on('error', (error) => {
      resolve({
        ok: false,
        error: { line: 0, shortMessage: 'Process error', details: error.message },
      });
    });

    javaProcess.stdin.write(block, 'utf-8');
    javaProcess.stdin.end();
  });
}

// IPC: Render PlantUML diagram - every @startXXX block, not just the first.
ipcMain.handle('render-diagram', async (_, { source, format = 'svg' }) => {
  const startedAt = Date.now();
  const blocks = splitDiagrams(source);
  if (blocks.length === 0) {
    return {
      ok: false,
      error: { line: 0, shortMessage: 'Nothing to render', details: 'The source contains no diagram.' },
    };
  }
  const results = await Promise.all(blocks.map((b) => renderOne(b, format)));
  const renderMs = Date.now() - startedAt;
  if (results.length === 1) {
    return { ...results[0], renderMs };
  }
  return { ok: results.some((r) => r.ok), diagrams: results.map((r) => ({ ...r, renderMs })) };
});

// ---------------------------------------------------------------------------
// Export: PNG/SVG/PDF + copy to clipboard
// ---------------------------------------------------------------------------

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
    const base64Data = data.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    await writeFile(result.filePath!, buffer);
    return { canceled: false, path: result.filePath };
  } catch (error: any) {
    return { canceled: false, error: error.message };
  }
});

// IPC: Export the currently shown diagram as PDF. PlantUML emits PDF through
// -tpdf when the bundled companion jar (batik+fop, the "pdf" variant) is on
// the classpath - the same jar that enables <math> formulas.
ipcMain.handle('export-pdf', async (_, { source, defaultPath }) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: defaultPath || 'diagram.pdf',
    filters: [
      { name: 'PDF', extensions: ['pdf'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });
  if (result.canceled) {
    return { canceled: true };
  }

  const block = splitDiagrams(source)[0] ?? source;
  return new Promise((resolve) => {
    const classpath = [getPlantUMLPath(), ...getLibClasspath()].join(process.platform === 'win32' ? ';' : ':');
    const args = ['-cp', classpath, 'net.sourceforge.plantuml.Run', '-tpdf', '-pipe', '-charset', 'UTF-8'];
    const javaProcess = spawn(getJREPath(), args, { stdio: ['pipe', 'pipe', 'pipe'] });

    const out = createWriteStream(result.filePath!);
    let stderr = '';
    javaProcess.stdout.pipe(out);
    javaProcess.stderr.on('data', (d: Buffer) => { stderr += d.toString('utf-8'); });
    javaProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ canceled: false, path: result.filePath });
      } else {
        resolve({ canceled: false, error: stderr || `plantuml exited with ${code}` });
      }
    });
    javaProcess.on('error', (error) => resolve({ canceled: false, error: error.message }));
    javaProcess.stdin.write(block, 'utf-8');
    javaProcess.stdin.end();
  });
});

// IPC: Copy the current preview image to the clipboard. PNG goes through
// nativeImage; SVG is copied as text so vector editors keep the vectors.
ipcMain.handle('copy-image', async (_, { data, format }) => {
  try {
    if (format === 'png') {
      const base64 = data.split(',')[1];
      const img = nativeImage.createFromBuffer(Buffer.from(base64, 'base64'));
      clipboard.writeImage(img);
    } else {
      const svgText = Buffer.from(data.split(',')[1], 'base64').toString('utf-8');
      clipboard.writeText(svgText);
    }
    return { ok: true };
  } catch (error: any) {
    return { ok: false, error: error.message };
  }
});

// ---------------------------------------------------------------------------
// File operations + recent files
// ---------------------------------------------------------------------------

const RECENTS_STORE = join(app.getPath('userData'), 'recent-files.json');

async function readRecents(): Promise<string[]> {
  try {
    const raw = await readFile(RECENTS_STORE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
  } catch {
    return [];
  }
}

async function addRecent(path: string): Promise<void> {
  if (!path) return;
  const recents = (await readRecents()).filter((p) => p !== path);
  recents.unshift(path);
  await writeFile(RECENTS_STORE, JSON.stringify(recents.slice(0, 10), null, 2), 'utf-8');
  await setApplicationMenu();
}

async function openRecent(path: string) {
  if (!existsSync(path)) {
    dialog.showErrorBox('File not found', `The file no longer exists:\n${path}`);
    return;
  }
  try {
    const content = await readFile(path, 'utf-8');
    currentFilePath = path;
    mainWindow?.webContents.send('recent-file-opened', { content, path });
  } catch (error: any) {
    dialog.showErrorBox('Could not open file', error.message);
  }
}

async function setApplicationMenu() {
  const recents = await readRecents();
  const recentsSubmenu: Electron.MenuItemConstructorOptions[] = recents.length > 0
    ? [
        ...recents.map((p) => ({
          label: p,
          click: () => openRecent(p),
        })),
        { type: 'separator' as const },
        {
          label: 'Clear Recently Opened',
          click: async () => {
            await writeFile(RECENTS_STORE, '[]', 'utf-8');
            await setApplicationMenu();
          },
        },
      ]
    : [{ label: 'No Recent Files', enabled: false }];

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        { label: 'New', accelerator: 'CmdOrCtrl+N', click: () => mainWindow?.webContents.send('menu-action', 'new') },
        { label: 'Open', accelerator: 'CmdOrCtrl+O', click: () => mainWindow?.webContents.send('menu-action', 'open') },
        { type: 'separator' },
        { label: 'Open Recent', submenu: recentsSubmenu },
        { type: 'separator' },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => mainWindow?.webContents.send('menu-action', 'save') },
        { label: 'Save As', accelerator: 'CmdOrCtrl+Shift+S', click: () => mainWindow?.webContents.send('menu-action', 'save-as') },
        { type: 'separator' },
        { label: 'Render', accelerator: 'CmdOrCtrl+Shift+R', click: () => mainWindow?.webContents.send('menu-action', 'render') },
        { type: 'separator' },
        { label: 'Export as SVG', accelerator: 'CmdOrCtrl+Shift+G', click: () => mainWindow?.webContents.send('menu-action', 'export-svg') },
        { label: 'Export as PNG', accelerator: 'CmdOrCtrl+Shift+P', click: () => mainWindow?.webContents.send('menu-action', 'export-png') },
        { label: 'Export as PDF', click: () => mainWindow?.webContents.send('menu-action', 'export-pdf') },
        { type: 'separator' },
        { label: 'Copy Image to Clipboard', accelerator: 'CmdOrCtrl+Shift+C', click: () => mainWindow?.webContents.send('menu-action', 'copy-image') },
        { type: 'separator' as const },
        ...(process.platform === 'darwin'
          ? [{ role: 'close' as const }, { role: 'quit' as const }]
          : [{ role: 'quit' as const }]),
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'resetZoom' },
        { type: 'separator' },
        { role: 'toggleDevTools' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Check for Updates', click: () => checkForUpdates(true) },
        { type: 'separator' },
        { label: 'FAQ', click: () => shell.openExternal('https://github.com/choksi2212/open-uml') },
        { label: 'Contact', click: () => shell.openExternal('mailto:manaschoksiwork@gmail.com?subject=Open%20UML%20Support') },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

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
    currentFilePath = result.filePaths[0];
    await addRecent(result.filePaths[0]);
    return { canceled: false, content, path: result.filePaths[0] };
  } catch (error: any) {
    return { canceled: false, error: error.message };
  }
});

// IPC: Save file
ipcMain.handle('save-file', async (_, { content, defaultPath, useExistingPath }) => {
  let filePath = useExistingPath && currentFilePath ? currentFilePath : null;

  if (!filePath) {
    const result = await dialog.showSaveDialog(mainWindow!, {
      defaultPath: defaultPath || currentFilePath || 'diagram.puml',
      filters: [
        { name: 'PlantUML Files', extensions: ['puml'] },
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (result.canceled) {
      return { canceled: true };
    }

    filePath = result.filePath!;
  }

  try {
    await writeFile(filePath, content, 'utf-8');
    currentFilePath = filePath;
    await addRecent(filePath);
    return { canceled: false, path: filePath };
  } catch (error: any) {
    return { canceled: false, error: error.message };
  }
});

// IPC: Save As file
ipcMain.handle('save-as-file', async (_, { content, defaultPath }) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: defaultPath || currentFilePath || 'diagram.puml',
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
    currentFilePath = result.filePath!;
    await addRecent(result.filePath!);
    return { canceled: false, path: result.filePath! };
  } catch (error: any) {
    return { canceled: false, error: error.message };
  }
});

// IPC: Open external URL
ipcMain.handle('open-external', async (_, url: string) => {
  await shell.openExternal(url);
});

// IPC: Read a file by absolute path (used by renderer drag-and-drop).
// The openFile dialog already does this through showOpenDialog, but
// drag-and-drop hands us a path directly without going through the OS
// dialog, so we need a path-based variant.
ipcMain.handle('read-file-by-path', async (_, filePath: string) => {
  if (!filePath) return { canceled: true };
  if (!existsSync(filePath)) {
    return { canceled: false, error: `File not found: ${filePath}` };
  }
  try {
    const content = await readFile(filePath, 'utf-8');
    currentFilePath = filePath;
    await addRecent(filePath);
    return { canceled: false, content, path: filePath };
  } catch (error: any) {
    return { canceled: false, error: error.message };
  }
});

// ---------------------------------------------------------------------------
// Update checker (GitHub releases; checks only, never auto-installs)
// ---------------------------------------------------------------------------

const UPDATE_URL = 'https://api.github.com/repos/choksi2212/open-uml/releases/latest';

async function fetchLatestRelease(): Promise<{ tag: string; url: string; notes: string } | null> {
  const { net } = require('electron');
  try {
    const res = await net.fetch(UPDATE_URL, {
      headers: { 'User-Agent': 'OpenUML-UpdateCheck' },
    });
    if (!res.ok) return null;
    const json: any = await res.json();
    return { tag: json.tag_name, url: json.html_url, notes: json.body || '' };
  } catch {
    return null;
  }
}

async function checkForUpdates(manual = false) {
  const release = await fetchLatestRelease();
  if (!release) {
    if (manual) {
      dialog.showErrorBox('Update check failed', 'Could not reach GitHub to check for updates. Try again later.');
    }
    return;
  }
  const current = `v${app.getVersion()}`;
  if (release.tag && release.tag !== current) {
    const choice = await dialog.showMessageBox(mainWindow!, {
      type: 'info',
      title: 'Update available',
      message: `A new version of Open UML is available: ${release.tag} (you have ${current}).`,
      detail: 'Open the release page to download it?',
      buttons: ['Open Release Page', 'Skip'],
      defaultId: 0,
      cancelId: 1,
    });
    if (choice.response === 0) {
      shell.openExternal(release.url);
    }
  } else if (manual) {
    dialog.showMessageBox(mainWindow!, {
      type: 'info',
      title: 'You are up to date',
      message: `Open UML ${current} is the latest release.`,
    });
  }
}

// IPC: renderer-triggered update check (returns info instead of a dialog)
ipcMain.handle('check-updates', async () => {
  const release = await fetchLatestRelease();
  if (!release) return { ok: false };
  const current = `v${app.getVersion()}`;
  return {
    ok: true,
    current,
    latest: release.tag,
    updateAvailable: release.tag !== current,
    url: release.url,
  };
});

// ---------------------------------------------------------------------------
// electron-updater (silent background updater; only enabled in packaged
// builds that are code-signed). Disabled in dev / unsigned builds - the
// existing GitHub-releases checker above handles those.
// ---------------------------------------------------------------------------

async function setupAutoUpdater() {
  if (!app.isPackaged) return;
  try {
    const { autoUpdater } = await import('electron-updater');
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.on('update-available', (info) => {
      // We surface this through the existing menu dialog too.
      dialog.showMessageBox(mainWindow!, {
        type: 'info',
        title: 'Downloading update',
        message: `Open UML ${info.version} is downloading in the background.`,
        detail: 'You will be prompted to install it when the download completes.',
      });
    });
    autoUpdater.on('update-downloaded', (info) => {
      const choice = dialog.showMessageBoxSync(mainWindow!, {
        type: 'info',
        title: 'Update ready',
        message: `Open UML ${info.version} has been downloaded.`,
        detail: 'Restart now to install, or continue working and install on quit.',
        buttons: ['Restart now', 'On next launch'],
        defaultId: 0,
        cancelId: 1,
      });
      if (choice === 0) autoUpdater.quitAndInstall();
    });
    autoUpdater.on('error', () => {
      // Swallow - the manual checker is the fallback for unsigned builds.
    });
    await autoUpdater.checkForUpdates();
  } catch {
    // electron-updater not available (unsigned build, missing config, etc.)
    // Fall back to the manual GitHub-releases checker above.
  }
}

app.setAppUserModelId('com.openuml.app');

// ---------------------------------------------------------------------------
// Single-instance + OS-level "open with" handling
// ---------------------------------------------------------------------------
//
// When the user double-clicks a .puml file while the app is already running,
// the OS starts a second instance. We grab the single-instance lock so the
// second process immediately exits and forwards its argv to us via the
// 'second-instance' event. On macOS the equivalent is 'open-file', which
// can fire before or after app.whenReady.

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
  // The second-instance event in the primary process will pick up the file.
}

// Files queued from the OS before the window is ready to receive them.
const pendingFileOpen: string[] = [];

// macOS: 'open-file' can fire before app.whenReady resolves.
app.on('open-file', (event, path) => {
  event.preventDefault();
  if (mainWindow && !mainWindow.webContents.isLoading()) {
    sendFileToRenderer(path);
  } else {
    pendingFileOpen.push(path);
  }
});

// Windows/Linux: a second launch (or first launch with a file argument)
// forwards its argv. The first element is the executable; the rest may
// include one or more file paths.
app.on('second-instance', (_event, argv) => {
  const filePath = argv.slice(1).find((a) => /\.(puml|plantuml|pu|txt)$/i.test(a));
  if (filePath) sendFileToRenderer(filePath);
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

function sendFileToRenderer(filePath: string) {
  if (!existsSync(filePath)) {
    dialog.showErrorBox('File not found', `Could not open:\n${filePath}`);
    return;
  }
  readFile(filePath, 'utf-8')
    .then((content) => {
      currentFilePath = filePath;
      mainWindow?.webContents.send('open-file-from-os', { content, path: filePath });
      return addRecent(filePath);
    })
    .catch((err: any) => dialog.showErrorBox('Could not open file', err.message));
}

app.whenReady().then(() => {
  createWindow();
  setApplicationMenu();

  // Pick up a file path passed on the initial command line (Windows/Linux).
  const argvPath = process.argv.slice(1).find((a) => /\.(puml|plantuml|pu|txt)$/i.test(a));
  if (argvPath) pendingFileOpen.push(argvPath);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      setApplicationMenu();
    }
  });

  // Silent update check once per session, shortly after launch.
  // Prefer electron-updater (auto-install on quit) when available; fall
  // back to the GitHub-releases checker otherwise.
  setTimeout(() => {
    void setupAutoUpdater();
    void checkForUpdates(false);
  }, 5000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
