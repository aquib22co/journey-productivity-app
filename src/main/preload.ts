import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getTasks: () => ipcRenderer.invoke('get-tasks'),
  saveTasks: (tasks: any) => ipcRenderer.invoke('save-tasks', tasks),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  setAlwaysOnTop: (alwaysOnTop: boolean) => ipcRenderer.invoke('set-always-on-top', alwaysOnTop),
  setOpacity: (opacity: number) => ipcRenderer.invoke('set-opacity', opacity),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  dragWindow: (dx: number, dy: number) => ipcRenderer.send('drag-window', { dx, dy }),
  restoreMainWindow: () => ipcRenderer.invoke('restore-main-window'),
  onHighlightTask: (callback: (taskId: string) => void) => {
    const subscription = (_event: any, taskId: string) => callback(taskId);
    ipcRenderer.on('highlight-task', subscription);
    return () => {
      ipcRenderer.removeListener('highlight-task', subscription);
    };
  },
  onRecurringCompletionsUpdated: (callback: (completions: any) => void) => {
    const subscription = (_event: any, completions: any) => callback(completions);
    ipcRenderer.on('recurring-completions-updated', subscription);
    return () => {
      ipcRenderer.removeListener('recurring-completions-updated', subscription);
    };
  },
  getRecurringGroups: () => ipcRenderer.invoke('get-recurring-groups'),
  saveRecurringGroups: (groups: any) => ipcRenderer.invoke('save-recurring-groups', groups),
  getRecurringCompletions: () => ipcRenderer.invoke('get-recurring-completions'),
  saveRecurringCompletions: (completions: any) => ipcRenderer.invoke('save-recurring-completions', completions),
});

