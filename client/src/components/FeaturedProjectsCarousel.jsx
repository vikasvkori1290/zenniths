import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { RiGithubFill, RiExternalLinkLine, RiArrowRightLeftLine } from 'react-icons/ri';
import api from '../api/axios';

const FeaturedProjectsCarousel = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [projects, setProjects] = useState([
    { _id: '1', title: 'Solar Tracking Robot', description: 'Autonomous dual-axis solar tracker with IoT monitoring.', techStack: ['Arduino', 'C++', 'IoT'], githubUrl: '#' },
    { _id: '2', title: 'Campus Navigation AR', description: 'Augmented reality app for university campus tour.', techStack: ['Unity', 'C#', 'ARCore'], githubUrl: '#' },
    { _id: '3', title: 'Club Management System', description: 'Centralized platform for member and event management.', techStack: ['MERN', 'JWT', 'Socket.io'], githubUrl: '#' },
    { _id: '4', title: 'AI Study Assistant', description: 'NLP-based bot to help students with academic queries.', techStack: ['Python', 'OpenAI', 'React'], githubUrl: '#' },
  ]);

  useEffect(() => {
    api.get('/projects?featured=true&limit=6')
      .then(({ data }) => { if (data.projects?.length) setProjects(data.projects); })
      .catch(() => {});
  }, []);

  return (
    <section id="projects" ref={ref} style={{ padding: '5rem 1.5rem', background: 'var(--color-bg-primary)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '3rem', textAlign: 'center' }}
        >
          <p className="section-label" style={{ marginBottom: '0.5rem' }}>🛠️ Innovation at Work</p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800 }}>
             Featured <span className="gradient-text">Projects</span>
          </h2>
        </motion.div>

        <div style={{
          display: 'flex',
          gap: '1.5rem',
          overflowX: 'auto',
          paddingBottom: '2rem',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}>
          {projects.map((project, i) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              style={{
                minWidth: '320px',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '24px',
                padding: '1.75rem',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: 'rgba(124, 58, 237, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-accent-primary)', fontSize: '1.5rem'
              }}>
                <RiArrowRightLeftLine />
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>{project.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, height: '4.8em', overflow: 'hidden' }}>
                    {project.description}
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {project.techStack?.map(tech => (
                  <span key={tech} style={{
                    fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)',
                    background: 'rgba(0,0,0,0.03)', border: '1px solid var(--color-border)',
                    padding: '0.2rem 0.6rem', borderRadius: '6px'
                  }}>
                    {tech}
                  </span>
                ))}
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <a href={project.githubUrl} style={{ color: 'var(--color-text-muted)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='#000'} onMouseLeave={e => e.currentTarget.style.color='var(--color-text-muted)'}>
                  <RiGithubFill size={22} />
                </a>
                <a href="#" style={{ marginLeft: 'auto', color: 'var(--color-accent-primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Live Demo <RiExternalLinkLine size={16} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjectsCarousel;
