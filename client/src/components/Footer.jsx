import { RiCodeSSlashLine, RiGithubFill, RiTwitterXLine, RiLinkedinBoxFill } from 'react-icons/ri';

const Footer = () => (
  <footer style={{
    borderTop: '1px solid var(--color-border)',
    padding: '3rem 1.5rem 2rem',
    background: 'var(--color-bg-secondary)',
  }}>
    <div style={{
      maxWidth: '1200px', margin: '0 auto',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
      textAlign: 'center',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <img src="/logo.png" alt="ClubFlow Logo" style={{ height: '32px', objectFit: 'contain' }} />
      </div>

      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', maxWidth: '360px', lineHeight: 1.6 }}>
        Empowering college tech enthusiasts to build, compete, and grow together.
      </p>

      {/* Social Links */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        {[
          { icon: <RiGithubFill size={20} />, href: '#', label: 'GitHub' },
          { icon: <RiTwitterXLine size={20} />, href: '#', label: 'Twitter' },
          { icon: <RiLinkedinBoxFill size={20} />, href: '#', label: 'LinkedIn' },
        ].map(({ icon, href, label }) => (
          <a key={label} href={href} aria-label={label} style={{
            width: '38px', height: '38px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-text-muted)', textDecoration: 'none',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text-primary)'; e.currentTarget.style.borderColor = 'var(--color-border-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
          >
            {icon}
          </a>
        ))}
      </div>

      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
        © {new Date().getFullYear()} ClubFlow. Built with ❤️ by the Tech Team.
      </p>
    </div>
  </footer>
);

export default Footer;
