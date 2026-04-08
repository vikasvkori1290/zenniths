import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { RiArrowRightLine, RiFlashlightLine, RiTeamLine, RiTrophyLine } from 'react-icons/ri';
import api from '../api/axios';

const images = ['/2.png', '/3.png', '/4.png', '/5.png', '/6.png', '/7.png'];
// Duplicate multiple times to ensure enough images to cover very wide screens without gaps
const allImages = [...images, ...images, ...images, ...images]; // 4 sets

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

const IMG_W = 170;
const GAP   = 20;
const STRIP_HALF = images.length * (IMG_W + GAP);

const HeroSection = ({ onOpenAuth }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [liveStats, setLiveStats] = useState({ members: 0, projects: 0, events: 0 });

  useEffect(() => {
    api.get('/admin/public-stats')
      .then(({ data }) => { if (data.success) setLiveStats(data.stats); })
      .catch(() => {});
  }, []);

  const statsDisplay = [
    { icon: <RiTeamLine size={22} />, value: liveStats.members || '200+', label: 'Active Members' },
    { icon: <RiFlashlightLine size={22} />, value: liveStats.projects || '50+', label: 'Projects Built' },
    { icon: <RiTrophyLine size={22} />, value: liveStats.events || '30+', label: 'Events Hosted' },
  ];

  return (
    <section
      ref={ref}
      style={{
        minHeight: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
        padding: '3rem 1.5rem 8rem',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* Ambient blobs */}
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
        backgroundImage: `linear-gradient(rgba(124,58,237,0.10) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(124,58,237,0.10) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
        zIndex: 0,
      }} />

      {/* CSS keyframe for strip animation */}
      <style>{`
        @keyframes heroSlide {
          0%   { transform: translateX(0px); }
          100% { transform: translateX(-${STRIP_HALF}px); }
        }
      `}</style>

      {/* ── Background image strip (z:0 — behind everything) ───── */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        <div style={{
          display: 'flex',
          gap: `${GAP}px`,
          animation: `heroSlide ${images.length * 4.5}s linear infinite`,
          willChange: 'transform',
          opacity: 0.65,

        }}>
          {allImages.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              style={{
                width: `${IMG_W}px`,
                height: '230px',
                objectFit: 'cover',
                borderRadius: '16px',
                flexShrink: 0,
                userSelect: 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/*
        ── Overlay curtains (z:1) — sit ON TOP of images but BELOW text (z:2)
        Left curtain : solid bg on far-left edge, fading to transparent inward
        Right curtain: solid bg on far-right edge, fading to transparent inward
        Centre panel : fully opaque bg strip that hides images behind text
      */}
      {/* Far-left edge fade */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: '18%',
        background: 'linear-gradient(to right, var(--color-bg-primary) 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 1,
      }} />
      {/* Far-right edge fade */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: '18%',
        background: 'linear-gradient(to left, var(--color-bg-primary) 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 1,
      }} />
      {/* Centre panel — hides images behind text */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0,
        left: '28%', right: '28%',
        background: 'linear-gradient(to right, transparent 0%, var(--color-bg-primary) 15%, var(--color-bg-primary) 85%, transparent 100%)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* ── Hero content (z:2 — on top of everything) ────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'show' : 'hidden'}
        style={{ maxWidth: '780px', position: 'relative', zIndex: 2 }}
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
          fontWeight: 900, lineHeight: 1.1,
          marginBottom: '1.5rem', letterSpacing: '-0.02em',
        }}>
          Build. Compete.{' '}
          <span className="gradient-text">Innovate.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p variants={itemVariants} style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: 'var(--color-text-secondary)',
          maxWidth: '560px', margin: '0 auto 2.5rem', lineHeight: 1.7,
        }}>
          Your college&apos;s central hub for events, project showcases, coding challenges,
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

        <motion.div variants={itemVariants} style={{
          display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap',
        }}>
          {statsDisplay.map(({ icon, value, label }) => (
            <div key={label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '0.35rem', padding: '1.25rem 2rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px', minWidth: '140px',
            }}>
              <span style={{ color: 'var(--color-accent-primary)' }}>{icon}</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{value}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

    </section>
  );
};

export default HeroSection;
