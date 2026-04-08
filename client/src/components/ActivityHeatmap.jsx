import { useMemo } from 'react';
import { motion } from 'framer-motion';

// Generate a year's worth of random activity data (for demo)
const generateActivityData = (activityLog = []) => {
  const weeks = 52;
  const days = 7;
  const grid = [];

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - weeks * 7 + 1);

  // Count activity per date
  const counts = {};
  activityLog.forEach((dateStr) => {
    const key = new Date(dateStr).toDateString();
    counts[key] = (counts[key] || 0) + 1;
  });

  // If no real data, generate random demo data
  const hasRealData = activityLog.length > 0;

  for (let w = 0; w < weeks; w++) {
    const week = [];
    for (let d = 0; d < days; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      const key = date.toDateString();

      let count;
      if (hasRealData) {
        count = counts[key] || 0;
      } else {
        // Random demo data with realistic distribution
        const rand = Math.random();
        count = rand < 0.55 ? 0 : rand < 0.75 ? 1 : rand < 0.88 ? 2 : rand < 0.96 ? 3 : 4;
      }

      week.push({ date, count, key });
    }
    grid.push(week);
  }

  return grid;
};

const INTENSITY_COLORS = [
  'rgba(255,255,255,0.04)',   // 0 — empty
  'rgba(124, 58, 237, 0.25)', // 1 — light
  'rgba(124, 58, 237, 0.5)',  // 2 — medium
  'rgba(124, 58, 237, 0.75)', // 3 — dark
  '#7c3aed',                  // 4 — full
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const ActivityHeatmap = ({ activityLog = [], totalContributions }) => {
  const grid = useMemo(() => generateActivityData(activityLog), [activityLog]);

  const totalCount = useMemo(() =>
    grid.flat().reduce((sum, cell) => sum + cell.count, 0),
    [grid]
  );

  // Month labels — find the first week of each month
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    grid.forEach((week, wi) => {
      const month = week[0].date.getMonth();
      if (month !== lastMonth) {
        labels.push({ wi, label: MONTHS[month] });
        lastMonth = month;
      }
    });
    return labels;
  }, [grid]);

  return (
    <div style={{
      background: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      borderRadius: '16px', padding: '1.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Activity</h3>
        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
          {totalContributions ?? totalCount} contributions in the last year
        </span>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 'fit-content' }}>
          {/* Month labels */}
          <div style={{ display: 'flex', gap: '3px', paddingLeft: '24px' }}>
            {grid.map((_, wi) => {
              const label = monthLabels.find(m => m.wi === wi);
              return (
                <div key={wi} style={{
                  width: '12px', fontSize: '0.6rem',
                  color: label ? 'var(--color-text-muted)' : 'transparent',
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  {label ? label.label : '·'}
                </div>
              );
            })}
          </div>

          {/* Grid */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {/* Day labels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '1px' }}>
              {DAY_LABELS.map((d, i) => (
                <div key={i} style={{
                  height: '12px', width: '20px',
                  fontSize: '0.58rem', color: 'var(--color-text-muted)',
                  display: 'flex', alignItems: 'center',
                }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {grid.map((week, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {week.map((cell, di) => (
                  <motion.div
                    key={`${wi}-${di}`}
                    title={`${cell.date.toDateString()}: ${cell.count} contribution${cell.count !== 1 ? 's' : ''}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: (wi * 7 + di) * 0.001, duration: 0.15 }}
                    whileHover={{ scale: 1.6, zIndex: 10 }}
                    style={{
                      width: '12px', height: '12px', borderRadius: '3px',
                      background: INTENSITY_COLORS[Math.min(cell.count, 4)],
                      border: '1px solid rgba(255,255,255,0.04)',
                      cursor: 'default', position: 'relative',
                      transition: 'background 0.2s',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.875rem', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Less</span>
        {INTENSITY_COLORS.map((color, i) => (
          <div key={i} style={{
            width: '11px', height: '11px', borderRadius: '3px',
            background: color, border: '1px solid rgba(255,255,255,0.04)',
          }} />
        ))}
        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>More</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
