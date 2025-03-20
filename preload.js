const { contextBridge, ipcRenderer } = require('electron');

// Expose limited, safe API to the Renderer process
contextBridge.exposeInMainWorld('api', {
    // Method to send 'open-settings' event to Main process
    openSettings: () => ipcRenderer.send('open-settings'),

    // Method to send 'close-settings' event to Main process
    closeSettings: () => ipcRenderer.send('close-settings')
});
