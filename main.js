// Importing necessary modules from Electron and Node.js
const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow; // Main application window
let settingsWindow; // Settings modal window

// File path where notes will be saved (inside userData folder specific to OS)
const notesFilePath = path.join(app.getPath("userData"), "notes.json");

// ==========================
// Function to load notes from file
function loadNotes() {
  try {
    const data = fs.readFileSync(notesFilePath, "utf8"); // Read file content
    return JSON.parse(data); // Parse JSON and return
  } catch (err) {
    return []; // If file doesn't exist or error occurs, return empty array
  }
}

// Function to save notes to file
function saveNotes(notes) {
  try {
    fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2)); // Save notes as formatted JSON
  } catch (err) {
    console.error("Failed to save notes", err);
  }
}

// ==========================
// Function to create the main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Preload script (secure API exposure)
      nodeIntegration: false, // Prevent direct Node access in renderer
      contextIsolation: true, // Isolate renderer & preload contexts
    },
  });

  // Optional DevTools & maximizing
  mainWindow.openDevTools();
  // mainWindow.maximize();

  mainWindow.loadFile("./renderer/index.html"); // Load renderer's main HTML

  // Once the main window finishes loading:
  mainWindow.webContents.on("did-finish-load", () => {
    // Send loaded notes to renderer process
    mainWindow.webContents.send("load-notes", loadNotes());
  });
}

// ==========================
// Electron app lifecycle events:

// When Electron is ready → create main window
app.whenReady().then(createWindow);

// When all windows are closed → quit app (except on macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// On macOS → reopen window when app icon is clicked and no windows are open
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ==========================
// IPC Event Listeners:

// Handle 'save-notes' event: Save notes to file
ipcMain.on("save-notes", (event, notes) => {
  saveNotes(notes);
});

// Handle 'open-notes-file' event: Open the saved notes file location
ipcMain.on("open-notes-file", () => {
  shell.openPath(notesFilePath); // Opens in default file explorer
});

// ==========================
// Handle opening Settings window
ipcMain.on("open-settings", () => {
  if (settingsWindow) {
    // If settings already open → do nothing
    return;
  }

  // Create a modal Settings window
  settingsWindow = new BrowserWindow({
    width: 400,
    height: 300,
    parent: mainWindow, // Attach to main window
    modal: true, // Modal behavior (blocks interaction with main window)
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Preload script
    },
  });

  settingsWindow.loadFile("./renderer/settings.html"); // Load settings HTML

  // Once closed → set settingsWindow to null so it can be reopened later
  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
});

// Handle closing Settings window
ipcMain.on("close-settings", () => {
  if (settingsWindow) {
    settingsWindow.close();
  }
});
