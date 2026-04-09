import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { navigate('/'); return; }

    localStorage.setItem('accessToken', token);

    refreshUser()
      .then((user) => {
        navigate(user?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      })
      .catch(() => navigate('/', { replace: true }));
  }, []); // eslint-disable-line

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8faff' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: '44px', height: '44px', border: '4px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', marginBottom: '1rem', animation: 'spin 0.8s linear infinite' }} />
      <h2 style={{ fontWeight: 800, color: '#1e293b', margin: 0 }}>Finalizing Login...</h2>
      <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Welcome to Zenniths! Redirecting you now...</p>
    </div>
  );
};

export default AuthSuccess;
