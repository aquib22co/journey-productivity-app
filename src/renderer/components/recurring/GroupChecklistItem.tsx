import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Edit3, Plus, Check, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RecurringGroup, RecurringSubtask } from '../../../shared/types';
import { IntervalSubtaskItem } from './IntervalSubtaskItem';
import { RegularSubtaskItem } from './RegularSubtaskItem';
import { AddSubtaskForm } from './AddSubtaskForm';
import { SubtaskManageItem } from './SubtaskManageItem';

interface GroupChecklistItemProps {
  group: RecurringGroup;
  selectedDate: string;
  isSubtaskCompleted: (subtask: RecurringSubtask) => boolean;
  onToggleSubtask: (groupId: string, subtaskId: string, date: string) => void;
  onToggleIntervalSubtaskEnabled: (groupId: string, subtask: RecurringSubtask) => void;
  formatCountdown: (subtaskId: string, intervalHours: number) => string;
  onAddSubtask: (groupId: string, title: string, time?: string, remind10MinBefore?: boolean, intervalHours?: number) => void;
  onDeleteSubtask: (groupId: string, subtaskId: string) => void;
  onUpdateSubtask: (groupId: string, subtaskId: string, updatedFields: Partial<RecurringSubtask>) => void;
  onDeleteGroup: (groupId: string) => void;
  onUpdateGroup: (groupId: string, title: string) => void;
}

export const GroupChecklistItem: React.FC<GroupChecklistItemProps> = ({
  group,
  selectedDate,
  isSubtaskCompleted,
  onToggleSubtask,
  onToggleIntervalSubtaskEnabled,
  formatCountdown,
  onAddSubtask,
  onDeleteSubtask,
  onUpdateSubtask,
  onDeleteGroup,
  onUpdateGroup,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');

  const totalSubtasks = group.subtasks.filter(st => !st.intervalHours).length;
  const completedCount = group.subtasks.filter(st => !st.intervalHours && isSubtaskCompleted(st)).length;
  const percent = totalSubtasks > 0 ? (completedCount / totalSubtasks) * 100 : 0;

  const handleToggleEditGroup = () => {
    const nextVal = !isEditingGroup;
    setIsEditingGroup(nextVal);
    setIsAddingSubtask(false);
    if (nextVal) {
      setEditGroupName(group.title);
      if (!expanded) setExpanded(true);
    }
  };

  const handleAddSubtask = (
    groupId: string,
    title: string,
    time?: string,
    remind10MinBefore?: boolean,
    intervalHours?: number
  ) => {
    onAddSubtask(groupId, title, time, remind10MinBefore, intervalHours);
    // If quick adding, automatically close the form. For full editing, keep open.
    setIsAddingSubtask(false);
  };

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
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          userSelect: 'none'
        }}
      >
        {isEditingGroup ? (
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ display: 'flex', gap: '6px', flex: 1, alignItems: 'center' }}
          >
            <input
              type="text"
              value={editGroupName}
              onChange={(e) => setEditGroupName(e.target.value)}
              className="input-field"
              style={{ padding: '4px 8px', fontSize: '12.5px', height: '28px', background: 'rgba(0,0,0,0.15)', flex: 1 }}
            />
            <Button
              onClick={(e) => {
                e.stopPropagation();
                if (!editGroupName.trim()) return;
                onUpdateGroup(group.id, editGroupName.trim());
                setIsEditingGroup(false);
              }}
              size="sm"
              style={{ background: 'var(--success-color)', height: '28px', width: '28px', padding: 0 }}
              title="Save changes"
            >
              <Check size={12} />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingGroup(false);
              }}
              variant="ghost"
              size="sm"
              style={{ height: '28px', width: '28px', padding: 0, color: 'var(--text-muted)' }}
              title="Cancel"
            >
              <X size={12} />
            </Button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete the group "${group.title}"?`)) {
                  onDeleteGroup(group.id);
                }
              }}
              style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', opacity: 0.8, padding: '0 6px' }}
              title="Delete Group"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => setExpanded(!expanded)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {expanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                {group.title}
              </span>
              {totalSubtasks > 0 && (
                <span 
                  style={{ 
                    fontSize: '10.5px', 
                    fontWeight: 600, 
                    color: percent === 100 ? 'var(--success-color)' : 'var(--text-muted)',
                    background: 'rgba(255,255,255,0.03)',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    marginLeft: '4px'
                  }}
                >
                  {completedCount}/{totalSubtasks}
                </span>
              )}
            </div>
            
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddingSubtask(!isAddingSubtask);
                  setIsEditingGroup(false);
                  if (!expanded) setExpanded(true);
                }}
                style={{
                  background: isAddingSubtask ? 'rgba(0, 132, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  border: isAddingSubtask ? '1px solid rgba(0, 132, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '5px',
                  color: isAddingSubtask ? 'var(--accent-color)' : 'var(--text-muted)',
                  width: '24px',
                  height: '24px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: 0.8
                }}
                className="hover:opacity-100 hover:bg-slate-800"
                title="Quick Add Subtask"
              >
                <Plus size={13} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleEditGroup();
                }}
                style={{
                  background: isEditingGroup ? 'rgba(0, 132, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  border: isEditingGroup ? '1px solid rgba(0, 132, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '5px',
                  color: isEditingGroup ? 'var(--accent-color)' : 'var(--text-muted)',
                  width: '24px',
                  height: '24px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: 0.8
                }}
                className="hover:opacity-100 hover:bg-slate-800"
                title="Edit Group Subtasks"
              >
                <Edit3 size={13} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Are you sure you want to delete the group "${group.title}"?`)) {
                    onDeleteGroup(group.id);
                  }
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '5px',
                  color: 'var(--danger-color)',
                  width: '24px',
                  height: '24px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: 0.8
                }}
                className="hover:opacity-100 hover:bg-slate-800"
                title="Delete Group"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
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
          {group.subtasks.length === 0 && !isEditingGroup && !isAddingSubtask ? (
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic', paddingLeft: '18px' }}>
              No subtasks. Tap gear, pen, or + to add.
            </span>
          ) : (
            <>
              {group.subtasks.map(subtask => {
                if (isEditingGroup) {
                  return (
                    <SubtaskManageItem
                      key={subtask.id}
                      groupId={group.id}
                      subtask={subtask}
                      onDeleteSubtask={onDeleteSubtask}
                      onUpdateSubtask={onUpdateSubtask}
                    />
                  );
                }

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
              })}
              {(isEditingGroup || isAddingSubtask) && (
                <AddSubtaskForm
                  groupId={group.id}
                  onAddSubtask={handleAddSubtask}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
