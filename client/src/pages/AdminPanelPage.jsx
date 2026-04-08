import { useState, useEffect } from 'react';
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

  // Gallery States
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);

  useEffect(() => {
    fetchData();
    fetchImages();
    fetchAnnouncements();
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
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(reader.result); // base64 string for Cloudinary
        setImagePreview(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const { data } = await api.post('/gallery', {
        image: selectedFile,
        title: uploadTitle || 'Event Memory'
      });
      if (data.success) {
        setUploadTitle('');
        setSelectedFile(null);
        setImagePreview(null);
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

      {/* High-level Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={<RiTeamLine />} gradient="linear-gradient(135deg, #3b82f6, #06b6d4)" />
        <StatCard title="Total Projects" value={stats?.totalProjects || 0} icon={<RiFolderLine />} gradient="linear-gradient(135deg, #8b5cf6, #d946ef)" />
        <StatCard title="Total Events" value={stats?.totalEvents || 0} icon={<RiCalendarEventLine />} gradient="linear-gradient(135deg, #ec4899, #f43f5e)" />
        <StatCard title="Challenges" value={stats?.totalChallenges || 0} icon={<RiSwordLine />} gradient="linear-gradient(135deg, #f59e0b, #ef4444)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '2rem', flexWrap: 'wrap' }}>
         
         {/* LEFT COLUMN: Submissions Review Queue */}
         <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '20px', overflow: 'hidden', height: 'fit-content' }}>
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
            
            {/* Analytics Mini-Chart Placeholder (Rich Aesthetic) */}
            <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RiBarChartLine /> Signup Analytics
                </h3>
                <div style={{ height: '120px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '10px 0' }}>
                   {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                     <motion.div
                       key={i}
                       initial={{ height: 0 }}
                       animate={{ height: `${h}%` }}
                       transition={{ duration: 1, delay: i * 0.1 }}
                       style={{ flex: 1, background: 'linear-gradient(to top, var(--color-accent-primary), var(--color-accent-secondary))', borderRadius: '4px 4px 0 0', opacity: 0.8 }}
                     />
                   ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                   <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
            </div>

            {/* Announcement Manager */}
            <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem' }}>
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

            {/* Gallery Uploader */}
            <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem' }}>
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
                        {imagePreview ? (
                            <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: 'auto', objectFit: 'contain', maxHeight: '180px' }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', width: '100%', height: '100%' }} onMouseEnter={e => e.currentTarget.style.opacity=1} onMouseLeave={e => e.currentTarget.style.opacity=0}>
                                    <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>Change Image</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <RiUploadCloud2Line size={32} color="var(--color-text-muted)" />
                                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Click to browse images</span>
                            </>
                        )}
                        <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    </label>
                    <button type="submit" disabled={!selectedFile || uploading} style={{ marginTop: '0.5rem', padding: '0.875rem', background: 'var(--color-accent-primary)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: (selectedFile && !uploading) ? 'pointer' : 'not-allowed', opacity: (selectedFile && !uploading) ? 1 : 0.6 }}>
                        {uploading ? 'Uploading...' : 'Publish to Homepage'}
                    </button>
                </form>
            </div>

            {/* Existing images list */}
            <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem' }}>
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
      </div>
    </div>
  );
};

export default AdminPanelPage;
