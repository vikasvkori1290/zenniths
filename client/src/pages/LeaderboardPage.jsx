import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiTrophyLine, RiMedalLine, RiFireLine } from 'react-icons/ri';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    fetchLeaderboard();

    if (socket) {
      socket.on('leaderboard_update', (data) => {
        setLeaderboard(data); // Real-time update triggered by admin grading
      });
      return () => socket.off('leaderboard_update');
    }
  }, [socket]);

  const fetchLeaderboard = async () => {
    try {
      const { data } = await api.get('/challenges/leaderboard');
      if (data.success) setLeaderboard(data.leaderboard);
    } catch (err) {
      console.error('Failed to fetch leaderboard', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
           style={{ display: 'inline-flex', padding: '1.5rem', background: 'rgba(245,158,11,0.1)', borderRadius: '50%', marginBottom: '1rem' }}
        >
          <RiTrophyLine size={48} color="#f59e0b" />
        </motion.div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Global Leaderboard
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <RiFireLine color="#ef4444" /> Live rankings based on completed challenges
        </p>
      </div>

      <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '24px', overflow: 'hidden' }}>
        {/* Header Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 150px', padding: '1.25rem 2rem', background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <div>Rank</div>
          <div>Hacker</div>
          <div style={{ textAlign: 'right' }}>Score</div>
        </div>

        {/* Rows */}
        {loading ? (
           <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Calculating ranks...</div>
        ) : leaderboard.length > 0 ? (
          <AnimatePresence>
            {leaderboard.map((user, index) => (
              <motion.div
                key={user._id}
                layout
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                style={{
                  display: 'grid', gridTemplateColumns: '80px 1fr 150px', alignItems: 'center',
                  padding: '1.25rem 2rem', borderBottom: '1px solid var(--color-border)',
                  background: index < 3 ? `linear-gradient(90deg, ${MEDAL_COLORS[index]}15, transparent)` : 'transparent',
                }}
              >
                {/* Rank */}
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: index < 3 ? MEDAL_COLORS[index] : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {index < 3 ? <RiMedalLine size={24} /> : `#${index + 1}`}
                </div>

                {/* Hacker Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  {/* Avatar */}
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.2rem', overflow: 'hidden' }}>
                    {user.avatar ? <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>{user.name}</h3>
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                       {user.techStack?.slice(0, 3).map(tech => (
                         <span key={tech} style={{ fontSize: '0.65rem', background: 'var(--color-bg-secondary)', padding: '0.1rem 0.4rem', borderRadius: '4px', color: 'var(--color-text-secondary)' }}>{tech}</span>
                       ))}
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div style={{ textAlign: 'right', fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                  {user.score}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
             No ranks available yet. Complete challenges to get on the board!
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
