import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiGithubFill, RiLinkedinBoxFill, RiSearchLine,
  RiShieldLine, RiTeamLine, RiUserLine,
} from 'react-icons/ri';
import api from '../api/axios';

// ── Static fallback data ───────────────────────────────────────────────────
const STATIC_MEMBERS = [
  { _id: '1', name: 'Aryan Mehta', role: 'admin', email: 'aryan@example.com', techStack: ['React', 'Node.js', 'MongoDB'], githubUrl: '#', avatar: null, createdAt: '2024-01-15' },
  { _id: '2', name: 'Priya Sharma', role: 'admin', email: 'priya@example.com', techStack: ['Python', 'TensorFlow', 'FastAPI'], githubUrl: '#', avatar: null, createdAt: '2024-02-01' },
  { _id: '3', name: 'Rohit Verma', role: 'member', email: 'rohit@example.com', techStack: ['Flutter', 'Firebase', 'Dart'], githubUrl: '#', avatar: null, createdAt: '2024-02-20' },
  { _id: '4', name: 'Sneha Patel', role: 'member', email: 'sneha@example.com', techStack: ['Vue.js', 'TypeScript', 'PostgreSQL'], githubUrl: '#', avatar: null, createdAt: '2024-03-05' },
  { _id: '5', name: 'Dev Kapoor', role: 'member', email: 'dev@example.com', techStack: ['Go', 'Docker', 'Kubernetes'], githubUrl: '#', avatar: null, createdAt: '2024-03-12' },
  { _id: '6', name: 'Ananya Singh', role: 'member', email: 'ananya@example.com', techStack: ['React', 'GraphQL', 'AWS'], githubUrl: '#', avatar: null, createdAt: '2024-03-20' },
  { _id: '7', name: 'Karan Joshi', role: 'member', email: 'karan@example.com', techStack: ['Angular', 'Java', 'Spring Boot'], githubUrl: '#', avatar: null, createdAt: '2024-04-01' },
  { _id: '8', name: 'Meera Iyer', role: 'member', email: 'meera@example.com', techStack: ['Swift', 'iOS', 'Firebase'], githubUrl: '#', avatar: null, createdAt: '2024-04-15' },
  { _id: '9', name: 'Vijay Kumar', role: 'member', email: 'vijay@example.com', techStack: ['Rust', 'WebAssembly', 'C++'], githubUrl: '#', avatar: null, createdAt: '2024-05-01' },
];

const AVATAR_GRADIENTS = [
  ['#7c3aed', '#06b6d4'], ['#ec4899', '#f59e0b'],
  ['#10b981', '#06b6d4'], ['#f59e0b', '#ef4444'],
  ['#3178c6', '#7c3aed'], ['#06b6d4', '#10b981'],
];

const TECH_COLORS = {
  React: '#61dafb', 'Node.js': '#68a063', MongoDB: '#4db33d',
  Python: '#3776ab', TypeScript: '#3178c6', TailwindCSS: '#06b6d4',
  Flutter: '#54c5f8', Firebase: '#ffca28', Go: '#00add8',
  Swift: '#f05138', Rust: '#dea584', 'Vue.js': '#42b883',
};

const FILTERS = [
  { label: 'All', value: 'all', icon: <RiTeamLine size={14} /> },
  { label: 'Leads', value: 'admin', icon: <RiShieldLine size={14} /> },
  { label: 'Members', value: 'member', icon: <RiUserLine size={14} /> },
];

// ── Member Card ────────────────────────────────────────────────────────────
const MemberCard = ({ member, index }) => {
  const [grad] = useState(AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(124,58,237,0.2)' }}
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '18px', padding: '1.5rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', gap: '0.875rem',
        cursor: 'default',
        transition: 'transform 0.25s, box-shadow 0.25s',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)',
        width: '100px', height: '100px', borderRadius: '50%',
        background: `radial-gradient(circle, ${grad[0]}20, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Role badge */}
      {member.role === 'admin' && (
        <div style={{
          position: 'absolute', top: '0.75rem', right: '0.75rem',
          background: 'rgba(245,158,11,0.15)',
          border: '1px solid rgba(245,158,11,0.35)',
          borderRadius: '100px', padding: '0.15rem 0.5rem',
          fontSize: '0.65rem', fontWeight: 700, color: '#f59e0b',
          display: 'flex', alignItems: 'center', gap: '0.25rem',
        }}>
          <RiShieldLine size={10} /> Lead
        </div>
      )}

      {/* Avatar */}
      <div style={{
        width: '68px', height: '68px', borderRadius: '50%',
        background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem', fontWeight: 800, color: '#fff',
        boxShadow: `0 0 0 4px ${grad[0]}25`,
        flexShrink: 0,
      }}>
        {member.avatar
          ? <img src={member.avatar} alt="" style={{ width: '100%', borderRadius: '50%' }} />
          : member.name.charAt(0).toUpperCase()
        }
      </div>

      <div>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.15rem' }}>{member.name}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{member.email}</div>
      </div>

      {/* Tech Stack */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', justifyContent: 'center' }}>
        {member.techStack?.slice(0, 3).map((tech) => (
          <span key={tech} style={{
            fontSize: '0.68rem', fontWeight: 600, padding: '0.2rem 0.55rem',
            borderRadius: '100px',
            background: `${TECH_COLORS[tech] || '#7c3aed'}18`,
            border: `1px solid ${TECH_COLORS[tech] || '#7c3aed'}35`,
            color: TECH_COLORS[tech] || 'var(--color-accent-primary)',
          }}>
            {tech}
          </span>
        ))}
      </div>

      {/* Social Links */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
        {member.githubUrl && member.githubUrl !== '#' && (
          <a href={member.githubUrl} target="_blank" rel="noreferrer" style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-text-secondary)', textDecoration: 'none',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--color-accent-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
          >
            <RiGithubFill size={15} />
          </a>
        )}
        {member.linkedinUrl && (
          <a href={member.linkedinUrl} target="_blank" rel="noreferrer" style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0A66C2', textDecoration: 'none',
          }}>
            <RiLinkedinBoxFill size={15} />
          </a>
        )}
      </div>

      {/* Member since */}
      <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
        Member since {new Date(member.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
      </div>
    </motion.div>
  );
};

// ── Team Directory Page ────────────────────────────────────────────────────
const TeamDirectoryPage = () => {
  const [members, setMembers] = useState(STATIC_MEMBERS);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users')
      .then(({ data }) => { if (data.users?.length) setMembers(data.users); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = members.filter((m) => {
    const matchesRole = filter === 'all' || m.role === filter;
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.techStack?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem' }}>Team Directory</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          {members.length} members building the future, together.
        </p>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          marginBottom: '2rem', flexWrap: 'wrap',
        }}
      >
        {/* Filter Chips */}
        <div style={{
          display: 'flex', gap: '0.5rem',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px', padding: '4px',
        }}>
          {FILTERS.map(({ label, value, icon }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.45rem 1rem', borderRadius: '9px', border: 'none',
                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
                background: filter === value
                  ? 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(6,182,212,0.2))'
                  : 'transparent',
                color: filter === value ? '#fff' : 'var(--color-text-secondary)',
                boxShadow: filter === value ? '0 0 12px rgba(124,58,237,0.25)' : 'none',
              }}
            >
              {icon} {label}
              <span style={{
                background: 'rgba(255,255,255,0.12)', borderRadius: '100px',
                padding: '0 0.4rem', fontSize: '0.68rem',
              }}>
                {value === 'all' ? members.length : members.filter(m => m.role === value).length}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '320px', marginLeft: 'auto' }}>
          <RiSearchLine size={16} style={{
            position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)',
          }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or tech..."
            style={{
              width: '100%', padding: '0.6rem 0.875rem 0.6rem 2.5rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--color-border)',
              borderRadius: '10px', color: 'var(--color-text-primary)',
              fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--color-accent-primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
          />
        </div>
      </motion.div>

      {/* Member Grid */}
      <AnimatePresence mode="popLayout">
        {filtered.length > 0 ? (
          <motion.div
            key="grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {filtered.map((member, i) => (
              <MemberCard key={member._id} member={member} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
            <div style={{ fontWeight: 600 }}>No members found</div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Try a different search or filter</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamDirectoryPage;
