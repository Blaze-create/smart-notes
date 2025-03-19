const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let settingsWindow;

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false, // Ensures security by disabling direct access to Node.js APIs
            contextIsolation: true, // Isolates the context between main and renderer
        }
    });
    mainWindow.openDevTools();
    mainWindow.maximize();
    mainWindow.loadFile('./renderer/index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});


ipcMain.on('open-settings', () => {
    if (settingsWindow) {
        return;
    }

    settingsWindow = new BrowserWindow({
        width: 400,
        height: 300,
        parent: mainWindow,
        modal: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    settingsWindow.loadFile('./renderer/settings.html');

    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });

});

ipcMain.on('close-settings', () => {
    if (settingsWindow) {
        settingsWindow.close();
    }
});