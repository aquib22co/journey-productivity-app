import { BrowserWindow as e, Menu as t, Notification as n, Tray as r, app as i, globalShortcut as a, ipcMain as o, nativeImage as s, screen as c } from "electron";
import * as l from "path";
import * as u from "fs";
import { fileURLToPath as d } from "url";
//#region src/main/main.ts
var f = d(import.meta.url), p = l.dirname(f), m = null, h = null, g = null, _ = l.join(i.getPath("userData"), "journey-widget-data.json"), v = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABoSURBVDhPY2AYWOD///8gDFIMwgxAgK5g1IDS///vQYIMQAwS1DAGDOgKGIYE4IJRFEAOY8CArYBhSAPEYCw2/P///0mO4eHhBvGJ4xPHp552AHIYAwZsBQxDGiAGY7EBAJm3YkQp3b2oAAAAAElFTkSuQmCC";
function y() {
	try {
		if (u.existsSync(_)) {
			let e = u.readFileSync(_, "utf-8"), t = JSON.parse(e), n = {};
			return t.recurringCompletions && typeof t.recurringCompletions == "object" && Object.entries(t.recurringCompletions).forEach(([e, t]) => {
				Array.isArray(t) && (n[e] = t.map((t) => {
					if (typeof t == "string") {
						let n = e.split("-");
						return {
							subtaskId: t,
							timestamp: new Date(Number(n[0]), Number(n[1]) - 1, Number(n[2]), 12, 0, 0).toISOString()
						};
					}
					return t;
				}));
			}), {
				tasks: Array.isArray(t.tasks) ? t.tasks : [],
				recurringGroups: Array.isArray(t.recurringGroups) ? t.recurringGroups : [],
				recurringCompletions: n,
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
					enableNotifications: !0,
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
		recurringGroups: [],
		recurringCompletions: {},
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
			enableNotifications: !0
		},
		windowBounds: null
	};
}
function b(e) {
	try {
		return u.writeFileSync(_, JSON.stringify(e, null, 2), "utf-8"), !0;
	} catch (e) {
		return console.error("Error writing data:", e), !1;
	}
}
function x() {
	if (!m) return;
	let e = m.isVisible(), t = m.isFocused();
	!e || h && h.isVisible() ? (h && h.hide(), m.show(), m.focus(), m.setAlwaysOnTop(!0)) : t ? (m.hide(), h ? h.show() : w()) : (m.show(), m.focus(), m.setAlwaysOnTop(!0));
}
function S() {
	g = new r(s.createFromDataURL(v));
	let e = t.buildFromTemplate([
		{
			label: "Show Widget",
			click: () => {
				m && (m.show(), m.focus(), m.setAlwaysOnTop(!0));
			}
		},
		{
			label: "Hide Widget",
			click: () => {
				m && m.hide();
			}
		},
		{ type: "separator" },
		{
			label: "Quit",
			click: () => {
				i.quit();
			}
		}
	]);
	g.setToolTip("Journey - Activity Widget"), g.setContextMenu(e), g.on("click", () => {
		x();
	});
}
function C() {
	let t = y().windowBounds, { width: n, height: r, x: i, y: a } = c.getPrimaryDisplay().workArea, o = 960, s = 620;
	t && typeof t.width == "number" && typeof t.height == "number" && (o = Math.max(800, Math.min(1200, t.width)), s = Math.max(800, Math.min(800, t.height)));
	let u = i + n - o - 24, d = a + r - s - 24;
	if (t && typeof t.x == "number" && typeof t.y == "number") {
		let e = t.x + o / 2, n = t.y + s / 2, r = !1, i = c.getAllDisplays();
		for (let t of i) {
			let i = t.bounds;
			if (e >= i.x && e <= i.x + i.width && n >= i.y && n <= i.y + i.height) {
				r = !0;
				break;
			}
		}
		r && (u = t.x, d = t.y);
	}
	m = new e({
		x: u,
		y: d,
		width: o,
		height: s,
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
			preload: l.join(p, "preload.mjs"),
			nodeIntegration: !1,
			contextIsolation: !0
		}
	}), process.env.VITE_DEV_SERVER_URL ? m.loadURL(process.env.VITE_DEV_SERVER_URL) : m.loadFile(l.join(p, "../dist/index.html"));
	let f = null, h = () => {
		f && clearTimeout(f), f = setTimeout(() => {
			if (m) try {
				let e = m.getBounds(), t = y();
				t.windowBounds = {
					x: e.x,
					y: e.y,
					width: e.width,
					height: e.height
				}, b(t);
			} catch (e) {
				console.error("Failed to save window bounds:", e);
			}
		}, 500);
	};
	m.on("move", h), m.on("resize", h), m.on("blur", () => {
		m && m.setAlwaysOnTop(!1);
	}), m.on("closed", () => {
		f && clearTimeout(f), m = null;
	});
}
function w() {
	if (console.log("[Main] createBadgeWindow called"), h) {
		console.log("[Main] badgeWin already exists");
		return;
	}
	try {
		let { width: t, height: n } = c.getPrimaryDisplay().workArea, r = t - 70 - 24, i = n - 70 - 24;
		if (console.log(`[Main] Badge coordinates calculated: x=${r}, y=${i}, size=70`), h = new e({
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
				preload: l.join(p, "preload.mjs"),
				nodeIntegration: !1,
				contextIsolation: !0
			}
		}), process.env.VITE_DEV_SERVER_URL) {
			let e = `${process.env.VITE_DEV_SERVER_URL}?mode=badge`;
			console.log(`[Main] Loading dev server URL: ${e}`), h.loadURL(e);
		} else {
			let e = l.join(p, "../dist/index.html");
			console.log(`[Main] Loading production index file: ${e}`), h.loadFile(e, { query: { mode: "badge" } });
		}
		h.on("closed", () => {
			console.log("[Main] badgeWin closed"), h = null;
		});
	} catch (e) {
		console.error("[Main] Exception caught in createBadgeWindow:", e);
	}
}
if (!i.requestSingleInstanceLock({ myKey: "journey-tracker" })) i.quit();
else {
	i.on("second-instance", () => {
		m && (m.isMinimized() && m.restore(), m.isVisible() || m.show(), m.focus());
	});
	let t = /* @__PURE__ */ new Set();
	function r(e) {
		if (!e.dueDate) return null;
		let [t, n, r] = e.dueDate.split("-").map(Number), i = 0, a = 0;
		if (e.time) {
			let t = e.time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
			if (t) {
				i = parseInt(t[1], 10), a = parseInt(t[2], 10);
				let e = t[3].toUpperCase();
				e === "PM" && i < 12 ? i += 12 : e === "AM" && i === 12 && (i = 0);
			}
		}
		return new Date(t, n - 1, r, i, a, 0, 0);
	}
	function o(e, t, n) {
		let r = e.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
		if (!r) return null;
		let i = parseInt(r[1], 10), a = parseInt(r[2], 10), o = r[3].toUpperCase();
		o === "PM" && i < 12 ? i += 12 : o === "AM" && i === 12 && (i = 0);
		let s = new Date(n.getFullYear(), n.getMonth(), n.getDate(), i, a, 0, 0);
		return t && s.setMinutes(s.getMinutes() - 10), s;
	}
	function s() {
		let e = y(), { tasks: i, recurringGroups: a, recurringCompletions: s, settings: c } = e;
		if (!c.enableNotifications) return;
		let l = /* @__PURE__ */ new Date(), u = !1, d = `${l.getFullYear()}-${String(l.getMonth() + 1).padStart(2, "0")}-${String(l.getDate()).padStart(2, "0")}`;
		i.forEach((e) => {
			if (e.completedAt) return;
			let i = r(e);
			if (i && i <= l) {
				let r = `${e.id}:${e.dueDate || ""}:${e.time || ""}`;
				if (!t.has(r) && (t.add(r), n.isSupported())) {
					let t = new n({
						title: e.title,
						body: e.description || "This task is now due."
					});
					t.on("click", () => {
						x(), m && m.webContents && m.webContents.send("highlight-task", e.id);
					}), t.show();
				}
			}
		}), Array.isArray(a) && a.forEach((e) => {
			Array.isArray(e.subtasks) && e.subtasks.forEach((r) => {
				if (r.intervalHours) {
					if (r.enabled === !1) return;
					let i = null;
					s && typeof s == "object" && Object.entries(s).forEach(([e, t]) => {
						Array.isArray(t) && t.forEach((t) => {
							let n = typeof t == "string" ? t : t.subtaskId;
							if (n === r.id) {
								let r = typeof t == "string" ? (/* @__PURE__ */ new Date(e + "T12:00:00")).toISOString() : t.timestamp;
								(!i || r > i.timestamp) && (i = {
									subtaskId: n,
									timestamp: r
								});
							}
						});
					});
					let a = i ? new Date(i.timestamp) : l;
					if (!i) {
						s[d] || (s[d] = []), s[d].push({
							subtaskId: r.id,
							timestamp: l.toISOString()
						}), u = !0;
						return;
					}
					if (new Date(a.getTime() + r.intervalHours * 60 * 60 * 1e3) <= l) {
						let i = `recurring-interval:${r.id}:${a.getTime()}`;
						if (!t.has(i)) {
							if (t.add(i), n.isSupported()) {
								let t = new n({
									title: `${e.title}: ${r.title}`,
									body: `Time for your habit: ${r.title} (due every ${r.intervalHours}h)`
								});
								t.on("click", () => {
									x();
								}), t.show();
							}
							s[d] || (s[d] = []), s[d].push({
								subtaskId: r.id,
								timestamp: l.toISOString()
							}), u = !0;
						}
					}
				} else if (r.time) {
					if ((s?.[d] || []).some((e) => (typeof e == "string" ? e : e.subtaskId) === r.id)) return;
					let i = o(r.time, !!r.remind10MinBefore, l);
					if (!i) return;
					if (i <= l) {
						let i = `recurring:${r.id}:${d}`;
						if (!t.has(i) && (t.add(i), n.isSupported())) {
							let t = r.remind10MinBefore ? `10 min left for your habit: ${r.title}` : `Time for your habit: ${r.title}`, i = new n({
								title: `${e.title}: ${r.title}`,
								body: t
							});
							i.on("click", () => {
								x();
							}), i.show();
						}
					}
				}
			});
		}), u && (e.recurringCompletions = s, b(e), m && m.webContents && m.webContents.send("recurring-completions-updated", s));
	}
	function c() {
		let e = y(), { tasks: n, recurringGroups: i, recurringCompletions: a } = e, c = /* @__PURE__ */ new Date(), l = `${c.getFullYear()}-${String(c.getMonth() + 1).padStart(2, "0")}-${String(c.getDate()).padStart(2, "0")}`, u = !1;
		n.forEach((e) => {
			if (!e.completedAt) {
				let n = r(e);
				if (n && n <= c) {
					let n = `${e.id}:${e.dueDate || ""}:${e.time || ""}`;
					t.add(n);
				}
			}
		}), Array.isArray(i) && i.forEach((e) => {
			Array.isArray(e.subtasks) && e.subtasks.forEach((e) => {
				if (e.intervalHours) {
					if (e.enabled === !1) return;
					let n = null;
					a && typeof a == "object" && Object.entries(a).forEach(([t, r]) => {
						Array.isArray(r) && r.forEach((r) => {
							let i = typeof r == "string" ? r : r.subtaskId;
							if (i === e.id) {
								let e = typeof r == "string" ? (/* @__PURE__ */ new Date(t + "T12:00:00")).toISOString() : r.timestamp;
								(!n || e > n.timestamp) && (n = {
									subtaskId: i,
									timestamp: e
								});
							}
						});
					});
					let r = n ? new Date(n.timestamp) : c;
					if (!n) {
						a[l] || (a[l] = []), a[l].push({
							subtaskId: e.id,
							timestamp: c.toISOString()
						}), u = !0;
						return;
					}
					if (new Date(r.getTime() + e.intervalHours * 60 * 60 * 1e3) <= c) {
						let n = `recurring-interval:${e.id}:${r.getTime()}`;
						t.add(n);
					}
				} else if (e.time && !(a?.[l] || []).some((t) => (typeof t == "string" ? t : t.subtaskId) === e.id)) {
					let n = o(e.time, !!e.remind10MinBefore, c);
					if (n && n <= c) {
						let n = `recurring:${e.id}:${l}`;
						t.add(n);
					}
				}
			});
		}), u && (e.recurringCompletions = a, b(e)), s(), setInterval(s, 6e4);
	}
	i.whenReady().then(() => {
		C(), S(), c(), a.register("CommandOrControl+Alt+J", () => {
			x();
		}), i.on("activate", () => {
			e.getAllWindows().length === 0 && C();
		});
	});
}
i.on("window-all-closed", () => {
	process.platform !== "darwin" && i.quit();
}), i.on("will-quit", () => {
	a.unregisterAll();
}), o.handle("get-tasks", () => y().tasks), o.handle("save-tasks", (e, t) => {
	let n = y();
	return n.tasks = t, b(n);
}), o.handle("get-recurring-groups", () => y().recurringGroups), o.handle("save-recurring-groups", (e, t) => {
	let n = y();
	return n.recurringGroups = t, b(n);
}), o.handle("get-recurring-completions", () => y().recurringCompletions), o.handle("save-recurring-completions", (e, t) => {
	let n = y();
	return n.recurringCompletions = t, b(n);
}), o.handle("get-settings", () => y().settings), o.handle("save-settings", (e, t) => {
	let n = y();
	n.settings = t;
	let r = b(n);
	r && m && m.setAlwaysOnTop(!1);
	try {
		i.setLoginItemSettings({
			openAtLogin: t.openAtLogin,
			path: i.getPath("exe")
		});
	} catch (e) {
		console.error("Failed to set login items settings:", e);
	}
	return r;
}), o.handle("set-always-on-top", (e, t) => {
	m && m.setAlwaysOnTop(!1);
}), o.handle("set-opacity", (e, t) => {}), o.handle("minimize-window", () => {
	if (console.log("[Main] IPC minimize-window handler invoked"), m) try {
		console.log("[Main] Hiding main window..."), m.hide(), h ? (console.log("[Main] badgeWin is already spawned. Showing badge..."), h.show()) : (console.log("[Main] badgeWin is null. Spawning badge..."), w());
	} catch (e) {
		console.error("[Main] Error handling minimize-window IPC:", e);
	}
	else console.warn("[Main] Cannot minimize: win is null!");
}), o.handle("hide-window", () => {
	m && m.hide();
}), o.handle("close-window", () => {
	if (console.log("[Main] IPC close-window handler invoked, quitting app..."), h) try {
		h.close();
	} catch {}
	if (m) try {
		m.close();
	} catch {}
	i.quit();
}), o.handle("restore-main-window", () => {
	h && h.hide(), m && (m.show(), m.focus(), m.setAlwaysOnTop(!0));
}), o.on("drag-window", (t, { dx: n, dy: r }) => {
	let i = e.fromWebContents(t.sender);
	if (i) {
		let [e, t] = i.getPosition();
		i.setPosition(Math.round(e + n), Math.round(t + r));
	}
});
//#endregion
export {};
