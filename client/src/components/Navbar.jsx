import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiMenuLine, RiCloseLine } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';

const NAVBAR_H = 64;

const Navbar = ({ onOpenAuth }) => {
  const { user, logout, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onResize = () => {
      const m = window.innerWidth <= 768;
      setIsMobile(m);
      if (!m) setMobileOpen(false);
    };
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const navLinks = [
    { label: 'Events', href: '#events' },
    { label: 'Projects', href: '#projects' },
    { label: 'Leaderboard', href: '#leaderboard' },
    { label: 'Gallery', href: '#gallery' },
  ];

  /* ── Desktop pill styles (scroll-aware) ── */
  const pillStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 300,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  };

  const navBarStyle = {
    width: '100%',
    maxWidth: scrolled && !isMobile ? '860px' : '100%',
    background: '#fff',
    borderRadius: scrolled && !isMobile ? '100px' : '0',
    boxShadow: scrolled || isMobile ? '0 2px 16px rgba(0,0,0,0.08)' : 'none',
    border: scrolled && !isMobile ? '1px solid rgba(0,0,0,0.07)' : '1px solid transparent',
    margin: scrolled && !isMobile ? '0.75rem 1.5rem 0' : '0',
    transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
    pointerEvents: 'all',
    backdropFilter: scrolled ? 'blur(16px)' : 'none',
  };

  const innerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.5rem',
    height: `${NAVBAR_H}px`,
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <>
      {/* ── Navbar bar ── */}
      <motion.div
        initial={{ opacity: 0, y: isMobile ? 0 : -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={pillStyle}
      >
        <div style={navBarStyle}>
          <div style={innerStyle}>

            {/* Logo */}
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', flexShrink: 0 }}>
              <img src="/logo.png" alt="ClubFlow" style={{ height: '36px', objectFit: 'contain' }} />
              {!isMobile && (
                <span className="gradient-text" style={{ fontSize: '1.15rem', fontWeight: 800 }}>ClubFlow</span>
              )}
            </a>

            {/* Desktop nav links */}
            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                {navLinks.map(l => (
                  <a key={l.label} href={l.href} style={{ color: '#475569', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#0f172a'}
                    onMouseLeave={e => e.target.style.color = '#475569'}
                  >{l.label}</a>
                ))}
              </div>
            )}

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {!isMobile && (
                user ? (
                  <>
                    {isAdmin && <a href="/admin" style={{ color: '#eab308', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>Admin</a>}
                    <a href="/dashboard" style={{ textDecoration: 'none' }}>
                      <button className="btn-outline" style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}>Dashboard</button>
                    </a>
                    <button onClick={logout} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer' }}>Logout</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => onOpenAuth('login')} style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', padding: '0.45rem 1rem' }}>Login</button>
                    <button className="btn-primary" onClick={() => onOpenAuth('signup')} style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}>Join Now</button>
                  </>
                )
              )}

              {/* Hamburger */}
              {isMobile && (
                <button
                  onClick={() => setMobileOpen(o => !o)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#1e293b', padding: '4px' }}
                >
                  {mobileOpen ? <RiCloseLine size={26} /> : <RiMenuLine size={26} />}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Mobile dropdown (rendered at root level, separate from navbar pill) ── */}
      <AnimatePresence>
        {mobileOpen && isMobile && (
          <>
            {/* Dropdown panel */}
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                top: `${NAVBAR_H}px`,
                left: 0, right: 0,
                zIndex: 400,
                background: '#fff',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                borderTop: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem 1.5rem 1.25rem' }}>
                {navLinks.map(l => (
                  <a key={l.label} href={l.href}
                    onClick={() => setMobileOpen(false)}
                    style={{ color: '#334155', textDecoration: 'none', fontWeight: 500, fontSize: '1rem', padding: '0.65rem 0', borderBottom: '1px solid #f1f5f9', display: 'block' }}
                  >{l.label}</a>
                ))}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.75rem' }}>
                  {user ? (
                    <>
                      <a href="/dashboard" onClick={() => setMobileOpen(false)}
                        style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 700, padding: '0.5rem 0', display: 'block' }}>→ Dashboard</a>
                      <button onClick={() => { logout(); setMobileOpen(false); }}
                        style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.7rem', background: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 500 }}>
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { onOpenAuth('login'); setMobileOpen(false); }}
                        style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.7rem', background: 'none', color: '#1e293b', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>
                        Login
                      </button>
                      <button className="btn-primary" onClick={() => { onOpenAuth('signup'); setMobileOpen(false); }}
                        style={{ padding: '0.7rem', fontSize: '0.95rem', borderRadius: '10px' }}>
                        Join Now
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: 'fixed', inset: 0, top: `${NAVBAR_H}px`, background: 'rgba(15,23,42,0.35)', zIndex: 399 }}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
