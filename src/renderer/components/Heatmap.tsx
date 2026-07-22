import React, { useState, useEffect, useRef } from 'react';
import type { Task, Settings } from '../../shared/types';

interface HeatmapProps {
  tasks: Task[];
  settings: Settings;
  onCellClick?: (dateStr: string) => void;
}

export const Heatmap: React.FC<HeatmapProps> = ({ tasks, settings, onCellClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCell, setHoveredCell] = useState<{
    dateStr: string;
    count: number;
    x: number;
    y: number;
    direction: 'left' | 'right';
    completedTasks: string[];
  } | null>(null);

  // Scroll to the right on mount so the most recent contribution cells are visible
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, []);

  // Compute date array starting from January 1st of the current year to the Saturday of the current week
  const today = new Date();
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Pad the grid to the end of the current week (Saturday) for a complete rectangle
  const endDay = endDate.getDay();
  endDate.setDate(endDate.getDate() + (6 - endDay)); // 6 is Saturday

  const startDate = new Date(today.getFullYear(), 0, 1); // January 1st of current year
  const startDay = startDate.getDay(); // 0 is Sunday
  // Align start date to Sunday of that week
  startDate.setDate(startDate.getDate() - startDay);

  const days: Date[] = [];
  const curr = new Date(startDate);
  while (curr <= endDate) {
    days.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
  }

  // Aggregate completion counts and task titles by YYYY-MM-DD
  const completionsByDate: Record<string, number> = {};
  const completedTasksByDate: Record<string, string[]> = {};

  tasks.forEach((task) => {
    if (task.completedAt) {
      const d = new Date(task.completedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      completionsByDate[key] = (completionsByDate[key] || 0) + 1;

      if (!completedTasksByDate[key]) {
        completedTasksByDate[key] = [];
      }
      completedTasksByDate[key].push(task.title);
    }
  });

  // Helper to resolve completion counts into colors based on configured thresholds
  const getLevel = (count: number) => {
    if (count === 0) return 0;
    const { low, medium, high } = settings.heatmapThresholds || { low: 1, medium: 3, high: 5 };
    if (count <= low) return 1;
    if (count <= medium) return 2;
    if (count <= high) return 3;
    return 4;
  };

  const handleCellMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    date: Date,
    count: number,
    idx: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cardRect = e.currentTarget.closest('.widget-card')?.getBoundingClientRect();

    if (cardRect) {
      // Determine tooltip offset direction based on cell column index
      const colIndex = Math.floor(idx / 7);
      const totalCols = Math.ceil(days.length / 7);
      const direction = colIndex < totalCols / 2 ? 'right' : 'left';

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const completedTasks = completedTasksByDate[key] || [];

      setHoveredCell({
        dateStr: date.toLocaleDateString(undefined, {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        count,
        x: rect.left - cardRect.left + rect.width / 2, // Relative to the main card component
        y: rect.top - cardRect.top, // Relative to the main card component
        direction,
        completedTasks,
      });
    }
  };

  // Generate Month headers (determine which columns start a month)
  const renderMonthHeaders = () => {
    const monthHeaders: { label: string; index: number }[] = [];
    let lastMonth = -1;

    // Check month of each Sunday (column starters)
    for (let i = 0; i < days.length; i += 7) {
      const date = days[i];

      // Fix: Skip months of the previous year to avoid clashing overlap at the start of the year (e.g. Dec/Jan labels)
      if (date.getFullYear() !== today.getFullYear()) {
        continue;
      }

      const month = date.getMonth();
      if (month !== lastMonth) {
        monthHeaders.push({
          label: date.toLocaleDateString(undefined, { month: 'short' }),
          index: i / 7,
        });
        lastMonth = month;
      }
    }

    return (
      <div style={{ position: 'relative', height: '18px', marginBottom: '6px', fontSize: '11.5px', color: 'var(--text-dim)', fontWeight: '500' }}>
        {monthHeaders.map((header, idx) => (
          <span
            key={idx}
            style={{
              position: 'absolute',
              left: `${header.index * 19}px`, // 15px cell width + 4px gap
              whiteSpace: 'nowrap',
            }}
          >
            {header.label}
          </span>
        ))}
      </div>
    );
  };

  const realToday = new Date();

  return (
    <div className="widget-card" style={{ position: 'relative', flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px 22px' }}>
      <div className="widget-card-header" style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="widget-card-title" style={{ fontSize: '16.5px', fontWeight: '700' }}>Your Journey</span>
        
        {/* Less/More Legend in Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', userSelect: 'none' }}>
          <span>Less</span>
          <div style={{ display: 'flex', gap: '3px' }}>
            <div style={{ width: '11px', height: '11px', borderRadius: '2px', backgroundColor: 'var(--hm-level-0)' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '2px', backgroundColor: 'var(--hm-level-1)' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '2px', backgroundColor: 'var(--hm-level-2)' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '2px', backgroundColor: 'var(--hm-level-3)' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '2px', backgroundColor: 'var(--hm-level-4)' }} />
          </div>
          <span>More</span>
        </div>
      </div>

      <div
        ref={containerRef}
        style={{
          position: 'relative',
          overflowX: 'auto',
          paddingBottom: '4px',
          userSelect: 'none',
        }}
        className="no-drag"
      >
        <div style={{ minWidth: `${Math.ceil(days.length / 7) * 19}px` }}>
          {/* Months Row */}
          <div style={{ paddingLeft: '0px' }}>
            {renderMonthHeaders()}
          </div>

          {/* Grid (No Day Labels) */}
          <div style={{ display: 'flex' }}>
            {/* Grid Cells */}
            <div
              style={{
                display: 'grid',
                gridTemplateRows: 'repeat(7, 15px)',
                gridAutoFlow: 'column',
                gap: '4px',
              }}
            >
              {days.map((date, idx) => {
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                const count = completionsByDate[key] || 0;
                const level = getLevel(count);
                const isFuture = date > realToday;

                return (
                  <div
                    key={idx}
                    style={{
                      width: '15px',
                      height: '15px',
                      borderRadius: '3.5px',
                      backgroundColor: `var(--hm-level-${level})`,
                      transition: 'transform 0.15s ease, filter 0.15s ease',
                      opacity: isFuture ? 0.25 : 1,
                      cursor: isFuture ? 'default' : 'pointer',
                    }}
                    className={isFuture ? '' : 'hm-cell'}
                    onMouseEnter={(e) => {
                      if (isFuture) return;
                      handleCellMouseEnter(e, date, count, idx);
                    }}
                    onMouseLeave={() => setHoveredCell(null)}
                    onClick={() => {
                      if (isFuture) return;
                      onCellClick?.(key);
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>



      {/* Tooltip Card (Rendered outside the scroll container to prevent boundary clipping) */}
      {hoveredCell && (
        <div
          style={{
            position: 'absolute',
            left: hoveredCell.direction === 'right'
              ? `${hoveredCell.x + 12}px`
              : `${hoveredCell.x - 12}px`,
            top: `${hoveredCell.y + 7.5}px`, // Center vertically aligned
            transform: hoveredCell.direction === 'right'
              ? 'translate(0, -50%)'
              : 'translate(-100%, -50%)',
            padding: '10px 14px',
            minWidth: '185px',
            maxWidth: '260px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            backgroundColor: 'rgba(13, 17, 28, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            zIndex: '9999',
            pointerEvents: 'none', // Prevent cursor flicker
          }}
        >
          <div style={{ fontWeight: '600', fontSize: '11.5px', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', width: '100%', gap: '8px' }}>
            <span>{hoveredCell.count} completed</span>
            <span style={{ color: 'var(--accent-color)' }}>{hoveredCell.dateStr.split(',')[0]}</span>
          </div>

          <div style={{ color: 'var(--text-dim)', fontSize: '9.5px', marginBottom: '2px' }}>
            {hoveredCell.dateStr}
          </div>

          {hoveredCell.completedTasks.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              marginTop: '6px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '6px',
              width: '100%'
            }}>
              {hoveredCell.completedTasks.map((title, i) => (
                <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '11px', color: 'var(--text-main)', lineHeight: '1.2' }}>
                  <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>•</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={title}>
                    {title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Embedded cell scale-up styling */}
      <style>{`
        .hm-cell:hover {
          transform: scale(1.15);
          filter: brightness(1.2);
          z-index: 10;
        }
      `}</style>
    </div>
  );
};
