import React, { useState } from 'react';
import { DatePicker } from './DatePicker';
import { ClipboardList, Plus, Code, MessageCircle, BookOpen, HelpCircle } from 'lucide-react';

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

interface AddTaskCardProps {
  onAddTask: (
    title: string,
    description?: string,
    dueDate?: string,
    category?: 'work' | 'social' | 'study' | 'general',
    time?: string
  ) => void;
}

export const AddTaskCard: React.FC<AddTaskCardProps> = ({ onAddTask }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newHour, setNewHour] = useState('');
  const [newMin, setNewMin] = useState('00');
  const [newAmpm, setNewAmpm] = useState<'AM' | 'PM'>('AM');
  const [newCategory, setNewCategory] = useState<'work' | 'social' | 'study' | 'general'>('general');
  const [showDetails] = useState(true);

  const handleMinChange = (val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    if (cleanVal === '') {
      setNewMin('');
      return;
    }
    const num = parseInt(cleanVal);
    if (num >= 0 && num <= 59) {
      setNewMin(cleanVal.slice(0, 2));
    }
  };

  const handleMinBlur = () => {
    if (newMin === '') {
      setNewMin('00');
    } else {
      setNewMin(newMin.padStart(2, '0'));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let formattedTime: string | undefined = undefined;
    if (newHour) {
      formattedTime = `${newHour}:${newMin} ${newAmpm}`;
    }

    onAddTask(
      newTitle,
      newDesc || undefined,
      newDueDate || undefined,
      newCategory,
      formattedTime
    );

    // Reset fields
    setNewTitle('');
    setNewDesc('');
    setNewDueDate('');
    setNewHour('');
    setNewMin('00');
    setNewAmpm('AM');
    setNewCategory('general');
  };

  return (
    <div className="widget-card">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Clipboard Icon Indicator */}
          <div className="cat-badge" style={{ background: 'rgba(0, 132, 255, 0.08)', color: '#0084ff', width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0 }}>
            <ClipboardList size={18} />
          </div>

          {/* Borderless Input Field */}
          <input
            type="text"
            className="input-field"
            style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: '0', fontSize: '14px' }}
            placeholder="Add a new task..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          {/* Controls */}
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <button
              type="submit"
              className="btn"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0084ff'
              }}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Details Drawer */}
        {showDetails && (
          <div className="settings-group" style={{ padding: '10px', gap: '8px', marginTop: '6px', animation: 'fadeIn 0.15s ease' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Add description..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Due Date</span>
                <DatePicker
                  value={newDueDate}
                  onChange={(val) => setNewDueDate(val)}
                  placeholder="Set date..."
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Time</span>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '28px' }}>
                  <select
                    className="input-field"
                    style={{ padding: '2px 4px', fontSize: '11px', height: '100%', flex: 1 }}
                    value={newHour}
                    onChange={(e) => setNewHour(e.target.value)}
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
                    value={newMin}
                    onChange={(e) => handleMinChange(e.target.value)}
                    onBlur={handleMinBlur}
                    disabled={!newHour}
                  />
                  <div style={{
                    display: 'flex',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    height: '100%',
                    opacity: newHour ? 1 : 0.5,
                    pointerEvents: newHour ? 'auto' : 'none'
                  }}>
                    <button
                      type="button"
                      onClick={() => setNewAmpm('AM')}
                      style={{
                        padding: '0 8px',
                        fontSize: '9.5px',
                        height: '100%',
                        border: 'none',
                        cursor: 'pointer',
                        background: newAmpm === 'AM' ? 'var(--accent-color)' : 'transparent',
                        color: newAmpm === 'AM' ? '#ffffff' : 'var(--text-muted)',
                        fontWeight: newAmpm === 'AM' ? 'bold' : 'normal',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAmpm('PM')}
                      style={{
                        padding: '0 8px',
                        fontSize: '9.5px',
                        height: '100%',
                        border: 'none',
                        cursor: 'pointer',
                        background: newAmpm === 'PM' ? 'var(--accent-color)' : 'transparent',
                        color: newAmpm === 'PM' ? '#ffffff' : 'var(--text-muted)',
                        fontWeight: newAmpm === 'PM' ? 'bold' : 'normal',
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
              <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Category Icon</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['general', 'work', 'social', 'study'] as const).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewCategory(cat)}
                    className={`cat-badge cat-${cat}`}
                    style={{
                      flex: 1,
                      border: newCategory === cat ? '1px solid var(--accent-color)' : '1px solid transparent',
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
                    <span style={{ fontSize: '9.5px', textTransform: 'capitalize' }}>{cat === 'general' ? 'None' : cat}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
