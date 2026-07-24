import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import type { RecurringGroup, RecurringSubtask } from '../../../shared/types';
import { GroupChecklistItem } from './GroupChecklistItem';

interface ChecklistViewProps {
  groups: RecurringGroup[];
  selectedDate: string;
  getLocalDateDisplay: (dateStr: string) => string;
  isSubtaskCompleted: (subtask: RecurringSubtask) => boolean;
  onToggleSubtask: (groupId: string, subtaskId: string, date: string) => void;
  onToggleIntervalSubtaskEnabled: (groupId: string, subtask: RecurringSubtask) => void;
  formatCountdown: (subtaskId: string, intervalHours: number) => string;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  groups,
  selectedDate,
  getLocalDateDisplay,
  isSubtaskCompleted,
  onToggleSubtask,
  onToggleIntervalSubtaskEnabled,
  formatCountdown,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Sub-Header: Date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '2px 0 12px 0' }}>
        <Calendar size={14} style={{ color: 'var(--accent-color)' }} />
        <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--accent-color)' }}>
          {getLocalDateDisplay(selectedDate)}
        </span>
      </div>

      {/* Group Checklist Content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '2px' }} className="no-drag">
        {groups.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 10px', color: 'var(--text-dim)', gap: '6px', textAlign: 'center' }}>
            <AlertCircle size={24} style={{ opacity: 0.3 }} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>No recurring tasks yet</span>
            <span style={{ fontSize: '10px', maxWidth: '200px' }}>Click the gear icon in the header to set up groups like Prayers or Workout!</span>
          </div>
        ) : (
          groups.map(group => (
            <GroupChecklistItem
              key={group.id}
              group={group}
              selectedDate={selectedDate}
              isSubtaskCompleted={isSubtaskCompleted}
              onToggleSubtask={onToggleSubtask}
              onToggleIntervalSubtaskEnabled={onToggleIntervalSubtaskEnabled}
              formatCountdown={formatCountdown}
            />
          ))
        )}
      </div>
    </div>
  );
};
