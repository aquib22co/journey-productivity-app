import React from 'react';
import type { RecurringSubtask } from '../../../shared/types';

interface IntervalSubtaskItemProps {
  groupId: string;
  subtask: RecurringSubtask;
  onToggleIntervalSubtaskEnabled: (groupId: string, subtask: RecurringSubtask) => void;
  formattedCountdown: string;
}

export const IntervalSubtaskItem: React.FC<IntervalSubtaskItemProps> = ({
  groupId,
  subtask,
  onToggleIntervalSubtaskEnabled,
  formattedCountdown,
}) => {
  const isEnabled = subtask.enabled !== false;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '2px 0',
        width: '100%'
      }}
    >
      <label className="switch" style={{ width: '32px', height: '18px', flexShrink: 0 }} title={isEnabled ? 'Disable Timer' : 'Enable Timer'}>
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={() => onToggleIntervalSubtaskEnabled(groupId, subtask)}
        />
        <span className="slider"></span>
      </label>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, minWidth: 0, gap: '8px' }}>
        <span
          style={{
            fontSize: '12.5px',
            color: isEnabled ? 'var(--text-main)' : 'var(--text-muted)',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            fontWeight: 500
          }}
        >
          {subtask.title}
        </span>
        <span
          style={{
            fontSize: '10.5px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: isEnabled ? 'var(--accent-color)' : 'var(--text-dim)',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.04)',
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {isEnabled ? formattedCountdown : 'Disabled'}
        </span>
      </div>
    </div>
  );
};
