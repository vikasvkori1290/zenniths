import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiStarLine, RiGithubFill, RiExternalLinkLine, RiStarFill,
  RiSearchLine, RiAddLine, RiFolderLine, RiCloseLine, RiDeleteBinLine, RiEdit2Line,
  RiCodeSSlashLine, RiTeamLine
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
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 10px 25px rgba(124,58,237,0.3)' }}>
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
    </div>
  );
};

export default ProjectsPage;
