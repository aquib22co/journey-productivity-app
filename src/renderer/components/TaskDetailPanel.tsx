import React, { useState } from 'react';
import type { Task } from '../../shared/types';
import { DatePicker } from './DatePicker';
import {
  MessageCircle,
  Code,
  BookOpen,
  HelpCircle,
  ChevronLeft,
  Trash2
} from 'lucide-react';

// Helper to get category icons
const getCategoryIcon = (category?: 'work' | 'social' | 'study' | 'general') => {
  switch (category) {
    case 'work':
      return <Code size={12} />;
    case 'social':
      return <MessageCircle size={12} />;
    case 'study':
      return <BookOpen size={12} />;
    default:
      return <HelpCircle size={12} />;
  }
};

interface TaskDetailPanelProps {
  task: Task;
  onSave: (updatedTask: Task) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
  onToggleComplete: (task: Task) => void;
}

export const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  task,
  onSave,
  onDelete,
  onCancel,
  onToggleComplete
}) => {
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || '');
  const [editDueDate, setEditDueDate] = useState(task.dueDate || '');
  const [editCategory, setEditCategory] = useState<'work' | 'social' | 'study' | 'general'>(task.category || 'general');

  // Parse time
  const parseTime = (timeStr?: string) => {
    if (!timeStr) return { hour: '', min: '00', ampm: 'AM' as const };
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      return {
        hour: match[1],
        min: match[2],
        ampm: match[3].toUpperCase() as 'AM' | 'PM'
      };
    }
    return { hour: '', min: '00', ampm: 'AM' as const };
  };

  const initialTime = parseTime(task.time);
  const [editHour, setEditHour] = useState(initialTime.hour);
  const [editMin, setEditMin] = useState(initialTime.min);
  const [editAmpm, setEditAmpm] = useState<'AM' | 'PM'>(initialTime.ampm);

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
    if (editMin === '') {
      setEditMin('00');
    } else {
      setEditMin(editMin.padStart(2, '0'));
    }
  };



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', padding: '4px 2px', animation: 'fadeIn 0.15s ease' }}>
      {/* Header / Back row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={onCancel}
          className="win-btn"
          style={{ 
            width: '28px', 
            height: '28px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
          title="Back to list"
        >
          <ChevronLeft size={16} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          <input
            type="checkbox"
            className="task-checkbox"
            checked={!!task.completedAt}
            onChange={() => onToggleComplete(task)}
          />
          <input
            type="text"
            className="input-field"
            style={{ 
              fontSize: '14.5px', 
              fontWeight: '700', 
              color: 'var(--text-main)',
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              padding: '0',
              width: '100%',
              outline: 'none'
            }}
            placeholder="Task title..."
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
        </div>
      </div>

      {/* Description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</span>
        <textarea
          className="input-field"
          placeholder="Add description..."
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          style={{ 
            fontSize: '12px', 
            color: 'var(--text-main)', 
            background: 'rgba(255,255,255,0.015)',
            border: '1px solid rgba(255,255,255,0.03)',
            padding: '8px 10px',
            borderRadius: '6px',
            lineHeight: '1.45',
            minHeight: '140px',
            resize: 'none',
            width: '100%',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Metadata Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {/* Due Date */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Due Date</span>
          <DatePicker
            value={editDueDate}
            onChange={(val) => setEditDueDate(val)}
            placeholder="Due Date..."
          />
        </div>

        {/* Time */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time</span>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '28px' }}>
            <select
              className="input-field"
              style={{ padding: '2px 4px', fontSize: '11px', height: '100%', flex: 1 }}
              value={editHour}
              onChange={(e) => setEditHour(e.target.value)}
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
              style={{ padding: '2px 4px', fontSize: '11px', height: '100%', flex: 1, textAlign: 'center' }}
              placeholder="00"
              maxLength={2}
              value={editMin}
              onChange={(e) => handleMinChange(e.target.value)}
              onBlur={handleMinBlur}
              disabled={!editHour}
            />
            <div style={{ 
              display: 'flex', 
              borderRadius: '6px', 
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
                  padding: '0 8px',
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
                  padding: '0 8px',
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
        </div>
      </div>

      {/* Category Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <span style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['general', 'work', 'social', 'study'] as const).map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setEditCategory(cat)}
              className={`cat-badge cat-${cat}`}
              style={{
                flex: 1,
                border: editCategory === cat ? '1px solid var(--accent-color)' : '1px solid transparent',
                cursor: 'pointer',
                padding: '4px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                borderRadius: '6px'
              }}
            >
              {getCategoryIcon(cat)}
              <span style={{ fontSize: '9px', textTransform: 'capitalize' }}>{cat === 'general' ? 'None' : cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Save / Delete / Cancel Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px' }}>
        <button
          type="button"
          onClick={() => {
            onDelete(task.id);
          }}
          className="btn btn-secondary"
          style={{ 
            padding: '5px 10px', 
            fontSize: '11px',
            color: 'var(--danger-color)',
            background: 'rgba(244,63,94,0.04)',
            border: '1px solid rgba(244,63,94,0.1)'
          }}
        >
          <Trash2 size={12} style={{ marginRight: '4px' }} /> Delete
        </button>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            type="button"
            onClick={onCancel} 
            className="btn btn-secondary" 
            style={{ padding: '5px 10px', fontSize: '11px' }}
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={() => {
              if (!editTitle.trim()) return;

              let formattedTime: string | undefined = undefined;
              if (editHour) {
                formattedTime = `${editHour}:${editMin} ${editAmpm}`;
              }

              onSave({
                ...task,
                title: editTitle,
                description: editDesc || undefined,
                dueDate: editDueDate || undefined,
                category: editCategory,
                time: formattedTime,
              });
            }} 
            className="btn" 
            style={{ padding: '5px 12px', fontSize: '11px', background: 'var(--accent-color)', color: '#ffffff' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
