import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchMe } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // 1. Save token to localStorage
      localStorage.setItem('accessToken', token);

      // 2. Fetch user details to sync AuthContext
      fetchMe().then((user) => {
        // 3. Redirect to dashboard or previous page
        if (user) {
          navigate(user.role === 'admin' ? '/admin' : '/dashboard');
        } else {
          navigate('/');
        }
      }).catch(() => {
        navigate('/');
      });
    } else {
      navigate('/');
    }
  }, [searchParams, navigate, fetchMe]);

  return (
    <div style={{ 
      height: '100vh', display: 'flex', flexDirection: 'column', 
      alignItems: 'center', justifyContent: 'center', 
      background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' 
    }}>
      <div className="spin" style={{ 
        width: '40px', height: '40px', 
        border: '4px solid var(--color-accent-primary)', 
        borderTopColor: 'transparent', borderRadius: '50%',
        marginBottom: '1rem' 
      }} />
      <h2 style={{ fontWeight: 800 }}>Finalizing Login...</h2>
      <p style={{ color: 'var(--color-text-secondary)' }}>Welcome to the Club Hub!</p>
    </div>
  );
};

export default AuthSuccess;
