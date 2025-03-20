// Importing necessary modules from Electron
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;      // Main application window
let settingsWindow;  // Settings modal window

// Function to create the main window
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Preload script to enable secure communication
            nodeIntegration: false, // Disables direct access to Node.js APIs in renderer (security best practice)
            contextIsolation: true, // Ensures renderer runs in separate context from main process
        }
    });

    mainWindow.openDevTools(); // Opens Developer Tools for debugging
    mainWindow.maximize(); // Maximizes the window on launch
    mainWindow.loadFile('./renderer/index.html'); // Loads the main HTML file
}

// When Electron has finished initialization, create the main window
app.whenReady().then(createWindow);

// Quit the app when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// On macOS, recreate the window if dock icon is clicked and no windows are open
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Listen for an IPC event 'open-settings' from renderer to open settings window
ipcMain.on('open-settings', () => {
    if (settingsWindow) {
        // If settings window is already open, do nothing
        return;
    }

    // Create the settings modal window
    settingsWindow = new BrowserWindow({
        width: 400,
        height: 300,
        parent: mainWindow, // Make it a child of main window (modal)
        modal: true,        // Ensures user interacts only with settings until it's closed
        webPreferences: {
            preload: path.join(__dirname, 'preload.js') // Preload script for settings window
        }
    });

    settingsWindow.loadFile('./renderer/settings.html'); // Load settings HTML file

    // When settings window is closed, set reference to null to allow reopening
    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });
});

// Listen for an IPC event 'close-settings' to close the settings window
ipcMain.on('close-settings', () => {
    if (settingsWindow) {
        settingsWindow.close(); // Close the settings window
    }
});
