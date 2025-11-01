// === DEBUG: CATCH SILENT MAIN PROCESS CRASHES ===
// Add this at the very top of your main.js
process.on('uncaughtException', (error) => {
  console.error('--- UNCAUGHT EXCEPTION ---');
  console.error('A fatal error occurred in the main process:');
  console.error(error);
  app.quit(); // Exit the app
});
// ===============================================

const { app, BrowserWindow, ipcMain, screen, Menu } = require('electron');
const path = require('path');

// ====================================================================
// CRITICAL FIX: ULTIMATE GPU DISABLE & STABILITY SWITCHES
// If previous disables failed, this set combines all known fixes to force 
// software rendering and resolve rendering context errors.
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('force-color-profile', 'srgb'); // Final attempt to stabilize the context
app.disableHardwareAcceleration();
// ====================================================================

function createWindow() {
    // 1. Determine screen dimensions
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    // 2. Define the desired widget size and position
    const widgetWidth = 350;
    const widgetHeight = 220;
    const padding = 20;

    const mainWindow = new BrowserWindow({
        width: widgetWidth,
        height: widgetHeight,
        x: screenWidth - widgetWidth - padding, // Position at bottom-right of the screen
        y: screenHeight - widgetHeight - padding,
        frame: false, // No default window frame (important for custom UI)
        transparent: true, // Allows for a custom shape/shadow
        resizable: false, // Widget size is fixed
        alwaysOnTop: true, // Keep it above other applications
        webPreferences: {
            preload: path.join(__dirname, 'renderer_clean.js'),
            contextIsolation: true, // Security best practice
            nodeIntegration: false,
        },
        skipTaskbar: true // Hide from taskbar
    });

    // === DEBUG: CATCH RENDERER PROCESS CRASHES ===
    mainWindow.webContents.on('render-process-gone', (event, details) => {
        console.error('--- RENDERER PROCESS CRASHED ---');
        console.error('The window rendering process has died.');
        console.error('Reason:', details.reason);
    });
    // ===========================================

    // === DEBUG: FORCE DEV TOOLS OPEN ===
    // This will open the developer console and show any errors
    // related to your index.html or renderer_clean.js
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    // ===================================

    // Load the HTML file
    mainWindow.loadFile('index.html');

    // Remove the default application menu
    Menu.setApplicationMenu(null); 

    // Handle IPC events from the renderer
    ipcMain.on('close-app', () => {
        mainWindow.close();
    });

    ipcMain.on('minimize-app', () => {
        // Hides the window after a short delay (for CSS transition)
        setTimeout(() => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.hide();
            }
        }, 300); 
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        // On macOS, recreate the window if none are open
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});