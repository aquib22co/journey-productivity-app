import { BrowserWindow as e, Menu as t, Tray as n, app as r, ipcMain as i, nativeImage as a, screen as o } from "electron";
import * as s from "path";
import * as c from "fs";
import { fileURLToPath as l } from "url";
//#region src/main/main.ts
var u = l(import.meta.url), d = s.dirname(u), f = null, p = null, m = s.join(r.getPath("userData"), "journey-widget-data.json"), h = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABoSURBVDhPY2AYWOD///8gDFIMwgxAgK5g1IDS///vQYIMQAwS1DAGDOgKGIYE4IJRFEAOY8CArYBhSAPEYCw2/P///0mO4eHhBvGJ4xPHp552AHIYAwZsBQxDGiAGY7EBAJm3YkQp3b2oAAAAAElFTkSuQmCC";
function g() {
	try {
		if (c.existsSync(m)) {
			let e = c.readFileSync(m, "utf-8"), t = JSON.parse(e);
			return {
				tasks: Array.isArray(t.tasks) ? t.tasks : [],
				settings: {
					alwaysOnTop: !0,
					opacity: .95,
					openAtLogin: !1,
					theme: "dark",
					heatmapThresholds: {
						low: 1,
						medium: 3,
						high: 5
					},
					...t.settings || {}
				}
			};
		}
	} catch (e) {
		console.error("Error reading data:", e);
	}
	return {
		tasks: [],
		settings: {
			alwaysOnTop: !0,
			opacity: .95,
			openAtLogin: !1,
			theme: "dark",
			heatmapThresholds: {
				low: 1,
				medium: 3,
				high: 5
			}
		}
	};
}
function _(e) {
	try {
		return c.writeFileSync(m, JSON.stringify(e, null, 2), "utf-8"), !0;
	} catch (e) {
		return console.error("Error writing data:", e), !1;
	}
}
function v() {
	p = new n(a.createFromDataURL(h));
	let e = t.buildFromTemplate([
		{
			label: "Show Widget",
			click: () => {
				f && (f.show(), f.focus());
			}
		},
		{
			label: "Hide Widget",
			click: () => {
				f && f.hide();
			}
		},
		{ type: "separator" },
		{
			label: "Quit",
			click: () => {
				r.quit();
			}
		}
	]);
	p.setToolTip("Journey - Activity Widget"), p.setContextMenu(e), p.on("click", () => {
		f && (f.isVisible() ? f.hide() : (f.show(), f.focus()));
	});
}
function y() {
	let t = g().settings, { width: n, height: r, x: i, y: a } = o.getPrimaryDisplay().workArea;
	f = new e({
		x: i + n - 960 - 24,
		y: a + r - 620 - 24,
		width: 960,
		height: 620,
		minWidth: 800,
		minHeight: 500,
		maxWidth: 1400,
		maxHeight: 1e3,
		frame: !1,
		transparent: !0,
		alwaysOnTop: !1,
		skipTaskbar: !0,
		backgroundMaterial: "acrylic",
		webPreferences: {
			preload: s.join(d, "preload.js"),
			nodeIntegration: !1,
			contextIsolation: !0
		}
	}), f.setOpacity(t.opacity), process.env.VITE_DEV_SERVER_URL ? f.loadURL(process.env.VITE_DEV_SERVER_URL) : f.loadFile(s.join(d, "../dist/index.html")), f.on("closed", () => {
		f = null;
	});
}
r.requestSingleInstanceLock({ myKey: "journey-tracker" }) ? (r.on("second-instance", () => {
	f && (f.isMinimized() && f.restore(), f.isVisible() || f.show(), f.focus());
}), r.whenReady().then(() => {
	y(), v(), r.on("activate", () => {
		e.getAllWindows().length === 0 && y();
	});
})) : r.quit(), r.on("window-all-closed", () => {
	process.platform !== "darwin" && r.quit();
}), i.handle("get-tasks", () => g().tasks), i.handle("save-tasks", (e, t) => {
	let n = g();
	return n.tasks = t, _(n);
}), i.handle("get-settings", () => g().settings), i.handle("save-settings", (e, t) => {
	let n = g();
	n.settings = t;
	let i = _(n);
	i && f && (f.setAlwaysOnTop(!1), f.setOpacity(t.opacity));
	try {
		r.setLoginItemSettings({
			openAtLogin: t.openAtLogin,
			path: r.getPath("exe")
		});
	} catch (e) {
		console.error("Failed to set login items settings:", e);
	}
	return i;
}), i.handle("set-always-on-top", (e, t) => {
	f && f.setAlwaysOnTop(!1);
}), i.handle("set-opacity", (e, t) => {
	f && f.setOpacity(t);
}), i.handle("minimize-window", () => {
	f && f.minimize();
}), i.handle("hide-window", () => {
	f && f.hide();
}), i.handle("close-window", () => {
	f && f.close();
});
//#endregion
export {};
