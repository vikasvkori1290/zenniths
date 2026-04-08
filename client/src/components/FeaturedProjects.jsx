import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { RiStarLine, RiGithubFill, RiExternalLinkLine } from 'react-icons/ri';
import api from '../api/axios';

const TECH_COLORS = {
  React: '#61dafb', 'Node.js': '#68a063', MongoDB: '#4db33d',
  Python: '#3776ab', 'Vue.js': '#42b883', TypeScript: '#3178c6',
  TailwindCSS: '#06b6d4', Express: '#fff', Next: '#fff',
  Flutter: '#54c5f8', Firebase: '#ffca28',
};

const STATIC_PROJECTS = [
  { _id: '1', title: 'AI Study Planner', description: 'Smart scheduler that builds personalized study plans using ML.', techStack: ['Python', 'React', 'MongoDB'], stars: 34, liveUrl: '#', repoUrl: '#', thumbnail: null },
  { _id: '2', title: 'CodeCollab IDE', description: 'Real-time collaborative code editor with syntax highlighting.', techStack: ['Node.js', 'React', 'TypeScript'], stars: 51, liveUrl: '#', repoUrl: '#', thumbnail: null },
  { _id: '3', title: 'CampusCart', description: 'Peer-to-peer marketplace for students to buy & sell items.', techStack: ['Next', 'MongoDB', 'TailwindCSS'], stars: 28, liveUrl: '#', repoUrl: '#', thumbnail: null },
  { _id: '4', title: 'EventFlow', description: 'Automated event registration and QR-based check-in system.', techStack: ['React', 'Express', 'MongoDB'], stars: 19, liveUrl: '#', repoUrl: '#', thumbnail: null },
  { _id: '5', title: 'DevBoard', description: 'GitHub-style contribution tracking dashboard for club members.', techStack: ['React', 'Node.js', 'MongoDB'], stars: 42, liveUrl: '#', repoUrl: '#', thumbnail: null },
  { _id: '6', title: 'MockBattle', description: 'Competitive mock interview platform with real-time scoring.', techStack: ['Vue.js', 'Firebase', 'Python'], stars: 23, liveUrl: '#', repoUrl: '#', thumbnail: null },
];

const ProjectCard = ({ project, index, isInView }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={isInView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.55, delay: index * 0.07 }}
    whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(124,58,237,0.2)' }}
    style={{
      background: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      borderRadius: '16px', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      transition: 'transform 0.25s, box-shadow 0.25s',
      cursor: 'pointer',
    }}
  >
    {/* Thumbnail / Placeholder */}
    <div style={{
      height: '160px',
      background: `linear-gradient(135deg, 
        hsl(${(index * 55 + 240) % 360}, 60%, 15%), 
        hsl(${(index * 55 + 280) % 360}, 70%, 20%))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '3rem', position: 'relative', overflow: 'hidden',
    }}>
      {project.thumbnail
        ? <img src={project.thumbnail} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ fontSize: '2.5rem', opacity: 0.6 }}>{'⚡🚀🛠️💡🎯🌐'[index % 6]}</span>
      }
      {/* Overlay gradient */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
        background: 'linear-gradient(to top, var(--color-bg-card), transparent)',
      }} />
    </div>

    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>{project.title}</h3>
      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, flex: 1, marginBottom: '1rem' }}>
        {project.description}
      </p>

      {/* Tech Stack Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
        {project.techStack?.slice(0, 4).map((tech) => (
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

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
          <RiStarLine size={14} />
          <span>{project.stars}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {project.repoUrl && project.repoUrl !== '#' && (
            <a href={project.repoUrl} target="_blank" rel="noreferrer"
              style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}
              onClick={(e) => e.stopPropagation()}
            >
              <RiGithubFill size={17} />
            </a>
          )}
          {project.liveUrl && project.liveUrl !== '#' && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer"
              style={{ color: 'var(--color-accent-secondary)', display: 'flex', alignItems: 'center' }}
              onClick={(e) => e.stopPropagation()}
            >
              <RiExternalLinkLine size={17} />
            </a>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

const FeaturedProjects = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [projects, setProjects] = useState(STATIC_PROJECTS);

  useEffect(() => {
    api.get('/projects?limit=6')
      .then(({ data }) => { if (data.projects?.length) setProjects(data.projects); })
      .catch(() => {});
  }, []);

  return (
    <section id="projects" ref={ref} style={{
      padding: '5rem 1.5rem',
      background: 'linear-gradient(180deg, transparent, rgba(124,58,237,0.04), transparent)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <p className="section-label" style={{ marginBottom: '0.5rem' }}>🚀 Member Creations</p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '480px', margin: '0 auto', fontSize: '0.95rem' }}>
            Explore what our members have built. Real projects, real impact.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}>
          {projects.map((project, i) => (
            <ProjectCard key={project._id} project={project} index={i} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
