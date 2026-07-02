import React, { useState, useEffect } from 'react';
import type { Task, Settings } from '../shared/types';
import { TaskList, AddTaskCard } from './components/TaskList';
import { Heatmap } from './components/Heatmap';
import { SettingsPanel } from './components/SettingsPanel';
import { Settings as SettingsIcon, Minus, X, Flame, Award, CheckCircle } from 'lucide-react';

const DEFAULT_SETTINGS: Settings = {
  alwaysOnTop: true,
  opacity: 0.95,
  openAtLogin: false,
  theme: 'dark',
  heatmapThresholds: { low: 1, medium: 3, high: 5 },
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks and settings on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        if (window.electronAPI) {
          const loadedTasks = await window.electronAPI.getTasks();
          const loadedSettings = await window.electronAPI.getSettings();
          
          setTasks(loadedTasks || []);
          setSettings(loadedSettings || DEFAULT_SETTINGS);
        } else {
          // Fallback for standard browser preview
          const localTasks = localStorage.getItem('journey_tasks');
          const localSettings = localStorage.getItem('journey_settings');
          if (localTasks) setTasks(JSON.parse(localTasks));
          if (localSettings) setSettings(JSON.parse(localSettings));
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Save tasks helper
  const handleSaveTasks = async (newTasks: Task[]) => {
    setTasks(newTasks);
    try {
      if (window.electronAPI) {
        await window.electronAPI.saveTasks(newTasks);
      } else {
        localStorage.setItem('journey_tasks', JSON.stringify(newTasks));
      }
    } catch (err) {
      console.error('Failed to save tasks:', err);
    }
  };

  // Sync settings to Electron store/file
  const handleSaveSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    try {
      if (window.electronAPI) {
        await window.electronAPI.saveSettings(newSettings);
      } else {
        localStorage.setItem('journey_settings', JSON.stringify(newSettings));
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleAddTask = (
    title: string, 
    description?: string, 
    dueDate?: string, 
    category?: 'work' | 'social' | 'study' | 'general', 
    time?: string
  ) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      dueDate,
      category,
      time,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    handleSaveTasks([newTask, ...tasks]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    const updated = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    handleSaveTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    const filtered = tasks.filter((t) => t.id !== id);
    handleSaveTasks(filtered);
  };

  const handleClearTasks = () => {
    handleSaveTasks([]);
  };

  const handleImportTasks = (importedTasks: Task[]) => {
    const taskMap = new Map<string, Task>();
    tasks.forEach(t => taskMap.set(t.id, t));
    importedTasks.forEach(t => taskMap.set(t.id, t));
    const merged = Array.from(taskMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    handleSaveTasks(merged);
  };

  // Custom title bar buttons
  const handleMinimize = () => {
    if (window.electronAPI) window.electronAPI.minimizeWindow();
  };

  const handleClose = () => {
    if (window.electronAPI) window.electronAPI.closeWindow();
  };

  // Streaks calculation inside App.tsx
  const calculateStreaks = () => {
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    let totalCompleted = 0;
    
    const completedDates = new Set(
      tasks
        .filter(t => t.completedAt)
        .map(t => {
          const d = new Date(t.completedAt!);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        })
    );
    
    totalCompleted = tasks.filter(t => t.completedAt).length;

    const today = new Date();
    const checkDate = new Date(today);
    const todayKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    let streakActive = completedDates.has(todayKey);
    
    if (!streakActive) {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      streakActive = completedDates.has(yesterdayKey);
    }

    if (streakActive) {
      const runner = new Date(checkDate);
      while (true) {
        const runnerKey = `${runner.getFullYear()}-${String(runner.getMonth() + 1).padStart(2, '0')}-${String(runner.getDate()).padStart(2, '0')}`;
        if (completedDates.has(runnerKey)) {
          currentStreak++;
          runner.setDate(runner.getDate() - 1);
        } else {
          break;
        }
      }
    }

    const sortedDays = Array.from(completedDates).sort();
    let prevDate: Date | null = null;

    for (let i = 0; i < sortedDays.length; i++) {
      const currentDate = new Date(sortedDays[i]);
      if (prevDate === null) {
        tempStreak = 1;
      } else {
        const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          if (tempStreak > maxStreak) {
            maxStreak = tempStreak;
          }
          tempStreak = 1;
        }
      }
      prevDate = currentDate;
    }
    
    if (tempStreak > maxStreak) maxStreak = tempStreak;
    if (currentStreak > maxStreak) maxStreak = currentStreak;

    return { currentStreak, maxStreak, totalCompleted };
  };

  const { currentStreak, maxStreak, totalCompleted } = calculateStreaks();

  if (isLoading) {
    return (
      <div className="widget-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-color)', animation: 'spin 1s linear infinite' }}></div>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>LOADING...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="widget-container">
      {/* Frameless Drag Handle Header */}
      <header className="widget-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Settings Icon enclosed in a dark rounded card button */}
          <div className="no-drag">
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
              className={`win-btn ${isSettingsOpen ? 'active' : ''}`}
              title="Settings"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                background: 'rgba(18, 24, 38, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isSettingsOpen ? 'var(--accent-color)' : 'var(--text-muted)'
              }}
            >
              <SettingsIcon size={20} />
            </button>
          </div>

          {/* Header Stats Row Card (Aligned to left-center) */}
          {!isSettingsOpen && (
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'row', 
                gap: '24px', 
                alignItems: 'center',
                height: '48px',
                background: 'rgba(18, 24, 38, 0.5)', 
                border: '1px solid rgba(255, 255, 255, 0.05)', 
                padding: '0 20px', 
                borderRadius: '10px' 
              }}
            >
              {/* Streak */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={18} color="#f59e0b" />
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Streak:</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>{currentStreak}d</span>
              </div>
              <div style={{ width: '1px', height: '16px', background: 'rgba(255, 255, 255, 0.06)' }} />
              {/* Max */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#6366f1" />
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Max:</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>{maxStreak}d</span>
              </div>
              <div style={{ width: '1px', height: '16px', background: 'rgba(255, 255, 255, 0.06)' }} />
              {/* Total */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={18} color="#10b981" />
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Total:</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>{totalCompleted}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side Controls: Minimize and Close */}
        <div className="window-controls no-drag">
          <button onClick={handleMinimize} className="win-btn" title="Minimize" style={{ width: '38px', height: '38px', borderRadius: '8px' }}>
            <Minus size={15} />
          </button>
          <button 
            onClick={handleClose} 
            className="win-btn close" 
            title="Close" 
            style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '8px', 
              border: '1px solid rgba(255, 255, 255, 0.05)', 
              background: 'rgba(255, 255, 255, 0.02)' 
            }}
          >
            <X size={15} />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="widget-content">
        {isSettingsOpen ? (
          <div style={{ flex: 1, overflowY: 'auto' }} className="no-drag">
            <SettingsPanel
              settings={settings}
              tasks={tasks}
              onUpdateSettings={handleSaveSettings}
              onImportTasks={handleImportTasks}
              onClearTasks={handleClearTasks}
            />
          </div>
        ) : (
          /* Side-by-Side Horizontal Grid Layout */
          <div className="dashboard-grid">
            {/* Left Column: Heatmap and Add Task Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minHeight: 0, minWidth: 0 }}>
              <Heatmap tasks={tasks} settings={settings} />
              <AddTaskCard onAddTask={handleAddTask} />
            </div>

            {/* Right Column: Task List Card */}
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }}>
              <TaskList
                tasks={tasks}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
            </div>
          </div>
        )}
      </main>

      {/* Embedded Spin Animation keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;
