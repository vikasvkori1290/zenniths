import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiCodeSSlashLine, RiDashboardLine, RiTeamLine, RiFolderLine,
  RiCalendarEventLine, RiFlashlightLine, RiTrophyLine,
  RiMenuLine, RiCloseLine, RiLogoutBoxLine, RiShieldLine,
  RiArrowLeftSLine, RiArrowRightSLine,
} from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { icon: <RiDashboardLine size={20} />, label: 'Dashboard', to: '/dashboard' },
  { icon: <RiTeamLine size={20} />, label: 'Participants', to: '/team' },
  { icon: <RiFolderLine size={20} />, label: 'Projects', to: '/projects' },
  { icon: <RiCalendarEventLine size={20} />, label: 'Events', to: '/events' },
  { icon: <RiFlashlightLine size={20} />, label: 'Challenges', to: '/challenges' },
  { icon: <RiTrophyLine size={20} />, label: 'Leaderboard', to: '/leaderboard' },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      style={{
        height: '100vh', position: 'sticky', top: 0,
        background: 'var(--color-bg-secondary)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', flexShrink: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '1.25rem 0' : '1.25rem 1.25rem',
        display: 'flex', alignItems: 'center',
        gap: '0.75rem', borderBottom: '1px solid var(--color-border)',
        justifyContent: collapsed ? 'center' : 'flex-start',
        minHeight: '68px',
      }}>
        <img
          src="/logo.png"
          alt="ClubFlow Logo"
          style={{
            height: '36px',
            maxWidth: collapsed ? '36px' : '130px',
            objectFit: 'contain',
            transition: 'max-width 0.25s',
          }}
        />
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
        {NAV_ITEMS.filter(item => {
          if (item.label === 'Participants' && !isAdmin) return false;
          return true;
        }).map(({ icon, label, to }) => (
          <NavLink
            key={to} to={to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center',
              gap: '0.75rem',
              padding: collapsed ? '0.75rem' : '0.7rem 0.875rem',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 600, fontSize: '0.875rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'all 0.18s',
              color: isActive ? '#fff' : 'var(--color-text-secondary)',
              background: isActive
                ? 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.15))'
                : 'transparent',
              border: isActive ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
            })}
            title={collapsed ? label : ''}
          >
            {({ isActive }) => (
              <>
                <span style={{ color: isActive ? 'var(--color-accent-primary)' : 'var(--color-text-muted)', flexShrink: 0 }}>
                  {icon}
                </span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}

        {/* Admin Link */}
        {isAdmin && (
          <NavLink
            to="/admin"
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: collapsed ? '0.75rem' : '0.7rem 0.875rem',
              borderRadius: '10px', textDecoration: 'none',
              fontWeight: 600, fontSize: '0.875rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: isActive ? '#f59e0b' : 'var(--color-text-muted)',
              background: isActive ? 'rgba(245,158,11,0.1)' : 'transparent',
              border: isActive ? '1px solid rgba(245,158,11,0.25)' : '1px solid transparent',
              marginTop: '0.5rem',
            })}
            title={collapsed ? 'Admin' : ''}
          >
            <RiShieldLine size={20} style={{ flexShrink: 0 }} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Admin Panel
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        )}
      </nav>

      {/* User Info + Collapse Toggle */}
      <div style={{ borderTop: '1px solid var(--color-border)', padding: '0.75rem 0.5rem' }}>
        {/* User card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: collapsed ? '0.5rem' : '0.65rem 0.75rem',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.03)',
          justifyContent: collapsed ? 'center' : 'flex-start',
          marginBottom: '0.5rem',
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.85rem', fontWeight: 700, color: '#fff',
          }}>
            {user?.avatar
              ? <img src={user.avatar} alt="" style={{ width: '100%', borderRadius: '50%' }} />
              : user?.name?.charAt(0).toUpperCase() || 'U'
            }
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ minWidth: 0 }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || 'Member'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                  {user?.role}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : ''}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: collapsed ? '0.65rem' : '0.65rem 0.875rem',
            borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'var(--color-text-muted)',
            fontSize: '0.875rem', fontWeight: 600,
            justifyContent: collapsed ? 'center' : 'flex-start',
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
        >
          <RiLogoutBoxLine size={18} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Logout</motion.span>}
          </AnimatePresence>
        </button>

        {/* Toggle button */}
        <button
          onClick={onToggle}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0.5rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'var(--color-text-muted)',
            transition: 'all 0.18s', marginTop: '0.25rem',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <RiArrowRightSLine size={18} /> : <RiArrowLeftSLine size={18} />}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
