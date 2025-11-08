
const { contextBridge, ipcRenderer, shell } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  
  getProjectRoot: () => ipcRenderer.invoke('get-project-root'),
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),
  closeWindow: () => ipcRenderer.send("window-close"),
  createNewWindow: () => ipcRenderer.send("create-new-window"),
  openTerminal: () => ipcRenderer.send('open-terminal'),
  openFile: (filePath) => shell.openPath(filePath),
  openFolder: (folderPath) => ipcRenderer.send("open-folder", folderPath),
  showItemInFolder: (filePath) => shell.showItemInFolder(filePath),
  addDownloadEntry: (entry) => ipcRenderer.send("add-download-entry", entry),
  showSaveDialog: (options) => ipcRenderer.invoke("show-save-dialog", options),
  getEnv: (key) => ipcRenderer.invoke("get-env", key),
  queryGemini: (query) => ipcRenderer.invoke("query-gemini", query),
  
  fsList: (relPath) => ipcRenderer.invoke('fs-list', relPath),
  fsRead: (relPath) => ipcRenderer.invoke('fs-read', relPath),
  fsWrite: (relPath, content) => ipcRenderer.invoke('fs-write', relPath, content),
  fsMkdir: (relPath) => ipcRenderer.invoke('fs-mkdir', relPath),
  fsDelete: (relPath) => ipcRenderer.invoke('fs-delete', relPath),
  fetchUrl: (url) => ipcRenderer.invoke('fetch-url', url),
  
  executeInTerminal: (command) => ipcRenderer.invoke('execute-in-terminal', command),
  getTerminalOutput: (terminalId) => ipcRenderer.invoke('get-terminal-output', terminalId),
  platform: process.platform, 
});
