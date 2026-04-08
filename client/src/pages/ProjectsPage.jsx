import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiStarLine, RiGithubFill, RiExternalLinkLine, RiStarFill,
  RiSearchLine, RiAddLine, RiFolderLine
} from 'react-icons/ri';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const TECH_COLORS = {
  React: '#61dafb', 'Node.js': '#68a063', MongoDB: '#4db33d',
  Python: '#3776ab', 'Vue.js': '#42b883', TypeScript: '#3178c6',
  TailwindCSS: '#06b6d4', Express: '#fff', Next: '#fff',
  Flutter: '#54c5f8', Firebase: '#ffca28', Go: '#00add8',
};

const ProjectCard = ({ project, index, onToggleStar, currentUserId }) => {
  const isStarred = project.stars?.includes(currentUserId);
  const [starLoading, setStarLoading] = useState(false);

  const handleStarClick = async (e) => {
    e.stopPropagation();
    if (starLoading) return;
    setStarLoading(true);
    await onToggleStar(project._id);
    setStarLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(124,58,237,0.15)' }}
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        transition: 'transform 0.25s, box-shadow 0.25s',
      }}
    >
      {/* Thumbnail */}
      <div style={{
        height: '180px',
        background: `linear-gradient(135deg, 
          hsl(${(index * 55 + 240) % 360}, 60%, 15%), 
          hsl(${(index * 55 + 280) % 360}, 70%, 20%))`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {project.thumbnail
          ? <img src={project.thumbnail} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <RiFolderLine size={64} style={{ opacity: 0.3 }} />
        }
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
          background: 'linear-gradient(to top, var(--color-bg-card), transparent)',
        }} />
        
        {/* Featured Badge */}
        {project.isFeatured && (
          <div style={{
            position: 'absolute', top: '1rem', left: '1rem',
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            padding: '0.2rem 0.6rem', borderRadius: '100px',
            fontSize: '0.65rem', fontWeight: 800, color: '#fff',
            boxShadow: '0 4px 12px rgba(245,158,11,0.4)',
          }}>
            FEATURED
          </div>
        )}
      </div>

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>{project.title}</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, flex: 1, marginBottom: '1.25rem' }}>
          {project.description}
        </p>

        {/* Tech Stack Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
          {project.techStack?.map((tech) => (
            <span key={tech} style={{
              fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.6rem',
              borderRadius: '100px',
              background: `${TECH_COLORS[tech] || '#7c3aed'}18`,
              border: `1px solid ${TECH_COLORS[tech] || '#7c3aed'}40`,
              color: TECH_COLORS[tech] || 'var(--color-accent-primary)',
            }}>
              {tech}
            </span>
          ))}
        </div>

        {/* Actions Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderTop: '1px solid var(--color-border)', paddingTop: '1rem',
        }}>
          {/* Author avatars */}
          <div style={{ display: 'flex', paddingLeft: '8px' }}>
            {project.authors?.slice(0, 3).map((author, i) => (
              <div key={author._id} title={author.name} style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                border: '2px solid var(--color-bg-card)',
                marginLeft: '-8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem', fontWeight: 700, color: '#fff', zIndex: 3 - i,
              }}>
                {author.avatar ? <img src={author.avatar} alt="" style={{ width: '100%', borderRadius: '50%' }} /> : author.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={handleStarClick}
              disabled={starLoading}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                color: isStarred ? '#f59e0b' : 'var(--color-text-muted)',
                fontSize: '0.85rem', fontWeight: 700, transition: 'color 0.2s',
              }}
            >
              {isStarred ? <RiStarFill size={18} /> : <RiStarLine size={18} />}
              {project.starCount || project.stars?.length || 0}
            </button>
            <div style={{ width: '1px', height: '14px', background: 'var(--color-border)' }} />
            {project.repoUrl && (
              <a href={project.repoUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-text-secondary)', display: 'flex' }} onClick={e => e.stopPropagation()}>
                <RiGithubFill size={18} />
              </a>
            )}
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent-secondary)', display: 'flex' }} onClick={e => e.stopPropagation()}>
                <RiExternalLinkLine size={18} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      if (data.success) setProjects(data.projects);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStar = async (projectId) => {
    try {
      const { data } = await api.patch(`/projects/${projectId}/star`);
      if (data.success) {
        setProjects(prev => prev.map(p => {
          if (p._id === projectId) {
            const isNowStarred = data.starred;
            const newStars = isNowStarred
              ? [...p.stars, user.id]
              : p.stars.filter(id => id !== user.id);
            return { ...p, stars: newStars, starCount: data.starCount };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error('Failed to toggle star', err);
    }
  };

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.techStack.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between',
        gap: '1rem', marginBottom: '2.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>Project Showcase</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Discover and star open-source projects built by the community.
          </p>
        </div>
        
        <button style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.75rem 1.25rem', borderRadius: '12px',
          background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
          color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.9rem',
          cursor: 'pointer', boxShadow: '0 10px 25px rgba(124,58,237,0.3)',
          transition: 'transform 0.2s',
        }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <RiAddLine size={18} /> Submit Project
        </button>
      </motion.div>

      {/* Tool Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{
        display: 'flex', marginBottom: '2rem'
      }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <RiSearchLine size={18} style={{
            position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)'
          }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search projects or technologies..."
            style={{
              width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
              background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
              borderRadius: '12px', color: 'var(--color-text-primary)',
              fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--color-accent-primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
          />
        </div>
      </motion.div>

      {/* Gallery Grid */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading projects...</div>
      ) : (
        <AnimatePresence mode="popLayout">
          {filteredProjects.length > 0 ? (
            <motion.div
              style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem',
              }}
            >
              {filteredProjects.map((project, i) => (
                <ProjectCard
                  key={project._id} project={project} index={i}
                  onToggleStar={handleToggleStar} currentUserId={user?.id}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{
              textAlign: 'center', padding: '5rem', background: 'var(--color-bg-card)', borderRadius: '20px', border: '1px dashed var(--color-border)'
            }}>
              <RiFolderLine size={48} color="var(--color-text-muted)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No projects found</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                Be the first to submit a project to the hub!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default ProjectsPage;
