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
	closeWindow: () => electron.ipcRenderer.invoke("close-window"),
	dragWindow: (dx, dy) => electron.ipcRenderer.send("drag-window", {
		dx,
		dy
	}),
	restoreMainWindow: () => electron.ipcRenderer.invoke("restore-main-window"),
	onHighlightTask: (callback) => {
		const subscription = (_event, taskId) => callback(taskId);
		electron.ipcRenderer.on("highlight-task", subscription);
		return () => {
			electron.ipcRenderer.removeListener("highlight-task", subscription);
		};
	},
	onRecurringCompletionsUpdated: (callback) => {
		const subscription = (_event, completions) => callback(completions);
		electron.ipcRenderer.on("recurring-completions-updated", subscription);
		return () => {
			electron.ipcRenderer.removeListener("recurring-completions-updated", subscription);
		};
	},
	getRecurringGroups: () => electron.ipcRenderer.invoke("get-recurring-groups"),
	saveRecurringGroups: (groups) => electron.ipcRenderer.invoke("save-recurring-groups", groups),
	getRecurringCompletions: () => electron.ipcRenderer.invoke("get-recurring-completions"),
	saveRecurringCompletions: (completions) => electron.ipcRenderer.invoke("save-recurring-completions", completions)
});
//#endregion
