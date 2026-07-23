import React, { useState, useEffect } from 'react';
import type { Task, Settings, RecurringGroup, RecurringCompletions, RecurringSubtask } from '../shared/types';
import { TaskList } from './components/TaskList';
import { Heatmap } from './components/Heatmap';
import { SettingsPanel } from './components/SettingsPanel';
import { CompletedTasksPanel, getLocalDateString, getSevenDaysAgoString } from './components/CompletedTasksPanel';
import { RecurringTasksPanel } from './components/RecurringTasksPanel';
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
  enableNotifications: true,
};

const BadgeWindow: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.screenX, y: e.screenY });
    setHasMoved(false);

    // Capture pointer events to track moves even outside the element bounds
    const element = e.currentTarget as HTMLElement;
    element.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.screenX - dragStart.x;
    const dy = e.screenY - dragStart.y;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
      setHasMoved(true);
      if (window.electronAPI && window.electronAPI.dragWindow) {
        window.electronAPI.dragWindow(dx, dy);
      }
      setDragStart({ x: e.screenX, y: e.screenY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    const element = e.currentTarget as HTMLElement;
    try {
      element.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    if (!hasMoved) {
      if (window.electronAPI && window.electronAPI.restoreMainWindow) {
        window.electronAPI.restoreMainWindow();
      }
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        overflow: 'hidden',
      }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="badge-hover-effect"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(18, 24, 38, 0.95)',
          border: '1.5px solid var(--accent-color, #0084ff)',
          boxShadow: '0 8px 24px rgba(0, 132, 255, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          userSelect: 'none',
          transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease',
          transform: isDragging ? 'scale(0.95)' : 'scale(1)',
        }}
      >
        <Flame size={26} className="text-amber-500 fill-amber-500/20" style={{ filter: 'drop-shadow(0 0 5px rgba(245, 158, 11, 0.6))' }} />
        <style>{`
          .badge-hover-effect:hover {
            transform: scale(1.1) !important;
            box-shadow: 0 12px 28px rgba(0, 132, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
            cursor: grab;
          }
          .badge-hover-effect:active {
            cursor: grabbing;
          }
        `}</style>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recurringGroups, setRecurringGroups] = useState<RecurringGroup[]>([]);
  const [recurringCompletions, setRecurringCompletions] = useState<RecurringCompletions>({});
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // History panel filter state
  const [historyStartDate, setHistoryStartDate] = useState<string>(getSevenDaysAgoString);
  const [historyEndDate, setHistoryEndDate] = useState<string>(() => getLocalDateString(new Date()));
  const [showHistoryFilter, setShowHistoryFilter] = useState(false);

  // Load tasks and settings on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        if (window.electronAPI) {
          const loadedTasks = await window.electronAPI.getTasks();
          const loadedSettings = await window.electronAPI.getSettings();
          const loadedGroups = await window.electronAPI.getRecurringGroups();
          const loadedCompletions = await window.electronAPI.getRecurringCompletions();

          setTasks(loadedTasks || []);
          setSettings(loadedSettings || DEFAULT_SETTINGS);
          setRecurringGroups(loadedGroups || []);
          setRecurringCompletions(loadedCompletions || {});
        } else {
          // Fallback for standard browser preview
          const localTasks = localStorage.getItem('journey_tasks');
          const localSettings = localStorage.getItem('journey_settings');
          const localGroups = localStorage.getItem('journey_recurring_groups');
          const localCompletions = localStorage.getItem('journey_recurring_completions');
          if (localTasks) setTasks(JSON.parse(localTasks));
          if (localSettings) setSettings(JSON.parse(localSettings));
          if (localGroups) setRecurringGroups(JSON.parse(localGroups));
          if (localCompletions) setRecurringCompletions(JSON.parse(localCompletions));
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

  const handleSaveRecurringGroups = async (newGroups: RecurringGroup[]) => {
    setRecurringGroups(newGroups);
    try {
      if (window.electronAPI) {
        await window.electronAPI.saveRecurringGroups(newGroups);
      } else {
        localStorage.setItem('journey_recurring_groups', JSON.stringify(newGroups));
      }
    } catch (err) {
      console.error('Failed to save recurring groups:', err);
    }
  };

  const handleSaveRecurringCompletions = async (newCompletions: RecurringCompletions) => {
    setRecurringCompletions(newCompletions);
    try {
      if (window.electronAPI) {
        await window.electronAPI.saveRecurringCompletions(newCompletions);
      } else {
        localStorage.setItem('journey_recurring_completions', JSON.stringify(newCompletions));
      }
    } catch (err) {
      console.error('Failed to save recurring completions:', err);
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
    if (updatedTask.id.startsWith('recurring-completed|')) {
      const parts = updatedTask.id.split('|');
      if (parts.length === 4 && parts[0] === 'recurring-completed') {
        const subtaskId = parts[1];
        const timestamp = parts[2];
        const dateKey = parts[3];
        const currentCompletionsForDate = recurringCompletions[dateKey] || [];
        const newCompletionsForDate = currentCompletionsForDate.filter(evt => {
          const evtId = typeof evt === 'string' ? evt : evt.subtaskId;
          const evtTime = typeof evt === 'string' ? '' : evt.timestamp;
          if (evtId === subtaskId) {
            if (evtTime === timestamp || evtTime === '') return false;
          }
          return true;
        });
        const newCompletions = {
          ...recurringCompletions,
          [dateKey]: newCompletionsForDate
        };
        handleSaveRecurringCompletions(newCompletions);
      }
      return;
    }
    if (updatedTask.id.startsWith('recurring-completed:')) {
      const parts = updatedTask.id.split(':');
      if (parts.length === 3 && parts[0] === 'recurring-completed') {
        const subtaskId = parts[1];
        const dateKey = parts[2];
        const currentCompletionsForDate = recurringCompletions[dateKey] || [];
        const newCompletionsForDate = currentCompletionsForDate.filter(evt => {
          const evtId = typeof evt === 'string' ? evt : evt.subtaskId;
          return evtId !== subtaskId;
        });
        const newCompletions = {
          ...recurringCompletions,
          [dateKey]: newCompletionsForDate
        };
        handleSaveRecurringCompletions(newCompletions);
      }
      return;
    }
    const updated = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    handleSaveTasks(updated);
  };

  const getRecurringScheduledDate = (timeStr: string, dateStr: string): Date | null => {
    const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!timeMatch) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    let hours = parseInt(timeMatch[1], 10);
    let minutes = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  };

  const handleToggleSubtask = (groupId: string, subtaskId: string, date: string) => {
    let isInterval = false;
    for (const group of recurringGroups) {
      const st = group.subtasks.find(s => s.id === subtaskId);
      if (st && st.intervalHours) {
        isInterval = true;
        break;
      }
    }

    const currentCompletionsForDate = recurringCompletions[date] || [];
    let newCompletionsForDate: any[];

    if (isInterval) {
      const now = new Date();
      const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const subtask = recurringGroups.flatMap(g => g.subtasks).find(st => st.id === subtaskId);
      const intervalMs = (subtask?.intervalHours || 2) * 60 * 60 * 1000;
      
      const completionsOfSubtask = currentCompletionsForDate.filter(evt => {
        const evtId = typeof evt === 'string' ? evt : evt.subtaskId;
        return evtId === subtaskId;
      });

      const lastEvent = completionsOfSubtask
        .map(evt => typeof evt === 'string' ? { subtaskId: evt, timestamp: new Date(date + 'T12:00:00').toISOString() } : evt)
        .sort((a,b) => b.timestamp.localeCompare(a.timestamp))[0];

      let isCurrentlyCompleted = false;
      if (lastEvent) {
        const timeSince = Date.now() - new Date(lastEvent.timestamp).getTime();
        isCurrentlyCompleted = timeSince < intervalMs;
      }

      if (isCurrentlyCompleted && lastEvent) {
        newCompletionsForDate = currentCompletionsForDate.filter(evt => evt !== lastEvent);
      } else {
        let completionTime = new Date();
        if (date !== todayKey) {
          const parts = date.split('-');
          completionTime = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
        }
        newCompletionsForDate = [
          ...currentCompletionsForDate,
          { subtaskId, timestamp: completionTime.toISOString() }
        ];
      }
    } else {
      const exists = currentCompletionsForDate.some(evt => {
        const evtId = typeof evt === 'string' ? evt : evt.subtaskId;
        return evtId === subtaskId;
      });

      if (exists) {
        newCompletionsForDate = currentCompletionsForDate.filter(evt => {
          const evtId = typeof evt === 'string' ? evt : evt.subtaskId;
          return evtId !== subtaskId;
        });
      } else {
        const subtask = recurringGroups.flatMap(g => g.subtasks).find(st => st.id === subtaskId);
        let completionTime = new Date();
        const todayKey = `${completionTime.getFullYear()}-${String(completionTime.getMonth() + 1).padStart(2, '0')}-${String(completionTime.getDate()).padStart(2, '0')}`;
        
        if (date !== todayKey) {
          let pastTimeSet = false;
          if (subtask && subtask.time) {
            const schedDate = getRecurringScheduledDate(subtask.time, date);
            if (schedDate) {
              completionTime = schedDate;
              pastTimeSet = true;
            }
          }
          if (!pastTimeSet) {
            const parts = date.split('-');
            completionTime = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
          }
        } else {
          if (subtask && subtask.time) {
            const schedDate = getRecurringScheduledDate(subtask.time, date);
            if (schedDate) {
              if (completionTime >= schedDate) {
                // Completed at or after scheduled time: log scheduled time
                completionTime = schedDate;
              }
              // If completed early, keep current completionTime
            }
          }
        }

        newCompletionsForDate = [
          ...currentCompletionsForDate,
          { subtaskId, timestamp: completionTime.toISOString() }
        ];
      }
    }

    const newCompletions = {
      ...recurringCompletions,
      [date]: newCompletionsForDate
    };
    handleSaveRecurringCompletions(newCompletions);
  };

  const handleAddRecurringGroup = (title: string) => {
    const newGroup: RecurringGroup = {
      id: crypto.randomUUID(),
      title,
      subtasks: []
    };
    handleSaveRecurringGroups([...recurringGroups, newGroup]);
  };

  const handleDeleteRecurringGroup = (groupId: string) => {
    const filtered = recurringGroups.filter(g => g.id !== groupId);
    handleSaveRecurringGroups(filtered);
  };

  const handleAddRecurringSubtask = (groupId: string, title: string, time?: string, remind10MinBefore?: boolean, intervalHours?: number) => {
    const updated = recurringGroups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          subtasks: [...g.subtasks, { id: crypto.randomUUID(), title, time, remind10MinBefore, intervalHours }]
        };
      }
      return g;
    });
    handleSaveRecurringGroups(updated);
  };

  const handleDeleteRecurringSubtask = (groupId: string, subtaskId: string) => {
    const updated = recurringGroups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          subtasks: g.subtasks.filter(st => st.id !== subtaskId)
        };
      }
      return g;
    });
    handleSaveRecurringGroups(updated);
  };

  const handleUpdateRecurringSubtask = (groupId: string, subtaskId: string, updatedFields: Partial<RecurringSubtask>) => {
    const updated = recurringGroups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          subtasks: g.subtasks.map(st => {
            if (st.id === subtaskId) {
              return {
                ...st,
                ...updatedFields
              };
            }
            return st;
          })
        };
      }
      return g;
    });
    handleSaveRecurringGroups(updated);
  };

  const handleDeleteTask = (id: string) => {
    const filtered = tasks.filter((t) => t.id !== id);
    handleSaveTasks(filtered);
  };

  const handleClearTasks = () => {
    handleSaveTasks([]);
  };

  const handleHeatmapCellClick = (dateStr: string) => {
    // If the clicked date is already selected, reset back to last 7 days!
    const todayStr = getLocalDateString(new Date());
    const sevenDaysAgoStr = getSevenDaysAgoString();
    
    if (historyStartDate === dateStr && historyEndDate === dateStr) {
      setHistoryStartDate(sevenDaysAgoStr);
      setHistoryEndDate(todayStr);
    } else {
      setHistoryStartDate(dateStr);
      setHistoryEndDate(dateStr);
    }
  };



  // Custom title bar buttons
  const handleMinimize = () => {
    console.log('[Renderer] Minimize button clicked!');
    if (window.electronAPI) {
      console.log('[Renderer] Exists window.electronAPI. Calling minimizeWindow()');
      window.electronAPI.minimizeWindow();
    } else {
      console.warn('[Renderer] window.electronAPI is undefined!');
    }
  };

  const handleClose = () => {
    console.log('[Renderer] Close button clicked!');
    if (window.electronAPI) {
      console.log('[Renderer] Calling closeWindow()');
      window.electronAPI.closeWindow();
    } else {
      console.warn('[Renderer] window.electronAPI is undefined!');
    }
  };

  // Streaks calculation inside App.tsx
  const calculateStreaks = (taskList: Task[]) => {
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    let totalCompleted = 0;

    const completedDates = new Set(
      taskList
        .filter(t => t.completedAt)
        .map(t => {
          const d = new Date(t.completedAt!);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        })
    );

    totalCompleted = taskList.filter(t => t.completedAt).length;

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

  const getVirtualTasks = (): Task[] => {
    const virtualTasks: Task[] = [];
    Object.entries(recurringCompletions).forEach(([dateKey, events]) => {
      if (!Array.isArray(events)) return;
      events.forEach((evt) => {
        const subtaskId = typeof evt === 'string' ? evt : evt.subtaskId;
        const timestamp = typeof evt === 'string' 
          ? new Date(dateKey + 'T12:00:00').toISOString() 
          : evt.timestamp;

        let groupTitle = '';
        let subtaskTitle = '';
        let subtaskTime = undefined;
        let intervalHours = undefined;
        for (const group of recurringGroups) {
          const st = group.subtasks.find(s => s.id === subtaskId);
          if (st) {
            groupTitle = group.title;
            subtaskTitle = st.title;
            subtaskTime = st.time;
            intervalHours = st.intervalHours;
            break;
          }
        }
        
        if (subtaskTitle) {
          const timeDisplay = new Date(timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            
          virtualTasks.push({
            id: `recurring-completed|${subtaskId}|${timestamp}|${dateKey}`,
            title: intervalHours 
              ? `${groupTitle}: ${subtaskTitle} (every ${intervalHours}h)`
              : `${groupTitle}: ${subtaskTitle}`,
            createdAt: timestamp,
            completedAt: timestamp,
            category: 'general',
            time: timeDisplay
          });
        }
      });
    });
    return virtualTasks;
  };

  const virtualTasks = getVirtualTasks();
  const allTasks = [...tasks, ...virtualTasks];

  const { currentStreak, maxStreak, totalCompleted } = calculateStreaks(allTasks);

  const urlParams = new URLSearchParams(window.location.search);
  const isBadgeMode = urlParams.get('mode') === 'badge';

  if (isBadgeMode) {
    return <BadgeWindow />;
  }

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
              {/* Leftmost Column: Recurring Tasks Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }}>
                <RecurringTasksPanel
                  groups={recurringGroups}
                  completions={recurringCompletions}
                  selectedDate={historyStartDate === historyEndDate ? historyStartDate : getLocalDateString(new Date())}
                  onToggleSubtask={handleToggleSubtask}
                  onAddGroup={handleAddRecurringGroup}
                  onDeleteGroup={handleDeleteRecurringGroup}
                  onAddSubtask={handleAddRecurringSubtask}
                  onDeleteSubtask={handleDeleteRecurringSubtask}
                  onUpdateSubtask={handleUpdateRecurringSubtask}
                />
              </div>

              {/* Middle Column: Heatmap & CompletedTasksPanel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, minHeight: 0, minWidth: 0 }}>
                <Heatmap tasks={allTasks} settings={settings} onCellClick={handleHeatmapCellClick} />
                <CompletedTasksPanel
                  tasks={allTasks}
                  onUpdateTask={handleUpdateTask}
                  startDate={historyStartDate}
                  endDate={historyEndDate}
                  onStartDateChange={setHistoryStartDate}
                  onEndDateChange={setHistoryEndDate}
                  showFilter={showHistoryFilter}
                  onShowFilterChange={setShowHistoryFilter}
                />
              </div>

              {/* Right Column: Task List Card */}
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }}>
                <TaskList
                  tasks={tasks}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  onAddTask={handleAddTask}
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
