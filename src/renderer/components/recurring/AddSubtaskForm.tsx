import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [hour, setHour] = useState('');
  const [min, setMin] = useState('00');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
  const [remindBefore, setRemindBefore] = useState(true);
  const [interval, setIntervalVal] = useState('2');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (mode === 'interval') {
      const intervalVal = parseInt(interval || '2', 10);
      onAddSubtask(groupId, title.trim(), undefined, undefined, intervalVal);
    } else {
      let formattedTime: string | undefined = undefined;
      if (hour) {
        formattedTime = `${hour.padStart(2, '0')}:${min.padStart(2, '0')} ${ampm}`;
      }
      const remind10MinBefore = formattedTime ? remindBefore : undefined;
      onAddSubtask(groupId, title.trim(), formattedTime, remind10MinBefore, undefined, selectedDays);
    }

    // Reset local states
    setTitle('');
    setHour('');
    setMin('00');
    setAmpm('AM');
    setRemindBefore(true);
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

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginTop: '8px',
        padding: '4px 0 0 0',
        background: 'transparent',
        border: 'none',
      }}
    >
      <div style={{ display: 'flex', gap: '6px' }}>
        <input
          type="text"
          placeholder="Subtask name..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
          style={{ padding: '4px 8px', fontSize: '11.5px', height: '26px', background: 'rgba(0,0,0,0.15)', flex: 1 }}
        />
        <Button
          type="submit"
          size="sm"
          style={{ background: 'var(--accent-color)', height: '26px', width: '26px', padding: 0 }}
          title="Add Subtask"
        >
          <Plus size={11} />
        </Button>
        {onClose && (
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            size="sm"
            style={{ height: '26px', width: '26px', padding: 0, color: 'var(--text-muted)' }}
            title="Close Form"
          >
            <X size={12} />
          </Button>
        )}
      </div>
      
      {/* Subtask Mode Toggle */}
      <div style={{ display: 'flex', gap: '8px', fontSize: '9.5px', color: 'var(--text-dim)', alignItems: 'center' }}>
        <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reminder:</span>
        <button
          type="button"
          onClick={() => setMode('time')}
          style={{
            background: mode === 'time' ? 'rgba(255,255,255,0.05)' : 'transparent',
            border: '1px solid ' + (mode === 'time' ? 'rgba(255,255,255,0.1)' : 'transparent'),
            color: mode === 'time' ? 'var(--text-main)' : 'var(--text-dim)',
            padding: '1px 5px',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Specific Time
        </button>
        <button
          type="button"
          onClick={() => setMode('interval')}
          style={{
            background: mode === 'interval' ? 'rgba(255,255,255,0.05)' : 'transparent',
            border: '1px solid ' + (mode === 'interval' ? 'rgba(255,255,255,0.1)' : 'transparent'),
            color: mode === 'interval' ? 'var(--text-main)' : 'var(--text-dim)',
            padding: '1px 5px',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Interval Timer
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        {/* Time Mode Controls */}
        {mode === 'time' && (
          <>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '26px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Time:</span>
              <select
                className="input-field"
                style={{ padding: '2px 4px', fontSize: '11px', height: '100%', width: '46px', background: 'rgba(7, 10, 17, 0.95)' }}
                value={hour}
                onChange={(e) => {
                  setHour(e.target.value);
                  if (e.target.value && !min) setMin('00');
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
                value={min}
                onChange={(e) => handleMinChange(e.target.value)}
                onBlur={handleMinBlur}
                disabled={!hour}
              />
              <div style={{
                display: 'flex',
                borderRadius: '4px',
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
                    padding: '0 6px',
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
                    padding: '0 6px',
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

            {/* Remind 10 min toggle switch */}
            {hour && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Remind 10m before:</span>
                <label className="switch" style={{ width: '32px', height: '18px' }}>
                  <input
                    type="checkbox"
                    checked={remindBefore}
                    onChange={() => setRemindBefore(!remindBefore)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            )}

            {/* Day Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', marginTop: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Days:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                  const isSelected = selectedDays.includes(day);
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
                        fontSize: '9px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: '1px solid ' + (isSelected ? 'var(--accent-color)' : 'rgba(255,255,255,0.08)'),
                        background: isSelected ? 'var(--accent-color)' : 'rgba(255,255,255,0.02)',
                        color: isSelected ? '#ffffff' : 'var(--text-muted)',
                        transition: 'all 0.15s ease'
                      }}
                      title={day}
                    >
                      {DAY_SHORT[day]}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Interval Mode Controls */}
        {mode === 'interval' && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', height: '26px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Repeat Every:</span>
            <select
              className="input-field"
              style={{ padding: '2px 4px', fontSize: '11px', height: '100%', width: '90px', background: 'rgba(7, 10, 17, 0.95)' }}
              value={interval}
              onChange={(e) => setIntervalVal(e.target.value)}
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
  );
};
