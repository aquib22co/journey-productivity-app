import React, { useState } from 'react';
import { DatePicker } from './DatePicker';
import {
  MessageCircle,
  Code,
  BookOpen,
  HelpCircle,
  ChevronLeft
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

interface AddTaskPanelProps {
  onSave: (
    title: string,
    description?: string,
    dueDate?: string,
    category?: 'work' | 'social' | 'study' | 'general',
    time?: string
  ) => void;
  onCancel: () => void;
}

export const AddTaskPanel: React.FC<AddTaskPanelProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [hour, setHour] = useState('');
  const [min, setMin] = useState('00');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
  const [category, setCategory] = useState<'work' | 'social' | 'study' | 'general'>('general');

  const handleMinChange = (val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    if (cleanVal === '') {
      setMin('');
      return;
    }
    const num = parseInt(cleanVal);
    if (num >= 0 && num <= 59) {
      setMin(cleanVal.slice(0, 2));
    }
  };

  const handleMinBlur = () => {
    if (min === '') {
      setMin('00');
    } else {
      setMin(min.padStart(2, '0'));
    }
  };

  const handleAddClick = () => {
    if (!title.trim()) return;

    let formattedTime: string | undefined = undefined;
    if (hour) {
      formattedTime = `${hour}:${min} ${ampm}`;
    }

    onSave(title, desc || undefined, dueDate || undefined, category, formattedTime);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--card-gap, 12px)', height: '100%', padding: '4px 2px', animation: 'fadeIn 0.15s ease' }}>
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
          title="Cancel"
        >
          <ChevronLeft size={16} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {/* Description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</span>
        <textarea
          className="input-field"
          placeholder="Add description..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          style={{ 
            fontSize: '12px', 
            color: 'var(--text-main)', 
            background: 'rgba(255,255,255,0.015)',
            border: '1px solid rgba(255,255,255,0.03)',
            padding: '8px 10px',
            borderRadius: '6px',
            lineHeight: '1.45',
            minHeight: 'var(--textarea-min-height, 140px)',
            resize: 'none',
            width: '100%',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Metadata Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--card-gap, 8px)' }}>
        {/* Due Date */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Due Date</span>
          <DatePicker
            value={dueDate}
            onChange={(val) => setDueDate(val)}
            placeholder="Set date..."
          />
        </div>

        {/* Time */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time</span>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: 'var(--input-height, 28px)' }}>
            <select
              className="input-field"
              style={{ padding: '2px 4px', fontSize: '11px', height: '100%', flex: 1 }}
              value={hour}
              onChange={(e) => setHour(e.target.value)}
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
              value={min}
              onChange={(e) => handleMinChange(e.target.value)}
              onBlur={handleMinBlur}
              disabled={!hour}
            />
            <div style={{ 
              display: 'flex', 
              borderRadius: '6px', 
              overflow: 'hidden', 
              border: '1px solid rgba(255, 255, 255, 0.08)', 
              background: 'rgba(255, 255, 255, 0.02)',
              height: '100%',
              opacity: hour ? 1 : 0.5,
              pointerEvents: hour ? 'auto' : 'none'
            }}>
              <button
                type="button"
                onClick={() => setAmpm('AM')}
                style={{
                  padding: '0 8px',
                  fontSize: '9.5px',
                  height: '100%',
                  border: 'none',
                  cursor: 'pointer',
                  background: ampm === 'AM' ? 'var(--accent-color)' : 'transparent',
                  color: ampm === 'AM' ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: ampm === 'AM' ? 'bold' : 'normal',
                  transition: 'all 0.15s ease'
                }}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setAmpm('PM')}
                style={{
                  padding: '0 8px',
                  fontSize: '9.5px',
                  height: '100%',
                  border: 'none',
                  cursor: 'pointer',
                  background: ampm === 'PM' ? 'var(--accent-color)' : 'transparent',
                  color: ampm === 'PM' ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: ampm === 'PM' ? 'bold' : 'normal',
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
        <div style={{ display: 'flex', gap: 'var(--card-gap, 6px)' }}>
          {(['general', 'work', 'social', 'study'] as const).map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`cat-badge cat-${cat}`}
              style={{
                flex: 1,
                border: category === cat ? '1px solid var(--accent-color)' : '1px solid transparent',
                cursor: 'pointer',
                padding: '4px',
                height: 'var(--input-height, 24px)',
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

      {/* Save / Cancel Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px' }}>
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
          onClick={handleAddClick} 
          className="btn" 
          disabled={!title.trim()}
          style={{ padding: '5px 12px', fontSize: '11px', background: 'var(--accent-color)', color: '#ffffff', opacity: title.trim() ? 1 : 0.5 }}
        >
          Add Task
        </button>
      </div>
    </div>
  );
};
