import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiDashboardLine, RiTeamLine, RiFolderLine, RiCalendarEventLine,
  RiSwordLine, RiCheckDoubleLine, RiCloseLine, RiInboxArchiveLine,
  RiImageAddLine, RiUploadCloud2Line, RiDeleteBinLine,
  RiMegaphoneLine, RiBarChartLine, RiSendPlaneLine
} from 'react-icons/ri';
import api from '../api/axios';

const StatCard = ({ title, value, icon, gradient }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}
    style={{
      background: 'var(--color-bg-card)',
      border: '1px solid rgba(0,0,0,0.05)',
      borderRadius: '20px', padding: '1.5rem',
      display: 'flex', alignItems: 'center', gap: '1.5rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
  >
    <div style={{
      width: '64px', height: '64px', borderRadius: '18px',
      background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: '1.8rem',
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
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
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';

  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gallery States
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);

  const [analyticsData, setAnalyticsData] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Attendance states
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [roster, setRoster] = useState([]);
  const [attendedEmails, setAttendedEmails] = useState(new Set());
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);

  useEffect(() => {
    fetchData();
    fetchImages();
    fetchAnnouncements();
    fetchAnalytics();
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await api.get('/admin/users');
      if (data.success) setAdminUsers(data.users);
    } catch (err) { console.error('Failed to fetch users', err); }
    finally { setLoadingUsers(false); }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setAdminUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) { alert('Role update failed'); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Permanently delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setAdminUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) { alert('Delete failed'); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, subsRes, eventsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/submissions/pending'),
        api.get('/events'), // Fetch all events for attendance
      ]);
      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (subsRes.data.success) setSubmissions(subsRes.data.submissions);
      if (eventsRes.data.success) setEvents(eventsRes.data.events);
    } catch (err) {
      console.error('Admin fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Attendance Handlers ──────────────────────────────────────────────────
  const handleOpenAttendance = async (eventId) => {
    setLoadingRoster(true);
    setSelectedEvent(null);
    try {
      const { data } = await api.get(`/events/${eventId}`);
      if (data.success) {
        const ev = data.event;
        const unifiedRoster = [];

        // Add Solo Users
        ev.registeredUsers?.forEach(u => {
          if (!unifiedRoster.some(r => r.email === u.email)) {
            unifiedRoster.push({ ...u, roleInTeam: 'Solo' });
          }
        });

        // Add Teams
        ev.teams?.forEach(t => {
          if (t.leader && !unifiedRoster.some(r => r.email === t.leader.email)) {
            unifiedRoster.push({ ...t.leader, roleInTeam: `Leader (${t.teamName})` });
          }
          t.members?.forEach(m => {
            if (!unifiedRoster.some(r => r.email === m.email)) {
              unifiedRoster.push({ ...m, roleInTeam: `Member (${t.teamName})` });
            }
          });
        });

        setRoster(unifiedRoster);
        setAttendedEmails(new Set(ev.attendedEmails || []));
        setSelectedEvent(ev);
      }
    } catch (err) { console.error('Failed to fetch event roster', err); }
    finally { setLoadingRoster(false); }
  };

  const handleToggleAttendance = (email) => {
    setAttendedEmails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(email)) newSet.delete(email);
      else newSet.add(email);
      return newSet;
    });
  };

  const handleSaveAttendance = async () => {
    setSavingAttendance(true);
    try {
      const emailsArray = Array.from(attendedEmails);
      await api.patch(`/admin/events/${selectedEvent._id}/attendance`, { attendedEmails: emailsArray });
      alert('Attendance saved successfully!');
      // Update local events state just in case
      setEvents(prev => prev.map(e => e._id === selectedEvent._id ? { ...e, attendedEmails: emailsArray } : e));
    } catch (err) {
      alert('Failed to save attendance');
      console.error(err);
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleExportCSV = () => {
    const attendees = roster.filter(r => attendedEmails.has(r.email));
    if (attendees.length === 0) {
      alert('No attendees marked to export.'); return;
    }
    
    const headers = ['Name', 'Email', 'Role', 'USN', 'Course', 'Batch'];
    const rows = attendees.map(a => [
      a.name || 'N/A',
      a.email || 'N/A',
      a.roleInTeam || 'N/A',
      (a.usn || 'N/A').toUpperCase(),
      a.course || 'N/A',
      a.batch || 'N/A'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(f => `"${f}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedEvent.title.replace(/\s+/g, '_')}_Attendance.csv`;
    link.click();
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const { data } = await api.get('/admin/analytics');
      if (data.success) {
        // Map 7 days back
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          days.push(d.toISOString().split('T')[0]);
        }
        
        const mapped = days.map(day => {
          const match = data.data.signups.find(s => s._id === day);
          return { day: day.split('-').slice(1).join('/'), count: match ? match.count : 0 };
        });
        setAnalyticsData(mapped);
      }
    } catch (err) {
      console.error('Analytics failed', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get('/announcements');
      if (data.success) setAnnouncements(data.data);
    } catch (err) {
      console.error('Failed to fetch announcements', err);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;
    setLoadingAnnouncements(true);
    try {
      const { data } = await api.post('/announcements', { text: newAnnouncement });
      if (data.success) {
        setNewAnnouncement('');
        fetchAnnouncements();
      }
    } catch (err) {
      console.error('Failed to create announcement', err);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Remove this announcement?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const fetchImages = async () => {
    try {
      const { data } = await api.get('/gallery');
      if (data.success) {
        setImages(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch gallery', err);
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

  // Gallery Handlers
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (files.length > 15) {
      alert('You can only upload up to 15 images at a time.');
      return;
    }

    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(base64Strings => {
      setSelectedFiles(base64Strings);
      setImagePreviews(files.map(f => URL.createObjectURL(f)));
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFiles.length) return;

    setUploading(true);
    try {
      const { data } = await api.post('/gallery', {
        images: selectedFiles,
        title: uploadTitle || 'Event Memory'
      });
      if (data.success) {
        setUploadTitle('');
        setSelectedFiles([]);
        setImagePreviews([]);
        fetchImages(); // Refresh array
      }
    } catch (err) {
      console.error('Upload failed', err);
      alert('Upload failed. Check file size limits.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (id) => {
    if (!window.confirm("Delete this memory permanently?")) return;
    try {
      await api.delete(`/gallery/${id}`);
      fetchImages(); // Refresh array
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  if (loading && !stats) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading Admin Data...</div>;

  return (
    <div style={{ maxWidth: '1400px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <RiDashboardLine color="var(--color-accent-primary)" /> Admin Console
      </h1>

      {currentTab === 'dashboard' && (
        <>
          {/* High-level Stats Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
            <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={<RiTeamLine />} gradient="linear-gradient(135deg, #3b82f6, #06b6d4)" />
            <StatCard title="Total Projects" value={stats?.totalProjects || 0} icon={<RiFolderLine />} gradient="linear-gradient(135deg, #8b5cf6, #d946ef)" />
            <StatCard title="Total Events" value={stats?.totalEvents || 0} icon={<RiCalendarEventLine />} gradient="linear-gradient(135deg, #ec4899, #f43f5e)" />
            <StatCard title="Challenges" value={stats?.totalChallenges || 0} icon={<RiSwordLine />} gradient="linear-gradient(135deg, #f59e0b, #ef4444)" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '2rem', flexWrap: 'wrap' }}>
         
         {/* LEFT COLUMN: Submissions Review Queue */}
         <div style={{ background: 'var(--color-bg-card)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '24px', overflow: 'hidden', height: 'fit-content', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ padding: '1.5rem 2rem', background: 'var(--color-bg-secondary)', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                 <div style={{ overflowX: 'auto' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                   <thead>
                     <tr style={{ background: 'var(--color-bg-primary)', textAlign: 'left', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                       <th style={{ padding: '1rem 2rem', fontWeight: 800 }}>Student</th>
                       <th style={{ padding: '1rem 2rem', fontWeight: 800 }}>Challenge</th>
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
                                <div style={{ width: '36px', height: '36px', background: 'var(--color-accent-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>
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
                             <a href={sub.solutionUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent-primary)', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'underline' }}>View Code</a>
                           </td>
                           <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                             <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                               <button 
                                 onClick={() => handleGradeSubmission(sub._id, 'Failed')}
                                 style={{ padding: '0.5rem 0.8rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                                 <RiCloseLine size={16} /> Reject
                               </button>
                               <button 
                                 onClick={() => handleGradeSubmission(sub._id, 'Passed')}
                                 style={{ padding: '0.5rem 0.8rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                                 <RiCheckDoubleLine size={16} /> Approve
                               </button>
                             </div>
                           </td>
                         </motion.tr>
                       ))}
                     </AnimatePresence>
                   </tbody>
                 </table>
                 </div>
               )}
            </div>
         </div>

         {/* RIGHT COLUMN: Gallery & Announcements */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Dynamic Analytics Chart */}
            <div style={{ background: 'var(--color-bg-card)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <RiBarChartLine /> New Signups
                    </h3>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>PAST 7 DAYS</span>
                </div>
                <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '10px 0', position: 'relative' }}>
                   {analyticsData.length === 0 ? (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                        {loadingAnalytics ? 'Calculating...' : 'No signup data yet'}
                      </div>
                   ) : (
                     analyticsData.map((d, i) => {
                       const max = Math.max(...analyticsData.map(x => x.count), 5);
                       const height = (d.count / max) * 100;
                       return (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: d.count > 0 ? 'var(--color-accent-primary)' : 'transparent' }}>{d.count}</div>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ duration: 1, delay: i * 0.05 }}
                            style={{ 
                              width: '100%', 
                              background: 'linear-gradient(to top, var(--color-accent-primary), var(--color-accent-secondary))', 
                              borderRadius: '4px 4px 0 0', 
                              opacity: 0.8,
                              minHeight: d.count > 0 ? '4px' : '2px'
                            }}
                          />
                        </div>
                       );
                     })
                   )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
                   {analyticsData.map(d => <span key={d.day}>{d.day}</span>)}
                </div>
            </div>

            {/* Announcement Manager */}
            <div style={{ background: 'var(--color-bg-card)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RiMegaphoneLine /> Announcements
                </h3>
                <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <input 
                        placeholder="Broadcast a new notice..." 
                        value={newAnnouncement} 
                        onChange={(e) => setNewAnnouncement(e.target.value)}
                        style={{ flex: 1, padding: '0.7rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '10px', fontSize: '0.85rem' }}
                    />
                    <button type="submit" disabled={loadingAnnouncements} style={{ padding: '0.7rem', background: 'var(--color-accent-primary)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                        <RiSendPlaneLine size={18} />
                    </button>
                </form>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
                    {announcements.map(ann => (
                        <div key={ann._id} style={{ padding: '0.8rem', background: 'var(--color-bg-secondary)', borderRadius: '10px', fontSize: '0.8rem', position: 'relative', border: '1px solid var(--color-border)' }}>
                            <p style={{ margin: 0, paddingRight: '1.5rem' }}>{ann.text}</p>
                            <button onClick={() => handleDeleteAnnouncement(ann._id)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6 }}>
                                <RiCloseLine size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
         </div>
      </div>
      </>
      )}

      {/* Gallery */}
      {currentTab === 'gallery' && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ background: 'var(--color-bg-card)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RiImageAddLine /> Upload to Public Gallery
                </h3>
                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input 
                        placeholder="Image/Album Title" 
                        value={uploadTitle} 
                        onChange={(e) => setUploadTitle(e.target.value)}
                        style={{ padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }}
                    />
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '2rem', border: '2px dashed var(--color-border)', borderRadius: '12px', background: 'var(--color-bg-secondary)', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                        {imagePreviews.length > 0 ? (
                            <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', position: 'relative', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', padding: '10px' }}>
                                {imagePreviews.map((preview, i) => (
                                    <img key={i} src={preview} alt="Preview" style={{ height: '80px', width: '80px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--color-border)' }} />
                                ))}
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', width: '100%', height: '100%' }} onMouseEnter={e => e.currentTarget.style.opacity=1} onMouseLeave={e => e.currentTarget.style.opacity=0}>
                                    <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>Change Images</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <RiUploadCloud2Line size={32} color="var(--color-text-muted)" />
                                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Click to browse images (Max 15)</span>
                            </>
                        )}
                        <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    </label>
                    <button type="submit" disabled={selectedFiles.length === 0 || uploading} style={{ marginTop: '0.5rem', padding: '0.875rem', background: 'var(--color-accent-primary)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: (selectedFiles.length > 0 && !uploading) ? 'pointer' : 'not-allowed', opacity: (selectedFiles.length > 0 && !uploading) ? 1 : 0.6 }}>
                        {uploading ? 'Uploading...' : (selectedFiles.length > 0 ? `Publish ${selectedFiles.length} Images to Homepage` : 'Publish to Homepage')}
                    </button>
                </form>
            </div>

            {/* Existing images list */}
            <div style={{ background: 'var(--color-bg-card)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Gallery DB ({images.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {images.map(img => (
                        <div key={img._id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '90px' }}>
                            <img src={img.url} alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.2rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: '#fff', fontSize: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60px' }}>{img.title}</span>
                                <button onClick={() => handleDeleteImage(img._id)} style={{ background: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.15rem', cursor: 'pointer' }}>
                                    <RiDeleteBinLine size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {images.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                            No images yet.
                        </div>
                    )}
                </div>
            </div>
         </div>
      )}

      {/* ── User Management ── */}
      {currentTab === 'users' && (
      <div style={{ background: 'var(--color-bg-card)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '1.5rem 2rem', background: 'var(--color-bg-secondary)', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><RiTeamLine /> User Management</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Promote, demote, or remove members from the platform.</p>
          </div>
          <span style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed', padding: '0.4rem 1rem', borderRadius: '100px', fontWeight: 800, fontSize: '0.85rem' }}>{adminUsers.length} Users</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loadingUsers ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading users...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg-primary)', textAlign: 'left', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem 2rem', fontWeight: 800 }}>User</th>
                  <th style={{ padding: '1rem 2rem', fontWeight: 800 }}>Email</th>
                  <th style={{ padding: '1rem 2rem', fontWeight: 800 }}>Role</th>
                  <th style={{ padding: '1rem 2rem', fontWeight: 800 }}>Joined</th>
                  <th style={{ padding: '1rem 2rem', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((u, i) => (
                  <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem 2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', flexShrink: 0 }}>
                          {u.avatar ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 2rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{u.email}</td>
                    <td style={{ padding: '1rem 2rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 800, background: u.role === 'admin' ? 'rgba(245,158,11,0.15)' : 'rgba(124,58,237,0.1)', color: u.role === 'admin' ? '#f59e0b' : '#7c3aed', border: `1px solid ${u.role === 'admin' ? 'rgba(245,158,11,0.3)' : 'rgba(124,58,237,0.2)'}` }}>
                        {u.role === 'admin' ? '🛡️ Admin' : '👤 Member'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 2rem', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem 2rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleRoleToggle(u._id, u.role)} style={{ padding: '0.35rem 0.85rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                          {u.role === 'admin' ? '⬇️ Demote' : '⬆️ Promote'}
                        </button>
                        <button onClick={() => handleDeleteUser(u._id)} style={{ padding: '0.35rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                          <RiDeleteBinLine size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      )}

      {/* ── Event Attendance Manager ── */}
      {currentTab === 'attendance' && (
      <div style={{ background: 'var(--color-bg-card)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '1.5rem 2rem', background: 'var(--color-bg-secondary)', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>< RiCalendarEventLine /> Event Attendance</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Select an event to mark user attendance and export to Excel.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', padding: '1.5rem' }}>
          {events.slice(0, 12).map((e) => (
            <div key={e._id} onClick={() => handleOpenAttendance(e._id)} style={{ cursor: 'pointer', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '12px', background: 'var(--color-bg-secondary)', transition: 'border 0.2s' }} onMouseEnter={ev => ev.currentTarget.style.borderColor = 'var(--color-accent-primary)'} onMouseLeave={ev => ev.currentTarget.style.borderColor = 'var(--color-border)'}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>{new Date(e.date).toLocaleDateString()}</p>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                <span style={{ color: 'var(--color-text-primary)' }}>{(e.registeredUsers?.length || 0) + (e.teams?.length || 0)} Units</span>
                <span style={{ color: '#10b981' }}>({e.attendedEmails?.length || 0} Attended)</span>
              </div>
            </div>
          ))}
          {events.length === 0 && <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>No events found.</div>}
        </div>
      </div>
      )}

      {/* ── Attendance Modal ── */}
      <AnimatePresence>
        {(loadingRoster || selectedEvent) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'stretch', padding: '2rem' }}>
            <motion.div initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }} style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '24px', width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
              {loadingRoster ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>Loading event roster...</div>
              ) : selectedEvent && (
                <>
                  <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-secondary)' }}>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedEvent.title} - Roster</h2>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>{roster.length} participants from Solo and Teams • {attendedEmails.size} marked present</div>
                    </div>
                    <button onClick={() => setSelectedEvent(null)} style={{ background: 'var(--color-bg-primary)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <RiCloseLine size={20} />
                    </button>
                  </div>
                  
                  <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ position: 'sticky', top: 0, background: 'var(--color-bg-secondary)', zIndex: 1 }}>
                        <tr style={{ textAlign: 'left', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                          <th style={{ padding: '1rem 2rem', fontWeight: 800, width: '60px' }}>Mark</th>
                          <th style={{ padding: '1rem 0.5rem', fontWeight: 800 }}>Student/Unit</th>
                          <th style={{ padding: '1rem 0.5rem', fontWeight: 800 }}>Identifiers</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roster.map((r, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={{ padding: '1rem 2rem' }}>
                              <input 
                                type="checkbox" 
                                checked={attendedEmails.has(r.email)} 
                                onChange={() => handleToggleAttendance(r.email)} 
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                              />
                            </td>
                            <td style={{ padding: '1rem 0.5rem' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-accent-primary)', fontWeight: 600, marginTop: '0.2rem' }}>{r.roleInTeam}</div>
                            </td>
                            <td style={{ padding: '1rem 0.5rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                              <div>{r.email}</div>
                              {(r.usn || r.course || r.batch) && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                                  USN: {(r.usn || '-').toUpperCase()} • {r.course || '-'} ({r.batch || '-'})
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                        {roster.length === 0 && (
                          <tr><td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No participants found for this event.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-secondary)' }}>
                    <button onClick={handleExportCSV} style={{ padding: '0.75rem 1.25rem', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '10px', color: 'var(--color-text-primary)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      ⬇️ Export to Excel (.csv)
                    </button>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button onClick={() => setSelectedEvent(null)} style={{ padding: '0.75rem 1.25rem', background: 'none', border: 'none', color: 'var(--color-text-muted)', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                      <button onClick={handleSaveAttendance} disabled={savingAttendance} style={{ padding: '0.75rem 1.5rem', background: '#10b981', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
                        {savingAttendance ? 'Saving...' : 'Save Attendance'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminPanelPage;
