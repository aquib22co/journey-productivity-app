import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Settings2, 
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RecurringGroup, RecurringCompletions, RecurringSubtask, RecurringCompletionEvent } from '../../shared/types';
import { ChecklistView } from './recurring/ChecklistView';
import { ManageModeView } from './recurring/ManageModeView';

interface RecurringTasksPanelProps {
  groups: RecurringGroup[];
  completions: RecurringCompletions;
  selectedDate: string; // YYYY-MM-DD
  onToggleSubtask: (groupId: string, subtaskId: string, date: string) => void;
  onAddGroup: (title: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onAddSubtask: (groupId: string, title: string, time?: string, remind10MinBefore?: boolean, intervalHours?: number) => void;
  onDeleteSubtask: (groupId: string, subtaskId: string) => void;
  onUpdateSubtask: (groupId: string, subtaskId: string, updatedFields: Partial<RecurringSubtask>) => void;
  onResetIntervalSubtask: (subtaskId: string, date: string) => void;
  onUpdateGroup: (groupId: string, title: string) => void;
}

export const RecurringTasksPanel: React.FC<RecurringTasksPanelProps> = ({
  groups,
  completions,
  selectedDate,
  onToggleSubtask,
  onAddGroup,
  onDeleteGroup,
  onAddSubtask,
  onDeleteSubtask,
  onUpdateSubtask,
  onResetIntervalSubtask,
  onUpdateGroup,
}) => {
  const [isManageMode, setIsManageMode] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getLatestCompletionEvent = (subtaskId: string, completionsData: RecurringCompletions): RecurringCompletionEvent | null => {
    let latestEvent: RecurringCompletionEvent | null = null;
    for (const dateKey of Object.keys(completionsData)) {
      const dayCompletions = completionsData[dateKey] || [];
      for (const evt of dayCompletions) {
        const completionEvt: RecurringCompletionEvent = typeof evt === 'string'
          ? { subtaskId: evt, timestamp: new Date(dateKey + 'T12:00:00').toISOString() }
          : evt;
        if (completionEvt.subtaskId === subtaskId) {
          if (!latestEvent || completionEvt.timestamp > latestEvent.timestamp) {
            latestEvent = completionEvt;
          }
        }
      }
    }
    return latestEvent;
  };

  const formatCountdown = (subtaskId: string, intervalHours: number) => {
    const latestEvent = getLatestCompletionEvent(subtaskId, completions);
    const lastTime = latestEvent ? new Date(latestEvent.timestamp) : new Date();
    const nextDue = new Date(lastTime.getTime() + intervalHours * 60 * 60 * 1000);
    const diffMs = nextDue.getTime() - Date.now();
    
    if (diffMs <= 0) {
      return '00:00:00';
    }
    
    const secs = Math.floor(diffMs / 1000) % 60;
    const mins = Math.floor(diffMs / (1000 * 60)) % 60;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  };

  const handleToggleIntervalSubtaskEnabled = (groupId: string, subtask: RecurringSubtask) => {
    const newEnabled = subtask.enabled !== false ? false : true;
    onUpdateSubtask(groupId, subtask.id, { enabled: newEnabled });
    if (newEnabled) {
      onResetIntervalSubtask(subtask.id, selectedDate);
    }
  };

  useEffect(() => {
    const todayStr = (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })();
    
    if (selectedDate !== todayStr) return;

    groups.forEach(group => {
      group.subtasks.forEach(subtask => {
        if (subtask.intervalHours && subtask.enabled !== false) {
          const latestEvent = getLatestCompletionEvent(subtask.id, completions);
          
          if (!latestEvent) {
            onResetIntervalSubtask(subtask.id, selectedDate);
            return;
          }

          const lastTime = new Date(latestEvent.timestamp);
          const nextDue = new Date(lastTime.getTime() + subtask.intervalHours * 60 * 60 * 1000);
          const diffMs = nextDue.getTime() - Date.now();

          if (diffMs <= 0) {
            onResetIntervalSubtask(subtask.id, selectedDate);

            // Desktop notification
            try {
              if (typeof window !== 'undefined' && 'Notification' in window) {
                if (Notification.permission === 'granted') {
                  new Notification(`${group.title}: ${subtask.title}`, {
                    body: `Time for your habit: ${subtask.title} (due every ${subtask.intervalHours}h)`,
                  });
                } else if (Notification.permission !== 'denied') {
                  Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                      new Notification(`${group.title}: ${subtask.title}`, {
                        body: `Time for your habit: ${subtask.title} (due every ${subtask.intervalHours}h)`,
                      });
                    }
                  });
                }
              }
            } catch (e) {
              console.error('Notification error:', e);
            }
          }
        }
      });
    });
  }, [tick, groups, completions, selectedDate]);

  const getLocalDateDisplay = (dateStr: string) => {
    const todayStr = (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })();

    if (dateStr === todayStr) {
      return 'Today';
    }

    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    }
    return dateStr;
  };

  const isSubtaskCompleted = (subtask: RecurringSubtask) => {
    if (subtask.intervalHours) {
      if (subtask.enabled === false) return false;
      const latestEvent = getLatestCompletionEvent(subtask.id, completions);
      if (!latestEvent) return false;
      const timeSince = Date.now() - new Date(latestEvent.timestamp).getTime();
      const intervalMs = subtask.intervalHours * 60 * 60 * 1000;
      return timeSince < intervalMs;
    }
    
    const dateCompletions = completions[selectedDate] || [];
    const events = dateCompletions.filter((evt: any) => {
      const evtId = typeof evt === 'string' ? evt : evt.subtaskId;
      return evtId === subtask.id;
    });
    return events.length > 0;
  };

  return (
    <div className="widget-card" style={{ flex: 1, height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div className="widget-card-header" style={{ marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} style={{ color: 'var(--accent-color)' }} />
          <span className="widget-card-title">
            {isManageMode ? 'Manage Recurring' : 'Daily Habits'}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsManageMode(!isManageMode)}
          style={{ 
            height: '28px',
            width: '28px',
            padding: 0,
            background: isManageMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            borderColor: isManageMode ? 'var(--success-color)' : 'rgba(255, 255, 255, 0.05)',
            color: isManageMode ? 'var(--success-color)' : 'var(--text-muted)'
          }}
          title={isManageMode ? 'Back to checklist' : 'Configure recurring groups'}
        >
          {isManageMode ? <Check size={14} /> : <Settings2 size={14} />}
        </Button>
      </div>

      {/* Conditional View Rendering */}
      {!isManageMode ? (
        <ChecklistView
          groups={groups}
          selectedDate={selectedDate}
          getLocalDateDisplay={getLocalDateDisplay}
          isSubtaskCompleted={isSubtaskCompleted}
          onToggleSubtask={onToggleSubtask}
          onToggleIntervalSubtaskEnabled={handleToggleIntervalSubtaskEnabled}
          formatCountdown={formatCountdown}
        />
      ) : (
        <ManageModeView
          groups={groups}
          onAddGroup={onAddGroup}
          onDeleteGroup={onDeleteGroup}
          onUpdateGroup={onUpdateGroup}
          onAddSubtask={onAddSubtask}
          onDeleteSubtask={onDeleteSubtask}
          onUpdateSubtask={onUpdateSubtask}
        />
      )}
    </div>
  );
};
