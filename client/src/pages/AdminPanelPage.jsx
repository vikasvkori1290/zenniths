import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiDashboardLine, RiTeamLine, RiFolderLine, RiCalendarEventLine,
  RiSwordLine, RiCheckDoubleLine, RiCloseLine, RiInboxArchiveLine,
} from 'react-icons/ri';
import api from '../api/axios';

const StatCard = ({ title, value, icon, gradient }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    style={{
      background: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      borderRadius: '16px', padding: '1.5rem',
      display: 'flex', alignItems: 'center', gap: '1.5rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    }}
  >
    <div style={{
      width: '64px', height: '64px', borderRadius: '50%',
      background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: '1.8rem',
      boxShadow: 'inset 0 -3px 10px rgba(0,0,0,0.3)',
    }}>
      {icon}
    </div>
    <div>
      <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </h3>
      <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
        {value}
      </div>
    </div>
  </motion.div>
);

const AdminPanelPage = () => {
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, subsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/submissions/pending'),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (subsRes.data.success) setSubmissions(subsRes.data.submissions);
    } catch (err) {
      console.error('Admin fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (id, status) => {
    const isPassing = status === 'Passed';
    const feedback = prompt(isPassing ? 'Add optional encouraging feedback:' : 'Provide technical feedback for failure:');
    
    // User cancelled prompt
    if (feedback === null) return;

    try {
      const { data } = await api.patch(`/admin/submissions/${id}/grade`, { status, feedback });
      if (data.success) {
        // Remove from pending list
        setSubmissions(prev => prev.filter(s => s._id !== id));
        // Refresh stats
        fetchData();
        alert(`Success: Submission marked as ${status}. Leaderboard updated via Sockets if passed!`);
      }
    } catch (err) {
       console.error('Failed to grade', err);
       alert('Operation failed. Check console.');
    }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading Admin Data...</div>;

  return (
    <div style={{ maxWidth: '1400px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <RiDashboardLine color="var(--color-accent-primary)" /> Admin Console
      </h1>

      {/* High-level Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={<RiTeamLine />} gradient="linear-gradient(135deg, #3b82f6, #06b6d4)" />
        <StatCard title="Total Projects" value={stats?.totalProjects || 0} icon={<RiFolderLine />} gradient="linear-gradient(135deg, #8b5cf6, #d946ef)" />
        <StatCard title="Total Events" value={stats?.totalEvents || 0} icon={<RiCalendarEventLine />} gradient="linear-gradient(135deg, #ec4899, #f43f5e)" />
        <StatCard title="Challenges" value={stats?.totalChallenges || 0} icon={<RiSwordLine />} gradient="linear-gradient(135deg, #f59e0b, #ef4444)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
         {/* Submissions Review Queue */}
         <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                 <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Submission Review Queue</h2>
                 <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Grade member coding challenge submissions.</p>
               </div>
               <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.4rem 1rem', borderRadius: '100px', fontWeight: 800, fontSize: '0.85rem' }}>
                 {submissions.length} Pending
               </span>
            </div>

            <div style={{ padding: '0' }}>
               {submissions.length === 0 ? (
                 <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                   <RiInboxArchiveLine size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                   <h3>Queue is completely empty!</h3>
                   <p style={{ fontSize: '0.9rem' }}>No pending submissions to grade right now.</p>
                 </div>
               ) : (
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead>
                     <tr style={{ background: 'var(--color-bg-primary)', textAlign: 'left', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                       <th style={{ padding: '1rem 2rem', fontWeight: 800 }}>Student</th>
                       <th style={{ padding: '1rem 2rem', fontWeight: 800 }}>Challenge</th>
                       <th style={{ padding: '1rem 2rem', fontWeight: 800 }}>Solution URL</th>
                       <th style={{ padding: '1rem 2rem', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     <AnimatePresence>
                       {submissions.map((sub, i) => (
                         <motion.tr
                           key={sub._id}
                           initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                           transition={{ delay: i * 0.05 }}
                           style={{ borderTop: '1px solid var(--color-border)' }}
                         >
                           <td style={{ padding: '1.25rem 2rem' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '36px', height: '36px', background: 'var(--color-accent-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                                  {sub.user?.avatar ? <img src={sub.user.avatar} style={{ width: '100%', borderRadius: '50%' }} alt="" /> : sub.user?.name?.charAt(0)}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{sub.user?.name}</div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{sub.user?.email}</div>
                                </div>
                             </div>
                           </td>
                           <td style={{ padding: '1.25rem 2rem' }}>
                             <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{sub.challenge?.title}</div>
                             <div style={{ fontSize: '0.8rem', color: 'var(--color-accent-secondary)' }}>{sub.challenge?.points} Pts • {sub.challenge?.difficulty}</div>
                           </td>
                           <td style={{ padding: '1.25rem 2rem' }}>
                             <a href={sub.solutionUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent-primary)', fontWeight: 600, textDecoration: 'underline' }}>
                               View Code
                             </a>
                           </td>
                           <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                             <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                               <button 
                                 onClick={() => handleGradeSubmission(sub._id, 'Failed')}
                                 style={{ padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                 <RiCloseLine size={16} /> Reject
                               </button>
                               <button 
                                 onClick={() => handleGradeSubmission(sub._id, 'Passed')}
                                 style={{ padding: '0.5rem 1rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                 <RiCheckDoubleLine size={16} /> Approve
                               </button>
                             </div>
                           </td>
                         </motion.tr>
                       ))}
                     </AnimatePresence>
                   </tbody>
                 </table>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminPanelPage;
