import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiStarLine, RiGithubFill, RiExternalLinkLine, RiStarFill,
  RiSearchLine, RiAddLine, RiFolderLine, RiCloseLine, RiDeleteBinLine,
  RiCodeSSlashLine, RiTeamLine, RiCalendarLine, RiLink, RiCheckLine, RiImageAddLine,
} from 'react-icons/ri';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const TECH_COLORS = {
  React: '#61dafb', 'Node.js': '#68a063', MongoDB: '#4db33d',
  Python: '#3776ab', 'Vue.js': '#42b883', TypeScript: '#3178c6',
  TailwindCSS: '#06b6d4', Express: '#fff', Next: '#fff',
  Flutter: '#54c5f8', Firebase: '#ffca28', Go: '#00add8',
};

const getRankBadge = (score = 0) => {
  if (score >= 1000) return { label: '👑 Legend', color: '#f59e0b' };
  if (score >= 500) return { label: '🔥 Expert', color: '#ef4444' };
  if (score >= 100) return { label: '⚡ Contributor', color: '#7c3aed' };
  return { label: '🌱 Newbie', color: '#10b981' };
};

// ── Submit Project Modal ───────────────────────────────────────────────────
const TECH_OPTIONS = ['React', 'Node.js', 'MongoDB', 'Python', 'Vue.js', 'TypeScript',
  'TailwindCSS', 'Express', 'Next.js', 'Flutter', 'Firebase', 'Go', 'PostgreSQL',
  'Docker', 'GraphQL', 'Redis', 'Java', 'Swift', 'Kotlin',
];

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem',
  background: '#f8faff', border: '1px solid #e2e8f0',
  borderRadius: '12px', color: '#1e293b', fontSize: '0.9rem', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
};
const labelStyle = { fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block' };

const SubmitProjectModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    teamName: '', title: '', repoUrl: '', liveUrl: '', eventDate: '',
    description: '', techStack: [], thumbnail: '',
  });
  const [techInput, setTechInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const handle = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Show preview immediately
    setImagePreview(URL.createObjectURL(file));
    // Upload to Cloudinary
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/upload/project', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success) handle('thumbnail', data.url);
    } catch {
      setError('Image upload failed. Please try again.');
      setImagePreview(null);
    } finally { setUploadingImage(false); }
  };

  const addTech = (tech) => {
    const t = tech.trim();
    if (t && !form.techStack.includes(t)) {
      setForm(f => ({ ...f, techStack: [...f.techStack, t] }));
    }
    setTechInput('');
  };
  const removeTech = (t) => setForm(f => ({ ...f, techStack: f.techStack.filter(x => x !== t) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Project name is required.');
    if (form.techStack.length === 0) return setError('Add at least one technology.');
    if (!form.description.trim()) return setError('Description is required.');
    setSubmitting(true); setError('');
    try {
      const payload = { ...form };
      if (!payload.eventDate) delete payload.eventDate;
      const { data } = await api.post('/projects', payload);
      if (data.success) { onSuccess(data.project); onClose(); }
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      <motion.div
        initial={{ scale: 0.92, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 24 }}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem 1.75rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>🚀 Submit Your Project</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0.25rem 0 0' }}>Showcase your work to the community</p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', color: '#64748b', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.5rem 1.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

          {/* Project Thumbnail */}
          <div>
            <label style={labelStyle}><RiImageAddLine style={{ display: 'inline', marginRight: '0.3rem' }} />Project Image</label>
            <div
              onClick={() => !uploadingImage && fileInputRef.current?.click()}
              style={{ border: '2px dashed #bfdbfe', borderRadius: '14px', background: '#f8faff', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: uploadingImage ? 'wait' : 'pointer', overflow: 'hidden', position: 'relative', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#bfdbfe'}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {uploadingImage && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#2563eb' }}>Uploading...</div>
                  )}
                  {!uploadingImage && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>Change Image</span>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                  <RiImageAddLine size={32} style={{ marginBottom: '0.5rem', color: '#93c5fd' }} />
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, color: '#475569' }}>Click to upload project image</p>
                  <p style={{ fontSize: '0.75rem', margin: '0.25rem 0 0', color: '#94a3b8' }}>PNG, JPG, WEBP up to 5MB</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </div>

          {/* Row 1: Team + Project */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}><RiTeamLine style={{ display: 'inline', marginRight: '0.3rem' }} />Team Name</label>
              <input style={inputStyle} placeholder="e.g. Team Alpha" value={form.teamName}
                onChange={e => handle('teamName', e.target.value)}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <div>
              <label style={labelStyle}><RiFolderLine style={{ display: 'inline', marginRight: '0.3rem' }} />Project Name *</label>
              <input style={inputStyle} placeholder="e.g. ClubFlow" value={form.title}
                onChange={e => handle('title', e.target.value)}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          {/* Row 2: GitHub + Live Demo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}><RiGithubFill style={{ display: 'inline', marginRight: '0.3rem' }} />GitHub Link</label>
              <input style={inputStyle} placeholder="https://github.com/..." value={form.repoUrl}
                onChange={e => handle('repoUrl', e.target.value)}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <div>
              <label style={labelStyle}><RiLink style={{ display: 'inline', marginRight: '0.3rem' }} />Live Demo Link</label>
              <input style={inputStyle} placeholder="https://your-app.com" value={form.liveUrl}
                onChange={e => handle('liveUrl', e.target.value)}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          {/* Row 3: Event Date */}
          <div>
            <label style={labelStyle}><RiCalendarLine style={{ display: 'inline', marginRight: '0.3rem' }} />Date of Project / Event</label>
            <input type="date" style={{ ...inputStyle, colorScheme: 'dark' }} value={form.eventDate}
              onChange={e => handle('eventDate', e.target.value)}
              onFocus={e => e.target.style.borderColor = '#7c3aed'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {/* Row 4: Description */}
          <div>
            <label style={labelStyle}>Description *</label>
            <textarea rows={3} style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
              placeholder="Briefly describe your project, what problem it solves..."
              value={form.description} onChange={e => handle('description', e.target.value)}
              onFocus={e => e.target.style.borderColor = '#7c3aed'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {/* Row 5: Tech Stack */}
          <div>
            <label style={labelStyle}><RiCodeSSlashLine style={{ display: 'inline', marginRight: '0.3rem' }} />Tech Stack *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
              {form.techStack.map(t => (
                <span key={t} onClick={() => removeTech(t)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '100px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', cursor: 'pointer' }}>
                  {t} <RiCloseLine size={12} />
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {TECH_OPTIONS.filter(t => !form.techStack.includes(t)).slice(0, 8).map(t => (
                <button key={t} type="button" onClick={() => addTech(t)}
                  style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.65rem', borderRadius: '100px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', cursor: 'pointer' }}>
                  + {t}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input style={{ ...inputStyle, flex: 1 }} placeholder="Or type custom tech..."
                value={techInput} onChange={e => setTechInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTech(techInput))}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <button type="button" onClick={() => addTech(techInput)}
                style={{ padding: '0.75rem 1rem', borderRadius: '12px', background: '#2563eb', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                Add
              </button>
            </div>
          </div>

          {error && <p style={{ color: '#dc2626', fontSize: '0.85rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.6rem 1rem', margin: 0 }}>{error}</p>}

          {/* Submit */}
          <button type="submit" disabled={submitting}
            style={{ padding: '0.9rem', borderRadius: '14px', background: submitting ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #06b6d4)', border: 'none', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'opacity 0.2s', marginTop: '0.5rem' }}>
            {submitting ? 'Submitting...' : <><RiCheckLine size={18} /> Submit Project</>}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ── Project Detail Modal ───────────────────────────────────────────────────
const ProjectDetailModal = ({ project, onClose, onToggleStar, currentUserId, isAdmin, onDelete, onFeatureToggle }) => {
  const isStarred = project.stars?.includes(currentUserId);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          style={{ width: '100%', maxWidth: '720px', maxHeight: '90vh', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 80px rgba(0,0,0,0.6)' }}
        >
          {/* Header */}
          <div style={{ height: '220px', background: `linear-gradient(135deg, #1e1b4b, #312e81)`, position: 'relative', flexShrink: 0 }}>
            {project.thumbnail
              ? <img src={project.thumbnail} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RiCodeSSlashLine size={80} style={{ opacity: 0.2 }} /></div>
            }
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%)' }} />
            <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.5rem', right: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem' }}>{project.title}</h2>
              {project.isFeatured && <span style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', padding: '0.15rem 0.6rem', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 800, color: '#fff' }}>FEATURED</span>}
            </div>
            <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RiCloseLine size={20} />
            </button>
          </div>

          {/* Body */}
          <div style={{ overflowY: 'auto', padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Description */}
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>{project.description}</p>

            {/* Tech Stack */}
            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>Tech Stack</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {project.techStack?.map(tech => (
                  <span key={tech} style={{ fontSize: '0.8rem', fontWeight: 600, padding: '0.3rem 0.8rem', borderRadius: '100px', background: `${TECH_COLORS[tech] || '#7c3aed'}18`, border: `1px solid ${TECH_COLORS[tech] || '#7c3aed'}40`, color: TECH_COLORS[tech] || 'var(--color-accent-primary)' }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Team */}
            {project.authors?.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><RiTeamLine /> Team Members</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {project.authors.map((author, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-bg-secondary)', padding: '0.4rem 0.75rem', borderRadius: '100px', border: '1px solid var(--color-border)' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>
                        {author.avatar ? <img src={author.avatar} alt="" style={{ width: '100%', borderRadius: '50%' }} /> : author.name?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{author.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem', marginTop: 'auto' }}>
              <button onClick={() => onToggleStar(project._id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', borderRadius: '10px', border: '1px solid var(--color-border)', background: isStarred ? 'rgba(245,158,11,0.1)' : 'var(--color-bg-secondary)', color: isStarred ? '#f59e0b' : 'var(--color-text-secondary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                {isStarred ? <RiStarFill size={16} /> : <RiStarLine size={16} />} {project.stars?.length || 0} Stars
              </button>
              {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', fontWeight: 700, textDecoration: 'none', fontSize: '0.85rem' }}><RiGithubFill size={16} /> GitHub</a>}
              {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', borderRadius: '10px', background: 'var(--color-accent-primary)', color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: '0.85rem', border: 'none' }}><RiExternalLinkLine size={16} /> Live Demo</a>}
              {isAdmin && (
                <>
                  <button onClick={() => onFeatureToggle(project._id, !project.isFeatured)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', marginLeft: 'auto' }}>
                    <RiStarFill size={16} /> {project.isFeatured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button onClick={() => onDelete(project._id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                    <RiDeleteBinLine size={16} /> Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Project Card ───────────────────────────────────────────────────────────
const ProjectCard = ({ project, index, onToggleStar, currentUserId, onClick }) => {
  const isStarred = project.stars?.includes(currentUserId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(124,58,237,0.15)' }}
      onClick={onClick}
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.25s, box-shadow 0.25s', cursor: 'pointer' }}
    >
      <div style={{ height: '180px', background: `linear-gradient(135deg, hsl(${(index * 55 + 240) % 360}, 60%, 15%), hsl(${(index * 55 + 280) % 360}, 70%, 20%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {project.thumbnail
          ? <img src={project.thumbnail} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          : <RiFolderLine size={64} style={{ opacity: 0.3 }} />
        }
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, var(--color-bg-card), transparent)' }} />
        {project.isFeatured && (
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 800, color: '#fff', boxShadow: '0 4px 12px rgba(245,158,11,0.4)' }}>FEATURED</div>
        )}
      </div>

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>{project.title}</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, flex: 1, marginBottom: '1.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {project.description}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
          {project.techStack?.slice(0, 4).map(tech => (
            <span key={tech} style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '100px', background: `${TECH_COLORS[tech] || '#7c3aed'}18`, border: `1px solid ${TECH_COLORS[tech] || '#7c3aed'}40`, color: TECH_COLORS[tech] || 'var(--color-accent-primary)' }}>{tech}</span>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', paddingLeft: '8px' }}>
            {project.authors?.slice(0, 3).map((author, i) => (
              <div key={i} title={author.name} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', border: '2px solid var(--color-bg-card)', marginLeft: '-8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#fff', zIndex: 3 - i }}>
                {author.avatar ? <img src={author.avatar} alt="" style={{ width: '100%', borderRadius: '50%' }} /> : author.name?.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button onClick={e => { e.stopPropagation(); onToggleStar(project._id); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', color: isStarred ? '#f59e0b' : 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 700 }}>
              {isStarred ? <RiStarFill size={18} /> : <RiStarLine size={18} />} {project.starCount || project.stars?.length || 0}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showSubmit, setShowSubmit] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      if (data.success) setProjects(data.projects);
    } catch (error) { console.error('Failed to fetch projects', error); }
    finally { setLoading(false); }
  };

  const handleToggleStar = async (projectId) => {
    try {
      const { data } = await api.patch(`/projects/${projectId}/star`);
      if (data.success) {
        setProjects(prev => prev.map(p => {
          if (p._id !== projectId) return p;
          const isNowStarred = data.starred;
          const newStars = isNowStarred ? [...p.stars, user.id] : p.stars.filter(id => id !== user.id);
          return { ...p, stars: newStars, starCount: data.starCount };
        }));
        if (selectedProject?._id === projectId) {
          setSelectedProject(prev => ({ ...prev, stars: data.starred ? [...prev.stars, user.id] : prev.stars.filter(id => id !== user.id) }));
        }
      }
    } catch (err) { console.error('Failed to toggle star', err); }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Delete this project permanently?')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(prev => prev.filter(p => p._id !== projectId));
      setSelectedProject(null);
    } catch (err) { alert('Delete failed'); }
  };

  const handleFeatureToggle = async (projectId, newFeatured) => {
    try {
      const { data } = await api.patch(`/projects/${projectId}`, { isFeatured: newFeatured });
      if (data.success) {
        setProjects(prev => prev.map(p => p._id === projectId ? { ...p, isFeatured: newFeatured } : p));
        setSelectedProject(prev => prev ? { ...prev, isFeatured: newFeatured } : prev);
      }
    } catch (err) { alert('Update failed'); }
  };

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.techStack?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: '1200px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>Project Showcase</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Discover and star open-source projects built by the community.</p>
        </div>
        <button
          onClick={() => setShowSubmit(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 10px 25px rgba(124,58,237,0.3)' }}>
          <RiAddLine size={18} /> Submit Project
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: '2rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <RiSearchLine size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects or technologies..."
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = 'var(--color-accent-primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
          />
        </div>
      </motion.div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading projects...</div>
      ) : (
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {filtered.map((project, i) => (
                <ProjectCard key={project._id} project={project} index={i} onToggleStar={handleToggleStar} currentUserId={user?.id} onClick={() => setSelectedProject(project)} />
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '5rem', background: 'var(--color-bg-card)', borderRadius: '20px', border: '1px dashed var(--color-border)' }}>
              <RiFolderLine size={48} color="var(--color-text-muted)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No projects found</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Be the first to submit a project!</p>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onToggleStar={handleToggleStar}
          currentUserId={user?.id}
          isAdmin={user?.role === 'admin'}
          onDelete={handleDelete}
          onFeatureToggle={handleFeatureToggle}
        />
      )}

      {/* Submit Project Modal */}
      <AnimatePresence>
        {showSubmit && (
          <SubmitProjectModal
            onClose={() => setShowSubmit(false)}
            onSuccess={(newProject) => {
              setProjects(prev => [newProject, ...prev]);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsPage;
