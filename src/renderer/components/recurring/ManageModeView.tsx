import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RecurringGroup, RecurringSubtask } from '../../../shared/types';
import { GroupManageItem } from './GroupManageItem';

interface ManageModeViewProps {
  groups: RecurringGroup[];
  onAddGroup: (title: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onUpdateGroup: (groupId: string, title: string) => void;
  onAddSubtask: (groupId: string, title: string, time?: string, remind10MinBefore?: boolean, intervalHours?: number) => void;
  onDeleteSubtask: (groupId: string, subtaskId: string) => void;
  onUpdateSubtask: (groupId: string, subtaskId: string, updatedFields: Partial<RecurringSubtask>) => void;
}

export const ManageModeView: React.FC<ManageModeViewProps> = ({
  groups,
  onAddGroup,
  onDeleteGroup,
  onUpdateGroup,
  onAddSubtask,
  onDeleteSubtask,
  onUpdateSubtask,
}) => {
  const [newGroupName, setNewGroupName] = useState('');

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    onAddGroup(newGroupName.trim());
    setNewGroupName('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: '14px' }} className="no-drag">
      {/* Add Group Form */}
      <form onSubmit={handleCreateGroup} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="New group (e.g. Workout)..."
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          className="input-field"
          style={{ padding: '6px 10px', fontSize: '12.5px', height: '32px' }}
        />
        <Button
          type="submit"
          size="sm"
          style={{ background: 'var(--accent-color)', height: '32px', padding: '0 12px' }}
        >
          <Plus size={14} />
        </Button>
      </form>

      {/* Manage Scrollable List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0px', paddingRight: '2px' }}>
        {groups.length === 0 ? (
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', textAlign: 'center', marginTop: '20px' }}>
            Create a group above to start configuring!
          </span>
        ) : (
          groups.map((group, index) => {
            const isLast = index === groups.length - 1;
            return (
              <div
                key={group.id}
                style={{
                  marginBottom: isLast ? '0px' : '16px',
                }}
              >
                <GroupManageItem
                  group={group}
                  onDeleteGroup={onDeleteGroup}
                  onUpdateGroup={onUpdateGroup}
                  onAddSubtask={onAddSubtask}
                  onDeleteSubtask={onDeleteSubtask}
                  onUpdateSubtask={onUpdateSubtask}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
