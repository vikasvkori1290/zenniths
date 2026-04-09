import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine, RiGithubFill, RiGoogleFill, RiEyeLine, RiEyeOffLine, RiLoader4Line } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { login, register, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const overlayRef = useRef(null);

  const [form, setForm] = useState({ name: '', email: '', password: '', mobile: '', otp: '' });

  useEffect(() => {
    setTab(initialTab);
    setError('');
    setForm({ name: '', email: '', password: '', mobile: '', otp: '' });
  }, [initialTab, isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleChange = (e) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        const res = await login(form.email, form.password);
        if (res.requiresOtp) {
          setTab('verify');
        } else {
          onClose();
          navigate(res.role === 'admin' ? '/admin' : '/dashboard');
        }
      } else if (tab === 'signup') {
        if (!form.name.trim()) { setError('Name is required'); setLoading(false); return; }
        if (!form.mobile.trim()) { setError('Mobile number is required'); setLoading(false); return; }
        const res = await register(form.name, form.email, form.password, form.mobile);
        if (res.requiresOtp) {
          setTab('verify');
        } else {
          onClose();
          navigate('/dashboard');
        }
      } else if (tab === 'verify') {
        if (!form.otp.trim()) { setError('OTP is required'); setLoading(false); return; }
        const user = await verifyOtp(form.email, form.otp);
        onClose();
        navigate(user.role === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        onClick={handleOverlayClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            width: '100%', maxWidth: '420px',
            background: 'var(--color-bg-card)',
            backdropFilter: 'blur(24px)',
            border: '1px solid var(--color-border)',
            borderRadius: '20px',
            padding: '2rem',
            position: 'relative',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: 'rgba(255,255,255,0.05)', border: 'none',
              borderRadius: '8px', padding: '0.4rem',
              color: 'var(--color-text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
          >
            <RiCloseLine size={18} />
          </button>

          {/* Header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              {tab === 'login' ? 'Welcome back 👋' : tab === 'verify' ? 'Check your email 📧' : 'Join the Club 🚀'}
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              {tab === 'login' ? 'Log in to access your dashboard' : tab === 'verify' ? 'Enter the 6-digit OTP sent to your email.' : 'Create your account to get started'}
            </p>
          </div>

          {/* Tab Toggle */}
          {tab !== 'verify' && (
            <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '1.5rem',
            border: '1px solid var(--color-border)',
          }}>
            {['login', 'signup'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                style={{
                  flex: 1, padding: '0.55rem',
                  border: 'none', borderRadius: '7px', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.875rem',
                  transition: 'all 0.25s',
                  background: tab === t
                    ? 'linear-gradient(135deg, var(--color-accent-gradient-start), var(--color-accent-gradient-end))'
                    : 'transparent',
                  color: tab === t ? '#fff' : 'var(--color-text-secondary)',
                }}
              >
                {t === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
            </div>
          )}

          {/* OAuth Buttons */}
          {tab !== 'verify' && (
            <>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {[
              { icon: <RiGoogleFill size={18} />, label: 'Google', color: '#ea4335' },
              { icon: <RiGithubFill size={18} />, label: 'GitHub', color: '#fff' },
            ].map(({ icon, label, color }) => (
              <button
                key={label}
                onClick={() => {
                  window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/${label.toLowerCase()}`;
                }}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '0.5rem', padding: '0.65rem',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px', cursor: 'pointer',
                  color, fontWeight: 600, fontSize: '0.875rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'var(--color-border-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
              >
                {icon}
                <span style={{ color: 'var(--color-text-primary)' }}>{label}</span>
              </button>
            ))}
          </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            </div>
            </>
          )}

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px', padding: '0.65rem 0.875rem',
                  color: '#f87171', fontSize: '0.8rem',
                  marginBottom: '1rem',
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {tab === 'signup' && (
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                  Full Name
                </label>
                <input
                  name="name" type="text" value={form.name}
                  onChange={handleChange} placeholder="Vikas Kumar"
                  required
                  style={{
                    width: '100%', padding: '0.7rem 0.875rem',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '10px', color: 'var(--color-text-primary)',
                    fontSize: '0.9rem', outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-accent-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>
            )}
            
            {tab === 'signup' && (
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                  Mobile Number
                </label>
                <input
                  name="mobile" type="tel" value={form.mobile}
                  onChange={handleChange} placeholder="+1234567890"
                  required
                  style={{
                    width: '100%', padding: '0.7rem 0.875rem',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '10px', color: 'var(--color-text-primary)',
                    fontSize: '0.9rem', outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-accent-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>
            )}

            {tab !== 'verify' && (
              <>
              <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Email Address
              </label>
              <input
                name="email" type="email" value={form.email}
                onChange={handleChange} placeholder="you@example.com"
                required
                style={{
                  width: '100%', padding: '0.7rem 0.875rem',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px', color: 'var(--color-text-primary)',
                  fontSize: '0.9rem', outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--color-accent-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password" type={showPassword ? 'text' : 'password'}
                  value={form.password} onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required minLength={6}
                  style={{
                    width: '100%', padding: '0.7rem 2.8rem 0.7rem 0.875rem',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '10px', color: 'var(--color-text-primary)',
                    fontSize: '0.9rem', outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-accent-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: 'var(--color-text-muted)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPassword ? <RiEyeOffLine size={17} /> : <RiEyeLine size={17} />}
                </button>
              </div>
            </div>
            </>
            )}

            {tab === 'verify' && (
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                  6-Digit OTP Code
                </label>
                <input
                  name="otp" type="text" value={form.otp}
                  onChange={handleChange} placeholder="e.g. 123456"
                  required maxLength={6}
                  style={{
                    width: '100%', padding: '0.7rem 0.875rem',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '10px', color: 'var(--color-text-primary)',
                    fontSize: '1.1rem', letterSpacing: '0.2em', outline: 'none',
                    transition: 'border-color 0.2s', textAlign: 'center',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-accent-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              style={{
                width: '100%', padding: '0.8rem',
                background: 'linear-gradient(135deg, var(--color-accent-gradient-start), var(--color-accent-gradient-end))',
                border: 'none', borderRadius: '10px',
                color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.8 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                marginTop: '0.25rem',
              }}
            >
              {loading ? <RiLoader4Line className="animate-spin" size={20} /> : tab === 'login' ? 'Log In' : tab === 'verify' ? 'Verify OTP' : 'Create Account'}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
