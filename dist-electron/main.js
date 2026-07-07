import { BrowserWindow, Menu, Tray, app, ipcMain, nativeImage, screen } from "electron";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
//#region src/main/main.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var win = null;
var tray = null;
var dataFilePath = path.join(app.getPath("userData"), "journey-widget-data.json");
var defaultIconBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABoSURBVDhPY2AYWOD///8gDFIMwgxAgK5g1IDS///vQYIMQAwS1DAGDOgKGIYE4IJRFEAOY8CArYBhSAPEYCw2/P///0mO4eHhBvGJ4xPHp552AHIYAwZsBQxDGiAGY7EBAJm3YkQp3b2oAAAAAElFTkSuQmCC";
function readData() {
	try {
		if (fs.existsSync(dataFilePath)) {
			const content = fs.readFileSync(dataFilePath, "utf-8");
			const parsed = JSON.parse(content);
			return {
				tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
				settings: {
					alwaysOnTop: true,
					opacity: .95,
					openAtLogin: false,
					theme: "dark",
					heatmapThresholds: {
						low: 1,
						medium: 3,
						high: 5
					},
					...parsed.settings || {}
				},
				windowBounds: parsed.windowBounds || null
			};
		}
	} catch (error) {
		console.error("Error reading data:", error);
	}
	return {
		tasks: [],
		settings: {
			alwaysOnTop: true,
			opacity: .95,
			openAtLogin: false,
			theme: "dark",
			heatmapThresholds: {
				low: 1,
				medium: 3,
				high: 5
			}
		},
		windowBounds: null
	};
}
function writeData(data) {
	try {
		fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
		return true;
	} catch (error) {
		console.error("Error writing data:", error);
		return false;
	}
}
function createTray() {
	tray = new Tray(nativeImage.createFromDataURL(defaultIconBase64));
	const contextMenu = Menu.buildFromTemplate([
		{
			label: "Show Widget",
			click: () => {
				if (win) {
					win.show();
					win.focus();
				}
			}
		},
		{
			label: "Hide Widget",
			click: () => {
				if (win) win.hide();
			}
		},
		{ type: "separator" },
		{
			label: "Quit",
			click: () => {
				app.quit();
			}
		}
	]);
	tray.setToolTip("Journey - Activity Widget");
	tray.setContextMenu(contextMenu);
	tray.on("click", () => {
		if (win) if (win.isVisible()) win.hide();
		else {
			win.show();
			win.focus();
		}
	});
}
function createWindow() {
	const initialData = readData();
	const settings = initialData.settings;
	const savedBounds = initialData.windowBounds;
	const { width, height, x, y } = screen.getPrimaryDisplay().workArea;
	let windowWidth = 960;
	let windowHeight = 620;
	if (savedBounds && typeof savedBounds.width === "number" && typeof savedBounds.height === "number") {
		windowWidth = Math.max(800, Math.min(1400, savedBounds.width));
		windowHeight = Math.max(500, Math.min(1e3, savedBounds.height));
	}
	let windowX = x + width - windowWidth - 24;
	let windowY = y + height - windowHeight - 24;
	if (savedBounds && typeof savedBounds.x === "number" && typeof savedBounds.y === "number") {
		const savedCenterX = savedBounds.x + windowWidth / 2;
		const savedCenterY = savedBounds.y + windowHeight / 2;
		let isVisible = false;
		const displays = screen.getAllDisplays();
		for (const display of displays) {
			const bounds = display.bounds;
			if (savedCenterX >= bounds.x && savedCenterX <= bounds.x + bounds.width && savedCenterY >= bounds.y && savedCenterY <= bounds.y + bounds.height) {
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
		maxHeight: 1e3,
		frame: false,
		transparent: true,
		alwaysOnTop: false,
		skipTaskbar: true,
		backgroundMaterial: "acrylic",
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			nodeIntegration: false,
			contextIsolation: true
		}
	});
	win.setOpacity(settings.opacity);
	if (process.env.VITE_DEV_SERVER_URL) win.loadURL(process.env.VITE_DEV_SERVER_URL);
	else win.loadFile(path.join(__dirname, "../dist/index.html"));
	let saveBoundsTimeout = null;
	const saveWindowBoundsDebounced = () => {
		if (saveBoundsTimeout) clearTimeout(saveBoundsTimeout);
		saveBoundsTimeout = setTimeout(() => {
			if (!win) return;
			try {
				const bounds = win.getBounds();
				const data = readData();
				data.windowBounds = {
					x: bounds.x,
					y: bounds.y,
					width: bounds.width,
					height: bounds.height
				};
				writeData(data);
			} catch (error) {
				console.error("Failed to save window bounds:", error);
			}
		}, 500);
	};
	win.on("move", saveWindowBoundsDebounced);
	win.on("resize", saveWindowBoundsDebounced);
	win.on("closed", () => {
		if (saveBoundsTimeout) clearTimeout(saveBoundsTimeout);
		win = null;
	});
}
if (!app.requestSingleInstanceLock({ myKey: "journey-tracker" })) app.quit();
else {
	app.on("second-instance", () => {
		if (win) {
			if (win.isMinimized()) win.restore();
			if (!win.isVisible()) win.show();
			win.focus();
		}
	});
	app.whenReady().then(() => {
		createWindow();
		createTray();
		app.on("activate", () => {
			if (BrowserWindow.getAllWindows().length === 0) createWindow();
		});
	});
}
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
ipcMain.handle("get-tasks", () => {
	return readData().tasks;
});
ipcMain.handle("save-tasks", (_event, tasks) => {
	const data = readData();
	data.tasks = tasks;
	return writeData(data);
});
ipcMain.handle("get-settings", () => {
	return readData().settings;
});
ipcMain.handle("save-settings", (_event, settings) => {
	const data = readData();
	data.settings = settings;
	const success = writeData(data);
	if (success && win) {
		win.setAlwaysOnTop(false);
		win.setOpacity(settings.opacity);
	}
	try {
		app.setLoginItemSettings({
			openAtLogin: settings.openAtLogin,
			path: app.getPath("exe")
		});
	} catch (error) {
		console.error("Failed to set login items settings:", error);
	}
	return success;
});
ipcMain.handle("set-always-on-top", (_event, _alwaysOnTop) => {
	if (win) win.setAlwaysOnTop(false);
});
ipcMain.handle("set-opacity", (_event, opacity) => {
	if (win) win.setOpacity(opacity);
});
ipcMain.handle("minimize-window", () => {
	if (win) win.minimize();
});
ipcMain.handle("hide-window", () => {
	if (win) win.hide();
});
ipcMain.handle("close-window", () => {
	if (win) win.close();
});
//#endregion
export {};
