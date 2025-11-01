const { app, BrowserWindow, ipcMain, screen, Menu } = require('electron');
const path = require('path');

// ====================================================================
// CRITICAL FIX: ULTIMATE GPU DISABLE & STABILITY SWITCHES (Restored)
// This block ensures stability and software rendering, as you intended.
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('force-color-profile', 'srgb');
app.disableHardwareAcceleration();
// ====================================================================

function createWindow() {
    // 1. Determine screen dimensions
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    // 2. Define the desired widget size and position (Restored to original)
    const widgetWidth = 350;
    const widgetHeight = 145;
    const padding = 20;

    const mainWindow = new BrowserWindow({
        // RESTORED WIDGET DIMENSIONS AND POSITIONING
        width: widgetWidth,
        height: widgetHeight,
        x: screenWidth - widgetWidth - padding, // Position at bottom-right
        y: screenHeight - widgetHeight - padding,
        
        // RESTORED WIDGET STYLE
        frame: false,       // No default window frame
        transparent: true,  // Allows for custom shape/shadow
        resizable: false,   // Widget size is fixed
        alwaysOnTop: true,  // Keep it above other applications
        skipTaskbar: true,  // Hide from taskbar

        webPreferences: {
            preload: path.join(__dirname, 'renderer_clean.js'),
            contextIsolation: true, // KEEP: Ensures security with the new preload script
            nodeIntegration: false, // KEEP: Ensures security
        },
    });
    
    // TEMPORARY DEBUG: You can safely remove this line later
    // mainWindow.webContents.openDevTools({ mode: 'detach' });

    // Load the HTML file
    mainWindow.loadFile('index.html');

    // Remove the default application menu
    Menu.setApplicationMenu(null); 
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// We can remove the general uncaughtException handler as the specific error
// was found and fixed, simplifying the production code.