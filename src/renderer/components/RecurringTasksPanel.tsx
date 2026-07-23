import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Settings2, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  Sparkles,
  Calendar,
  AlertCircle,
  Edit3,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RecurringGroup, RecurringCompletions, RecurringSubtask } from '../../shared/types';

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
}) => {
  const [isManageMode, setIsManageMode] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  
  // Subtask Creator Form States
  const [newSubtaskNames, setNewSubtaskNames] = useState<Record<string, string>>({});
  const [subtaskMode, setSubtaskMode] = useState<Record<string, 'time' | 'interval'>>({});
  const [newSubtaskHour, setNewSubtaskHour] = useState<Record<string, string>>({});
  const [newSubtaskMin, setNewSubtaskMin] = useState<Record<string, string>>({});
  const [newSubtaskAmpm, setNewSubtaskAmpm] = useState<Record<string, 'AM' | 'PM'>>({});
  const [newSubtaskRemindBefore, setNewSubtaskRemindBefore] = useState<Record<string, boolean>>({});
  const [newSubtaskInterval, setNewSubtaskInterval] = useState<Record<string, string>>({});

  // Subtask Editor Inline States
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editSubtaskTitle, setEditSubtaskTitle] = useState('');
  const [editSubtaskMode, setEditSubtaskMode] = useState<'time' | 'interval'>('time');
  const [editSubtaskHour, setEditSubtaskHour] = useState('');
  const [editSubtaskMin, setEditSubtaskMin] = useState('00');
  const [editSubtaskAmpm, setEditSubtaskAmpm] = useState<'AM' | 'PM'>('AM');
  const [editSubtaskRemindBefore, setEditSubtaskRemindBefore] = useState(true);
  const [editSubtaskInterval, setEditSubtaskInterval] = useState('2');
  
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    // Expand all groups by default
    return {};
  });

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

  const isGroupExpanded = (groupId: string) => {
    return expandedGroups[groupId] !== false; // default to true
  };

  const toggleExpand = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !isGroupExpanded(groupId)
    }));
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    onAddGroup(newGroupName.trim());
    setNewGroupName('');
  };

  const handleAddSubtaskSubmit = (groupId: string, e: React.FormEvent) => {
    e.preventDefault();
    const title = newSubtaskNames[groupId] || '';
    if (!title.trim()) return;

    const mode = subtaskMode[groupId] || 'time';

    if (mode === 'interval') {
      const intervalVal = parseInt(newSubtaskInterval[groupId] || '2', 10);
      onAddSubtask(groupId, title.trim(), undefined, undefined, intervalVal);
    } else {
      const hour = newSubtaskHour[groupId] || '';
      let formattedTime: string | undefined = undefined;
      if (hour) {
        const min = newSubtaskMin[groupId] || '00';
        const ampm = newSubtaskAmpm[groupId] || 'AM';
        formattedTime = `${hour.padStart(2, '0')}:${min.padStart(2, '0')} ${ampm}`;
      }
      const remind10MinBefore = formattedTime ? (newSubtaskRemindBefore[groupId] !== false) : undefined;
      onAddSubtask(groupId, title.trim(), formattedTime, remind10MinBefore);
    }

    // Clear states for this group
    setNewSubtaskNames(prev => ({ ...prev, [groupId]: '' }));
    setNewSubtaskHour(prev => ({ ...prev, [groupId]: '' }));
    setNewSubtaskMin(prev => ({ ...prev, [groupId]: '' }));
    setNewSubtaskAmpm(prev => ({ ...prev, [groupId]: 'AM' }));
    setNewSubtaskRemindBefore(prev => ({ ...prev, [groupId]: true }));
    setNewSubtaskInterval(prev => ({ ...prev, [groupId]: '2' }));
  };

  const handleSubtaskNameChange = (groupId: string, val: string) => {
    setNewSubtaskNames(prev => ({ ...prev, [groupId]: val }));
  };

  const handleSubtaskModeChange = (groupId: string, mode: 'time' | 'interval') => {
    setSubtaskMode(prev => ({ ...prev, [groupId]: mode }));
  };

  const handleSubtaskHourChange = (groupId: string, val: string) => {
    setNewSubtaskHour(prev => ({ ...prev, [groupId]: val }));
    if (val && !newSubtaskMin[groupId]) {
      setNewSubtaskMin(prev => ({ ...prev, [groupId]: '00' }));
    }
  };

  const handleSubtaskMinChange = (groupId: string, val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    if (cleanVal === '') {
      setNewSubtaskMin(prev => ({ ...prev, [groupId]: '' }));
      return;
    }
    const num = parseInt(cleanVal);
    if (num >= 0 && num <= 59) {
      setNewSubtaskMin(prev => ({ ...prev, [groupId]: cleanVal.slice(0, 2) }));
    }
  };

  const handleSubtaskMinBlur = (groupId: string) => {
    const minVal = newSubtaskMin[groupId];
    if (minVal === '' || minVal === undefined) {
      setNewSubtaskMin(prev => ({ ...prev, [groupId]: '00' }));
    } else {
      setNewSubtaskMin(prev => ({ ...prev, [groupId]: minVal.padStart(2, '0') }));
    }
  };

  const handleSubtaskAmpmChange = (groupId: string, val: 'AM' | 'PM') => {
    setNewSubtaskAmpm(prev => ({ ...prev, [groupId]: val }));
  };

  const handleSubtaskRemindToggle = (groupId: string) => {
    setNewSubtaskRemindBefore(prev => ({
      ...prev,
      [groupId]: !(prev[groupId] !== false)
    }));
  };

  const handleSubtaskIntervalChange = (groupId: string, val: string) => {
    setNewSubtaskInterval(prev => ({ ...prev, [groupId]: val }));
  };

  // Editor specific handlers
  const handleStartEdit = (st: RecurringSubtask) => {
    setEditingSubtaskId(st.id);
    setEditSubtaskTitle(st.title);
    if (st.intervalHours) {
      setEditSubtaskMode('interval');
      setEditSubtaskInterval(String(st.intervalHours));
      setEditSubtaskHour('');
      setEditSubtaskMin('00');
      setEditSubtaskAmpm('AM');
      setEditSubtaskRemindBefore(true);
    } else {
      setEditSubtaskMode('time');
      setEditSubtaskInterval('2');
      if (st.time) {
        const timeMatch = st.time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (timeMatch) {
          setEditSubtaskHour(parseInt(timeMatch[1], 10).toString());
          setEditSubtaskMin(timeMatch[2]);
          setEditSubtaskAmpm(timeMatch[3].toUpperCase() as 'AM' | 'PM');
        } else {
          setEditSubtaskHour('');
          setEditSubtaskMin('00');
          setEditSubtaskAmpm('AM');
        }
      } else {
        setEditSubtaskHour('');
        setEditSubtaskMin('00');
        setEditSubtaskAmpm('AM');
      }
      setEditSubtaskRemindBefore(st.remind10MinBefore !== false);
    }
  };

  const handleSaveEdit = (groupId: string, subtaskId: string) => {
    if (!editSubtaskTitle.trim()) return;

    let time: string | undefined = undefined;
    let remind10MinBefore: boolean | undefined = undefined;
    let intervalHours: number | undefined = undefined;

    if (editSubtaskMode === 'interval') {
      intervalHours = parseInt(editSubtaskInterval, 10);
    } else {
      if (editSubtaskHour) {
        time = `${editSubtaskHour.padStart(2, '0')}:${editSubtaskMin.padStart(2, '0')} ${editSubtaskAmpm}`;
        remind10MinBefore = editSubtaskRemindBefore;
      }
    }

    onUpdateSubtask(groupId, subtaskId, {
      title: editSubtaskTitle.trim(),
      time,
      remind10MinBefore,
      intervalHours
    });

    setEditingSubtaskId(null);
  };

  const handleCancelEdit = () => {
    setEditingSubtaskId(null);
  };

  // Helper to determine check/uncheck status dynamically
  const isSubtaskCompleted = (subtask: any) => {
    const dateCompletions = completions[selectedDate] || [];
    
    const events = dateCompletions.filter((evt: any) => {
      const evtId = typeof evt === 'string' ? evt : evt.subtaskId;
      return evtId === subtask.id;
    });
    
    if (events.length === 0) return false;
    
    if (subtask.intervalHours) {
      const todayStr = (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })();
      
      if (selectedDate === todayStr) {
        const lastEvent = events
          .map((evt: any) => typeof evt === 'string' ? { subtaskId: evt, timestamp: new Date(selectedDate + 'T12:00:00').toISOString() } : evt)
          .sort((a: any, b: any) => b.timestamp.localeCompare(a.timestamp))[0];
          
        if (lastEvent) {
          const timeSince = Date.now() - new Date(lastEvent.timestamp).getTime();
          const intervalMs = subtask.intervalHours * 60 * 60 * 1000;
          return timeSince < intervalMs;
        }
      } else {
        return true;
      }
    }
    
    return true;
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

      {/* Checklist View */}
      {!isManageMode ? (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {/* Sub-Header: Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '2px 0 12px 0' }}>
            <Calendar size={14} style={{ color: 'var(--accent-color)' }} />
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--accent-color)' }}>
              {getLocalDateDisplay(selectedDate)}
            </span>
          </div>

          {/* Group Checklist Content */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '2px' }} className="no-drag">
            {groups.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 10px', color: 'var(--text-dim)', gap: '6px', textAlign: 'center' }}>
                <AlertCircle size={24} style={{ opacity: 0.3 }} />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>No recurring tasks yet</span>
                <span style={{ fontSize: '10px', maxWidth: '200px' }}>Click the gear icon in the header to set up groups like Prayers or Workout!</span>
              </div>
            ) : (
              groups.map(group => {
                const totalSubtasks = group.subtasks.length;
                const completedCount = group.subtasks.filter(st => isSubtaskCompleted(st)).length;
                const percent = totalSubtasks > 0 ? (completedCount / totalSubtasks) * 100 : 0;
                const expanded = isGroupExpanded(group.id);

                return (
                  <div 
                    key={group.id}
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Header Row: Title & Expand Toggle */}
                    <div 
                      onClick={() => toggleExpand(group.id)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {expanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                        <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {group.title}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 500, color: percent === 100 ? 'var(--success-color)' : 'var(--text-muted)' }}>
                        {completedCount}/{totalSubtasks}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {totalSubtasks > 0 && (
                      <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${percent}%`,
                            height: '100%',
                            background: percent === 100 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #0084ff, #00c6ff)',
                            borderRadius: '3px',
                            transition: 'width 0.3s ease-in-out'
                          }}
                        />
                      </div>
                    )}

                    {/* Expandable Subtask List */}
                    {expanded && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.02)', paddingTop: '6px' }}>
                        {totalSubtasks === 0 ? (
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic', paddingLeft: '18px' }}>
                            No subtasks. Tap gear to add.
                          </span>
                        ) : (
                          group.subtasks.map(subtask => {
                            const isCompleted = isSubtaskCompleted(subtask);
                            return (
                              <div
                                key={subtask.id}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0' }}
                              >
                                <div
                                  className="task-checkbox-container"
                                  onClick={() => onToggleSubtask(group.id, subtask.id, selectedDate)}
                                >
                                  <input
                                    type="checkbox"
                                    className="task-checkbox"
                                    checked={isCompleted}
                                    onChange={() => { }} // handled via container click
                                    style={{ width: '18px', height: '18px' }}
                                  />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, minWidth: 0, gap: '4px' }}>
                                  <span
                                    style={{
                                      fontSize: '12.5px',
                                      color: isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
                                      textDecoration: isCompleted ? 'line-through' : 'none',
                                      transition: 'color 0.2s ease, text-decoration 0.2s ease',
                                      textOverflow: 'ellipsis',
                                      overflow: 'hidden',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {subtask.title}
                                  </span>
                                  
                                  {subtask.intervalHours && (
                                    <span
                                      style={{
                                        fontSize: '9.5px',
                                        color: isCompleted ? 'rgba(255,255,255,0.15)' : 'var(--text-dim)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '2px',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        padding: '1px 5px',
                                        borderRadius: '4px',
                                        border: '1px solid rgba(255, 255, 255, 0.04)',
                                        flexShrink: 0
                                      }}
                                    >
                                      🕒 Every {subtask.intervalHours}h
                                    </span>
                                  )}

                                  {!subtask.intervalHours && subtask.time && (
                                    <span
                                      style={{
                                        fontSize: '9.5px',
                                        color: isCompleted ? 'rgba(255,255,255,0.15)' : 'var(--text-dim)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '2px',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        padding: '1px 5px',
                                        borderRadius: '4px',
                                        border: '1px solid rgba(255, 255, 255, 0.04)',
                                        flexShrink: 0
                                      }}
                                      title={subtask.remind10MinBefore ? 'Reminds 10 min before' : 'Reminds at exact time'}
                                    >
                                      🕒 {subtask.time}
                                      {subtask.remind10MinBefore && <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>• 10m</span>}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Manage Mode View */
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: '14px' }} className="no-drag">
          
          {/* Add Group Form */}
          <form onSubmit={handleCreateGroup} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="New group (e.g. Workout)..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="input-field"
              style={{ padding: '6px 10px', fontSize: '12.5px', height: '32px' }}
            />
            <Button
              type="submit"
              size="sm"
              style={{ background: 'var(--accent-color)', height: '32px', padding: '0 12px' }}
            >
              <Plus size={14} />
            </Button>
          </form>

          {/* Manage Scrollable List */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0px', paddingRight: '2px' }}>
            {groups.length === 0 ? (
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', textAlign: 'center', marginTop: '20px' }}>
                Create a group above to start configuring!
              </span>
            ) : (
              groups.map((group, index) => (
                <div
                  key={group.id}
                  style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    paddingBottom: '16px',
                    borderBottom: index === groups.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                    marginBottom: index === groups.length - 1 ? '0px' : '16px'
                  }}
                >
                  {/* Group Title Row with Delete Group Button */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', flex: 1 }}>
                      {group.title}
                    </span>
                    <button
                      onClick={() => onDeleteGroup(group.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', opacity: 0.7 }}
                      title="Delete Group"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Subtask Manager List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.02)', paddingTop: '6px' }}>
                    {group.subtasks.map(st => {
                      const isEditing = editingSubtaskId === st.id;

                      if (isEditing) {
                        return (
                          <div 
                            key={st.id}
                            style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '6px', 
                              padding: '6px', 
                              background: 'rgba(255,255,255,0.02)', 
                              border: '1px solid rgba(255,255,255,0.06)', 
                              borderRadius: '6px',
                              marginTop: '4px',
                              marginBottom: '4px'
                            }}
                          >
                            {/* Edit Name Row */}
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <input 
                                type="text"
                                placeholder="Edit name..."
                                value={editSubtaskTitle}
                                onChange={(e) => setEditSubtaskTitle(e.target.value)}
                                className="input-field"
                                style={{ padding: '4px 8px', fontSize: '11.5px', height: '26px', background: 'rgba(0,0,0,0.15)', flex: 1 }}
                              />
                              <Button 
                                onClick={() => handleSaveEdit(group.id, st.id)}
                                size="sm"
                                style={{ background: 'var(--success-color)', height: '26px', width: '26px', padding: 0 }}
                                title="Save changes"
                              >
                                <Check size={11} />
                              </Button>
                              <Button 
                                onClick={handleCancelEdit}
                                variant="ghost"
                                size="sm"
                                style={{ height: '26px', width: '26px', padding: 0, color: 'var(--text-muted)' }}
                                title="Cancel editing"
                              >
                                <X size={11} />
                              </Button>
                            </div>

                            {/* Edit Mode Toggle */}
                            <div style={{ display: 'flex', gap: '8px', fontSize: '9.5px', color: 'var(--text-dim)', alignItems: 'center' }}>
                              <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reminder:</span>
                              <button 
                                type="button" 
                                onClick={() => setEditSubtaskMode('time')}
                                style={{
                                  background: editSubtaskMode === 'time' ? 'rgba(255,255,255,0.05)' : 'transparent',
                                  border: '1px solid ' + (editSubtaskMode === 'time' ? 'rgba(255,255,255,0.1)' : 'transparent'),
                                  color: editSubtaskMode === 'time' ? 'var(--text-main)' : 'var(--text-dim)',
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  cursor: 'pointer'
                                }}
                              >
                                Specific Time
                              </button>
                              <button 
                                type="button" 
                                onClick={() => setEditSubtaskMode('interval')}
                                style={{
                                  background: editSubtaskMode === 'interval' ? 'rgba(255,255,255,0.05)' : 'transparent',
                                  border: '1px solid ' + (editSubtaskMode === 'interval' ? 'rgba(255,255,255,0.1)' : 'transparent'),
                                  color: editSubtaskMode === 'interval' ? 'var(--text-main)' : 'var(--text-dim)',
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  cursor: 'pointer'
                                }}
                              >
                                Interval Timer
                              </button>
                            </div>

                            {/* Edit Specific Config Row */}
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                              {editSubtaskMode === 'time' && (
                                <>
                                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '26px' }}>
                                    <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Time:</span>
                                    <select
                                      className="input-field"
                                      style={{ padding: '2px 4px', fontSize: '11px', height: '100%', width: '46px', background: 'rgba(7, 10, 17, 0.95)' }}
                                      value={editSubtaskHour}
                                      onChange={(e) => {
                                        setEditSubtaskHour(e.target.value);
                                        if (e.target.value && !editSubtaskMin) setEditSubtaskMin('00');
                                      }}
                                    >
                                      <option value="">--</option>
                                      {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(h => (
                                        <option key={h} value={h}>{h}</option>
                                      ))}
                                    </select>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>:</span>
                                    <input
                                      type="text"
                                      className="input-field"
                                      style={{ padding: '2px 4px', fontSize: '11px', height: '100%', width: '36px', textAlign: 'center', background: 'rgba(7, 10, 17, 0.95)' }}
                                      placeholder="00"
                                      maxLength={2}
                                      value={editSubtaskMin}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val === '') { setEditSubtaskMin(''); return; }
                                        const num = parseInt(val);
                                        if (num >= 0 && num <= 59) setEditSubtaskMin(val.slice(0, 2));
                                      }}
                                      onBlur={() => {
                                        if (editSubtaskMin === '') setEditSubtaskMin('00');
                                        else setEditSubtaskMin(editSubtaskMin.padStart(2, '0'));
                                      }}
                                      disabled={!editSubtaskHour}
                                    />
                                    <div style={{ 
                                      display: 'flex', 
                                      borderRadius: '4px', 
                                      overflow: 'hidden', 
                                      border: '1px solid rgba(255, 255, 255, 0.08)', 
                                      background: 'rgba(255, 255, 255, 0.02)',
                                      height: '100%',
                                      opacity: editSubtaskHour ? 1 : 0.5,
                                      pointerEvents: editSubtaskHour ? 'auto' : 'none'
                                    }}>
                                      <button
                                        type="button"
                                        onClick={() => setEditSubtaskAmpm('AM')}
                                        style={{
                                          padding: '0 6px',
                                          fontSize: '9.5px',
                                          height: '100%',
                                          border: 'none',
                                          cursor: 'pointer',
                                          background: editSubtaskAmpm === 'AM' ? 'var(--accent-color)' : 'transparent',
                                          color: editSubtaskAmpm === 'AM' ? '#ffffff' : 'var(--text-muted)',
                                          fontWeight: editSubtaskAmpm === 'AM' ? 'bold' : 'normal',
                                          transition: 'all 0.15s ease'
                                        }}
                                      >
                                        AM
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditSubtaskAmpm('PM')}
                                        style={{
                                          padding: '0 6px',
                                          fontSize: '9.5px',
                                          height: '100%',
                                          border: 'none',
                                          cursor: 'pointer',
                                          background: editSubtaskAmpm === 'PM' ? 'var(--accent-color)' : 'transparent',
                                          color: editSubtaskAmpm === 'PM' ? '#ffffff' : 'var(--text-muted)',
                                          fontWeight: editSubtaskAmpm === 'PM' ? 'bold' : 'normal',
                                          transition: 'all 0.15s ease'
                                        }}
                                      >
                                        PM
                                      </button>
                                    </div>
                                  </div>

                                  {editSubtaskHour && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Remind:</span>
                                      <label className="switch" style={{ width: '32px', height: '18px' }}>
                                        <input 
                                          type="checkbox" 
                                          checked={editSubtaskRemindBefore !== false} 
                                          onChange={() => setEditSubtaskRemindBefore(!editSubtaskRemindBefore)} 
                                        />
                                        <span className="slider"></span>
                                      </label>
                                    </div>
                                  )}
                                </>
                              )}

                              {editSubtaskMode === 'interval' && (
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', height: '26px' }}>
                                  <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Repeat Every:</span>
                                  <select
                                    className="input-field"
                                    style={{ padding: '2px 4px', fontSize: '11px', height: '100%', width: '90px', background: 'rgba(7, 10, 17, 0.95)' }}
                                    value={editSubtaskInterval}
                                    onChange={(e) => setEditSubtaskInterval(e.target.value)}
                                  >
                                    <option value="1">1 hour</option>
                                    <option value="2">2 hours</option>
                                    <option value="3">3 hours</option>
                                    <option value="4">4 hours</option>
                                    <option value="6">6 hours</option>
                                    <option value="8">8 hours</option>
                                    <option value="12">12 hours</option>
                                  </select>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={st.id}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', minWidth: 0, flex: 1 }}>
                            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              • {st.title}
                            </span>
                            {st.intervalHours && (
                              <span style={{ fontSize: '9px', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.18)', padding: '1px 4px', borderRadius: '3px', flexShrink: 0 }}>
                                🕒 Every {st.intervalHours}h
                              </span>
                            )}
                            {!st.intervalHours && st.time && (
                              <span style={{ fontSize: '9px', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.18)', padding: '1px 4px', borderRadius: '3px', flexShrink: 0 }}>
                                🕒 {st.time} {st.remind10MinBefore ? '(10m before)' : '(exact)'}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => handleStartEdit(st)}
                              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', opacity: 0.7 }}
                              title="Edit Subtask"
                            >
                              <Edit3 size={11} className="hover:text-blue-400 transition-colors" />
                            </button>
                            <button
                              onClick={() => onDeleteSubtask(group.id, st.id)}
                              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                              title="Delete Subtask"
                            >
                              <Trash2 size={11} className="hover:text-red-400 transition-colors" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add Subtask Form */}
                    <form
                      onSubmit={(e) => handleAddSubtaskSubmit(group.id, e)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        marginTop: '8px',
                        padding: '8px',
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px dashed rgba(255,255,255,0.05)',
                        borderRadius: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="text"
                          placeholder="Subtask name..."
                          value={newSubtaskNames[group.id] || ''}
                          onChange={(e) => handleSubtaskNameChange(group.id, e.target.value)}
                          className="input-field"
                          style={{ padding: '4px 8px', fontSize: '11.5px', height: '26px', background: 'rgba(0,0,0,0.15)', flex: 1 }}
                        />
                        <Button
                          type="submit"
                          size="sm"
                          style={{ background: 'var(--accent-color)', height: '26px', width: '26px', padding: 0 }}
                        >
                          <Plus size={11} />
                        </Button>
                      </div>
                      
                      {/* Subtask Mode Toggle */}
                      <div style={{ display: 'flex', gap: '8px', fontSize: '9.5px', color: 'var(--text-dim)', alignItems: 'center' }}>
                        <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reminder:</span>
                        <button
                          type="button"
                          onClick={() => handleSubtaskModeChange(group.id, 'time')}
                          style={{
                            background: (subtaskMode[group.id] || 'time') === 'time' ? 'rgba(255,255,255,0.05)' : 'transparent',
                            border: '1px solid ' + ((subtaskMode[group.id] || 'time') === 'time' ? 'rgba(255,255,255,0.1)' : 'transparent'),
                            color: (subtaskMode[group.id] || 'time') === 'time' ? 'var(--text-main)' : 'var(--text-dim)',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          Specific Time
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSubtaskModeChange(group.id, 'interval')}
                          style={{
                            background: (subtaskMode[group.id] || 'time') === 'interval' ? 'rgba(255,255,255,0.05)' : 'transparent',
                            border: '1px solid ' + ((subtaskMode[group.id] || 'time') === 'interval' ? 'rgba(255,255,255,0.1)' : 'transparent'),
                            color: (subtaskMode[group.id] || 'time') === 'interval' ? 'var(--text-main)' : 'var(--text-dim)',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          Interval Timer
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        {/* 1. Time Mode Controls */}
                        {(subtaskMode[group.id] || 'time') === 'time' && (
                          <>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '26px' }}>
                              <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Time:</span>
                              <select
                                className="input-field"
                                style={{ padding: '2px 4px', fontSize: '11px', height: '100%', width: '46px', background: 'rgba(7, 10, 17, 0.95)' }}
                                value={newSubtaskHour[group.id] || ''}
                                onChange={(e) => handleSubtaskHourChange(group.id, e.target.value)}
                              >
                                <option value="">--</option>
                                {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(h => (
                                  <option key={h} value={h}>{h}</option>
                                ))}
                              </select>
                              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>:</span>
                              <input
                                type="text"
                                className="input-field"
                                style={{ padding: '2px 4px', fontSize: '11px', height: '100%', width: '36px', textAlign: 'center', background: 'rgba(7, 10, 17, 0.95)' }}
                                placeholder="00"
                                maxLength={2}
                                value={newSubtaskMin[group.id] || ''}
                                onChange={(e) => handleSubtaskMinChange(group.id, e.target.value)}
                                onBlur={() => handleSubtaskMinBlur(group.id)}
                                disabled={!newSubtaskHour[group.id]}
                              />
                              <div style={{
                                display: 'flex',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                background: 'rgba(255, 255, 255, 0.02)',
                                height: '100%',
                                opacity: newSubtaskHour[group.id] ? 1 : 0.5,
                                pointerEvents: newSubtaskHour[group.id] ? 'auto' : 'none'
                              }}>
                                <button
                                  type="button"
                                  onClick={() => handleSubtaskAmpmChange(group.id, 'AM')}
                                  style={{
                                    padding: '0 6px',
                                    fontSize: '9.5px',
                                    height: '100%',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: (newSubtaskAmpm[group.id] || 'AM') === 'AM' ? 'var(--accent-color)' : 'transparent',
                                    color: (newSubtaskAmpm[group.id] || 'AM') === 'AM' ? '#ffffff' : 'var(--text-muted)',
                                    fontWeight: (newSubtaskAmpm[group.id] || 'AM') === 'AM' ? 'bold' : 'normal',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  AM
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSubtaskAmpmChange(group.id, 'PM')}
                                  style={{
                                    padding: '0 6px',
                                    fontSize: '9.5px',
                                    height: '100%',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: (newSubtaskAmpm[group.id] || 'AM') === 'PM' ? 'var(--accent-color)' : 'transparent',
                                    color: (newSubtaskAmpm[group.id] || 'AM') === 'PM' ? '#ffffff' : 'var(--text-muted)',
                                    fontWeight: (newSubtaskAmpm[group.id] || 'AM') === 'PM' ? 'bold' : 'normal',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  PM
                                </button>
                              </div>
                            </div>

                            {/* Remind 10 min toggle switch */}
                            {newSubtaskHour[group.id] && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Remind 10m before:</span>
                                <label className="switch" style={{ width: '32px', height: '18px' }}>
                                  <input
                                    type="checkbox"
                                    checked={newSubtaskRemindBefore[group.id] !== false}
                                    onChange={() => handleSubtaskRemindToggle(group.id)}
                                  />
                                  <span className="slider"></span>
                                </label>
                              </div>
                            )}
                          </>
                        )}

                        {/* 2. Interval Mode Controls */}
                        {subtaskMode[group.id] === 'interval' && (
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', height: '26px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Repeat Every:</span>
                            <select
                              className="input-field"
                              style={{ padding: '2px 4px', fontSize: '11px', height: '100%', width: '90px', background: 'rgba(7, 10, 17, 0.95)' }}
                              value={newSubtaskInterval[group.id] || '2'}
                              onChange={(e) => handleSubtaskIntervalChange(group.id, e.target.value)}
                            >
                              <option value="1">1 hour</option>
                              <option value="2">2 hours</option>
                              <option value="3">3 hours</option>
                              <option value="4">4 hours</option>
                              <option value="6">6 hours</option>
                              <option value="8">8 hours</option>
                              <option value="12">12 hours</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
