import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, screen } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win: BrowserWindow | null = null;
let tray: Tray | null = null;

const dataFilePath = path.join(app.getPath('userData'), 'journey-widget-data.json');

// Default icon in base64: a simple 16x16 teal square with rounded appearance (in PNG format)
const defaultIconBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABoSURBVDhPY2AYWOD///8gDFIMwgxAgK5g1IDS///vQYIMQAwS1DAGDOgKGIYE4IJRFEAOY8CArYBhSAPEYCw2/P///0mO4eHhBvGJ4xPHp552AHIYAwZsBQxDGiAGY7EBAJm3YkQp3b2oAAAAAElFTkSuQmCC';

function readData() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        settings: {
          alwaysOnTop: true,
          opacity: 0.95,
          openAtLogin: false,
          theme: 'dark',
          heatmapThresholds: { low: 1, medium: 3, high: 5 },
          ...(parsed.settings || {})
        },
        windowBounds: parsed.windowBounds || null
      };
    }
  } catch (error) {
    console.error('Error reading data:', error);
  }
  return {
    tasks: [],
    settings: {
      alwaysOnTop: true,
      opacity: 0.95,
      openAtLogin: false,
      theme: 'dark',
      heatmapThresholds: { low: 1, medium: 3, high: 5 }
    },
    windowBounds: null
  };
}

function writeData(data: any) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
}

function createTray() {
  const icon = nativeImage.createFromDataURL(defaultIconBase64);
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Widget', click: () => { if (win) { win.show(); win.focus(); } } },
    { label: 'Hide Widget', click: () => { if (win) { win.hide(); } } },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.quit(); } }
  ]);

  tray.setToolTip('Journey - Activity Widget');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (win) {
      if (win.isVisible()) {
        win.hide();
      } else {
        win.show();
        win.focus();
      }
    }
  });
}

function createWindow() {
  const initialData = readData();
  const savedBounds = initialData.windowBounds;

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height, x, y } = primaryDisplay.workArea;

  // Restore saved width/height or use defaults
  let windowWidth = 960;
  let windowHeight = 620;
  if (savedBounds && typeof savedBounds.width === 'number' && typeof savedBounds.height === 'number') {
    windowWidth = Math.max(800, Math.min(1400, savedBounds.width));
    windowHeight = Math.max(500, Math.min(1000, savedBounds.height));
  }

  // Restore saved position or default to bottom-right corner of the primary display
  let windowX = x + width - windowWidth - 24;
  let windowY = y + height - windowHeight - 24;

  if (savedBounds && typeof savedBounds.x === 'number' && typeof savedBounds.y === 'number') {
    // Safety check: ensure the center of the saved bounds is visible on at least one display
    const savedCenterX = savedBounds.x + windowWidth / 2;
    const savedCenterY = savedBounds.y + windowHeight / 2;
    
    let isVisible = false;
    const displays = screen.getAllDisplays();
    for (const display of displays) {
      const bounds = display.bounds;
      if (
        savedCenterX >= bounds.x &&
        savedCenterX <= bounds.x + bounds.width &&
        savedCenterY >= bounds.y &&
        savedCenterY <= bounds.y + bounds.height
      ) {
        isVisible = true;
        break;
      }
    }

    if (isVisible) {
      windowX = savedBounds.x;
      windowY = savedBounds.y;
    }
  }

  win = new BrowserWindow({
    x: windowX,
    y: windowY,
    width: windowWidth,
    height: windowHeight,
    minWidth: 800,
    minHeight: 500,
    maxWidth: 1400,
    maxHeight: 1000,
    frame: false,
    transparent: true,
    alwaysOnTop: false,
    skipTaskbar: true,
    backgroundMaterial: 'none',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });



  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Debounced listener to persist window position and size
  let saveBoundsTimeout: NodeJS.Timeout | null = null;
  const saveWindowBoundsDebounced = () => {
    if (saveBoundsTimeout) {
      clearTimeout(saveBoundsTimeout);
    }
    saveBoundsTimeout = setTimeout(() => {
      if (!win) return;
      try {
        const bounds = win.getBounds();
        const data = readData();
        data.windowBounds = {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
        };
        writeData(data);
      } catch (error) {
        console.error('Failed to save window bounds:', error);
      }
    }, 500); // 500ms debounce
  };

  win.on('move', saveWindowBoundsDebounced);
  win.on('resize', saveWindowBoundsDebounced);

  win.on('closed', () => {
    if (saveBoundsTimeout) {
      clearTimeout(saveBoundsTimeout);
    }
    win = null;
  });
}

// Single Instance Lock
const additionalData = { myKey: 'journey-tracker' };
const isPrimaryInstance = app.requestSingleInstanceLock(additionalData);

if (!isPrimaryInstance) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      if (!win.isVisible()) win.show();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    createTray();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC IPC Handlers
ipcMain.handle('get-tasks', () => {
  return readData().tasks;
});

ipcMain.handle('save-tasks', (_event, tasks) => {
  const data = readData();
  data.tasks = tasks;
  return writeData(data);
});

ipcMain.handle('get-settings', () => {
  return readData().settings;
});

ipcMain.handle('save-settings', (_event, settings) => {
  const data = readData();
  data.settings = settings;
  const success = writeData(data);

  if (success && win) {
    win.setAlwaysOnTop(false);
  }

  // Set startup launch settings
  try {
    app.setLoginItemSettings({
      openAtLogin: settings.openAtLogin,
      path: app.getPath('exe'),
    });
  } catch (error) {
    console.error('Failed to set login items settings:', error);
  }

  return success;
});

ipcMain.handle('set-always-on-top', (_event, _alwaysOnTop) => {
  if (win) {
    win.setAlwaysOnTop(false);
  }
});

ipcMain.handle('set-opacity', (_event, _opacity) => {
  // Handled via CSS variables in renderer
});

ipcMain.handle('minimize-window', () => {
  if (win) win.minimize();
});

ipcMain.handle('hide-window', () => {
  if (win) win.hide();
});

ipcMain.handle('close-window', () => {
  if (win) win.close();
});
