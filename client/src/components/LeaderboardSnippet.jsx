import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { RiTrophyLine, RiMedalLine, RiArrowRightLine } from 'react-icons/ri';
import api from '../api/axios';

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32', '#7c3aed', '#06b6d4'];

const STATIC_LEADERBOARD = [
  { _id: '1', name: 'Aryan Mehta', score: 2480, avatar: null, techStack: ['React', 'Node.js'] },
  { _id: '2', name: 'Priya Sharma', score: 2350, avatar: null, techStack: ['Python', 'ML'] },
  { _id: '3', name: 'Rohit Verma', score: 2200, avatar: null, techStack: ['Flutter', 'Firebase'] },
  { _id: '4', name: 'Sneha Patel', score: 1980, avatar: null, techStack: ['Vue.js', 'TypeScript'] },
  { _id: '5', name: 'Dev Kapoor', score: 1870, avatar: null, techStack: ['Go', 'Docker'] },
];

const rankBadge = (rank) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
};

const LeaderboardSnippet = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [leaders, setLeaders] = useState(STATIC_LEADERBOARD);

  useEffect(() => {
    api.get('/leaderboard?limit=5')
      .then(({ data }) => { if (data.leaderboard?.length) setLeaders(data.leaderboard); })
      .catch(() => {});
  }, []);

  return (
    <section id="leaderboard" ref={ref} style={{ padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '2.5rem' }}
        >
          <p className="section-label" style={{ marginBottom: '0.5rem' }}>🏆 Top Performers</p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
            Global <span className="gradient-text">Leaderboard</span>
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            Updated in real-time as challenges are scored.
          </p>
        </motion.div>

        {/* Leaderboard Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 0 60px rgba(124,58,237,0.1)',
          }}
        >
          {/* Podium top bar */}
          <div style={{
            padding: '1.25rem 1.75rem',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.08))',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <RiTrophyLine size={18} color="#FFD700" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Top 5 This Month</span>
            <span style={{
              marginLeft: 'auto', fontSize: '0.75rem',
              background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)',
              color: '#06b6d4', borderRadius: '100px', padding: '0.2rem 0.6rem',
              fontWeight: 600,
            }}>
              Live
            </span>
          </div>

          {/* Rows */}
          {leaders.map((user, i) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.75rem',
                borderBottom: i < leaders.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                background: i === 0 ? 'rgba(255,215,0,0.03)' : 'transparent',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = i === 0 ? 'rgba(255,215,0,0.03)' : 'transparent'; }}
            >
              {/* Rank */}
              <div style={{
                width: '36px', textAlign: 'center',
                fontSize: i < 3 ? '1.3rem' : '0.95rem',
                fontWeight: 800,
                color: i < 3 ? MEDAL_COLORS[i] : 'var(--color-text-muted)',
              }}>
                {rankBadge(i + 1)}
              </div>

              {/* Avatar */}
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${MEDAL_COLORS[i % 5]}, ${MEDAL_COLORS[(i + 2) % 5]})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                boxShadow: i === 0 ? '0 0 12px rgba(255,215,0,0.3)' : 'none',
              }}>
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} style={{ width: '100%', borderRadius: '50%' }} />
                  : user.name.charAt(0).toUpperCase()
                }
              </div>

              {/* Name + Tech */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                  {user.techStack?.slice(0, 2).join(' · ')}
                </div>
              </div>

              {/* Score */}
              <div style={{
                fontWeight: 800, fontSize: '1rem',
                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {user.score.toLocaleString()}
                <span style={{ fontSize: '0.65rem', fontWeight: 500, WebkitTextFillColor: 'var(--color-text-muted)', marginLeft: '2px' }}> pts</span>
              </div>
            </motion.div>
          ))}

          {/* View Full Link */}
          <div style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center',
          }}>
            <a href="/leaderboard" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              color: 'var(--color-accent-primary)', textDecoration: 'none',
              fontSize: '0.85rem', fontWeight: 600,
            }}>
              View Full Leaderboard <RiArrowRightLine size={15} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LeaderboardSnippet;
