let electron = require("electron");
//#region src/main/preload.ts
electron.contextBridge.exposeInMainWorld("electronAPI", {
	getTasks: () => electron.ipcRenderer.invoke("get-tasks"),
	saveTasks: (tasks) => electron.ipcRenderer.invoke("save-tasks", tasks),
	getSettings: () => electron.ipcRenderer.invoke("get-settings"),
	saveSettings: (settings) => electron.ipcRenderer.invoke("save-settings", settings),
	setAlwaysOnTop: (alwaysOnTop) => electron.ipcRenderer.invoke("set-always-on-top", alwaysOnTop),
	setOpacity: (opacity) => electron.ipcRenderer.invoke("set-opacity", opacity),
	minimizeWindow: () => electron.ipcRenderer.invoke("minimize-window"),
	hideWindow: () => electron.ipcRenderer.invoke("hide-window"),
	closeWindow: () => electron.ipcRenderer.invoke("close-window")
});
//#endregion
