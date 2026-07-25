import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddSubtaskFormProps {
  groupId: string;
  onAddSubtask: (
    groupId: string,
    title: string,
    time?: string,
    remind10MinBefore?: boolean,
    intervalHours?: number,
    days?: string[]
  ) => void;
  onClose?: () => void;
}

export const AddSubtaskForm: React.FC<AddSubtaskFormProps> = ({
  groupId,
  onAddSubtask,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<'time' | 'interval'>('time');
  const [hour, setHour] = useState('10');
  const [min, setMin] = useState('30');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
  const [interval, setIntervalVal] = useState('2');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    if (mode === 'interval') {
      const intervalVal = parseInt(interval || '2', 10);
      onAddSubtask(groupId, title.trim(), undefined, undefined, intervalVal);
    } else {
      let formattedTime: string | undefined = undefined;
      if (hour) {
        formattedTime = `${hour.padStart(2, '0')}:${min.padStart(2, '0')} ${ampm}`;
      }
      const remind10MinBefore = formattedTime ? true : undefined;
      onAddSubtask(groupId, title.trim(), formattedTime, remind10MinBefore, undefined, selectedDays);
    }

    // Reset local states
    setTitle('');
    setHour('10');
    setMin('30');
    setAmpm('AM');
    setIntervalVal('2');
    setSelectedDays([]);
  };

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

  const DAYS_LIST = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const DAY_SHORT: Record<string, string> = {
    Monday: 'M',
    Tuesday: 'T',
    Wednesday: 'W',
    Thursday: 'Th',
    Friday: 'F',
    Saturday: 'Sa',
    Sunday: 'Su'
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginTop: '12px',
        padding: '12px',
        background: 'rgba(23, 29, 41, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        boxSizing: 'border-box',
        width: '100%'
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>New Subtask</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px',
              opacity: 0.8,
              transition: 'opacity 0.2s ease'
            }}
            className="hover:opacity-100"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Input: Subtask Name */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-dim)' }}>Subtask Name</span>
        <input
          type="text"
          placeholder="Subtask name..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
          style={{
            padding: '6px 10px',
            fontSize: '12.5px',
            height: '30px',
            background: 'rgba(7, 10, 17, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            color: 'var(--text-main)',
            width: '100%',
            boxSizing: 'border-box'
          }}
          autoFocus
        />
      </div>

      {/* Row: Reminder Mode Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-dim)' }}>Reminder Type</span>
        <div
          style={{
            display: 'flex',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.01)',
            padding: '2px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <button
            type="button"
            onClick={() => setMode('time')}
            style={{
              flex: 1,
              padding: '5px 0',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              background: mode === 'time' ? 'var(--accent-color)' : 'transparent',
              color: mode === 'time' ? '#ffffff' : 'var(--text-dim)',
              transition: 'all 0.2s ease',
              textAlign: 'center'
            }}
          >
            Specific Time
          </button>
          <button
            type="button"
            onClick={() => setMode('interval')}
            style={{
              flex: 1,
              padding: '5px 0',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              background: mode === 'interval' ? 'var(--accent-color)' : 'transparent',
              color: mode === 'interval' ? '#ffffff' : 'var(--text-dim)',
              transition: 'all 0.2s ease',
              textAlign: 'center'
            }}
          >
            Interval Timer
          </button>
        </div>
      </div>

      {/* Row: Time Config / Interval Config */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-dim)' }}>
          {mode === 'time' ? 'Reminder Time' : 'Repeat Interval'}
        </span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            background: 'rgba(7, 10, 17, 0.2)',
            padding: '6px 12px',
            height: '32px',
            boxSizing: 'border-box',
            width: '100%'
          }}
        >
          {mode === 'time' ? (
            <>
              {/* Hour & Minute selects */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <select
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(h => (
                    <option key={h} value={h} style={{ background: '#1c212c', color: '#fff' }}>{h}</option>
                  ))}
                </select>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '0 2px' }}>:</span>
                <input
                  type="text"
                  value={min}
                  onChange={(e) => handleMinChange(e.target.value)}
                  onBlur={handleMinBlur}
                  maxLength={2}
                  placeholder="00"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                    width: '20px',
                    padding: 0,
                    textAlign: 'center'
                  }}
                />
              </div>

              {/* AM | PM */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600 }}>
                <span
                  onClick={() => setAmpm('AM')}
                  style={{
                    color: ampm === 'AM' ? 'var(--accent-color)' : 'var(--text-dim)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  AM
                </span>
                <span style={{ color: 'rgba(255,255,255,0.15)', userSelect: 'none' }}>|</span>
                <span
                  onClick={() => setAmpm('PM')}
                  style={{
                    color: ampm === 'PM' ? 'var(--accent-color)' : 'var(--text-dim)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  PM
                </span>
              </div>
            </>
          ) : (
            <select
              value={interval}
              onChange={(e) => setIntervalVal(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer',
                width: '100%',
                padding: 0
              }}
            >
              <option value="1" style={{ background: '#1c212c', color: '#fff' }}>1 hour</option>
              <option value="2" style={{ background: '#1c212c', color: '#fff' }}>2 hours</option>
              <option value="3" style={{ background: '#1c212c', color: '#fff' }}>3 hours</option>
              <option value="4" style={{ background: '#1c212c', color: '#fff' }}>4 hours</option>
              <option value="6" style={{ background: '#1c212c', color: '#fff' }}>6 hours</option>
              <option value="8" style={{ background: '#1c212c', color: '#fff' }}>8 hours</option>
              <option value="12" style={{ background: '#1c212c', color: '#fff' }}>12 hours</option>
            </select>
          )}
        </div>
      </div>

      {/* Row: Days (Circular Selector) */}
      {mode === 'time' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-dim)' }}>Active Days</span>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'space-between', width: '100%' }}>
            {DAYS_LIST.map(day => {
              const isSelected = selectedDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    setSelectedDays(prev =>
                      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                    );
                  }}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    fontSize: '9.5px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    background: isSelected ? 'var(--accent-color)' : 'rgba(255,255,255,0.01)',
                    color: isSelected ? '#ffffff' : 'var(--text-dim)',
                    transition: 'all 0.15s ease',
                    padding: 0
                  }}
                  title={day}
                >
                  {DAY_SHORT[day]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Row: Actions (Cancel, Create Subtask) */}
      <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '6px' }}>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              height: '32px',
              fontSize: '12px',
              fontWeight: 500,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              padding: 0
            }}
            className="hover:bg-white/5"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={() => handleSubmit()}
          style={{
            flex: 2,
            height: '32px',
            fontSize: '12px',
            fontWeight: 600,
            border: 'none',
            borderRadius: '6px',
            background: 'var(--accent-color)',
            color: '#ffffff',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0, 132, 255, 0.3)',
            transition: 'opacity 0.2s ease',
            padding: 0
          }}
          className="hover:opacity-90"
        >
          Create Subtask
        </button>
      </div>
    </div>
  );
};
