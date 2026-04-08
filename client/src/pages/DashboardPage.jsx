import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RiFlashlightLine, RiCalendarEventLine, RiTrophyLine,
  RiGithubFill, RiLinkedinBoxFill, RiEdit2Line,
  RiStarLine, RiTimeLine,
} from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import ActivityHeatmap from '../components/ActivityHeatmap';
import api from '../api/axios';

// ── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, sublabel }) => (
  <motion.div
    whileHover={{ y: -3, boxShadow: `0 12px 30px ${color}25` }}
    style={{
      background: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      borderRadius: '16px', padding: '1.25rem 1.5rem',
      display: 'flex', flexDirection: 'column', gap: '0.5rem',
      transition: 'transform 0.2s, box-shadow 0.2s',
      position: 'relative', overflow: 'hidden',
    }}
  >
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
      background: `linear-gradient(90deg, ${color}, transparent)`,
    }} />
    <div style={{
      width: '40px', height: '40px', borderRadius: '12px',
      background: `${color}18`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{label}</div>
      {sublabel && <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>{sublabel}</div>}
    </div>
  </motion.div>
);

// ── Recent Activity Item ───────────────────────────────────────────────────
const ActivityItem = ({ icon, text, time, color }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
    padding: '0.75rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  }}>
    <div style={{
      width: '34px', height: '34px', borderRadius: '10px',
      background: `${color}18`, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{text}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <RiTimeLine size={11} /> {time}
      </div>
    </div>
  </div>
);

// ── Main Dashboard Page ────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ challenges: 0, events: 0, score: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // These routes will exist after Phase 5 & 6 are built
        const [challengesRes, eventsRes] = await Promise.allSettled([
          api.get('/challenges/my'),
          api.get('/events/my'),
        ]);

        const challenges = challengesRes.status === 'fulfilled' ? challengesRes.value.data.count || 0 : 2;
        const events = eventsRes.status === 'fulfilled' ? eventsRes.value.data.count || 0 : 3;
        setStats({ challenges, events, score: challenges * 120 + events * 50 });
      } catch {
        setStats({ challenges: 2, events: 3, score: 390 }); // demo fallback
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const techColors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3178c6'];

  const recentActivities = [
    { icon: <RiFlashlightLine size={16} />, text: 'Submitted solution for "Binary Tree Traversal"', time: '2 hours ago', color: '#7c3aed' },
    { icon: <RiCalendarEventLine size={16} />, text: 'Registered for Hackathon 2025', time: 'Yesterday', color: '#06b6d4' },
    { icon: <RiStarLine size={16} />, text: 'Starred project "AI Study Planner"', time: '3 days ago', color: '#f59e0b' },
    { icon: <RiTrophyLine size={16} />, text: 'Moved to #4 on the leaderboard', time: '1 week ago', color: '#10b981' },
  ];

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ maxWidth: '1100px' }}>
      {/* Page Header */}
      <motion.div variants={itemVariants} style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Welcome back, {user?.name?.split(' ')[0] || 'Member'} 👋
        </p>
      </motion.div>

      {/* Profile Header Card */}
      <motion.div variants={itemVariants} style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '20px', padding: '1.75rem',
        marginBottom: '1.5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '90px',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))',
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.25rem', position: 'relative', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', fontWeight: 800, color: '#fff',
            border: '4px solid var(--color-bg-card)',
            flexShrink: 0,
          }}>
            {user?.avatar
              ? <img src={user.avatar} alt="" style={{ width: '100%', borderRadius: '50%' }} />
              : user?.name?.charAt(0).toUpperCase() || 'U'
            }
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{user?.name}</h2>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.7rem',
                borderRadius: '100px', textTransform: 'capitalize', letterSpacing: '0.05em',
                background: user?.role === 'admin' ? 'rgba(245,158,11,0.15)' : 'rgba(124,58,237,0.15)',
                border: user?.role === 'admin' ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(124,58,237,0.4)',
                color: user?.role === 'admin' ? '#f59e0b' : 'var(--color-accent-primary)',
              }}>
                {user?.role}
              </span>
            </div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '0.875rem' }}>
              {user?.email}
            </div>

            {/* Tech Stack Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {(user?.techStack?.length ? user.techStack : ['React', 'Node.js', 'MongoDB', 'Python']).map((tech, i) => (
                <span key={tech} style={{
                  fontSize: '0.72rem', fontWeight: 600, padding: '0.25rem 0.7rem',
                  borderRadius: '100px',
                  background: `${techColors[i % techColors.length]}18`,
                  border: `1px solid ${techColors[i % techColors.length]}35`,
                  color: techColors[i % techColors.length],
                }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {user?.githubUrl && (
              <a href={user.githubUrl} target="_blank" rel="noreferrer" style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-text-secondary)', textDecoration: 'none',
              }}>
                <RiGithubFill size={18} />
              </a>
            )}
            {user?.linkedinUrl && (
              <a href={user.linkedinUrl} target="_blank" rel="noreferrer" style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#0A66C2', textDecoration: 'none',
              }}>
                <RiLinkedinBoxFill size={18} />
              </a>
            )}
            <button style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0 0.875rem', height: '36px',
              background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: '10px', color: 'var(--color-accent-primary)',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            }}>
              <RiEdit2Line size={14} /> Edit Profile
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={itemVariants} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem', marginBottom: '1.5rem',
      }}>
        <StatCard
          icon={<RiFlashlightLine size={20} />}
          label="Active Challenges"
          value={stats.challenges}
          color="#7c3aed"
          sublabel="2 due this week"
        />
        <StatCard
          icon={<RiCalendarEventLine size={20} />}
          label="Joined Events"
          value={stats.events}
          color="#06b6d4"
          sublabel="1 upcoming"
        />
        <StatCard
          icon={<RiTrophyLine size={20} />}
          label="Total Score"
          value={stats.score.toLocaleString()}
          color="#f59e0b"
          sublabel="Rank #12 globally"
        />
      </motion.div>

      {/* Activity Heatmap */}
      <motion.div variants={itemVariants} style={{ marginBottom: '1.5rem' }}>
        <ActivityHeatmap activityLog={user?.activityLog || []} />
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants} style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px', padding: '1.5rem',
      }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>Recent Activity</h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Your latest interactions</p>
        {recentActivities.map((item, i) => (
          <ActivityItem key={i} {...item} />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
