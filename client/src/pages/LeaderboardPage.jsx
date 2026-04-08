import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiTrophyLine, RiMedalLine, RiFireLine, RiSwordLine, RiArrowDownSLine } from 'react-icons/ri';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  // Per-challenge state
  const [view, setView] = useState('global'); // 'global' | 'challenge'
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challengeBoard, setChallengeBoard] = useState([]);
  const [loadingChallenge, setLoadingChallenge] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
    fetchChallenges();
    if (socket) {
      socket.on('leaderboard_update', data => setLeaderboard(data));
      return () => socket.off('leaderboard_update');
    }
  }, [socket]);

  const fetchLeaderboard = async () => {
    try {
      const { data } = await api.get('/challenges/leaderboard');
      if (data.success) setLeaderboard(data.leaderboard);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchChallenges = async () => {
    try {
      const { data } = await api.get('/challenges');
      if (data.success) setChallenges(data.challenges);
    } catch (err) { console.error(err); }
  };

  const fetchChallengeBoard = async (challengeId) => {
    setLoadingChallenge(true);
    try {
      const { data } = await api.get(`/challenges/${challengeId}`);
      if (data.success && data.challenge.submissions) {
        // Sort by score desc, then by submission time asc (earlier = better)
        const subs = [...(data.challenge.submissions || [])]
          .filter(s => s.status === 'Passed')
          .sort((a, b) => (b.score || 0) - (a.score || 0) || new Date(a.createdAt) - new Date(b.createdAt));
        setChallengeBoard(subs);
      }
    } catch (err) { console.error(err); }
    finally { setLoadingChallenge(false); }
  };

  const handleSelectChallenge = (c) => {
    setSelectedChallenge(c);
    fetchChallengeBoard(c._id);
  };

  const RANK_BADGE = (score) => {
    if (score >= 1000) return { label: '👑 Legend', color: '#f59e0b' };
    if (score >= 500) return { label: '🔥 Expert', color: '#ef4444' };
    if (score >= 100) return { label: '⚡ Contributor', color: '#7c3aed' };
    return { label: '🌱 Newbie', color: '#10b981' };
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ display: 'inline-flex', padding: '1.5rem', background: 'rgba(245,158,11,0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
          <RiTrophyLine size={48} color="#f59e0b" />
        </motion.div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Leaderboard</h1>
        <p style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><RiFireLine color="#ef4444" /> Live rankings based on completed challenges</p>
      </div>

      {/* View Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', background: 'var(--color-bg-card)', padding: '0.35rem', borderRadius: '12px', border: '1px solid var(--color-border)', width: 'fit-content' }}>
        {[{ id: 'global', label: '🌍 Global' }, { id: 'challenge', label: '⚔️ Per Challenge' }].map(tab => (
          <button key={tab.id} onClick={() => setView(tab.id)} style={{ padding: '0.5rem 1.25rem', borderRadius: '9px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s', background: view === tab.id ? 'var(--color-accent-primary)' : 'transparent', color: view === tab.id ? '#fff' : 'var(--color-text-muted)' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {view === 'global' ? (
        <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '24px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 150px', padding: '1.25rem 2rem', background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <div>Rank</div><div>Hacker</div><div style={{ textAlign: 'right' }}>Score</div>
          </div>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Calculating ranks...</div>
          ) : leaderboard.length > 0 ? (
            <AnimatePresence>
              {leaderboard.map((u, index) => {
                const badge = RANK_BADGE(u.score);
                return (
                  <motion.div key={u._id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}
                    style={{ display: 'grid', gridTemplateColumns: '80px 1fr 150px', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid var(--color-border)', background: index < 3 ? `linear-gradient(90deg, ${MEDAL_COLORS[index]}15, transparent)` : 'transparent' }}
                  >
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: index < 3 ? MEDAL_COLORS[index] : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {index < 3 ? <RiMedalLine size={24} /> : `#${index + 1}`}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.2rem', overflow: 'hidden' }}>
                        {u.avatar ? <img src={u.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : (u.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{u.name}</h3>
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: '100px', background: `${badge.color}20`, color: badge.color, border: `1px solid ${badge.color}40` }}>{badge.label}</span>
                          {(u.techStack || []).slice(0, 2).map(tech => <span key={tech} style={{ fontSize: '0.65rem', background: 'var(--color-bg-secondary)', padding: '0.1rem 0.4rem', borderRadius: '4px', color: 'var(--color-text-secondary)' }}>{tech}</span>)}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '1.5rem', fontWeight: 900 }}>{u.score}</div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          ) : (
            <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No ranks yet. Complete challenges to get on the board!</div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Challenge Selector */}
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><RiSwordLine /> Select a Challenge</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {challenges.map(c => (
                <button key={c._id} onClick={() => handleSelectChallenge(c)} style={{ padding: '0.4rem 0.9rem', borderRadius: '8px', border: `1px solid ${selectedChallenge?._id === c._id ? 'var(--color-accent-primary)' : 'var(--color-border)'}`, background: selectedChallenge?._id === c._id ? 'rgba(124,58,237,0.15)' : 'transparent', color: selectedChallenge?._id === c._id ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {c.title}
                </button>
              ))}
              {challenges.length === 0 && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No challenges available</span>}
            </div>
          </div>

          {/* Per-Challenge Board */}
          {selectedChallenge && (
            <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '24px', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 2rem', background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1rem' }}>{selectedChallenge.title} — Top Solvers</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Ranked by score, then by earliest submission</p>
              </div>
              {loadingChallenge ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>
              ) : challengeBoard.length > 0 ? (
                challengeBoard.map((sub, i) => (
                  <div key={sub._id || i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 120px 120px', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid var(--color-border)', background: i < 3 ? `linear-gradient(90deg, ${MEDAL_COLORS[i] || '#7c3aed'}12, transparent)` : 'transparent' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: i < 3 ? MEDAL_COLORS[i] : 'var(--color-text-muted)' }}>{i < 3 ? ['🥇','🥈','🥉'][i] : `#${i+1}`}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '0.9rem', overflow: 'hidden' }}>
                        {sub.user?.avatar ? <img src={sub.user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (sub.user?.name || '?').charAt(0)}
                      </div>
                      <span style={{ fontWeight: 700 }}>{sub.user?.name || 'Unknown'}</span>
                    </div>
                    <div style={{ fontWeight: 800, color: '#10b981', textAlign: 'center' }}>{sub.score || 0} pts</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>{new Date(sub.createdAt).toLocaleDateString()}</div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No passed submissions yet for this challenge.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
