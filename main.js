// Importing necessary modules from Electron
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow; // Main application window
let settingsWindow; // Settings modal window

// File path for saving/loading notes
const notesFilePath = path.join(app.getPath("userData"), "notes.json");

// Function to read notes from file
function loadNotes() {
  try {
    const data = fs.readFileSync(notesFilePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return []; // Return an empty array if no notes are found
  }
}

// Function to save notes to file
function saveNotes(notes) {
  try {
    fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2));
  } catch (err) {
    console.error("Failed to save notes", err);
  }
}

// Function to create the main window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Preload script to enable secure communication
      nodeIntegration: false, // Disables direct access to Node.js APIs in renderer (security best practice)
      contextIsolation: true, // Ensures renderer runs in separate context from main process
    },
  });

  mainWindow.openDevTools(); // Opens Developer Tools for debugging
  // mainWindow.maximize(); 3// Maximizes the window on launch
  mainWindow.loadFile("./renderer/index.html"); // Loads the main HTML file

  // Load existing notes when app starts
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("load-notes", loadNotes());
  });
}

// When Electron has finished initialization, create the main window
app.whenReady().then(createWindow);

// Quit the app when all windows are closed (except on macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// On macOS, recreate the window if dock icon is clicked and no windows are open
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// IPC: Handle saving notes
ipcMain.on("save-notes", (event, notes) => {
  saveNotes(notes);
});

// IPC: Handle opening notes file dialog
ipcMain.on("open-notes-file", () => {
  shell.openPath(notesFilePath);
});
// Listen for an IPC event 'open-settings' from renderer to open settings window
ipcMain.on("open-settings", () => {
  if (settingsWindow) {
    // If settings window is already open, do nothing
    return;
  }

  // Create the settings modal window
  settingsWindow = new BrowserWindow({
    width: 400,
    height: 300,
    parent: mainWindow, // Make it a child of main window (modal)
    modal: true, // Ensures user interacts only with settings until it's closed
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Preload script for settings window
    },
  });

  settingsWindow.loadFile("./renderer/settings.html"); // Load settings HTML file

  // When settings window is closed, set reference to null to allow reopening
  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
});

// Listen for an IPC event 'close-settings' to close the settings window
ipcMain.on("close-settings", () => {
  if (settingsWindow) {
    settingsWindow.close(); // Close the settings window
  }
});
