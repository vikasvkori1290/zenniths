import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiFlashlightLine, RiCalendarEventLine, RiTrophyLine,
  RiGithubFill, RiLinkedinBoxFill, RiEdit2Line,
  RiStarLine, RiTimeLine, RiCodeSSlashLine, RiDeleteBinLine
} from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ challenges: 0, events: 0, score: 0 });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ 
    name: '', mobile: '', techStack: '', 
    leetcodeUrl: '', linkedinUrl: '', usn: '', course: '', batch: '' 
  });
  const [submittingProfile, setSubmittingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        mobile: user.mobile || '',
        techStack: user.techStack?.join(', ') || '',
        leetcodeUrl: user.leetcodeUrl || '',
        linkedinUrl: user.linkedinUrl || '',
        usn: user.usn || '',
        course: user.course || '',
        batch: user.batch || ''
      });
    }
  }, [user]);

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    setSubmittingProfile(true);
    try {
      const payload = {
        name: profileForm.name,
        mobile: profileForm.mobile,
        techStack: profileForm.techStack.split(',').map(s => s.trim()).filter(Boolean),
        leetcodeUrl: profileForm.leetcodeUrl,
        linkedinUrl: profileForm.linkedinUrl,
        usn: profileForm.usn,
        course: profileForm.course,
        batch: profileForm.batch,
      };
      await api.put('/users/profile', payload);
      window.location.reload(); // Quick refresh to pull new auth context state
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setSubmittingProfile(false);
    }
  };

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

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you absolutely sure you want to permanently delete your account? This action cannot be undone.")) {
      try {
        const { data } = await api.delete('/users/me');
        if (data.success) {
          await logout();
          navigate('/');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to delete account.');
      }
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>;

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
        borderRadius: '20px',
        marginBottom: '1.5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background Cover Photo */}
        <div style={{
          height: '110px',
          background: 'linear-gradient(135deg, var(--color-border-hover), var(--color-border))',
        }} />

        <div style={{ padding: '0 1.75rem 1.75rem', position: 'relative' }}>
          
          {/* Avatar & Actions Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-42px', marginBottom: '1rem' }}>
            <div style={{
              width: '84px', height: '84px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-accent-gradient-start), var(--color-accent-gradient-end))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 800, color: '#fff',
              border: '4px solid var(--color-bg-card)',
              flexShrink: 0,
            }}>
              {user?.avatar
                ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : user?.name?.charAt(0).toUpperCase() || 'U'
              }
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {user?.githubUrl && (
                <a href={user.githubUrl} target="_blank" rel="noreferrer" style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-text-secondary)', textDecoration: 'none',
                }}>
                  <RiGithubFill size={18} />
                </a>
              )}
              {user?.linkedinUrl && (
                <a href={user.linkedinUrl} target="_blank" rel="noreferrer" style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#0A66C2', textDecoration: 'none',
                }}>
                  <RiLinkedinBoxFill size={18} />
                </a>
              )}
              {user?.leetcodeUrl && (
                <a href={user.leetcodeUrl} target="_blank" rel="noreferrer" style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fbbf24', textDecoration: 'none',
                }} title="LeetCode">
                  <RiCodeSSlashLine size={18} />
                </a>
              )}
              <button 
                onClick={() => setShowEditModal(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0 0.875rem', height: '36px',
                  background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-hover)',
                  borderRadius: '10px', color: 'var(--color-accent-primary)',
                  fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              }}>
                <RiEdit2Line size={14} /> Edit Profile
              </button>
            </div>
          </div>

          {/* Info Details Row */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{user?.name}</h2>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.7rem',
                borderRadius: '100px', textTransform: 'capitalize', letterSpacing: '0.05em',
                background: user?.role === 'admin' ? 'rgba(245,158,11,0.15)' : 'var(--color-bg-secondary)',
                border: user?.role === 'admin' ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--color-border-hover)',
                color: user?.role === 'admin' ? '#f59e0b' : 'var(--color-accent-primary)',
              }}>
                {user?.role}
              </span>
            </div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              {user?.email} {user?.mobile && `• ${user.mobile}`}
            </div>
            {(user?.usn || user?.course || user?.batch) && (
               <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                 {user?.course && <span>{user.course}</span>}
                 {user?.batch && <span>(Batch {user.batch})</span>}
                 {user?.usn && <span>• USN: {user.usn.toUpperCase()}</span>}
               </div>
            )}
            {!(user?.usn || user?.course || user?.batch) && <div style={{ marginBottom: '1rem' }} />}

            {/* Tech Stack Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {(user?.techStack?.length ? user.techStack : ['React', 'Node.js', 'MongoDB', 'Python']).map((tech, i) => (
                <span key={tech} style={{
                  fontSize: '0.72rem', fontWeight: 600, padding: '0.25rem 0.7rem',
                  borderRadius: '100px',
                  background: `${techColors[i % techColors.length]}15`,
                  border: `1px solid ${techColors[i % techColors.length]}30`,
                  color: techColors[i % techColors.length],
                }}>
                  {tech}
                </span>
              ))}
            </div>
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

      {/* Danger Zone */}
      {user?.role !== 'admin' && (
        <motion.div variants={itemVariants} style={{
        marginTop: '2.5rem',
        padding: '1.5rem',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '16px',
        background: 'rgba(239, 68, 68, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ef4444', marginBottom: '0.25rem' }}>Danger Zone</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>Permanently delete your account and all associated data. This action cannot be undone.</p>
        </div>
        <button 
          onClick={handleDeleteAccount}
          style={{
            padding: '0.8rem 1.25rem',
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <RiDeleteBinLine size={18} />
          Delete Account
        </button>
      </motion.div>
      )}

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} style={{
              background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '24px',
              width: '100%', maxWidth: '450px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}>
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '800', fontSize: '1.25rem' }}>
                Edit Profile
              </div>
              <form onSubmit={handleEditProfileSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', maxHeight: '70vh' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Name</label>
                  <input required value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Mobile Number</label>
                    <input type="tel" value={profileForm.mobile} onChange={e => setProfileForm({...profileForm, mobile: e.target.value})} placeholder="+1234567890" style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>USN Number <span style={{ color: '#ef4444' }}>*</span></label>
                    <input required value={profileForm.usn} onChange={e => setProfileForm({...profileForm, usn: e.target.value})} placeholder="1XX22XX000" style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Course <span style={{ color: '#ef4444' }}>*</span></label>
                    <input required value={profileForm.course} onChange={e => setProfileForm({...profileForm, course: e.target.value})} placeholder="e.g. B.Tech CS" style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Batch <span style={{ color: '#ef4444' }}>*</span></label>
                    <input required value={profileForm.batch} onChange={e => setProfileForm({...profileForm, batch: e.target.value})} placeholder="2022-2026" pattern="\d{4}-\d{4}" title="Format must be YYYY-YYYY (e.g. 2022-2026)" style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Tech Stack (comma separated)</label>
                  <input value={profileForm.techStack} onChange={e => setProfileForm({...profileForm, techStack: e.target.value})} placeholder="React, Node, Python" style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   <div>
                     <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>LinkedIn URL (Optional)</label>
                     <input type="url" value={profileForm.linkedinUrl} onChange={e => setProfileForm({...profileForm, linkedinUrl: e.target.value})} placeholder="https://linkedin.com/in/username" style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />
                   </div>
                   <div>
                     <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>LeetCode URL (Optional)</label>
                     <input type="url" value={profileForm.leetcodeUrl} onChange={e => setProfileForm({...profileForm, leetcodeUrl: e.target.value})} placeholder="https://leetcode.com/u/username" style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />
                   </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexShrink: 0 }}>
                  <button type="button" onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={submittingProfile} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: 'var(--color-accent-primary)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>{submittingProfile ? 'Saving...' : 'Save Profile'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DashboardPage;
