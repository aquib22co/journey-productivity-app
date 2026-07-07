import React, { useState, useEffect } from 'react';
import type { Task, Settings } from '../shared/types';
import { TaskList } from './components/TaskList';
import { AddTaskCard } from './components/AddTaskCard';
import { Heatmap } from './components/Heatmap';
import { SettingsPanel } from './components/SettingsPanel';
import { Settings as SettingsIcon, Minus, X, Flame, Award, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    <TooltipProvider>
      <div 
        className="widget-container" 
        style={{ background: `rgba(9, 13, 22, ${settings.opacity})` }}
      >
        {/* Frameless Drag Handle Header */}
        <header className="widget-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Settings Icon enclosed in a dark rounded card button */}
            <div className="no-drag">
              <Tooltip>
                <TooltipTrigger 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
                  className={`win-btn ${isSettingsOpen ? 'active' : ''}`}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    background: 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSettingsOpen ? 'var(--accent-color)' : 'var(--text-muted)'
                  }}
                >
                  <SettingsIcon size={20} />
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start">
                  <p>{isSettingsOpen ? 'Close Settings' : 'Open Settings'}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Header Stats Row Card (Aligned to left-center) */}
            {!isSettingsOpen && (
              <Badge 
                variant="outline" 
                className="flex flex-row items-center gap-6 no-drag"
                style={{
                  height: '48px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  background: 'var(--bg-card)',
                  padding: '0 20px',
                }}
              >
                {/* Streak */}
                <div className="flex items-center gap-2">
                  <Flame size={16} className="text-amber-500 fill-amber-500/10" />
                  <span className="text-[12px] text-slate-400 font-normal">Streak:</span>
                  <span className="text-[15px] font-bold text-slate-100">{currentStreak}d</span>
                </div>
                
                <Separator orientation="vertical" className="bg-white/10" style={{ alignSelf: 'center', height: '16px' }} />

                {/* Max */}
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-indigo-400 fill-indigo-400/10" />
                  <span className="text-[12px] text-slate-400 font-normal">Max:</span>
                  <span className="text-[15px] font-bold text-slate-100">{maxStreak}d</span>
                </div>

                <Separator orientation="vertical" className="bg-white/10" style={{ alignSelf: 'center', height: '16px' }} />

                {/* Total */}
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-400 fill-emerald-400/10" />
                  <span className="text-[12px] text-slate-400 font-normal">Total:</span>
                  <span className="text-[15px] font-bold text-slate-100">{totalCompleted}</span>
                </div>
              </Badge>
            )}
          </div>

          {/* Right Side Controls: Minimize and Close */}
          <div className="window-controls no-drag">
            <Tooltip>
              <TooltipTrigger 
                onClick={handleMinimize} 
                className="win-btn" 
                style={{ width: '38px', height: '38px', borderRadius: '8px' }}
              >
                <Minus size={15} />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Minimize</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger 
                onClick={handleClose} 
                className="win-btn close" 
                style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '8px', 
                  border: '1px solid rgba(255, 255, 255, 0.05)', 
                  background: 'rgba(255, 255, 255, 0.02)' 
                }}
              >
                <X size={15} />
              </TooltipTrigger>
              <TooltipContent side="bottom" align="end">
                <p>Close Widget</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* Main Layout */}
        <main className="widget-content">
          {isSettingsOpen ? (
            <div style={{ flex: 1, overflowY: 'auto' }} className="no-drag">
              <SettingsPanel
                settings={settings}
                onUpdateSettings={handleSaveSettings}
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
    </TooltipProvider>
  );
};

export default App;
