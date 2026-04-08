import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiGithubFill, RiLinkedinBoxFill, RiSearchLine,
  RiShieldLine, RiTeamLine, RiUserLine, RiCloseLine,
  RiMailLine, RiPhoneLine, RiBook2Line, RiCalendarLine
} from 'react-icons/ri';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

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

// ── Member Detail Modal ─────────────────────────────────────────────────────
const MemberModal = ({ member, onClose, grad }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '480px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 80px rgba(0,0,0,0.5)' }}
      >
        {/* Header Banner */}
        <div style={{ height: '100px', background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`, position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RiCloseLine size={18} />
          </button>
        </div>

        {/* Avatar overlapping banner */}
        <div style={{ padding: '0 1.75rem 1.75rem', position: 'relative' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`, border: '4px solid var(--color-bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '-40px', marginBottom: '0.75rem', overflow: 'hidden' }}>
            {member.avatar ? <img src={member.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : member.name.charAt(0).toUpperCase()}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.2rem' }}>{member.name}</h2>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '100px', background: member.role === 'admin' ? 'rgba(245,158,11,0.15)' : 'rgba(124,58,237,0.15)', color: member.role === 'admin' ? '#f59e0b' : '#7c3aed', border: `1px solid ${member.role === 'admin' ? 'rgba(245,158,11,0.3)' : 'rgba(124,58,237,0.3)'}` }}>
                {member.role === 'admin' ? '🛡️ Lead' : '👤 Member'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {member.githubUrl && <a href={member.githubUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-text-secondary)', display: 'flex' }}><RiGithubFill size={22} /></a>}
              {member.linkedinUrl && <a href={member.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: '#0a66c2', display: 'flex' }}><RiLinkedinBoxFill size={22} /></a>}
            </div>
          </div>

          {/* Details */}
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {member.email && <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.87rem', color: 'var(--color-text-secondary)' }}><RiMailLine color="var(--color-accent-primary)" /> {member.email}</div>}
            {member.mobile && <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.87rem', color: 'var(--color-text-secondary)' }}><RiPhoneLine color="var(--color-accent-secondary)" /> {member.mobile}</div>}
            {member.usn && <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.87rem', color: 'var(--color-text-secondary)' }}><RiBook2Line color="#f59e0b" /> {member.usn.toUpperCase()} · {member.course}</div>}
            {member.batch && <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.87rem', color: 'var(--color-text-secondary)' }}><RiCalendarLine color="#10b981" /> Batch {member.batch}</div>}
          </div>

          {/* Tech Stack */}
          {member.techStack?.length > 0 && (
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Tech Stack</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {member.techStack.map(tech => (
                  <span key={tech} style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '100px', background: `${TECH_COLORS[tech] || '#7c3aed'}18`, border: `1px solid ${TECH_COLORS[tech] || '#7c3aed'}40`, color: TECH_COLORS[tech] || 'var(--color-accent-primary)' }}>{tech}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ── Member Card ────────────────────────────────────────────────────────────
const MemberCard = ({ member, index, onSelect }) => {
  const grad = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(124,58,237,0.2)' }}
      onClick={() => onSelect(member, grad)}
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '18px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.875rem', cursor: 'pointer', transition: 'transform 0.25s, box-shadow 0.25s', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '100px', borderRadius: '50%', background: `radial-gradient(circle, ${grad[0]}20, transparent 70%)`, pointerEvents: 'none' }} />
      {member.role === 'admin' && (
        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: '100px', padding: '0.15rem 0.5rem', fontSize: '0.65rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <RiShieldLine size={10} /> Lead
        </div>
      )}
      <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#fff', boxShadow: `0 8px 24px ${grad[0]}40`, overflow: 'hidden' }}>
        {member.avatar ? <img src={member.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : member.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.15rem' }}>{member.name}</h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>{member.course || member.email}</p>
      </div>
      {member.techStack?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', justifyContent: 'center' }}>
          {member.techStack.slice(0, 3).map(tech => (
            <span key={tech} style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '100px', background: `${TECH_COLORS[tech] || '#7c3aed'}18`, color: TECH_COLORS[tech] || 'var(--color-accent-primary)', border: `1px solid ${TECH_COLORS[tech] || '#7c3aed'}40` }}>{tech}</span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
        {member.githubUrl && <a href={member.githubUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--color-text-secondary)', display: 'flex', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}><RiGithubFill size={20} /></a>}
        {member.linkedinUrl && <a href={member.linkedinUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: '#0a66c2', display: 'flex' }}><RiLinkedinBoxFill size={20} /></a>}
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '-0.25rem' }}>Click to view profile</div>
    </motion.div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
const TeamDirectoryPage = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedGrad, setSelectedGrad] = useState(null);

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    try {
      const { data } = await api.get('/users');
      if (data.success) setMembers(data.users);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = members.filter(m => {
    const matchRole = filter === 'all' || m.role === filter;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.techStack?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchRole && matchSearch;
  });

  const leads = filtered.filter(m => m.role === 'admin');
  const regularMembers = filtered.filter(m => m.role !== 'admin');

  if (!user) return null;

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>Team Directory</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Meet the minds behind the club.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 1rem', borderRadius: '100px', border: `1px solid ${filter === f.value ? 'var(--color-accent-primary)' : 'var(--color-border)'}`, background: filter === f.value ? 'rgba(124,58,237,0.1)' : 'transparent', color: filter === f.value ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s' }}>
              {f.icon} {f.label}
            </button>
          ))}
          <div style={{ position: 'relative' }}>
            <RiSearchLine size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..."
              style={{ padding: '0.5rem 0.75rem 0.5rem 2.2rem', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '100px', color: 'var(--color-text-primary)', fontSize: '0.85rem', outline: 'none', width: '180px' }} />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>Loading team...</div>
      ) : (
        <>
          {leads.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><RiShieldLine /> Club Leads</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
                {leads.map((m, i) => <MemberCard key={m._id} member={m} index={i} onSelect={(mem, grad) => { setSelectedMember(mem); setSelectedGrad(grad); }} />)}
              </div>
            </div>
          )}
          {regularMembers.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><RiUserLine /> Members</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
                {regularMembers.map((m, i) => <MemberCard key={m._id} member={m} index={i + leads.length} onSelect={(mem, grad) => { setSelectedMember(mem); setSelectedGrad(grad); }} />)}
              </div>
            </div>
          )}
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>No members found.</div>}
        </>
      )}

      {selectedMember && <MemberModal member={selectedMember} grad={selectedGrad || AVATAR_GRADIENTS[0]} onClose={() => setSelectedMember(null)} />}
    </div>
  );
};

export default TeamDirectoryPage;
