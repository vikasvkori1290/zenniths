import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { RiSwordLine, RiFlashlightLine, RiArrowRightLine } from 'react-icons/ri';
import api from '../api/axios';

const ChallengesPreview = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [challenges, setChallenges] = useState([
    { _id: '1', title: 'Binary Tree Traversal', difficulty: 'Medium', points: 150, category: 'DSA' },
    { _id: '2', title: 'Optimize React Render', difficulty: 'Hard', points: 300, category: 'Frontend' },
    { _id: '3', title: 'DB Indexing Master', difficulty: 'Medium', points: 200, category: 'Backend' },
  ]);

  useEffect(() => {
    api.get('/challenges?featured=true&limit=3')
      .then(({ data }) => { if (data.challenges?.length) setChallenges(data.challenges); })
      .catch(() => {});
  }, []);

  const diffColor = (diff) => {
    if (diff === 'Easy') return '#10b981';
    if (diff === 'Medium') return '#f59e0b';
    return '#ef4444';
  };

  return (
    <section id="featured-challenges" ref={ref} style={{ padding: '5rem 1.5rem', background: 'var(--color-bg-secondary)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p className="section-label" style={{ marginBottom: '0.5rem' }}>⚔️ Sharpen Your Skills</p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800 }}>
               Weekly <span className="gradient-text">Challenges</span>
            </h2>
          </div>
          <a href="/challenges" style={{ color: 'var(--color-accent-primary)', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            All Challenges <RiArrowRightLine />
          </a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {challenges.map((ch, i) => (
            <motion.div
              key={ch._id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{ x: 5 }}
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '20px',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent-primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                background: `linear-gradient(135deg, ${diffColor(ch.difficulty)}20, transparent)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: diffColor(ch.difficulty), border: `1px solid ${diffColor(ch.difficulty)}40`
              }}>
                <RiFlashlightLine size={28} />
              </div>

              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.25rem' }}>{ch.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  <span style={{ color: diffColor(ch.difficulty) }}>{ch.difficulty}</span>
                  <span>•</span>
                  <span>{ch.points} Pts</span>
                  <span>•</span>
                  <span>{ch.category}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ChallengesPreview;
