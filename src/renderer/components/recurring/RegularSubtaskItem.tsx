import React from 'react';
import type { RecurringSubtask } from '../../../shared/types';

interface RegularSubtaskItemProps {
  groupId: string;
  subtask: RecurringSubtask;
  isCompleted: boolean;
  onToggleSubtask: (groupId: string, subtaskId: string, date: string) => void;
  selectedDate: string;
}

export const RegularSubtaskItem: React.FC<RegularSubtaskItemProps> = ({
  groupId,
  subtask,
  isCompleted,
  onToggleSubtask,
  selectedDate,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0' }}>
      <div
        className="task-checkbox-container"
        onClick={() => onToggleSubtask(groupId, subtask.id, selectedDate)}
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
        
        {subtask.time && (
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
            {subtask.time}
            {subtask.remind10MinBefore && <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>• 10m</span>}
          </span>
        )}
      </div>
    </div>
  );
};
