import { app, BrowserWindow, Menu, ipcMain, nativeImage } from "electron";
import * as path from "path";
import { fileURLToPath } from "url";


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
    },
  });

  const startUrl =
    process.env.ELECTRON_START_URL ||
    `file://${path.join(__dirname, "../dist/index.html")}`;
  win.loadURL(startUrl);
  
  Menu.setApplicationMenu(null);

  ipcMain.on("window-minimize", () => win.minimize());
  ipcMain.on("window-maximize", () => (win.isMaximized() ? win.unmaximize() : win.maximize()));
  ipcMain.on("window-close", () => win.close());
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
