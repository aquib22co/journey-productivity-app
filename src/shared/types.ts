export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: string; // ISO Date String
  dueDate?: string;  // ISO Date String
  completedAt?: string | null; // ISO Date String | null
  time?: string;      // e.g. "09:30 AM"
  category?: 'work' | 'social' | 'study' | 'general';
}

export interface Settings {
  alwaysOnTop: boolean;
  opacity: number;
  openAtLogin: boolean;
  theme: 'dark' | 'light';
  heatmapThresholds: {
    low: number;
    medium: number;
    high: number;
  };
  enableNotifications: boolean;
}

export interface AppData {
  tasks: Task[];
  settings: Settings;
}

export interface ElectronAPI {
  getTasks: () => Promise<Task[]>;
  saveTasks: (tasks: Task[]) => Promise<boolean>;
  getSettings: () => Promise<Settings>;
  saveSettings: (settings: Settings) => Promise<boolean>;
  setAlwaysOnTop: (alwaysOnTop: boolean) => Promise<void>;
  setOpacity: (opacity: number) => Promise<void>;
  minimizeWindow: () => Promise<void>;
  hideWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  dragWindow: (dx: number, dy: number) => void;
  restoreMainWindow: () => Promise<void>;
  onHighlightTask: (callback: (taskId: string) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
