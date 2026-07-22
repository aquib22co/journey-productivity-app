import { BrowserWindow as e, Menu as t, Tray as n, app as r, globalShortcut as i, ipcMain as a, nativeImage as o, screen as s } from "electron";
import * as c from "path";
import * as l from "fs";
import { fileURLToPath as u } from "url";
//#region src/main/main.ts
var d = u(import.meta.url), f = c.dirname(d), p = null, m = null, h = null, g = c.join(r.getPath("userData"), "journey-widget-data.json"), _ = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABoSURBVDhPY2AYWOD///8gDFIMwgxAgK5g1IDS///vQYIMQAwS1DAGDOgKGIYE4IJRFEAOY8CArYBhSAPEYCw2/P///0mO4eHhBvGJ4xPHp552AHIYAwZsBQxDGiAGY7EBAJm3YkQp3b2oAAAAAElFTkSuQmCC";
function v() {
	try {
		if (l.existsSync(g)) {
			let e = l.readFileSync(g, "utf-8"), t = JSON.parse(e);
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
function y(e) {
	try {
		return l.writeFileSync(g, JSON.stringify(e, null, 2), "utf-8"), !0;
	} catch (e) {
		return console.error("Error writing data:", e), !1;
	}
}
function b() {
	if (!p) return;
	let e = p.isVisible(), t = p.isFocused();
	!e || m && m.isVisible() ? (m && m.hide(), p.show(), p.focus(), p.setAlwaysOnTop(!0)) : t ? (p.hide(), m ? m.show() : C()) : (p.show(), p.focus(), p.setAlwaysOnTop(!0));
}
function x() {
	h = new n(o.createFromDataURL(_));
	let e = t.buildFromTemplate([
		{
			label: "Show Widget",
			click: () => {
				p && (p.show(), p.focus(), p.setAlwaysOnTop(!0));
			}
		},
		{
			label: "Hide Widget",
			click: () => {
				p && p.hide();
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
	h.setToolTip("Journey - Activity Widget"), h.setContextMenu(e), h.on("click", () => {
		b();
	});
}
function S() {
	let t = v().windowBounds, { width: n, height: r, x: i, y: a } = s.getPrimaryDisplay().workArea, o = 960, l = 620;
	t && typeof t.width == "number" && typeof t.height == "number" && (o = Math.max(800, Math.min(1200, t.width)), l = Math.max(800, Math.min(800, t.height)));
	let u = i + n - o - 24, d = a + r - l - 24;
	if (t && typeof t.x == "number" && typeof t.y == "number") {
		let e = t.x + o / 2, n = t.y + l / 2, r = !1, i = s.getAllDisplays();
		for (let t of i) {
			let i = t.bounds;
			if (e >= i.x && e <= i.x + i.width && n >= i.y && n <= i.y + i.height) {
				r = !0;
				break;
			}
		}
		r && (u = t.x, d = t.y);
	}
	p = new e({
		x: u,
		y: d,
		width: o,
		height: l,
		minWidth: 800,
		minHeight: 600,
		maxWidth: 1200,
		maxHeight: 800,
		frame: !1,
		transparent: !0,
		alwaysOnTop: !1,
		skipTaskbar: !0,
		backgroundMaterial: "none",
		webPreferences: {
			preload: c.join(f, "preload.mjs"),
			nodeIntegration: !1,
			contextIsolation: !0
		}
	}), process.env.VITE_DEV_SERVER_URL ? p.loadURL(process.env.VITE_DEV_SERVER_URL) : p.loadFile(c.join(f, "../dist/index.html"));
	let m = null, h = () => {
		m && clearTimeout(m), m = setTimeout(() => {
			if (p) try {
				let e = p.getBounds(), t = v();
				t.windowBounds = {
					x: e.x,
					y: e.y,
					width: e.width,
					height: e.height
				}, y(t);
			} catch (e) {
				console.error("Failed to save window bounds:", e);
			}
		}, 500);
	};
	p.on("move", h), p.on("resize", h), p.on("blur", () => {
		p && p.setAlwaysOnTop(!1);
	}), p.on("closed", () => {
		m && clearTimeout(m), p = null;
	});
}
function C() {
	if (console.log("[Main] createBadgeWindow called"), m) {
		console.log("[Main] badgeWin already exists");
		return;
	}
	try {
		let { width: t, height: n } = s.getPrimaryDisplay().workArea, r = t - 70 - 24, i = n - 70 - 24;
		if (console.log(`[Main] Badge coordinates calculated: x=${r}, y=${i}, size=70`), m = new e({
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
				preload: c.join(f, "preload.mjs"),
				nodeIntegration: !1,
				contextIsolation: !0
			}
		}), process.env.VITE_DEV_SERVER_URL) {
			let e = `${process.env.VITE_DEV_SERVER_URL}?mode=badge`;
			console.log(`[Main] Loading dev server URL: ${e}`), m.loadURL(e);
		} else {
			let e = c.join(f, "../dist/index.html");
			console.log(`[Main] Loading production index file: ${e}`), m.loadFile(e, { query: { mode: "badge" } });
		}
		m.on("closed", () => {
			console.log("[Main] badgeWin closed"), m = null;
		});
	} catch (e) {
		console.error("[Main] Exception caught in createBadgeWindow:", e);
	}
}
r.requestSingleInstanceLock({ myKey: "journey-tracker" }) ? (r.on("second-instance", () => {
	p && (p.isMinimized() && p.restore(), p.isVisible() || p.show(), p.focus());
}), r.whenReady().then(() => {
	S(), x(), i.register("CommandOrControl+Alt+J", () => {
		b();
	}), r.on("activate", () => {
		e.getAllWindows().length === 0 && S();
	});
})) : r.quit(), r.on("window-all-closed", () => {
	process.platform !== "darwin" && r.quit();
}), r.on("will-quit", () => {
	i.unregisterAll();
}), a.handle("get-tasks", () => v().tasks), a.handle("save-tasks", (e, t) => {
	let n = v();
	return n.tasks = t, y(n);
}), a.handle("get-settings", () => v().settings), a.handle("save-settings", (e, t) => {
	let n = v();
	n.settings = t;
	let i = y(n);
	i && p && p.setAlwaysOnTop(!1);
	try {
		r.setLoginItemSettings({
			openAtLogin: t.openAtLogin,
			path: r.getPath("exe")
		});
	} catch (e) {
		console.error("Failed to set login items settings:", e);
	}
	return i;
}), a.handle("set-always-on-top", (e, t) => {
	p && p.setAlwaysOnTop(!1);
}), a.handle("set-opacity", (e, t) => {}), a.handle("minimize-window", () => {
	if (console.log("[Main] IPC minimize-window handler invoked"), p) try {
		console.log("[Main] Hiding main window..."), p.hide(), m ? (console.log("[Main] badgeWin is already spawned. Showing badge..."), m.show()) : (console.log("[Main] badgeWin is null. Spawning badge..."), C());
	} catch (e) {
		console.error("[Main] Error handling minimize-window IPC:", e);
	}
	else console.warn("[Main] Cannot minimize: win is null!");
}), a.handle("hide-window", () => {
	p && p.hide();
}), a.handle("close-window", () => {
	if (console.log("[Main] IPC close-window handler invoked, quitting app..."), m) try {
		m.close();
	} catch {}
	if (p) try {
		p.close();
	} catch {}
	r.quit();
}), a.handle("restore-main-window", () => {
	m && m.hide(), p && (p.show(), p.focus(), p.setAlwaysOnTop(!0));
}), a.on("drag-window", (t, { dx: n, dy: r }) => {
	let i = e.fromWebContents(t.sender);
	if (i) {
		let [e, t] = i.getPosition();
		i.setPosition(Math.round(e + n), Math.round(t + r));
	}
});
//#endregion
export {};
