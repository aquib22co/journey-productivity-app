import React, { useState } from 'react';
import type { Task } from '../../shared/types';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Calendar, 
  Check, 
  X, 
  ArrowUpDown, 
  MoreHorizontal, 
  MessageCircle, 
  Code, 
  BookOpen, 
  HelpCircle,
  ClipboardList,
  ListTodo,
  Star
} from 'lucide-react';

// Helper to get category icons
const getCategoryIcon = (category?: 'work' | 'social' | 'study' | 'general') => {
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
   AddTaskCard Component (renders the quick-add widget card)
   ========================================================================== */
interface AddTaskCardProps {
  onAddTask: (
    title: string, 
    description?: string, 
    dueDate?: string, 
    category?: 'work' | 'social' | 'study' | 'general', 
    time?: string
  ) => void;
}

export const AddTaskCard: React.FC<AddTaskCardProps> = ({ onAddTask }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newCategory, setNewCategory] = useState<'work' | 'social' | 'study' | 'general'>('general');
  const [showDetails] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let formattedTime: string | undefined = undefined;
    if (newTime) {
      const [hourStr, minStr] = newTime.split(':');
      const hour = parseInt(hourStr);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      formattedTime = `${formattedHour}:${minStr} ${ampm}`;
    }

    onAddTask(
      newTitle, 
      newDesc || undefined, 
      newDueDate || undefined, 
      newCategory, 
      formattedTime
    );

    // Reset fields
    setNewTitle('');
    setNewDesc('');
    setNewDueDate('');
    setNewTime('');
    setNewCategory('general');
  };

  return (
    <div className="widget-card">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Clipboard Icon Indicator */}
          <div className="cat-badge" style={{ background: 'rgba(0, 132, 255, 0.08)', color: '#0084ff', width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0 }}>
            <ClipboardList size={18} />
          </div>

          {/* Borderless Input Field */}
          <input
            type="text"
            className="input-field"
            style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: '0', fontSize: '14px' }}
            placeholder="Add a new task..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          {/* Controls */}
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <button 
              type="submit" 
              className="btn" 
              style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '8px', 
                padding: '0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: '#0084ff' 
              }}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Details Drawer */}
        {showDetails && (
          <div className="settings-group" style={{ padding: '10px', gap: '8px', marginTop: '6px', animation: 'fadeIn 0.15s ease' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Add description..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Due Date</span>
                <input
                  type="date"
                  className="input-field"
                  style={{ padding: '4px 6px', fontSize: '11px' }}
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Time</span>
                <input
                  type="time"
                  className="input-field"
                  style={{ padding: '4px 6px', fontSize: '11px' }}
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
              </div>
            </div>
            
            {/* Category Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
              <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Category Icon</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['general', 'work', 'social', 'study'] as const).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewCategory(cat)}
                    className={`cat-badge cat-${cat}`}
                    style={{
                      flex: 1,
                      border: newCategory === cat ? '1px solid var(--accent-color)' : '1px solid transparent',
                      cursor: 'pointer',
                      padding: '4px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      borderRadius: '6px'
                    }}
                  >
                    {getCategoryIcon(cat)}
                    <span style={{ fontSize: '9.5px', textTransform: 'capitalize' }}>{cat === 'general' ? 'None' : cat}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

/* ==========================================================================
   TaskList Component (renders the task list manager panel)
   ========================================================================== */
interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onUpdateTask, onDeleteTask }) => {
  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editCategory, setEditCategory] = useState<'work' | 'social' | 'study' | 'general'>('general');

  // Filter & Sort states
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [sortBy, setSortBy] = useState<'created' | 'time' | 'due'>('created');
  
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

  const handleStartEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditDueDate(task.dueDate || '');
    setEditCategory(task.category || 'general');
    
    if (task.time) {
      const match = task.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = match[2];
        const ampm = match[3].toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        setEditTime(`${String(hours).padStart(2, '0')}:${minutes}`);
      } else {
        setEditTime('');
      }
    } else {
      setEditTime('');
    }
  };

  const handleSaveEdit = (task: Task) => {
    if (!editTitle.trim()) return;

    let formattedTime: string | undefined = undefined;
    if (editTime) {
      const [hourStr, minStr] = editTime.split(':');
      const hour = parseInt(hourStr);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      formattedTime = `${formattedHour}:${minStr} ${ampm}`;
    }

    onUpdateTask({
      ...task,
      title: editTitle,
      description: editDesc || undefined,
      dueDate: editDueDate || undefined,
      category: editCategory,
      time: formattedTime,
    });
    setEditingId(null);
  };

  const toggleSort = () => {
    if (sortBy === 'created') setSortBy('time');
    else if (sortBy === 'time') setSortBy('due');
    else setSortBy('created');
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

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completedAt;
    if (filter === 'completed') return !!task.completedAt;
    return true; // all
  });

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
        <div className="widget-card-actions">
          <button 
            type="button" 
            className="win-btn" 
            onClick={toggleSort} 
            title={`Sorting by: ${sortBy}. Click to change.`}
            style={{ width: '24px', height: '24px' }}
          >
            <ArrowUpDown size={13} />
          </button>
          <button 
            type="button" 
            className="win-btn" 
            style={{ width: '24px', height: '24px' }}
            title="More actions"
            onClick={() => alert("Journey Widget v1.3.0\nLocal database persistence active.")}
          >
            <MoreHorizontal size={13} />
          </button>
        </div>
      </div>

      {/* Sub-Header: Date & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2px 0 10px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} style={{ color: '#0084ff' }} />
          <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0084ff' }}>
            {todayFormatted}
          </span>
        </div>
        <div className="filter-pills">
          <button 
            type="button" 
            onClick={() => setFilter('all')} 
            className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
          >
            All
          </button>
          <button 
            type="button" 
            onClick={() => setFilter('pending')} 
            className={`filter-pill ${filter === 'pending' ? 'active' : ''}`}
          >
            Pending
          </button>
          <button 
            type="button" 
            onClick={() => setFilter('completed')} 
            className={`filter-pill ${filter === 'completed' ? 'active' : ''}`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Task Rows List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 2 }}>
        {sortedTasks.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 10px', color: 'var(--text-dim)', gap: '4px' }}>
            <Check size={24} style={{ opacity: 0.3 }} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>No tasks found</span>
            <span style={{ fontSize: '10px' }}>Filter: {filter}</span>
          </div>
        ) : (
          sortedTasks.map(task => {
            const editing = editingId === task.id;
            const isRippling = ripplingTaskId === task.id;

            return (
              <div 
                key={task.id} 
                className={`task-row ${task.completedAt ? 'completed' : ''} ${isRippling ? 'ripple-animation' : ''}`}
                style={{
                  background: 'rgba(255, 255, 255, 0.015)',
                  border: '1px solid rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  marginBottom: '0'
                }}
              >
                {/* Left Side: Checkbox & Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                  <div className="task-checkbox-container">
                    <input
                      type="checkbox"
                      className="task-checkbox"
                      checked={!!task.completedAt}
                      onChange={() => handleToggleComplete(task)}
                    />
                  </div>

                  <div className="task-text-container">
                    {editing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', padding: '4px 0' }}>
                        <input
                          type="text"
                          className="input-field"
                          style={{ padding: '3px 6px', fontSize: '12px' }}
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                        />
                        <input
                          type="text"
                          className="input-field"
                          style={{ padding: '3px 6px', fontSize: '11px' }}
                          placeholder="Description..."
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                          <input
                            type="date"
                            className="input-field"
                            style={{ padding: '2px 4px', fontSize: '10.5px' }}
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                          />
                          <input
                            type="time"
                            className="input-field"
                            style={{ padding: '2px 4px', fontSize: '10.5px' }}
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                          {(['general', 'work', 'social', 'study'] as const).map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setEditCategory(cat)}
                              className={`cat-badge cat-${cat}`}
                              style={{
                                flex: 1,
                                border: editCategory === cat ? '1px solid var(--accent-color)' : '1px solid transparent',
                                padding: '2px',
                                height: '20px',
                                borderRadius: '4px'
                              }}
                            >
                              {getCategoryIcon(cat)}
                            </button>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '4px', alignSelf: 'flex-end', marginTop: '2px' }}>
                          <button onClick={() => handleSaveEdit(task)} className="btn" style={{ padding: '3px 8px', fontSize: '11px' }}>
                            <Check size={11} /> Save
                          </button>
                          <button onClick={() => setEditingId(null)} className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '11px' }}>
                            <X size={11} /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="task-title">{task.title}</span>
                        {task.description && <span className="task-desc">{task.description}</span>}
                        {task.dueDate && !task.completedAt && (
                          <span 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '3px', 
                              fontSize: '10px',
                              color: isOverdue(task) ? 'var(--danger-color)' : 'var(--text-dim)',
                              marginTop: '1px'
                            }}
                          >
                            <Calendar size={10} />
                            Due {formatDate(task.dueDate)} {isOverdue(task) && '(Overdue)'}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Right Side: Category Badge, Time Badge, Actions */}
                {!editing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    
                    {/* Category Icon */}
                    {task.category && task.category !== 'general' && (
                      <div className={`cat-badge cat-${task.category}`}>
                        {getCategoryIcon(task.category)}
                      </div>
                    )}

                    {/* Time Badge */}
                    {task.time && (
                      <span className={`time-badge ${isOverdue(task) ? 'overdue' : ''}`}>
                        {task.time}
                      </span>
                    )}

                    {/* Action hover buttons */}
                    <div className="task-actions" style={{ marginLeft: '4px' }}>
                      <button 
                        onClick={() => handleStartEdit(task)} 
                        className="action-btn" 
                        title="Edit" 
                        style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.04)' 
                        }}
                      >
                        <Edit2 size={11} style={{ color: 'var(--text-muted)' }} />
                      </button>
                      <button 
                        onClick={() => onDeleteTask(task.id)} 
                        className="action-btn delete" 
                        title="Delete" 
                        style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '6px',
                          background: 'rgba(244,63,94,0.04)',
                          border: '1px solid rgba(244,63,94,0.1)' 
                        }}
                      >
                        <Trash2 size={11} style={{ color: 'var(--danger-color)' }} />
                      </button>
                    </div>

                  </div>
                )}

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
