const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('miniLex', {
    analizar: (codigo) => ipcRenderer.invoke('analizar-codigo', codigo)
});