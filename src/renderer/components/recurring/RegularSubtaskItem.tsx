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
        
        {subtask.time ? (
          <span
            style={{
              fontSize: '9.5px',
              color: isCompleted ? 'rgba(255,255,255,0.15)' : 'var(--text-dim)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '1px 5px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              width: '62px',
              height: '16px',
              boxSizing: 'border-box',
              flexShrink: 0
            }}
            title={subtask.remind10MinBefore ? 'Reminds 10 min before' : 'Reminds at exact time'}
          >
            {subtask.time}
          </span>
        ) : (
          <div style={{ width: '62px', flexShrink: 0 }} />
        )}
        {(!subtask.days || subtask.days.length === 0) ? (
          <span
            style={{
              fontSize: '9.5px',
              color: isCompleted ? 'rgba(255,255,255,0.15)' : 'var(--text-dim)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '1px 5px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              width: '55px',
              height: '16px',
              boxSizing: 'border-box',
              flexShrink: 0
            }}
          >
            All Days
          </span>
        ) : (
          <span
            style={{
              fontSize: '9.5px',
              color: isCompleted ? 'rgba(255,255,255,0.15)' : 'var(--accent-color)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 132, 255, 0.05)',
              padding: '1px 5px',
              borderRadius: '4px',
              border: '1px solid rgba(0, 132, 255, 0.1)',
              width: '55px',
              height: '16px',
              boxSizing: 'border-box',
              flexShrink: 0
            }}
          >
            {(() => {
              if (subtask.days.length > 2) {
                return `${subtask.days.length} Days`;
              }
              const DAY_SHORT: Record<string, string> = {
                Monday: 'Mon',
                Tuesday: 'Tue',
                Wednesday: 'Wed',
                Thursday: 'Thu',
                Friday: 'Fri',
                Saturday: 'Sat',
                Sunday: 'Sun'
              };
              return subtask.days.map(d => DAY_SHORT[d] || d.slice(0, 3)).join(', ');
            })()}
          </span>
        )}
      </div>
    </div>
  );
};
