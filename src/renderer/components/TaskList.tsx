import React, { useState } from 'react';
import type { Task } from '../../shared/types';
import { TaskDetailPanel } from './TaskDetailPanel';
import { AddTaskPanel } from './AddTaskPanel';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  Calendar,
  Check,
  MessageCircle,
  Code,
  BookOpen,
  HelpCircle,
  ListTodo,
  Star,
  Plus
} from 'lucide-react';

// Helper to get category icons
export const getCategoryIcon = (category?: 'work' | 'social' | 'study' | 'general') => {
  switch (category) {
    case 'work':
      return <Code size={12} />;
    case 'social':
      return <MessageCircle size={12} />;
    case 'study':
      return <BookOpen size={12} />;
    default:
      return <HelpCircle size={12} />;
  }
};

/* ==========================================================================
   TaskList Component (renders the task list manager panel)
   ========================================================================== */
interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (
    title: string,
    description?: string,
    dueDate?: string,
    category?: 'work' | 'social' | 'study' | 'general',
    time?: string
  ) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onUpdateTask, onDeleteTask, onAddTask }) => {

  // Filter & Sort states
  const [sortBy] = useState<'created' | 'time' | 'due'>('created');
  const [detailedTask, setDetailedTask] = useState<Task | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Animation state
  const [ripplingTaskId, setRipplingTaskId] = useState<string | null>(null);

  // Date Formatting for Subheader
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handleToggleComplete = (task: Task) => {
    const isCompleting = !task.completedAt;

    if (isCompleting) {
      setRipplingTaskId(task.id);
      setTimeout(() => {
        setRipplingTaskId(null);
        onUpdateTask({
          ...task,
          completedAt: new Date().toISOString(),
        });
      }, 500);
    } else {
      onUpdateTask({
        ...task,
        completedAt: null,
      });
    }
  };



  const isOverdue = (task: Task) => {
    if (task.completedAt || !task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    return due < today;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Filter tasks to only include pending/uncompleted tasks
  const filteredTasks = tasks.filter(task => !task.completedAt);

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'due') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (sortBy === 'time') {
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="widget-card" style={{ flex: 1, height: '100%', position: 'relative' }}>

      {/* Card Title Header */}
      <div className="widget-card-header" style={{ marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ListTodo size={18} style={{ color: '#0084ff' }} />
          <span className="widget-card-title">Day Wise Task Manager</span>
        </div>
        {!detailedTask && !isAddingTask && (
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsAddingTask(true)}
            title="Add Task"
          >
            <Plus size={14} />
            Task
          </Button>
        )}
      </div>

      {/* Sub-Header: Date */}
      {!detailedTask && !isAddingTask && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2px 0 10px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} style={{ color: '#0084ff' }} />
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0084ff' }}>
              {todayFormatted}
            </span>
          </div>
        </div>
      )}

      {/* Task Rows List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 2 }}>
        {isAddingTask ? (
          <AddTaskPanel
            onCancel={() => setIsAddingTask(false)}
            onSave={(title, description, dueDate, category, time) => {
              onAddTask(title, description, dueDate, category, time);
              setIsAddingTask(false);
            }}
          />
        ) : detailedTask ? (
          <TaskDetailPanel
            task={detailedTask}
            onCancel={() => setDetailedTask(null)}
            onDelete={(id) => {
              onDeleteTask(id);
              setDetailedTask(null);
            }}
            onSave={(updatedTask) => {
              onUpdateTask(updatedTask);
              setDetailedTask(null);
            }}
            onToggleComplete={(task) => {
              handleToggleComplete(task);
              setDetailedTask(prev => prev ? {
                ...prev,
                completedAt: prev.completedAt ? null : new Date().toISOString()
              } : null);
            }}
          />
        ) : sortedTasks.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 10px', color: 'var(--text-dim)', gap: '4px' }}>
            <Check size={24} style={{ opacity: 0.3 }} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>No tasks found</span>
            <span style={{ fontSize: '10px' }}>Enjoy your day!</span>
          </div>
        ) : (
          sortedTasks.map(task => {
            const isRippling = ripplingTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`task-row ${task.completedAt ? 'completed' : ''} ${isRippling ? 'ripple-animation' : ''}`}
                onClick={() => setDetailedTask(task)}
                style={{
                  background: 'rgba(255, 255, 255, 0.015)',
                  border: '1px solid rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  marginBottom: '0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                {/* Row 1: Checkbox & Text Content (Title & Description) */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', width: '100%' }}>
                  <div
                    className="task-checkbox-container"
                    style={{ marginTop: '3px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="task-checkbox"
                      checked={!!task.completedAt}
                      onChange={() => handleToggleComplete(task)}
                    />
                  </div>

                  <div className="task-text-container" style={{ flex: 1, minWidth: 0 }}>
                    <span className="task-title" style={{ fontSize: '14.5px', fontWeight: '600', color: 'var(--text-main)', display: 'block' }}>{task.title}</span>
                    {task.description && (
                      <span
                        className="task-desc"
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          display: 'block',
                          marginTop: '2px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {task.description}
                      </span>
                    )}
                  </div>
                </div>

                {/* Row 2: Badges and Action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', borderTop: '1px solid rgba(255, 255, 255, 0.03)', paddingTop: '6px', marginTop: '2px' }}>
                  {/* Left side: Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Due Date Badge */}
                    {task.dueDate && !task.completedAt && (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3.5px',
                          fontSize: '10.5px',
                          color: isOverdue(task) ? 'var(--danger-color)' : 'var(--text-dim)',
                          background: isOverdue(task) ? 'rgba(244, 63, 94, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                          border: isOverdue(task) ? '1px solid rgba(244, 63, 94, 0.15)' : '1px solid rgba(255, 255, 255, 0.04)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        <Calendar size={11} />
                        <span>Due {formatDate(task.dueDate)} {isOverdue(task) && '(Overdue)'}</span>
                      </span>
                    )}

                    {/* Time Badge */}
                    {task.time && (
                      <span className={`time-badge ${isOverdue(task) ? 'overdue' : ''}`} style={{ fontSize: '10.5px', padding: '2px 6px', borderRadius: '4px' }}>
                        {task.time}
                      </span>
                    )}

                    {/* Category Badge */}
                    {task.category && task.category !== 'general' && (
                      <div
                        className={`cat-badge cat-${task.category}`}
                        title={task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                        style={{
                          height: '18px',
                          width: '18px',
                          padding: '0',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'help'
                        }}
                      >
                        {getCategoryIcon(task.category)}
                      </div>
                    )}
                  </div>

                  {/* Right side: Actions */}
                  <div
                    className="task-actions"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="action-btn delete"
                      title="Delete"
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: 'rgba(244,63,94,0.04)',
                        border: '1px solid rgba(244,63,94,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Trash2 size={11} style={{ color: 'var(--danger-color)' }} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Card Footer: Motivation & Mountain Peak Graphics */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px', marginTop: '6px', zIndex: 2 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: '1px solid rgba(0, 132, 255, 0.2)',
          background: 'rgba(0, 132, 255, 0.05)',
          color: '#0084ff',
          flexShrink: 0
        }}>
          <Star size={12} />
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
          Keep going! Small steps every day lead to big results.
        </span>
      </div>


      {/* Mountain Vector Art Background */}
      <svg
        style={{ position: 'absolute', right: 0, bottom: 0, opacity: 0.12, pointerEvents: 'none', zIndex: 1 }}
        width="90"
        height="50"
        viewBox="0 0 90 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 50L22 25L40 40L72 5L90 50H0Z" fill="url(#mountain-grad)" />
        <defs>
          <linearGradient id="mountain-grad" x1="45" y1="5" x2="45" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0084ff" />
            <stop offset="1" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
