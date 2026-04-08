import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiMenuLine, RiCloseLine, RiCodeSSlashLine } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onOpenAuth }) => {
  const { user, logout, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Events', href: '#events' },
    { label: 'Projects', href: '#projects' },
    { label: 'Leaderboard', href: '#leaderboard' },
    { label: 'Gallery', href: '#gallery' },
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0, paddingTop: '0rem', paddingBottom: '0rem', paddingLeft: '0rem', paddingRight: '0rem' }}
      animate={{
        y: 0,
        opacity: 1,
        paddingTop: scrolled ? '0.75rem' : '0rem',
        paddingBottom: scrolled ? '0.75rem' : '0rem',
        paddingLeft: scrolled ? '1.5rem' : '0rem',
        paddingRight: scrolled ? '1.5rem' : '0rem',
      }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        background: 'transparent',
      }}
    >
      <motion.div
        animate={{
          borderRadius: scrolled ? '100px' : '0px',
          maxWidth: scrolled ? '860px' : '1200px',
          background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'blur(0px)',
          boxShadow: scrolled
            ? '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)'
            : 'none',
          border: scrolled ? '1px solid rgba(0,0,0,0.07)' : '1px solid transparent',
        }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        style={{
          width: '100%',
          pointerEvents: 'all',
          overflow: 'hidden',
        }}
      >
      <motion.div
        animate={{
          maxWidth: scrolled ? '860px' : '1200px',
          paddingLeft: scrolled ? '1.75rem' : '1.5rem',
          paddingRight: scrolled ? '1.75rem' : '1.5rem',
          height: scrolled ? '58px' : '68px',
        }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        style={{
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <img src="/logo.png" alt="ClubFlow Logo" style={{ height: '44px', objectFit: 'contain' }} />
          <span className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 800 }}>ClubFlow</span>
        </a>


        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} style={{
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--color-text-primary)'}
              onMouseLeave={e => e.target.style.color = 'var(--color-text-secondary)'}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <>
              {isAdmin && (
                <a href="/admin" style={{
                  color: 'var(--color-accent-secondary)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}>
                  Admin
                </a>
              )}
              <a href="/dashboard" style={{ textDecoration: 'none' }}>
                <button className="btn-outline" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                  Dashboard
                </button>
              </a>
              <button
                onClick={logout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.target.style.color = 'var(--color-text-primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--color-text-secondary)'}
              >
                Login
              </button>
              <button className="btn-primary" onClick={() => onOpenAuth('signup')} style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                Join Now
              </button>
            </>
          )}

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', display: 'none' }}
            className="mobile-menu-btn"
          >
            {mobileOpen ? <RiCloseLine size={24} /> : <RiMenuLine size={24} />}
          </button>
        </div>
      </motion.div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              background: 'var(--color-bg-card)',
              borderTop: '1px solid var(--color-border)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {navLinks.map((link) => (
                <a key={link.label} href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontWeight: 500 }}
                >
                  {link.label}
                </a>
              ))}
              {!user && (
                <button className="btn-primary" onClick={() => { onOpenAuth('signup'); setMobileOpen(false); }}>
                  Join Now
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
