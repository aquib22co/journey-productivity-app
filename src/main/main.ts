import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, screen, globalShortcut, Notification } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win: BrowserWindow | null = null;
let badgeWin: BrowserWindow | null = null;
let tray: Tray | null = null;

const dataFilePath = path.join(app.getPath('userData'), 'journey-widget-data.json');

// Default icon in base64: a simple 16x16 teal square with rounded appearance (in PNG format)
const defaultIconBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABoSURBVDhPY2AYWOD///8gDFIMwgxAgK5g1IDS///vQYIMQAwS1DAGDOgKGIYE4IJRFEAOY8CArYBhSAPEYCw2/P///0mO4eHhBvGJ4xPHp552AHIYAwZsBQxDGiAGY7EBAJm3YkQp3b2oAAAAAElFTkSuQmCC';

function readData() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      
      const completions: Record<string, any[]> = {};
      if (parsed.recurringCompletions && typeof parsed.recurringCompletions === 'object') {
        Object.entries(parsed.recurringCompletions).forEach(([dateStr, items]) => {
          if (Array.isArray(items)) {
            completions[dateStr] = items.map(item => {
              if (typeof item === 'string') {
                const parts = dateStr.split('-');
                const defaultDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
                return { subtaskId: item, timestamp: defaultDate.toISOString() };
              }
              return item;
            });
          }
        });
      }

      return {
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        recurringGroups: Array.isArray(parsed.recurringGroups) ? parsed.recurringGroups : [],
        recurringCompletions: completions,
        settings: {
          alwaysOnTop: true,
          opacity: 0.95,
          openAtLogin: false,
          theme: 'dark',
          heatmapThresholds: { low: 1, medium: 3, high: 5 },
          enableNotifications: true,
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
    recurringGroups: [],
    recurringCompletions: {},
    settings: {
      alwaysOnTop: true,
      opacity: 0.95,
      openAtLogin: false,
      theme: 'dark',
      heatmapThresholds: { low: 1, medium: 3, high: 5 },
      enableNotifications: true
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

function toggleMainWindow() {
  if (!win) return;

  const isVisible = win.isVisible();
  const isFocused = win.isFocused();

  // If badge window is visible, or main window is hidden/minimized
  if (!isVisible || (badgeWin && badgeWin.isVisible())) {
    if (badgeWin) {
      badgeWin.hide();
    }
    win.show();
    win.focus();
    win.setAlwaysOnTop(true);
  } else {
    if (isFocused) {
      // Hide main window and show badge
      win.hide();
      if (!badgeWin) {
        createBadgeWindow();
      } else {
        badgeWin.show();
      }
    } else {
      // Main window is visible but not focused, bring it to front
      win.show();
      win.focus();
      win.setAlwaysOnTop(true);
    }
  }
}

function createTray() {
  const icon = nativeImage.createFromDataURL(defaultIconBase64);
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Widget', click: () => { if (win) { win.show(); win.focus(); win.setAlwaysOnTop(true); } } },
    { label: 'Hide Widget', click: () => { if (win) { win.hide(); } } },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.quit(); } }
  ]);

  tray.setToolTip('Journey - Activity Widget');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    toggleMainWindow();
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
    windowWidth = Math.max(800, Math.min(1200, savedBounds.width));
    windowHeight = Math.max(800, Math.min(800, savedBounds.height));
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
    minHeight: 600,
    maxWidth: 1200,
    maxHeight: 800,
    frame: false,
    transparent: true,
    alwaysOnTop: false,
    skipTaskbar: true,
    backgroundMaterial: 'none',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
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

  win.on('blur', () => {
    if (win) {
      win.setAlwaysOnTop(false);
    }
  });

  win.on('closed', () => {
    if (saveBoundsTimeout) {
      clearTimeout(saveBoundsTimeout);
    }
    win = null;
  });
}

function createBadgeWindow() {
  console.log('[Main] createBadgeWindow called');
  if (badgeWin) {
    console.log('[Main] badgeWin already exists');
    return;
  }
  try {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workArea;

    const badgeSize = 70; // 70x70 to allow for hover scaling and shadows
    const badgeX = width - badgeSize - 24;
    const badgeY = height - badgeSize - 24;
    console.log(`[Main] Badge coordinates calculated: x=${badgeX}, y=${badgeY}, size=${badgeSize}`);

    badgeWin = new BrowserWindow({
      x: badgeX,
      y: badgeY,
      width: badgeSize,
      height: badgeSize,
      frame: false,
      transparent: true,
      alwaysOnTop: false,
      skipTaskbar: true,
      resizable: false,
      backgroundMaterial: 'none',
      webPreferences: {
        preload: path.join(__dirname, 'preload.mjs'),
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    if (process.env.VITE_DEV_SERVER_URL) {
      const devUrl = `${process.env.VITE_DEV_SERVER_URL}?mode=badge`;
      console.log(`[Main] Loading dev server URL: ${devUrl}`);
      badgeWin.loadURL(devUrl);
    } else {
      const buildPath = path.join(__dirname, '../dist/index.html');
      console.log(`[Main] Loading production index file: ${buildPath}`);
      badgeWin.loadFile(buildPath, { query: { mode: 'badge' } });
    }

    badgeWin.on('closed', () => {
      console.log('[Main] badgeWin closed');
      badgeWin = null;
    });
  } catch (error) {
    console.error('[Main] Exception caught in createBadgeWindow:', error);
  }
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
// Keep track of notified task IDs with a composite key: task.id + ':' + (task.dueDate || '') + ':' + (task.time || '')
const notifiedKeys = new Set<string>();

function getTaskDueTime(task: any): Date | null {
  if (!task.dueDate) return null;
  const [year, month, day] = task.dueDate.split('-').map(Number);
  
  let hours = 0;
  let minutes = 0;
  
  if (task.time) {
    const timeMatch = task.time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) {
        hours += 12;
      } else if (ampm === 'AM' && hours === 12) {
        hours = 0;
      }
    }
  }
  
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function getRecurringSubtaskDueTime(timeStr: string, remind10MinBefore: boolean, date: Date): Date | null {
  const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!timeMatch) return null;
  
  let hours = parseInt(timeMatch[1], 10);
  let minutes = parseInt(timeMatch[2], 10);
  const ampm = timeMatch[3].toUpperCase();
  if (ampm === 'PM' && hours < 12) {
    hours += 12;
  } else if (ampm === 'AM' && hours === 12) {
    hours = 0;
  }
  
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0);
  if (remind10MinBefore) {
    target.setMinutes(target.getMinutes() - 10);
  }
  return target;
}

function checkDueTasks() {
  const data = readData() as any;
  const { tasks, recurringGroups, recurringCompletions, settings } = data;
  if (!settings.enableNotifications) return;

  const now = new Date();
  let completionsChanged = false;
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  // 1. Check regular tasks
  tasks.forEach((task: any) => {
    if (task.completedAt) return;
    
    const dueTime = getTaskDueTime(task);
    if (!dueTime) return;
    
    if (dueTime <= now) {
      const key = `${task.id}:${task.dueDate || ''}:${task.time || ''}`;
      if (!notifiedKeys.has(key)) {
        notifiedKeys.add(key);
        
        if (Notification.isSupported()) {
          const notification = new Notification({
            title: task.title,
            body: task.description || 'This task is now due.',
          });
          
          notification.on('click', () => {
            toggleMainWindow();
            if (win && win.webContents) {
              win.webContents.send('highlight-task', task.id);
            }
          });
          
          notification.show();
        }
      }
    }
  });

  // 2. Check recurring tasks
  if (Array.isArray(recurringGroups)) {
    recurringGroups.forEach((group: any) => {
      if (Array.isArray(group.subtasks)) {
        group.subtasks.forEach((subtask: any) => {
          if (subtask.intervalHours) {
            // Check if subtask is enabled
            if (subtask.enabled === false) return;

            // Search all keys in recurringCompletions for the latest event
            let latestEvent: any = null;
            if (recurringCompletions && typeof recurringCompletions === 'object') {
              Object.entries(recurringCompletions).forEach(([dateStr, items]: [string, any]) => {
                if (Array.isArray(items)) {
                  items.forEach((evt: any) => {
                    const evtId = typeof evt === 'string' ? evt : evt.subtaskId;
                    if (evtId === subtask.id) {
                      const timestamp = typeof evt === 'string' 
                        ? new Date(dateStr + 'T12:00:00').toISOString()
                        : evt.timestamp;
                      if (!latestEvent || timestamp > latestEvent.timestamp) {
                        latestEvent = { subtaskId: evtId, timestamp };
                      }
                    }
                  });
                }
              });
            }

            // If there's no completion event, initialize it to the current time so it starts counting down
            const lastTime = latestEvent ? new Date(latestEvent.timestamp) : now;
            if (!latestEvent) {
              if (!recurringCompletions[todayKey]) {
                recurringCompletions[todayKey] = [];
              }
              recurringCompletions[todayKey].push({
                subtaskId: subtask.id,
                timestamp: now.toISOString()
              });
              completionsChanged = true;
              return;
            }

            const nextDue = new Date(lastTime.getTime() + subtask.intervalHours * 60 * 60 * 1000);

            if (nextDue <= now) {
              const key = `recurring-interval:${subtask.id}:${lastTime.getTime()}`;
              if (!notifiedKeys.has(key)) {
                notifiedKeys.add(key);

                if (Notification.isSupported()) {
                  const notification = new Notification({
                    title: `${group.title}: ${subtask.title}`,
                    body: `Time for your habit: ${subtask.title} (due every ${subtask.intervalHours}h)`,
                  });

                  notification.on('click', () => {
                    toggleMainWindow();
                  });

                  notification.show();
                }

                // Auto-reset
                if (!recurringCompletions[todayKey]) {
                  recurringCompletions[todayKey] = [];
                }
                recurringCompletions[todayKey].push({
                  subtaskId: subtask.id,
                  timestamp: now.toISOString()
                });
                completionsChanged = true;
              }
            }
          } else if (subtask.time) {
            const completionsToday = recurringCompletions?.[todayKey] || [];
            const isCompleted = completionsToday.some((evt: any) => {
              const evtId = typeof evt === 'string' ? evt : evt.subtaskId;
              return evtId === subtask.id;
            });
            if (isCompleted) return;

            const notifyTime = getRecurringSubtaskDueTime(subtask.time, !!subtask.remind10MinBefore, now);
            if (!notifyTime) return;

            if (notifyTime <= now) {
              const key = `recurring:${subtask.id}:${todayKey}`;
              if (!notifiedKeys.has(key)) {
                notifiedKeys.add(key);

                if (Notification.isSupported()) {
                  const bodyText = subtask.remind10MinBefore
                    ? `10 min left for your habit: ${subtask.title}`
                    : `Time for your habit: ${subtask.title}`;
                  const notification = new Notification({
                    title: `${group.title}: ${subtask.title}`,
                    body: bodyText,
                  });

                  notification.on('click', () => {
                    toggleMainWindow();
                  });

                  notification.show();
                }
              }
            }
          }
        });
      }
    });
  }

  if (completionsChanged) {
    data.recurringCompletions = recurringCompletions;
    writeData(data);
    if (win && win.webContents) {
      win.webContents.send('recurring-completions-updated', recurringCompletions);
    }
  }
}

function startDueTaskScheduler() {
  const data = readData() as any;
  const { tasks, recurringGroups, recurringCompletions } = data;
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  let completionsChanged = false;
  
  tasks.forEach((task: any) => {
    if (!task.completedAt) {
      const dueTime = getTaskDueTime(task);
      if (dueTime && dueTime <= now) {
        const key = `${task.id}:${task.dueDate || ''}:${task.time || ''}`;
        notifiedKeys.add(key);
      }
    }
  });

  if (Array.isArray(recurringGroups)) {
    recurringGroups.forEach((group: any) => {
      if (Array.isArray(group.subtasks)) {
        group.subtasks.forEach((subtask: any) => {
          if (subtask.intervalHours) {
            if (subtask.enabled === false) return;

            let latestEvent: any = null;
            if (recurringCompletions && typeof recurringCompletions === 'object') {
              Object.entries(recurringCompletions).forEach(([dateStr, items]: [string, any]) => {
                if (Array.isArray(items)) {
                  items.forEach((evt: any) => {
                    const evtId = typeof evt === 'string' ? evt : evt.subtaskId;
                    if (evtId === subtask.id) {
                      const timestamp = typeof evt === 'string' 
                        ? new Date(dateStr + 'T12:00:00').toISOString()
                        : evt.timestamp;
                      if (!latestEvent || timestamp > latestEvent.timestamp) {
                        latestEvent = { subtaskId: evtId, timestamp };
                      }
                    }
                  });
                }
              });
            }

            const lastTime = latestEvent ? new Date(latestEvent.timestamp) : now;
            if (!latestEvent) {
              if (!recurringCompletions[todayKey]) {
                recurringCompletions[todayKey] = [];
              }
              recurringCompletions[todayKey].push({
                subtaskId: subtask.id,
                timestamp: now.toISOString()
              });
              completionsChanged = true;
              return;
            }

            const nextDue = new Date(lastTime.getTime() + subtask.intervalHours * 60 * 60 * 1000);

            if (nextDue <= now) {
              const key = `recurring-interval:${subtask.id}:${lastTime.getTime()}`;
              notifiedKeys.add(key);
            }
          } else if (subtask.time) {
            const completionsToday = recurringCompletions?.[todayKey] || [];
            const isCompleted = completionsToday.some((evt: any) => {
              const evtId = typeof evt === 'string' ? evt : evt.subtaskId;
              return evtId === subtask.id;
            });
            if (!isCompleted) {
              const notifyTime = getRecurringSubtaskDueTime(subtask.time, !!subtask.remind10MinBefore, now);
              if (notifyTime && notifyTime <= now) {
                const key = `recurring:${subtask.id}:${todayKey}`;
                notifiedKeys.add(key);
              }
            }
          }
        });
      }
    });
  }

  if (completionsChanged) {
    data.recurringCompletions = recurringCompletions;
    writeData(data);
  }

  // Run check immediately, and then every 60 seconds
  checkDueTasks();
  setInterval(checkDueTasks, 60000);
}
  app.whenReady().then(() => {
    createWindow();
    createTray();
    startDueTaskScheduler();

    // Register global shortcut to toggle widget window focus
    globalShortcut.register('CommandOrControl+Alt+J', () => {
      toggleMainWindow();
    });

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

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
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

ipcMain.handle('get-recurring-groups', () => {
  return (readData() as any).recurringGroups;
});

ipcMain.handle('save-recurring-groups', (_event, groups) => {
  const data = readData() as any;
  data.recurringGroups = groups;
  return writeData(data);
});

ipcMain.handle('get-recurring-completions', () => {
  return (readData() as any).recurringCompletions;
});

ipcMain.handle('save-recurring-completions', (_event, completions) => {
  const data = readData() as any;
  data.recurringCompletions = completions;
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
  console.log('[Main] IPC minimize-window handler invoked');
  if (win) {
    try {
      console.log('[Main] Hiding main window...');
      win.hide();
      if (!badgeWin) {
        console.log('[Main] badgeWin is null. Spawning badge...');
        createBadgeWindow();
      } else {
        console.log('[Main] badgeWin is already spawned. Showing badge...');
        badgeWin.show();
      }
    } catch (error) {
      console.error('[Main] Error handling minimize-window IPC:', error);
    }
  } else {
    console.warn('[Main] Cannot minimize: win is null!');
  }
});

ipcMain.handle('hide-window', () => {
  if (win) win.hide();
});

ipcMain.handle('close-window', () => {
  console.log('[Main] IPC close-window handler invoked, quitting app...');
  if (badgeWin) {
    try { badgeWin.close(); } catch { }
  }
  if (win) {
    try { win.close(); } catch { }
  }
  app.quit();
});

ipcMain.handle('restore-main-window', () => {
  if (badgeWin) {
    badgeWin.hide();
  }
  if (win) {
    win.show();
    win.focus();
    win.setAlwaysOnTop(true);
  }
});

ipcMain.on('drag-window', (event, { dx, dy }) => {
  const senderWin = BrowserWindow.fromWebContents(event.sender);
  if (senderWin) {
    const [x, y] = senderWin.getPosition();
    // Electron's setPosition requires integer values, which can be violated by display scaling
    senderWin.setPosition(Math.round(x + dx), Math.round(y + dy));
  }
});
