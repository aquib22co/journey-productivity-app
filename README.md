# Journey 🎯 — Desktop Activity-Tracker Widget

**Journey** is a premium, native-feeling Windows desktop widget built with **Electron, React, and TypeScript (Vite)**. It blends seamlessly with your desktop environment, mimicking the look and feel of a native Windows 11 widget with a transparent background, custom drag-and-drop movement, and responsive desktop-oriented design.

It integrates a **Daily Habits Column**, a **GitHub-style activity heatmap** (contribution graph), a **simple task manager**, and a completed **activity history** log to visualize and track your productivity in real-time.

---

## Key Features

### 1. Daily Habits Checklist (New!)
- **Group-Based Habit Bundles**: Organize daily habits into groups (e.g., Namaz, DSA, Health, Workout).
- **Flexible Reminder Modes**:
  - **Specific Time**: Set precise hour/minute target times (AM/PM) with optional push alerts.
  - **Notification Offsets**: A simple toggle switch configures the alert to fire exactly at the scheduled time or 10 minutes prior.
- **Interval Repeating Timers**: Configure recurring tasks that repeat at a set frequency (e.g., "Drink Water" every 2 hours).
- **Rolling Checkboxes**: Interval tasks dynamically uncheck themselves in the UI once their repeat window has elapsed, prompting you to log the habit again.
- **Inline Subtask Editor**: Edit habit name, reminder types, times, and intervals inline without opening popups.
- **Progress Tracking**: Dynamic progress bars showing completion percentage for each habit group.

### 2. Interactive Activity Heatmap
- **GitHub-style Contribution Grid**: A 12-month calendar grid mapping task completions column-wise.
- **HSL Gradient Intensity**: Day cell colors transition dynamically based on completion counts (unified across standard tasks and recurring daily habits).
- **Configurable Thresholds**: Define custom ranges for Low, Medium, and High activity colors in the settings panel.
- **Streak Analytics**: Real-time tracking of your current streak (consecutive days with at least 1 completed task) and maximum lifetime streak.
- **Custom Tooltips**: Hover over cells to see the exact completion date and task counts.

### 3. Simple Task Manager
- **Task Management**: Create, edit titles/descriptions, set due dates, complete, and delete tasks.
- **Collapsible Completed List**: Completed tasks collapse out of the way to keep the widget compact.
- **Success Animations**: Interactive checkboxes trigger a subtle ripple highlight on completion.
- **Data Import & Export**: Back up task history, recurring groups, completions, and settings as a `.json` file and restore them anytime.

### 4. Native Desktop Widget Integration
- **Transparent Frameless Styling**: Clean drag handle header with custom minimize, close, and drag regions.
- **Always-on-Top Toggle**: Keeps the widget hovering above your work or lets it behave as a standard floating window.
- **Adjustable Opacity**: Slider in settings lets you change widget transparency dynamically (from 30% to 100%).
- **Launch on Startup**: Option to automatically start Journey when Windows boots up.
- **System Tray Integration**: Minimizes cleanly to the Windows system tray; click the tray icon to toggle visibility or right-click to access quick menu options.
- **Single Instance Enforcement**: Prevents multiple copies of the widget from running simultaneously, focusing the existing one instead.
- **Robust Local Storage**: Stores data safely in the user's local application data folder (`app.getPath('userData')/journey-widget-data.json`).

---

## Technical Architecture

The project follows a secure, optimized Electron architecture:
- **Main Process (`src/main/main.ts`)**: Controls window creation, system tray, login items, and secure JSON read/write handlers. Includes a rolling notification scheduler that checks regular and recurring task timings.
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
2. Package the app using Vite/Electron packager or run the compiled files directly via Electron.

---

## Native UX Audit Compliance

This widget has been audited against standard desktop design guidelines:
- **Default Cursors**: Hovering list rows or standard buttons does not change the pointer to a web-style hand cursor.
- **No Text Selection**: Text selection is disabled on layout chrome (`user-select: none`) and only enabled inside text inputs.
- **Segoe UI Typography**: Uses the Windows 11 system font stack.
- **Focus Rings**: Includes high-contrast outlines for accessible keyboard navigation.
- **Escape Key Action**: Pressing Escape in the edit task form closes the editor.
