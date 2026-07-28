import React from 'react';
import type { RecurringSubtask } from '../../../shared/types';

interface RegularSubtaskItemProps {
  groupId: string;
  subtask: RecurringSubtask;
  isCompleted: boolean;
  onToggleSubtask: (groupId: string, subtaskId: string, date: string) => void;
  selectedDate: string;
  isActiveToday?: boolean;
}

export const RegularSubtaskItem: React.FC<RegularSubtaskItemProps> = ({
  groupId,
  subtask,
  isCompleted,
  onToggleSubtask,
  selectedDate,
  isActiveToday = true,
}) => {
  const getSubtaskBadgeText = () => {
    const rawTime = subtask.time || '';
    let timeStr = '';
    if (rawTime) {
      const match = rawTime.match(/^0?(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (match) {
        timeStr = `${match[1]}:${match[2]}${match[3].toLowerCase()}`;
      } else {
        timeStr = rawTime.toLowerCase().replace(/\s+/g, '');
      }
    }
    
    let daysStr = 'All';
    if (subtask.days && subtask.days.length > 0) {
      if (subtask.days.length > 2) {
        daysStr = `${subtask.days.length} Days`;
      } else {
        const DAY_SHORT: Record<string, string> = {
          Monday: 'Mon',
          Tuesday: 'Tue',
          Wednesday: 'Wed',
          Thursday: 'Thu',
          Friday: 'Fri',
          Saturday: 'Sat',
          Sunday: 'Sun'
        };
        daysStr = subtask.days.map(d => DAY_SHORT[d] || d.slice(0, 3)).join(', ');
      }
    }

    if (timeStr) {
      return `${timeStr} - ${daysStr}`;
    }
    return daysStr;
  };

  const hasCustomDays = subtask.days && subtask.days.length > 0;

  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '2px 0',
        opacity: isActiveToday ? 1 : 0.35,
        pointerEvents: isActiveToday ? 'auto' : 'none'
      }}
    >
      <div
        className="task-checkbox-container"
        onClick={() => isActiveToday && onToggleSubtask(groupId, subtask.id, selectedDate)}
        style={{ cursor: isActiveToday ? 'pointer' : 'default' }}
      >
        <input
          type="checkbox"
          className="task-checkbox"
          checked={isCompleted}
          onChange={() => { }} // handled via container click
          disabled={!isActiveToday}
          style={{ width: '18px', height: '18px', cursor: isActiveToday ? 'pointer' : 'default' }}
        />
      </div>
      {/* Title & Badge Alignment Wrapper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: '12.5px',
            color: isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
            textDecoration: isCompleted ? 'line-through' : 'none',
            transition: 'color 0.2s ease, text-decoration 0.2s ease',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            flex: 1
          }}
        >
          {subtask.title}
        </span>
        
        <span
          style={{
            fontSize: '9px',
            color: isCompleted 
              ? 'rgba(255, 255, 255, 0.15)' 
              : hasCustomDays ? 'var(--accent-color)' : 'var(--text-dim)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isCompleted
              ? 'rgba(255, 255, 255, 0.01)'
              : hasCustomDays ? 'rgba(0, 132, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
            padding: '1px 6px',
            borderRadius: '4px',
            border: isCompleted
              ? '1px solid rgba(255, 255, 255, 0.02)'
              : hasCustomDays ? '1px solid rgba(0, 132, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.04)',
            width: '85px',
            height: '16px',
            boxSizing: 'border-box',
            flexShrink: 0,
            whiteSpace: 'nowrap'
          }}
          title={subtask.time ? (subtask.remind10MinBefore ? 'Reminds 10 min before' : 'Reminds at exact time') : undefined}
        >
          {getSubtaskBadgeText()}
        </span>
      </div>
    </div>
  );
};
