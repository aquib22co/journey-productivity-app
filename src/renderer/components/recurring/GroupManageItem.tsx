import React, { useState } from 'react';
import { Check, X, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RecurringGroup, RecurringSubtask } from '../../../shared/types';
import { SubtaskManageItem } from './SubtaskManageItem';
import { AddSubtaskForm } from './AddSubtaskForm';

interface GroupManageItemProps {
  group: RecurringGroup;
  onDeleteGroup: (groupId: string) => void;
  onUpdateGroup: (groupId: string, title: string) => void;
  onAddSubtask: (groupId: string, title: string, time?: string, remind10MinBefore?: boolean, intervalHours?: number) => void;
  onDeleteSubtask: (groupId: string, subtaskId: string) => void;
  onUpdateSubtask: (groupId: string, subtaskId: string, updatedFields: Partial<RecurringSubtask>) => void;
}

export const GroupManageItem: React.FC<GroupManageItemProps> = ({
  group,
  onDeleteGroup,
  onUpdateGroup,
  onAddSubtask,
  onDeleteSubtask,
  onUpdateSubtask,
}) => {
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');

  const handleStartGroupEdit = () => {
    setIsEditingGroup(true);
    setEditGroupName(group.title);
  };

  const handleSaveGroupEdit = () => {
    if (!editGroupName.trim()) return;
    onUpdateGroup(group.id, editGroupName.trim());
    setIsEditingGroup(false);
  };

  return (
    <div
      style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        paddingBottom: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '16px'
      }}
    >
      {/* Group Title Row with Delete/Edit Group Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        {isEditingGroup ? (
          <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
            <input
              type="text"
              value={editGroupName}
              onChange={(e) => setEditGroupName(e.target.value)}
              className="input-field"
              style={{ padding: '4px 8px', fontSize: '12px', height: '26px', background: 'rgba(0,0,0,0.15)', flex: 1 }}
            />
            <Button
              onClick={handleSaveGroupEdit}
              size="sm"
              style={{ background: 'var(--success-color)', height: '26px', width: '26px', padding: 0 }}
              title="Save changes"
            >
              <Check size={11} />
            </Button>
            <Button
              onClick={() => setIsEditingGroup(false)}
              variant="ghost"
              size="sm"
              style={{ height: '26px', width: '26px', padding: 0, color: 'var(--text-muted)' }}
              title="Cancel"
            >
              <X size={11} />
            </Button>
          </div>
        ) : (
          <>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', flex: 1 }}>
              {group.title}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={handleStartGroupEdit}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', opacity: 0.7 }}
                title="Edit Group Title"
              >
                <Edit3 size={11} className="hover:text-blue-400 transition-colors" />
              </button>
              <button
                onClick={() => onDeleteGroup(group.id)}
                style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', opacity: 0.7 }}
                title="Delete Group"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Subtask Manager List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.02)', paddingTop: '6px' }}>
        {group.subtasks.map(st => (
          <SubtaskManageItem
            key={st.id}
            groupId={group.id}
            subtask={st}
            onDeleteSubtask={onDeleteSubtask}
            onUpdateSubtask={onUpdateSubtask}
          />
        ))}

        {/* Add Subtask Form */}
        <AddSubtaskForm
          groupId={group.id}
          onAddSubtask={onAddSubtask}
        />
      </div>
    </div>
  );
};
