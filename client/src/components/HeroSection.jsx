import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { RiArrowRightLine, RiFlashlightLine, RiTeamLine, RiTrophyLine } from 'react-icons/ri';

const stats = [
  { icon: <RiTeamLine size={22} />, value: '200+', label: 'Active Members' },
  { icon: <RiFlashlightLine size={22} />, value: '50+', label: 'Projects Built' },
  { icon: <RiTrophyLine size={22} />, value: '30+', label: 'Events Hosted' },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
};

const HeroSection = ({ onOpenAuth }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '6rem 1.5rem 4rem',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* Ambient background blobs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.18) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '5%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'show' : 'hidden'}
        style={{ maxWidth: '780px', position: 'relative', zIndex: 1 }}
      >
        {/* Badge */}
        <motion.div variants={itemVariants} style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(124, 58, 237, 0.12)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            borderRadius: '100px', padding: '0.4rem 1rem',
            fontSize: '0.8rem', fontWeight: 600,
            color: 'var(--color-accent-secondary)',
            letterSpacing: '0.05em',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#06b6d4', display: 'inline-block' }} />
            University Technical Club Platform
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={itemVariants} style={{
          fontSize: 'clamp(2.5rem, 7vw, 5rem)',
          fontWeight: 900,
          lineHeight: 1.1,
          marginBottom: '1.5rem',
          letterSpacing: '-0.02em',
        }}>
          Build. Compete.{' '}
          <span className="gradient-text">Innovate.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p variants={itemVariants} style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: 'var(--color-text-secondary)',
          maxWidth: '560px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.7,
        }}>
          Your college's central hub for events, project showcases, coding challenges,
          and a real-time leaderboard. All in one place.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(124,58,237,0.4)' }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary"
            onClick={() => onOpenAuth('signup')}
            style={{ padding: '0.85rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            Get Started <RiArrowRightLine size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-outline"
            style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
          >
            Explore Events
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} style={{
          display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap',
        }}>
          {stats.map(({ icon, value, label }) => (
            <div key={label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '0.35rem',
              padding: '1.25rem 2rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              minWidth: '140px',
            }}>
              <span style={{ color: 'var(--color-accent-primary)' }}>{icon}</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{value}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
        }}
      >
        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll</span>
        <div style={{
          width: '1px', height: '40px',
          background: 'linear-gradient(to bottom, var(--color-accent-primary), transparent)',
        }} />
      </motion.div>
    </section>
  );
};

export default HeroSection;
