import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiMenuLine, RiCloseLine } from 'react-icons/ri';
import Sidebar from '../components/Sidebar';

const SidebarLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Desktop Sidebar */}
      <div className="sidebar-desktop">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                zIndex: 99, backdropFilter: 'blur(4px)',
              }}
            />
            <motion.div
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100 }}
            >
              <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile top bar */}
        <div className="mobile-topbar" style={{
          display: 'none', alignItems: 'center', gap: '1rem',
          padding: '0.875rem 1.25rem',
          background: 'var(--color-bg-secondary)',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <button
            onClick={() => setMobileOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer' }}
          >
            <RiMenuLine size={22} />
          </button>
          <img src="/logo.png" alt="ClubFlow" style={{ height: '28px', objectFit: 'contain' }} />
        </div>

        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
