import { app, BrowserWindow, Menu, ipcMain, nativeImage, dialog, shell } from "electron";
import * as path from "path";
import { spawn } from 'child_process';
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { promises as fsPromises } from 'fs';
import fetch from 'node-fetch';


config();


app.commandLine.appendSwitch('enable-features', 'ElectronSerialPort');


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const iconPath = path.join(__dirname, "../public/cat.png");
  const icon = nativeImage.createFromPath(iconPath);

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    icon,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true, 
      webviewTag: true, 
      allowRunningInsecureContent: false, 
    },
  });

  const startUrl =
    process.env.ELECTRON_START_URL ||
    `file://${path.join(__dirname, "../dist/index.html")}`;
  win.loadURL(startUrl);

 
  const menu = Menu.buildFromTemplate([
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);

  
  win.webContents.session.on('will-download', (event, item, webContents) => {
    
    item.on('updated', (event, state) => {
      const progress = {
        id: item.getStartTime() + '-' + item.getFilename(),
        filename: item.getFilename(),
        url: item.getURL(),
        receivedBytes: item.getReceivedBytes(),
        totalBytes: item.getTotalBytes(),
        state,
        paused: item.isPaused(),
      };
      win.webContents.send('download-progress', progress);
    });

    item.once('done', (event, state) => {
      const doneInfo = {
        id: item.getStartTime() + '-' + item.getFilename(),
        filename: item.getFilename(),
        url: item.getURL(),
        filePath: item.getSavePath(),
        totalBytes: item.getTotalBytes(),
        state,
        status: state,
      };
      win.webContents.send('download-done', doneInfo);
      if (state === 'completed') {
        console.log('Download successfully');
      } else {
        console.log(`Download failed: ${state}`);
      }
    });
  });
  ipcMain.on("window-minimize", () => win.minimize());
  ipcMain.on("window-maximize", () => (win.isMaximized() ? win.unmaximize() : win.maximize()));
  ipcMain.on("window-close", () => win.close());

  
  ipcMain.on("add-download-entry", (event, entry) => {
    
    try {
      const stored = localStorage.getItem('browser_downloads') || '[]';
      const downloads = JSON.parse(stored);
      const newEntry = {
        ...entry,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };
      downloads.unshift(newEntry);
      const limitedDownloads = downloads.slice(0, 1000);
      localStorage.setItem('browser_downloads', JSON.stringify(limitedDownloads));
    } catch (error) {
      console.error('Error saving download entry:', error);
    }
  });


}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});


ipcMain.on("create-new-window", () => {
  createWindow();
});


ipcMain.on('open-terminal', (event) => {
  try {
    if (process.platform === 'win32') {
      try {
        spawn('cmd.exe', ['/c', 'start', 'wt'], { detached: true, stdio: 'ignore' }).unref();
        return;
      } catch (e) {
      }
      try {
        spawn('cmd.exe', ['/c', 'start', 'powershell'], { detached: true, stdio: 'ignore' }).unref();
        return;
      } catch (e) {
      }
      try {
        spawn('cmd.exe', ['/c', 'start', 'cmd.exe'], { detached: true, stdio: 'ignore' }).unref();
        return;
      } catch (e) {
        console.error('open-terminal: failed to open any Windows terminal', e);
      }
      return;
    }

    if (process.platform === 'darwin') {
      spawn('open', ['-a', 'Terminal'], { detached: true, stdio: 'ignore' }).unref();
      return;
    }

    const terminals = ['x-terminal-emulator', 'gnome-terminal', 'konsole', 'xterm'];
    for (const term of terminals) {
      try {
        spawn(term, [], { detached: true, stdio: 'ignore' }).unref();
        return;
      } catch (e) {
      }
    }

    console.warn('open-terminal: no terminal command succeeded');
  } catch (err) {
    console.error('open-terminal error:', err);
  }
});


const terminalOutputs = new Map<string, string>();


ipcMain.handle('execute-in-terminal', async (event, command: string) => {
  const terminalId = Date.now().toString();
  
  try {
    const isWindows = process.platform === 'win32';
    const shell = isWindows ? 'powershell.exe' : 'bash';
    const args = isWindows ? ['-Command', command] : ['-c', command];
    
    const proc = spawn(shell, args, {
      cwd: ALLOWED_ROOT,
      env: process.env
    });

    let output = '';
    
    proc.stdout.on('data', (data: Buffer) => {
      output += data.toString();
    });

    proc.stderr.on('data', (data: Buffer) => {
      output += data.toString();
    });

    await new Promise<void>((resolve) => {
      proc.on('close', () => {
        terminalOutputs.set(terminalId, output);
        setTimeout(() => {
          terminalOutputs.delete(terminalId);
        }, 30000); 
        resolve();
      });
    });

    return terminalId;
  } catch (err: any) {
    console.error('Terminal command error:', err);
    return null;
  }
});


ipcMain.handle('get-terminal-output', async (event, terminalId: string) => {
  return terminalOutputs.get(terminalId) || null;
});


ipcMain.handle("query-gemini", async (event, query: string) => {
  console.log('Main Process: Received Gemini query:', query);

  return new Promise((resolve) => {
    
    const serverPath = path.resolve(__dirname, '../aiServer.js');
    console.log('Main Process: aiServer path:', serverPath);

    try {
      
      const aiProcess = spawn('node', [serverPath], {
        env: {
          ...process.env,
          GEMINI_QUERY: query,
          GEMINI_API_KEY: "AIzaSyA7x4GdafR8u16AxlTdCxSnd4QKP2Gb9a4"
        }
      });

      let output = '';
      let errorOutput = '';

      aiProcess.stdout.on('data', (data: any) => {
        const chunk = data.toString();
        console.log('Gemini Output:', chunk);
        output += chunk;
      });

      aiProcess.stderr.on('data', (data: any) => {
        const chunk = data.toString();
        console.error('Gemini Error:', chunk);
        errorOutput += chunk;
      });

      aiProcess.on('close', (code: number) => {
        console.log('Gemini process exited with code:', code);
        if (code === 0 && output.trim()) {
          resolve({ text: output.trim() });
        } else {
          const error = errorOutput.trim() || 'No output received from Gemini';
          console.error('Gemini process failed:', error);
          resolve({ 
            text: 'Sorry, I encountered an error processing your request.',
            error: error
          });
        }
      });

      aiProcess.on('error', (error: any) => {
        console.error('Failed to start Gemini process:', error);
        resolve({ 
          text: 'Sorry, I encountered an error processing your request.',
          error: error.message || String(error)
        });
      });
    } catch (error: any) {
      console.error('Error in main process while handling Gemini query:', error);
      resolve({
        text: 'Sorry, I encountered an error processing your request.',
        error: error?.message || String(error)
      });
    }
  });
});


ipcMain.handle("show-save-dialog", async (event, options) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  return await dialog.showSaveDialog(win, options);
});


ipcMain.on('open-folder', (event, folderPath) => {
  shell.openPath(folderPath).then(result => {
    if (result) {
      console.error('Failed to open folder:', result);
    }
  });
});

ipcMain.handle('get-env', (event, key) => {
  return process.env[key];
});

const ALLOWED_ROOT = path.resolve(__dirname, '..');

ipcMain.handle('get-project-root', () => ALLOWED_ROOT);

function isPathAllowed(resolvedPath: string) {
  const normalizedRoot = ALLOWED_ROOT.replace(/\\/g, '/');
  const normalizedResolved = resolvedPath.replace(/\\/g, '/');
  return normalizedResolved.startsWith(normalizedRoot);
}

ipcMain.handle('fs-list', async (event, relPath: string) => {
  try {
    const resolved = path.resolve(ALLOWED_ROOT, relPath || '.');
    if (!isPathAllowed(resolved)) throw new Error('Access denied');
    const entries = await fsPromises.readdir(resolved, { withFileTypes: true });
    return entries.map(e => ({ name: e.name, isDirectory: e.isDirectory() }));
  } catch (err: any) {
    console.error('fs-list error:', err);
    return { error: err.message };
  }
});

ipcMain.handle('fs-read', async (event, relPath: string) => {
  try {
    const resolved = path.resolve(ALLOWED_ROOT, relPath);
    if (!isPathAllowed(resolved)) throw new Error('Access denied');
    const data = await fsPromises.readFile(resolved, 'utf8');
    return { content: data };
  } catch (err: any) {
    console.error('fs-read error:', err);
    return { error: err.message };
  }
});

ipcMain.handle('fs-write', async (event, relPath: string, content: string) => {
  try {
    const resolved = path.resolve(ALLOWED_ROOT, relPath);
    if (!isPathAllowed(resolved)) throw new Error('Access denied');
    await fsPromises.mkdir(path.dirname(resolved), { recursive: true });
    await fsPromises.writeFile(resolved, content, 'utf8');
    return { ok: true };
  } catch (err: any) {
    console.error('fs-write error:', err);
    return { error: err.message };
  }
});

ipcMain.handle('fs-mkdir', async (event, relPath: string) => {
  try {
    const resolved = path.resolve(ALLOWED_ROOT, relPath);
    if (!isPathAllowed(resolved)) throw new Error('Access denied');
    await fsPromises.mkdir(resolved, { recursive: true });
    return { ok: true };
  } catch (err: any) {
    console.error('fs-mkdir error:', err);
    return { error: err.message };
  }
});

ipcMain.handle('fs-delete', async (event, relPath: string) => {
  try {
    const resolved = path.resolve(ALLOWED_ROOT, relPath);
    if (!isPathAllowed(resolved)) throw new Error('Access denied');
    await fsPromises.rm(resolved, { recursive: true, force: true });
    return { ok: true };
  } catch (err: any) {
    console.error('fs-delete error:', err);
    return { error: err.message };
  }
});

ipcMain.handle('fetch-url', async (event, url: string) => {
  try {
  const res = await fetch(url);
    const text = await res.text();
    return { content: text };
  } catch (err: any) {
    console.error('fetch-url error:', err);
    return { error: err.message };
  }
});
