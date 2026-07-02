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
});
