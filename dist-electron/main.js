import { BrowserWindow as e, Menu as t, Tray as n, app as r, ipcMain as i, nativeImage as a, screen as o } from "electron";
import * as s from "path";
import * as c from "fs";
import { fileURLToPath as l } from "url";
//#region src/main/main.ts
var u = l(import.meta.url), d = s.dirname(u), f = null, p = null, m = null, h = s.join(r.getPath("userData"), "journey-widget-data.json"), g = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABoSURBVDhPY2AYWOD///8gDFIMwgxAgK5g1IDS///vQYIMQAwS1DAGDOgKGIYE4IJRFEAOY8CArYBhSAPEYCw2/P///0mO4eHhBvGJ4xPHp552AHIYAwZsBQxDGiAGY7EBAJm3YkQp3b2oAAAAAElFTkSuQmCC";
function _() {
	try {
		if (c.existsSync(h)) {
			let e = c.readFileSync(h, "utf-8"), t = JSON.parse(e);
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
				},
				windowBounds: t.windowBounds || null
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
		},
		windowBounds: null
	};
}
function v(e) {
	try {
		return c.writeFileSync(h, JSON.stringify(e, null, 2), "utf-8"), !0;
	} catch (e) {
		return console.error("Error writing data:", e), !1;
	}
}
function y() {
	m = new n(a.createFromDataURL(g));
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
	m.setToolTip("Journey - Activity Widget"), m.setContextMenu(e), m.on("click", () => {
		f && (f.isVisible() ? f.hide() : (f.show(), f.focus()));
	});
}
function b() {
	let t = _().windowBounds, { width: n, height: r, x: i, y: a } = o.getPrimaryDisplay().workArea, c = 960, l = 620;
	t && typeof t.width == "number" && typeof t.height == "number" && (c = Math.max(800, Math.min(1400, t.width)), l = Math.max(500, Math.min(1e3, t.height)));
	let u = i + n - c - 24, p = a + r - l - 24;
	if (t && typeof t.x == "number" && typeof t.y == "number") {
		let e = t.x + c / 2, n = t.y + l / 2, r = !1, i = o.getAllDisplays();
		for (let t of i) {
			let i = t.bounds;
			if (e >= i.x && e <= i.x + i.width && n >= i.y && n <= i.y + i.height) {
				r = !0;
				break;
			}
		}
		r && (u = t.x, p = t.y);
	}
	f = new e({
		x: u,
		y: p,
		width: c,
		height: l,
		minWidth: 800,
		minHeight: 500,
		maxWidth: 1400,
		maxHeight: 1e3,
		frame: !1,
		transparent: !0,
		alwaysOnTop: !1,
		skipTaskbar: !0,
		backgroundMaterial: "none",
		webPreferences: {
			preload: s.join(d, "preload.mjs"),
			nodeIntegration: !1,
			contextIsolation: !0
		}
	}), process.env.VITE_DEV_SERVER_URL ? f.loadURL(process.env.VITE_DEV_SERVER_URL) : f.loadFile(s.join(d, "../dist/index.html"));
	let m = null, h = () => {
		m && clearTimeout(m), m = setTimeout(() => {
			if (f) try {
				let e = f.getBounds(), t = _();
				t.windowBounds = {
					x: e.x,
					y: e.y,
					width: e.width,
					height: e.height
				}, v(t);
			} catch (e) {
				console.error("Failed to save window bounds:", e);
			}
		}, 500);
	};
	f.on("move", h), f.on("resize", h), f.on("closed", () => {
		m && clearTimeout(m), f = null;
	});
}
function x() {
	if (console.log("[Main] createBadgeWindow called"), p) {
		console.log("[Main] badgeWin already exists");
		return;
	}
	try {
		let { width: t, height: n } = o.getPrimaryDisplay().workArea, r = t - 70 - 24, i = n - 70 - 24;
		if (console.log(`[Main] Badge coordinates calculated: x=${r}, y=${i}, size=70`), p = new e({
			x: r,
			y: i,
			width: 70,
			height: 70,
			frame: !1,
			transparent: !0,
			alwaysOnTop: !1,
			skipTaskbar: !0,
			resizable: !1,
			backgroundMaterial: "none",
			webPreferences: {
				preload: s.join(d, "preload.mjs"),
				nodeIntegration: !1,
				contextIsolation: !0
			}
		}), process.env.VITE_DEV_SERVER_URL) {
			let e = `${process.env.VITE_DEV_SERVER_URL}?mode=badge`;
			console.log(`[Main] Loading dev server URL: ${e}`), p.loadURL(e);
		} else {
			let e = s.join(d, "../dist/index.html");
			console.log(`[Main] Loading production index file: ${e}`), p.loadFile(e, { query: { mode: "badge" } });
		}
		p.on("closed", () => {
			console.log("[Main] badgeWin closed"), p = null;
		});
	} catch (e) {
		console.error("[Main] Exception caught in createBadgeWindow:", e);
	}
}
r.requestSingleInstanceLock({ myKey: "journey-tracker" }) ? (r.on("second-instance", () => {
	f && (f.isMinimized() && f.restore(), f.isVisible() || f.show(), f.focus());
}), r.whenReady().then(() => {
	b(), y(), r.on("activate", () => {
		e.getAllWindows().length === 0 && b();
	});
})) : r.quit(), r.on("window-all-closed", () => {
	process.platform !== "darwin" && r.quit();
}), i.handle("get-tasks", () => _().tasks), i.handle("save-tasks", (e, t) => {
	let n = _();
	return n.tasks = t, v(n);
}), i.handle("get-settings", () => _().settings), i.handle("save-settings", (e, t) => {
	let n = _();
	n.settings = t;
	let i = v(n);
	i && f && f.setAlwaysOnTop(!1);
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
}), i.handle("set-opacity", (e, t) => {}), i.handle("minimize-window", () => {
	if (console.log("[Main] IPC minimize-window handler invoked"), f) try {
		console.log("[Main] Hiding main window..."), f.hide(), p ? (console.log("[Main] badgeWin is already spawned. Showing badge..."), p.show()) : (console.log("[Main] badgeWin is null. Spawning badge..."), x());
	} catch (e) {
		console.error("[Main] Error handling minimize-window IPC:", e);
	}
	else console.warn("[Main] Cannot minimize: win is null!");
}), i.handle("hide-window", () => {
	f && f.hide();
}), i.handle("close-window", () => {
	if (console.log("[Main] IPC close-window handler invoked, quitting app..."), p) try {
		p.close();
	} catch {}
	if (f) try {
		f.close();
	} catch {}
	r.quit();
}), i.handle("restore-main-window", () => {
	p && p.hide(), f && (f.show(), f.focus());
}), i.on("drag-window", (t, { dx: n, dy: r }) => {
	let i = e.fromWebContents(t.sender);
	if (i) {
		let [e, t] = i.getPosition();
		i.setPosition(Math.round(e + n), Math.round(t + r));
	}
});
//#endregion
export {};
