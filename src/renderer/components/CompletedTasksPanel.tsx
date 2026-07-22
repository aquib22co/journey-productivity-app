import React, { useState } from 'react';
import type { Task } from '../../shared/types';
import { DatePicker } from './DatePicker';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  ChevronLeft,
  History,
  CheckCircle2,
  CalendarCheck,
  Tag,
  Check,
  Clock,
  ChevronRight,
  Puzzle,
  ArrowLeftRight,
  FileText,
  HelpCircle,
  Filter
} from 'lucide-react';

interface CompletedTasksPanelProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  showFilter: boolean;
  onShowFilterChange: (show: boolean) => void;
}

export const getLocalDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getSevenDaysAgoString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return getLocalDateString(d);
};

// Custom category icons for history cards
const getHistoryCategoryIcon = (category?: 'work' | 'social' | 'study' | 'general') => {
  switch (category) {
    case 'work':
      return <FileText size={15} />;
    case 'social':
      return <Puzzle size={15} />;
    case 'study':
      return <ArrowLeftRight size={15} />;
    default:
      return <HelpCircle size={15} />;
  }
};

// Custom category color styles matching the image design system
const getCategoryStyles = (category?: 'work' | 'social' | 'study' | 'general') => {
  switch (category) {
    case 'work':
      return {
        border: '1px solid rgba(0, 132, 255, 0.15)',
        background: 'rgba(0, 132, 255, 0.04)',
        color: '#0084ff'
      };
    case 'social':
      return {
        border: '1px solid rgba(168, 85, 247, 0.15)',
        background: 'rgba(168, 85, 247, 0.04)',
        color: '#a855f7'
      };
    case 'study':
      return {
        border: '1px solid rgba(249, 115, 22, 0.15)',
        background: 'rgba(249, 115, 22, 0.04)',
        color: '#f97316'
      };
    default:
      return {
        border: '1px solid rgba(148, 163, 184, 0.15)',
        background: 'rgba(148, 163, 184, 0.04)',
        color: '#94a3b8'
      };
  }
};

export const CompletedTasksPanel: React.FC<CompletedTasksPanelProps> = ({
  tasks,
  onUpdateTask,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  showFilter,
  onShowFilterChange
}) => {
  const [detailedTask, setDetailedTask] = useState<Task | null>(null);

  // Helper to format date display (e.g. "Jul 7, 2026")
  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helper to format completed timestamp (e.g. "Jul 7, 2026 at 4:32 PM")
  const formatTimestampDisplay = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Filter tasks that are completed and match the date filters
  const completedTasks = tasks.filter(task => {
    if (!task.completedAt) return false;
    const completedDateStr = getLocalDateString(new Date(task.completedAt));
    return completedDateStr >= startDate && completedDateStr <= endDate;
  });

  // Sort by completed date descending (most recent first)
  const sortedCompletedTasks = [...completedTasks].sort((a, b) => {
    if (!a.completedAt) return 1;
    if (!b.completedAt) return -1;
    return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
  });

  const subtitleText = sortedCompletedTasks.length > 0
    ? "All your activities are completed. Great job! "
    : "No activities completed for this period.";

  return (
    <div className="widget-card" style={{ flex: 1, height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px 18px' }}>

      {/* Header */}
      {!detailedTask && (
        <div className="widget-card-header" style={{ marginBottom: '0px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Circular Icon block */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(0, 132, 255, 0.2), rgba(0, 70, 255, 0.4))',
              border: '1px solid rgba(0, 132, 255, 0.3)',
              color: '#0084ff',
              flexShrink: 0
            }}>
              <History size={14} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span className="widget-card-title" style={{ fontSize: '14px', fontWeight: '700', lineHeight: 1.2 }}>Activity History</span>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{subtitleText}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onShowFilterChange(!showFilter)}
            className={`win-btn ${showFilter ? 'active' : ''}`}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: showFilter ? 'rgba(0, 132, 255, 0.15)' : 'rgba(255, 255, 255, 0.02)',
              color: showFilter ? 'var(--accent-color)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Filter by Date Range"
          >
            <Filter size={13} />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {detailedTask ? (
          /* Detailed Task View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', animation: 'fadeIn 0.15s ease' }}>
            {/* Detailed Header / Back Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
              <button
                type="button"
                onClick={() => setDetailedTask(null)}
                className="win-btn"
                style={{
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
                title="Back to list"
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Task Details</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onUpdateTask({
                    ...detailedTask,
                    completedAt: null
                  });
                  setDetailedTask(null);
                }}
                style={{
                  marginLeft: 'auto',
                  borderColor: 'rgba(244, 63, 94, 0.2)',
                  color: '#f43f5e',
                  background: 'rgba(244, 63, 94, 0.04)',
                  padding: '2px 8px',
                  height: '24px',
                  fontSize: '10.5px'
                }}
              >
                Mark Pending
              </Button>
            </div>

            {/* Task Information */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '2px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', wordBreak: 'break-word', lineHeight: '1.3' }}>
                  {detailedTask.title}
                </h3>
              </div>

              {/* Badges Info Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px' }}>
                {/* Completed Date Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px' }}>
                  <CalendarCheck size={13} style={{ color: 'var(--success-color)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-muted)' }}>Completed:</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{formatTimestampDisplay(detailedTask.completedAt || undefined)}</span>
                </div>

                {/* Category Row */}
                {detailedTask.category && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px' }}>
                    <Tag size={13} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-muted)' }}>Category:</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textTransform: 'capitalize', color: 'var(--text-main)', fontWeight: 500 }}>
                      <span className={`cat-badge cat-${detailedTask.category}`} style={{ width: '16px', height: '16px', borderRadius: '4px' }}>
                        {getHistoryCategoryIcon(detailedTask.category)}
                      </span>
                      {detailedTask.category}
                    </span>
                  </div>
                )}

                {/* Due Date Row */}
                {detailedTask.dueDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px' }}>
                    <Calendar size={13} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-muted)' }}>Due Date:</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                      {formatDateDisplay(detailedTask.dueDate)} {detailedTask.time && `at ${detailedTask.time}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Description Card */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</span>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-main)',
                  background: 'rgba(255,255,255,0.015)',
                  border: '1px solid rgba(255,255,255,0.03)',
                  padding: '10px',
                  borderRadius: '6px',
                  minHeight: '60px',
                  lineHeight: '1.45',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}>
                  {detailedTask.description || <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>No description provided.</span>}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Normal List View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
            {/* Filter Mode Selector & Pickers Row */}
            {showFilter && (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px', animation: 'fadeIn 0.15s ease' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 600 }}>Start Date</span>
                  <DatePicker
                    value={startDate}
                    onChange={(val) => onStartDateChange(val || getSevenDaysAgoString())}
                    placeholder="From..."
                  />
                </div>
                <span style={{ color: 'var(--text-dim)', fontSize: '11px', marginTop: '14px' }}>to</span>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 600 }}>End Date</span>
                  <DatePicker
                    value={endDate}
                    onChange={(val) => onEndDateChange(val || getLocalDateString(new Date()))}
                    placeholder="To..."
                  />
                </div>
              </div>
            )}

            {/* Completed Tasks List Viewport with Timeline */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '2px', position: 'relative' }}>
              {sortedCompletedTasks.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 10px', color: 'var(--text-dim)', gap: '4px', textAlign: 'center', margin: 'auto' }}>
                  <CheckCircle2 size={24} style={{ opacity: 0.3 }} />
                  <span style={{ fontSize: '11px', fontWeight: 600 }}>No completed tasks</span>
                  <span style={{ fontSize: '9px' }}>Try selecting a different date filter</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
                  {sortedCompletedTasks.map((task, index) => {
                    const catStyles = getCategoryStyles(task.category);
                    return (
                      <div key={task.id} style={{ display: 'flex', gap: '16px', alignItems: 'center', position: 'relative' }}>

                        {/* Timeline Node Column */}
                        <div style={{ width: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch', position: 'relative', flexShrink: 0 }}>
                          {/* Timeline vertical line segment */}
                          <div style={{
                            position: 'absolute',
                            top: index === 0 ? '50%' : 0,
                            bottom: index === sortedCompletedTasks.length - 1 ? '50%' : 0,
                            width: '2px',
                            backgroundColor: 'rgba(16, 185, 129, 0.2)',
                            zIndex: 1
                          }} />
                          {/* Checkmark circle node */}
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            border: '2px solid rgba(16, 185, 129, 0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                            color: 'rgb(16, 185, 129)',
                            marginTop: 'auto',
                            marginBottom: 'auto'
                          }}>
                            <Check size={11} strokeWidth={3.5} />
                          </div>
                        </div>

                        {/* Task Item Card */}
                        <div
                          onClick={() => setDetailedTask(task)}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            background: 'rgba(255, 255, 255, 0.015)',
                            border: '1px solid rgba(255, 255, 255, 0.03)',
                            borderRadius: '10px',
                            padding: '12px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          className="task-row-history-card"
                        >
                          {/* Category Box */}
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            ...catStyles
                          }}>
                            {getHistoryCategoryIcon(task.category)}
                          </div>

                          {/* Title & Metadata */}
                          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ display: 'block', fontSize: '13.5px', fontWeight: '600', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {task.title}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-dim)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={11} />
                                <span>{formatDateDisplay(task.completedAt || undefined)}</span>
                              </div>
                              <span>•</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={11} />
                                <span>{task.completedAt ? new Date(task.completedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : ''}</span>
                              </div>
                            </div>
                          </div>

                          {/* Arrow Chevron Button */}
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            background: 'rgba(255, 255, 255, 0.01)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#10b981',
                            flexShrink: 0
                          }}>
                            <ChevronRight size={14} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Hover effects */}
      <style>{`
        .task-row-history-card:hover {
          background: rgba(255, 255, 255, 0.03) !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};
