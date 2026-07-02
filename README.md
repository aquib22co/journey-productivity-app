# Journey 🎯 — Desktop Activity-Tracker Widget

**Journey** is a lightweight, premium Windows desktop widget built with **Electron, React, and TypeScript (Vite)**. It blends seamlessly with your desktop environment, mimicking the look and feel of a native Windows 11 widget with a frosted glass **Acrylic** backdrop, custom drag-and-drop movement, and responsive desktop-oriented design.

It combines a **GitHub-style activity heatmap** (contribution graph) with a **task manager** to visualizes your daily productivity in real-time.

---

## Key Features

1. **Native-Feel Desktop Widget**:
   - **Acrylic Background**: Native frosted glass acrylic material on Windows 11.
   - **Chromeless Framing**: Clean drag handle header with custom minimize, close, and drag regions.
   - **Always-on-Top Toggle**: Keeps the widget hovering above your work or lets it behave as a standard floating window.
   - **Adjustable Opacity**: Slider in settings lets you change widget transparency dynamically (from 30% to 100%).
   - **Launch on Startup**: Option to automatically start Journey when Windows boots up.
   - **System Tray Integration**: Minimizes cleanly to the Windows system tray; click the tray icon to toggle visibility or right-click to access quick menu options.
   - **Single Instance Enforcement**: Prevents multiple copies of the widget from running simultaneously, focusing the existing one instead.
2. **Interactive Activity Heatmap**:
   - **GitHub-style Contribution Grid**: A 12-month calendar grid mapping task completions column-wise.
   - **HSL Gradient Intensity**: Day cell colors transition dynamically based on completion counts.
   - **Configurable Thresholds**: Define custom ranges for Low, Medium, and High activity colors.
   - **Streak Analytics**: Real-time stats on your current streak (days in a row with at least 1 completed task) and maximum lifetime streak.
   - **Custom Tooltips**: Hover over cells to see the exact completion date and task counts.
3. **Simple Task Manager**:
   - **CRUD Operations**: Quickly create, edit titles/descriptions, set due dates, complete, and delete tasks.
   - **Collapsible Completed List**: Completed tasks collapse out of the way to keep the widget compact.
   - **Success Animations**: Interactive checkboxes trigger a subtle ripple highlight on completion.
   - **Data Import & Export**: Back up task history and settings as a `.json` file and restore them anytime.
4. **Robust Local Storage**:
   - Stores data safely in the user's local application data folder (`app.getPath('userData')/journey-widget-data.json`).
   - Zero external cloud or native database dependencies.

---

## Technical Architecture

The project follows a secure, optimized Electron architecture:
- **Main Process (`src/main/main.ts`)**: Controls window creation, system tray, login items, and secure JSON read/write handlers.
- **Preload Script (`src/main/preload.ts`)**: Exposes a safe context bridge API to the renderer under `window.electronAPI`.
- **Renderer Process (`src/renderer/`)**: Core React dashboard (`App.tsx`), components, and styles.
- **Shared Contracts (`src/shared/types.ts`)**: Type definitions for tasks, settings, and IPC communications.
- **Vanilla CSS System (`src/renderer/index.css`)**: Highly-polished design utilizing Segoe UI typography, smooth transitions, custom range/switch controls, and interactive focus rings.

---

## Getting Started

### Prerequisites

Ensure you have **Node.js (v18+)** and **npm** installed.

### Installation

1. Clone or copy the project files to your directory.
2. Install the dependencies:
   ```bash
   npm install
   ```

### Development

To start the application in development mode with hot-reloading:
```bash
npm run dev
```

### Packaging for Production

To package the widget into a production-ready Windows executable:
1. Compile the build:
   ```bash
   npm run build
   ```
2. You can package the app using an installer bundler like `electron-builder` or run the compiled files directly via Electron.

---

## Native UX Audit Compliance

This widget has been audited against standard desktop design guidelines:
- **Default Cursors**: Hovering list rows or standard buttons does not change the pointer to a web-style hand cursor.
- **No Text Selection**: Text selection is disabled on layout chrome (`user-select: none`) and only enabled inside text inputs.
- **Segoe UI Typography**: Uses the Windows 11 system font stack.
- **Focus Rings**: Includes high-contrast outlines for accessible keyboard navigation.
- **Escape Key Action**: Pressing Escape in the edit task form closes the editor.
