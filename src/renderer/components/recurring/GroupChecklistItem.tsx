import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { RecurringGroup, RecurringSubtask } from '../../../shared/types';
import { IntervalSubtaskItem } from './IntervalSubtaskItem';
import { RegularSubtaskItem } from './RegularSubtaskItem';

interface GroupChecklistItemProps {
  group: RecurringGroup;
  selectedDate: string;
  isSubtaskCompleted: (subtask: RecurringSubtask) => boolean;
  onToggleSubtask: (groupId: string, subtaskId: string, date: string) => void;
  onToggleIntervalSubtaskEnabled: (groupId: string, subtask: RecurringSubtask) => void;
  formatCountdown: (subtaskId: string, intervalHours: number) => string;
}

export const GroupChecklistItem: React.FC<GroupChecklistItemProps> = ({
  group,
  selectedDate,
  isSubtaskCompleted,
  onToggleSubtask,
  onToggleIntervalSubtaskEnabled,
  formatCountdown,
}) => {
  const [expanded, setExpanded] = useState(true);

  const totalSubtasks = group.subtasks.filter(st => !st.intervalHours).length;
  const completedCount = group.subtasks.filter(st => !st.intervalHours && isSubtaskCompleted(st)).length;
  const percent = totalSubtasks > 0 ? (completedCount / totalSubtasks) * 100 : 0;

  return (
    <div 
      style={{ 
        background: 'rgba(255, 255, 255, 0.01)',
        border: '1px solid rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Header Row: Title & Expand Toggle */}
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {expanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
          <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)' }}>
            {group.title}
          </span>
        </div>
        {totalSubtasks > 0 && (
          <span style={{ fontSize: '11px', fontWeight: 500, color: percent === 100 ? 'var(--success-color)' : 'var(--text-muted)' }}>
            {completedCount}/{totalSubtasks}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {totalSubtasks > 0 && (
        <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${percent}%`,
              height: '100%',
              background: percent === 100 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #0084ff, #00c6ff)',
              borderRadius: '3px',
              transition: 'width 0.3s ease-in-out'
            }}
          />
        </div>
      )}

      {/* Expandable Subtask List */}
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.02)', paddingTop: '6px' }}>
          {group.subtasks.length === 0 ? (
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic', paddingLeft: '18px' }}>
              No subtasks. Tap gear to add.
            </span>
          ) : (
            group.subtasks.map(subtask => {
              if (subtask.intervalHours) {
                return (
                  <IntervalSubtaskItem
                    key={subtask.id}
                    groupId={group.id}
                    subtask={subtask}
                    onToggleIntervalSubtaskEnabled={onToggleIntervalSubtaskEnabled}
                    formattedCountdown={formatCountdown(subtask.id, subtask.intervalHours)}
                  />
                );
              }

              const isCompleted = isSubtaskCompleted(subtask);
              return (
                <RegularSubtaskItem
                  key={subtask.id}
                  groupId={group.id}
                  subtask={subtask}
                  isCompleted={isCompleted}
                  onToggleSubtask={onToggleSubtask}
                  selectedDate={selectedDate}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
