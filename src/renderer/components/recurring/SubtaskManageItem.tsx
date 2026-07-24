import React, { useState } from 'react';
import { Check, X, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RecurringSubtask } from '../../../shared/types';

interface SubtaskManageItemProps {
  groupId: string;
  subtask: RecurringSubtask;
  onDeleteSubtask: (groupId: string, subtaskId: string) => void;
  onUpdateSubtask: (groupId: string, subtaskId: string, updatedFields: Partial<RecurringSubtask>) => void;
}

export const SubtaskManageItem: React.FC<SubtaskManageItemProps> = ({
  groupId,
  subtask,
  onDeleteSubtask,
  onUpdateSubtask,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editMode, setEditMode] = useState<'time' | 'interval'>('time');
  const [editHour, setEditHour] = useState('');
  const [editMin, setEditMin] = useState('00');
  const [editAmpm, setEditAmpm] = useState<'AM' | 'PM'>('AM');
  const [editRemindBefore, setEditRemindBefore] = useState(true);
  const [editInterval, setEditInterval] = useState('2');

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditTitle(subtask.title);
    if (subtask.intervalHours) {
      setEditMode('interval');
      setEditInterval(String(subtask.intervalHours));
      setEditHour('');
      setEditMin('00');
      setEditAmpm('AM');
      setEditRemindBefore(true);
    } else {
      setEditMode('time');
      setEditInterval('2');
      if (subtask.time) {
        const timeMatch = subtask.time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (timeMatch) {
          setEditHour(parseInt(timeMatch[1], 10).toString());
          setEditMin(timeMatch[2]);
          setEditAmpm(timeMatch[3].toUpperCase() as 'AM' | 'PM');
        } else {
          setEditHour('');
          setEditMin('00');
          setEditAmpm('AM');
        }
      } else {
        setEditHour('');
        setEditMin('00');
        setEditAmpm('AM');
      }
      setEditRemindBefore(subtask.remind10MinBefore !== false);
    }
  };

  const handleSave = () => {
    if (!editTitle.trim()) return;

    let time: string | undefined = undefined;
    let remind10MinBefore: boolean | undefined = undefined;
    let intervalHours: number | undefined = undefined;

    if (editMode === 'interval') {
      intervalHours = parseInt(editInterval, 10);
    } else {
      if (editHour) {
        time = `${editHour.padStart(2, '0')}:${editMin.padStart(2, '0')} ${editAmpm}`;
        remind10MinBefore = editRemindBefore;
      }
    }

    onUpdateSubtask(groupId, subtask.id, {
      title: editTitle.trim(),
      time,
      remind10MinBefore,
      intervalHours
    });

    setIsEditing(false);
  };

  const handleMinChange = (val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    if (cleanVal === '') {
      setEditMin('');
      return;
    }
    const num = parseInt(cleanVal);
    if (num >= 0 && num <= 59) {
      setEditMin(cleanVal.slice(0, 2));
    }
  };

  const handleMinBlur = () => {
    if (editMin === '') setEditMin('00');
    else setEditMin(editMin.padStart(2, '0'));
  };

  if (isEditing) {
    return (
      <div 
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
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="input-field"
            style={{ padding: '4px 8px', fontSize: '11.5px', height: '26px', background: 'rgba(0,0,0,0.15)', flex: 1 }}
          />
          <Button 
            onClick={handleSave}
            size="sm"
            style={{ background: 'var(--success-color)', height: '26px', width: '26px', padding: 0 }}
            title="Save changes"
          >
            <Check size={11} />
          </Button>
          <Button 
            onClick={() => setIsEditing(false)}
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
            onClick={() => setEditMode('time')}
            style={{
              background: editMode === 'time' ? 'rgba(255,255,255,0.05)' : 'transparent',
              border: '1px solid ' + (editMode === 'time' ? 'rgba(255,255,255,0.1)' : 'transparent'),
              color: editMode === 'time' ? 'var(--text-main)' : 'var(--text-dim)',
              padding: '1px 5px',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Specific Time
          </button>
          <button 
            type="button" 
            onClick={() => setEditMode('interval')}
            style={{
              background: editMode === 'interval' ? 'rgba(255,255,255,0.05)' : 'transparent',
              border: '1px solid ' + (editMode === 'interval' ? 'rgba(255,255,255,0.1)' : 'transparent'),
              color: editMode === 'interval' ? 'var(--text-main)' : 'var(--text-dim)',
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
          {editMode === 'time' && (
            <>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '26px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Time:</span>
                <select
                  className="input-field"
                  style={{ padding: '2px 4px', fontSize: '11px', height: '100%', width: '46px', background: 'rgba(7, 10, 17, 0.95)' }}
                  value={editHour}
                  onChange={(e) => {
                    setEditHour(e.target.value);
                    if (e.target.value && !editMin) setEditMin('00');
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
                  value={editMin}
                  onChange={(e) => handleMinChange(e.target.value)}
                  onBlur={handleMinBlur}
                  disabled={!editHour}
                />
                <div style={{ 
                  display: 'flex', 
                  borderRadius: '4px', 
                  overflow: 'hidden', 
                  border: '1px solid rgba(255, 255, 255, 0.08)', 
                  background: 'rgba(255, 255, 255, 0.02)',
                  height: '100%',
                  opacity: editHour ? 1 : 0.5,
                  pointerEvents: editHour ? 'auto' : 'none'
                }}>
                  <button
                    type="button"
                    onClick={() => setEditAmpm('AM')}
                    style={{
                      padding: '0 6px',
                      fontSize: '9.5px',
                      height: '100%',
                      border: 'none',
                      cursor: 'pointer',
                      background: editAmpm === 'AM' ? 'var(--accent-color)' : 'transparent',
                      color: editAmpm === 'AM' ? '#ffffff' : 'var(--text-muted)',
                      fontWeight: editAmpm === 'AM' ? 'bold' : 'normal',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditAmpm('PM')}
                    style={{
                      padding: '0 6px',
                      fontSize: '9.5px',
                      height: '100%',
                      border: 'none',
                      cursor: 'pointer',
                      background: editAmpm === 'PM' ? 'var(--accent-color)' : 'transparent',
                      color: editAmpm === 'PM' ? '#ffffff' : 'var(--text-muted)',
                      fontWeight: editAmpm === 'PM' ? 'bold' : 'normal',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    PM
                  </button>
                </div>
              </div>

              {editHour && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Remind:</span>
                  <label className="switch" style={{ width: '32px', height: '18px' }}>
                    <input 
                      type="checkbox" 
                      checked={editRemindBefore !== false} 
                      onChange={() => setEditRemindBefore(!editRemindBefore)} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              )}
            </>
          )}

          {editMode === 'interval' && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', height: '26px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Repeat Every:</span>
              <select
                className="input-field"
                style={{ padding: '2px 4px', fontSize: '11px', height: '100%', width: '90px', background: 'rgba(7, 10, 17, 0.95)' }}
                value={editInterval}
                onChange={(e) => setEditInterval(e.target.value)}
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
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          • {subtask.title}
        </span>
        {subtask.intervalHours && (
          <span style={{ fontSize: '9px', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.18)', padding: '1px 4px', borderRadius: '3px', flexShrink: 0 }}>
            Every {subtask.intervalHours}h
          </span>
        )}
        {!subtask.intervalHours && subtask.time && (
          <span style={{ fontSize: '9px', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.18)', padding: '1px 4px', borderRadius: '3px', flexShrink: 0 }}>
            {subtask.time} {subtask.remind10MinBefore ? '(10m before)' : '(exact)'}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={handleStartEdit}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', opacity: 0.7 }}
          title="Edit Subtask"
        >
          <Edit3 size={11} className="hover:text-blue-400 transition-colors" />
        </button>
        <button
          onClick={() => onDeleteSubtask(groupId, subtask.id)}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          title="Delete Subtask"
        >
          <Trash2 size={11} className="hover:text-red-400 transition-colors" />
        </button>
      </div>
    </div>
  );
};
