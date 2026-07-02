import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder = 'Select date...', style }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state if value prop changes
  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      setCurrentDate(new Date(y, m - 1, d));
    }
  }, [value]);

  // Click outside handler to close the popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay(); // 0 is Sunday

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const yyyy = year;
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Grid cells including offset from previous month
  const gridCells = [];
  for (let i = 0; i < startDay; i++) {
    gridCells.push(<div key={`empty-${i}`} style={{ width: '24px', height: '24px' }} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isSelected = value === `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
    
    gridCells.push(
      <button
        key={`day-${d}`}
        type="button"
        onClick={() => handleSelectDay(d)}
        style={{
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          fontSize: '11px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: isSelected || isToday ? 'bold' : 'normal',
          backgroundColor: isSelected 
            ? 'var(--accent-color)' 
            : isToday 
              ? 'rgba(0, 132, 255, 0.15)' 
              : 'transparent',
          color: isSelected 
            ? '#ffffff' 
            : isToday 
              ? 'var(--accent-color)' 
              : 'var(--text-main)',
          transition: 'background-color 0.15s ease',
        }}
        className="cal-day-btn"
      >
        {d}
      </button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className="input-field"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          fontSize: '11px',
          cursor: 'pointer',
          height: '28px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '6px',
          userSelect: 'none',
          width: '100%',
          ...style
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
          <CalendarIcon size={12} style={{ color: value ? 'var(--accent-color)' : 'var(--text-dim)', flexShrink: 0 }} />
          <span style={{ color: value ? 'var(--text-main)' : 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {value ? formatDateDisplay(value) : placeholder}
          </span>
        </div>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear(e);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-dim)'
            }}
            className="hover-bright"
          >
            <X size={10} />
          </button>
        )}
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        className="no-drag"
        style={{
          width: '210px',
          backgroundColor: 'rgba(13, 17, 28, 0.98)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '10px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={prevMonth}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-dim)',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)' }}>
            {currentDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-dim)',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Weekday Titles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
          {weekdays.map((w) => (
            <span key={w} style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 600 }}>
              {w}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {gridCells}
        </div>

        {/* Shortcut Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
          <button
            type="button"
            onClick={() => {
              const today = new Date();
              const y = today.getFullYear();
              const m = String(today.getMonth() + 1).padStart(2, '0');
              const d = String(today.getDate()).padStart(2, '0');
              onChange(`${y}-${m}-${d}`);
              setIsOpen(false);
            }}
            style={{
              padding: '4px',
              fontSize: '9.5px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: 'rgba(255,255,255,0.04)',
              color: 'var(--text-main)',
              fontWeight: 600
            }}
            className="cal-day-btn"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              const y = tomorrow.getFullYear();
              const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
              const d = String(tomorrow.getDate()).padStart(2, '0');
              onChange(`${y}-${m}-${d}`);
              setIsOpen(false);
            }}
            style={{
              padding: '4px',
              fontSize: '9.5px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: 'rgba(255,255,255,0.04)',
              color: 'var(--text-main)',
              fontWeight: 600
            }}
            className="cal-day-btn"
          >
            Tomorrow
          </button>
        </div>
      </PopoverContent>

      {/* Add CSS hover helper */}
      <style>{`
        .cal-day-btn:hover {
          background-color: rgba(255, 255, 255, 0.08) !important;
        }
      `}</style>
    </Popover>
  );
};
