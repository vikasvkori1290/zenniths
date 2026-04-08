import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiCalendarEventLine, RiMapPinLine, RiTimeLine, RiTeamLine,
  RiCheckLine, RiAddLine, RiSearchLine, RiInformationLine, RiDeleteBinLine, RiEdit2Line, RiImageAddLine, RiCloseLine, RiArrowRightSLine, RiShareForwardLine
} from 'react-icons/ri';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';

// ── Team Roster Card Wrapper ───────────────────────────────────────────────
const TeamRosterCard = ({ team }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ background: 'var(--color-bg-secondary)', borderRadius: '14px', padding: '1rem 1.25rem', border: '1px solid var(--color-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontWeight: 800, fontSize: '1rem' }}>🏷️ {team.teamName}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{(team.members?.length || 0) + 1} members</span>
      </div>
      {/* Leader */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: (expanded || !team.members?.length) ? '1px solid var(--color-border)' : 'none' }}>
        <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center', opacity: team.members?.length ? 1 : 0, pointerEvents: team.members?.length ? 'auto' : 'none' }}>
          <RiArrowRightSLine style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: '0.2s', fontSize: '1.2rem' }} />
        </button>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '0.8rem' }}>
          {team.leader?.name?.charAt(0)?.toUpperCase() || 'L'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{team.leader?.name || 'Leader'} <span style={{ fontSize: '0.7rem', color: '#7c3aed', fontWeight: 600 }}>★ Leader</span></div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
            {team.leader?.email} {team.leader?.mobile && `• 📞 ${team.leader.mobile}`}
            {(team.leader?.usn || team.leader?.course || team.leader?.batch) && (
              <div style={{ marginTop: '0.2rem', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                {team.leader?.course} {team.leader?.batch && `(${team.leader.batch})`} {team.leader?.usn && `• USN: ${team.leader.usn.toUpperCase()}`}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Team Members */}
      <AnimatePresence>
        {expanded && team.members?.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            {team.members.map((m, mi) => (
              <div key={mi} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', paddingLeft: '2.5rem', borderBottom: mi < team.members.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#7c3aed', fontSize: '0.75rem' }}>
                  {m.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{m.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                    {m.email} {m.mobile && `• 📞 ${m.mobile}`}
                    {(m.usn || m.course || m.batch) && (
                      <div style={{ marginTop: '0.2rem', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                        {m.course} {m.batch && `(${m.batch})`} {m.usn && `• USN: ${m.usn.toUpperCase()}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EventCard = ({ event, onToggleRegister, onDelete, onRegisterTeam, onEdit, currentUserId, isAdmin, onOpenRoster, onPosterClick, user, onShowAlert }) => {
  const isRegistered = event.registeredUsers?.includes(currentUserId);
  const hasTeamRegistered = event.teams?.some(t => (t.leader?._id || t.leader) === currentUserId);
  const [loading, setLoading] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const isTeamEvent = (event.minTeam > 1 || event.maxTeam > 1);

  // Team form state
  const extraSlots = Math.max((event.minTeam || 1) - 1, 0);
  const maxExtra = Math.max((event.maxTeam || 1) - 1, 0);
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState(
    Array.from({ length: extraSlots }, () => ({ name: '', email: '', mobile: '', usn: '', course: '', batch: '' }))
  );

  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();

  const handleRegister = async () => {
    if (loading) return;

    if (!isAdmin && (!user?.usn || !user?.course || !user?.batch || !user?.mobile)) {
      onShowAlert({
        title: "Profile Incomplete",
        message: "Please complete your mandatory profile details (USN, Course, Batch, Mobile Number) from the top right user menu before registering for events!",
        type: "warning"
      });
      return;
    }

    if (isTeamEvent && !isRegistered && !hasTeamRegistered) {
      setShowTeamModal(true);
      return;
    }
    setLoading(true);
    await onToggleRegister(event._id);
    setLoading(false);
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onRegisterTeam(event._id, teamName, teamMembers);
      setShowTeamModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addMemberSlot = () => {
    if (teamMembers.length < maxExtra) {
      setTeamMembers([...teamMembers, { name: '', email: '', mobile: '', usn: '', course: '', batch: '' }]);
    }
  };

  const removeMemberSlot = (idx) => {
    if (teamMembers.length > extraSlots) {
      setTeamMembers(teamMembers.filter((_, i) => i !== idx));
    }
  };

  const updateMember = (idx, field, value) => {
    setTeamMembers(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  };

  const alreadyDone = isRegistered || hasTeamRegistered;

  return (
    <>
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '20px',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Poster Image */}
      <div style={{ height: '220px', background: 'var(--color-bg-secondary)', position: 'relative' }}>
        {event.poster ? (
          <img src={event.poster} alt={event.title} onClick={() => onPosterClick && onPosterClick(event.poster)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
        ) : (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
            <RiCalendarEventLine size={64} style={{ opacity: 0.2 }} />
          </div>
        )}
        <div style={{
          position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem'
        }}>
          <span style={{
            background: 'var(--color-bg-card)', padding: '0.25rem 0.75rem', borderRadius: '100px',
            fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent-primary)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}>
            {event.category}
          </span>
          {!isUpcoming && (
            <span style={{
              background: '#ef4444', padding: '0.25rem 0.75rem', borderRadius: '100px',
              fontSize: '0.75rem', fontWeight: 700, color: '#fff',
              boxShadow: '0 4px 12px rgba(239,68,68,0.5)'
            }}>
              ENDED
            </span>
          )}
        </div>
        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const url = `${window.location.origin}/events?id=${event._id}`;
              navigator.clipboard.writeText(url);
              onShowAlert({ title: "Link Copied!", message: "The event link has been copied to your clipboard. Share it with your friends!", type: "success" });
            }}
            style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#3b82f6',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            title="Share Link"
          >
            <RiShareForwardLine size={16} />
          </button>
          
          {isAdmin && (
            <>
            <button
              onClick={() => onEdit(event)}
              style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#1e1b4b',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              title="Edit Event"
            >
              <RiEdit2Line size={16} />
            </button>
            <button
              onClick={() => onDelete(event._id)}
              style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'rgba(239,68,68,0.9)', backdropFilter: 'blur(8px)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              title="Delete Event"
            >
              <RiDeleteBinLine size={16} />
            </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>{event.title}</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            <RiCalendarEventLine size={16} color="var(--color-accent-primary)" />
            {eventDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            <RiTimeLine size={16} color="var(--color-accent-secondary)" />
            {eventDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            <RiMapPinLine size={16} color="#ef4444" />
            {event.location}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            <RiTeamLine size={16} color="#7c3aed" />
            {(event.minTeam === 1 && event.maxTeam === 1) ? '🏆 Solo' : `👥 Team (${event.minTeam || 1}–${event.maxTeam || 1} members)`}
          </div>
        </div>

        {(event.facultyIncharge?.length > 0 || event.studentIncharge?.length > 0) && (
          <div style={{ marginBottom: '1.5rem', background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            {event.facultyIncharge?.length > 0 && (
              <div style={{ marginBottom: event.studentIncharge?.length > 0 ? '0.75rem' : 0 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Faculty Incharge</span>
                {event.facultyIncharge.map((f, i) => (
                  <div key={i} style={{ fontSize: '0.85rem' }}>👨‍🏫 {f.name} {f.number && <span style={{ color: 'var(--color-text-muted)' }}>• {f.number}</span>}</div>
                ))}
              </div>
            )}
            {event.studentIncharge?.length > 0 && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student Incharge</span>
                {event.studentIncharge.map((s, i) => (
                  <div key={i} style={{ fontSize: '0.85rem' }}>🧑‍🎓 {s.name} {s.number && <span style={{ color: 'var(--color-text-muted)' }}>• {s.number}</span>}</div>
                ))}
              </div>
            )}
          </div>
        )}

        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, flex: 1, marginBottom: '1.5rem' }}>
          {event.description}
        </p>

        {/* Footer actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
            <RiTeamLine size={18} />
            {isTeamEvent ? `${event.teams?.length || 0} Teams` : `${event.registeredUsers?.length || 0} Registered`}
            {isAdmin && (event.registeredUsers?.length > 0 || event.teams?.length > 0) && (
              <button onClick={() => onOpenRoster(event._id)} style={{ marginLeft: '0.5rem', padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '6px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', cursor: 'pointer', fontWeight: 700 }}>
                View Roster
              </button>
            )}
          </div>

          {isUpcoming && (
            <button
              onClick={handleRegister} disabled={loading}
              style={{
                padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s',
                ...(alreadyDone
                  ? { background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }
                  : { background: 'var(--color-accent-primary)', color: '#fff' }
                )
              }}
            >
              {alreadyDone ? <><RiCheckLine size={18} /> Registered</> : (isTeamEvent ? '👥 Register Team' : 'Register Now')}
            </button>
          )}
        </div>
      </div>
    </motion.div>

    {/* Team Registration Modal */}
    <AnimatePresence>
      {showTeamModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} style={{
            background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '24px',
            width: '100%', maxWidth: '520px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.25rem' }}>👥 Register Team</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                {event.title} — Team of {event.minTeam}–{event.maxTeam} members (including you)
              </p>
            </div>
            <form onSubmit={handleTeamSubmit} style={{ padding: '1.5rem 2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Team Name</label>
                <input required value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Code Crushers"
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)', boxSizing: 'border-box' }} />
              </div>

              <div style={{ padding: '0.6rem 0.8rem', background: 'rgba(124,58,237,0.08)', borderRadius: '10px', border: '1px solid rgba(124,58,237,0.2)', fontSize: '0.8rem', color: 'var(--color-accent-primary)', fontWeight: 600 }}>
                Member 1 (You) — auto-filled from your account
              </div>

              {teamMembers.map((m, idx) => (
                <div key={idx} style={{ background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Member {idx + 2}</span>
                    {teamMembers.length > extraSlots && (
                      <button type="button" onClick={() => removeMemberSlot(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>Remove</button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
                    <input required placeholder="Full Name" value={m.name} onChange={e => updateMember(idx, 'name', e.target.value)}
                      style={{ width: '100%', minWidth: 0, padding: '0.65rem 0.8rem', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                    <input required type="email" placeholder="Email" value={m.email} onChange={e => updateMember(idx, 'email', e.target.value)}
                      style={{ width: '100%', minWidth: 0, padding: '0.65rem 0.8rem', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
                    <input required placeholder="USN Number" value={m.usn} onChange={e => updateMember(idx, 'usn', e.target.value)}
                      style={{ width: '100%', minWidth: 0, padding: '0.65rem 0.8rem', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
                    <input placeholder="Mobile" value={m.mobile} onChange={e => updateMember(idx, 'mobile', e.target.value)}
                      style={{ width: '100%', minWidth: 0, padding: '0.65rem 0.8rem', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                    <input required placeholder="Course" value={m.course} onChange={e => updateMember(idx, 'course', e.target.value)}
                      style={{ width: '100%', minWidth: 0, padding: '0.65rem 0.8rem', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                    <input required placeholder="Batch (YYYY-YYYY)" pattern="\d{4}-\d{4}" value={m.batch} onChange={e => updateMember(idx, 'batch', e.target.value)}
                      style={{ width: '100%', minWidth: 0, padding: '0.65rem 0.8rem', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                  </div>
                </div>
              ))}

              {teamMembers.length < maxExtra && (
                <button type="button" onClick={addMemberSlot} style={{
                  padding: '0.65rem', borderRadius: '10px', border: '1px dashed var(--color-border)', background: 'transparent',
                  color: 'var(--color-accent-primary)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                }}>
                  + Add Team Member
                </button>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowTeamModal(false)} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: 'var(--color-accent-primary)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>{loading ? 'Registering...' : 'Register Team'}</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};


const EventsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', date: '', location: '', category: 'Workshop', minTeam: 1, maxTeam: 1, facultyIncharge: [], studentIncharge: [] });
  const [posterFile, setPosterFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [rosterData, setRosterData] = useState(null);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', date: '', location: '', category: 'Workshop', minTeam: 1, maxTeam: 1, facultyIncharge: [], studentIncharge: [] });
  const [editPosterFile, setEditPosterFile] = useState(null);

  // --- Crop & Fullscreen state ---
  const [fullScreenPoster, setFullScreenPoster] = useState(null);
  const [cropData, setCropData] = useState({ crop: { x: 0, y: 0 }, zoom: 1 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropperObj, setShowCropperObj] = useState(null); // { imageSrc, isEdit }
  const [posterPreview, setPosterPreview] = useState(null);
  const [editPosterPreview, setEditPosterPreview] = useState(null);
  const [alertData, setAlertData] = useState(null);

  useEffect(() => {
    fetchEvents(activeTab);
  }, [activeTab]);

  const fetchEvents = async (status) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/events?status=${status}`);
      if (data.success) setEvents(data.events);
    } catch (error) {
      console.error('Failed to fetch events', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRegister = async (eventId) => {
    try {
      const { data } = await api.patch(`/events/${eventId}/register`);
      if (data.success) {
        setEvents(prev => prev.map(e => {
          if (e._id === eventId) {
            const isNowRegistered = data.registered;
            const newUsers = isNowRegistered
              ? [...(e.registeredUsers || []), user.id]
              : (e.registeredUsers || []).filter(id => id !== user.id);
            return { ...e, registeredUsers: newUsers };
          }
          return e;
        }));
      }
    } catch (error) {
      console.error('Registration failed', error);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
        else fd.append(k, v);
      });
      if (posterFile) fd.append('poster', posterFile);
      const { data } = await api.post('/events', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data.success) {
        setShowCreateModal(false);
        setFormData({ title: '', description: '', date: '', location: '', category: 'Workshop', minTeam: 1, maxTeam: 1, facultyIncharge: [], studentIncharge: [] });
        setPosterFile(null);
        setPosterPreview(null);
        if (activeTab === 'upcoming') {
           setEvents(prev => [data.event, ...prev]);
        } else {
           setActiveTab('upcoming');
        }
      }
    } catch (err) {
      console.error('Failed to create event', err);
      alert('Failed to create event. Check console.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (event) => {
    const d = new Date(event.date);
    const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setEditForm({
      title: event.title,
      description: event.description,
      date: localDate,
      location: event.location,
      category: event.category,
      minTeam: event.minTeam || 1,
      maxTeam: event.maxTeam || 1,
      facultyIncharge: event.facultyIncharge || [],
      studentIncharge: event.studentIncharge || [],
    });
    setEditPosterFile(null);
    setEditPosterPreview(null);
    setEditEvent(event);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => {
        if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
        else fd.append(k, v);
      });
      if (editPosterFile) fd.append('poster', editPosterFile);
      const { data } = await api.put(`/events/${editEvent._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data.success) {
        setEditEvent(null);
        setEditPosterFile(null);
        setEditPosterPreview(null);
        fetchEvents(activeTab);
      }
    } catch (err) {
      console.error('Failed to update event', err);
      alert('Failed to update event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This cannot be undone.')) return;
    try {
      const { data } = await api.delete(`/events/${eventId}`);
      if (data.success) {
        setEvents(prev => prev.filter(e => e._id !== eventId));
      }
    } catch (err) {
      console.error('Failed to delete event', err);
      alert('Failed to delete event.');
    }
  };

  const handleRegisterTeam = async (eventId, teamName, members) => {
    try {
      const { data } = await api.post(`/events/${eventId}/register-team`, { teamName, members });
      if (data.success) {
        // Refresh events to get updated data
        fetchEvents(activeTab);
      }
    } catch (err) {
      console.error('Team registration failed', err);
      alert(err.response?.data?.message || 'Failed to register team.');
      throw err;
    }
  };

  const handleOpenRoster = async (eventId) => {
    setLoadingRoster(true);
    try {
      const { data } = await api.get(`/events/${eventId}`);
      if (data.success) {
         setRosterData({
           eventTitle: data.event.title,
           users: data.event.registeredUsers || [],
           teams: data.event.teams || [],
           isTeamEvent: (data.event.minTeam > 1 || data.event.maxTeam > 1),
         });
      }
    } catch (err) {
      console.error('Failed to fetch roster', err);
    } finally {
      setLoadingRoster(false);
    }
  };

  const handleCropSave = async () => {
    if (!showCropperObj || !croppedAreaPixels) return;
    try {
      const croppedFile = await getCroppedImg(showCropperObj.imageSrc, croppedAreaPixels);
      const previewUrl = URL.createObjectURL(croppedFile);
      if (showCropperObj.isEdit) {
        setEditPosterFile(croppedFile);
        setEditPosterPreview(previewUrl);
      } else {
        setPosterFile(croppedFile);
        setPosterPreview(previewUrl);
      }
      setShowCropperObj(null);
    } catch (e) { console.error('Crop error', e); }
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>Events Hub</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Workshops, hackathons, and community meetups.
          </p>
        </div>
        {user?.role === 'admin' && (
          <button 
             onClick={() => setShowCreateModal(true)}
             style={{
               display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '12px',
               background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))',
               color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer'
            }}>
            <RiAddLine size={18} /> Create Event
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)' }}>
        {['upcoming', 'past'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '1rem 2rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, textTransform: 'capitalize', position: 'relative',
            color: activeTab === tab ? 'var(--color-text-primary)' : 'var(--color-text-muted)', transition: 'color 0.2s',
          }}>
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="eventTab" style={{
                position: 'absolute', bottom: -1, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-secondary))', borderRadius: '10px 10px 0 0'
              }} />
            )}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading events...</div>
      ) : (
        <AnimatePresence mode="popLayout">
           {events.length > 0 ? (
            <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
              {events.map((event) => (
                <EventCard key={event._id} event={event} onToggleRegister={handleToggleRegister} onDelete={handleDeleteEvent} onRegisterTeam={handleRegisterTeam} onEdit={openEditModal} currentUserId={user?.id || user?._id} isAdmin={user?.role === 'admin'} onOpenRoster={handleOpenRoster} onPosterClick={setFullScreenPoster} user={user} onShowAlert={setAlertData} />
              ))}
             </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{
              textAlign: 'center', padding: '5rem', background: 'var(--color-bg-card)', borderRadius: '20px', border: '1px dashed var(--color-border)'
            }}>
              <RiInformationLine size={48} color="var(--color-text-muted)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No {activeTab} events</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                There are currently no {activeTab} events scheduled.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Media Gallery Section placeholder (will be used to display photos from past events later) */}
      {activeTab === 'past' && events.length > 0 && (
         <div style={{ marginTop: '5rem' }}>
           <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Past Event Highlights</h2>
           <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>A glimpse into our past activities.</p>
           {/* Gallery grid goes here */}
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ height: '200px', background: 'var(--color-bg-card)', borderRadius: '12px', border: '1px dashed var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Images coming soon...</span>
              </div>
           </div>
         </div>
      )}

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} style={{
              background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '24px',
              width: '100%', maxWidth: '500px', overflow: 'hidden',
               boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}>
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '800', fontSize: '1.25rem' }}>
                Create New Event
              </div>
              <form onSubmit={handleCreateSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Poster Upload */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Event Poster</label>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.25rem', background: 'var(--color-bg-secondary)', border: '2px dashed var(--color-border)', borderRadius: '12px', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}>
                    <RiImageAddLine size={20} />
                    {posterFile ? posterFile.name : 'Click to upload poster image'}
                    <input type="file" accept="image/*" onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        const url = URL.createObjectURL(e.target.files[0]);
                        setShowCropperObj({ imageSrc: url, isEdit: false });
                      }
                      e.target.value = null; // reset input
                    }} style={{ display: 'none' }} />
                  </label>
                  {posterPreview && <div style={{ marginTop: '0.5rem', borderRadius: '10px', overflow: 'hidden', maxHeight: '120px' }}><img src={posterPreview} alt="Preview" style={{ width: '100%', height: '120px', objectFit: 'cover' }} /></div>}
                </div>

                <input required placeholder="Event Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />
                
                <textarea required placeholder="Description" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)', resize: 'vertical' }} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input required type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }}>
                    <option>Workshop</option><option>Hackathon</option><option>Seminar</option><option>Social</option><option>Other</option>
                  </select>
                </div>

                <input required placeholder="Location (Room 101, Discord, etc)" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Min Team Members</label>
                    <input required type="number" min={1} value={formData.minTeam} onChange={e => setFormData({...formData, minTeam: Math.max(1, parseInt(e.target.value) || 1)})}
                      style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Max Team Members</label>
                    <input required type="number" min={1} value={formData.maxTeam} onChange={e => setFormData({...formData, maxTeam: Math.max(1, parseInt(e.target.value) || 1)})}
                      style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />
                  </div>
                </div>
                {formData.minTeam === 1 && formData.maxTeam === 1 && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-accent-primary)', fontWeight: 600, marginTop: '-0.5rem' }}>🏆 Solo Competition</div>
                )}
                {(formData.minTeam > 1 || formData.maxTeam > 1) && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-accent-primary)', fontWeight: 600, marginTop: '-0.5rem' }}>👥 Team Competition ({formData.minTeam}–{formData.maxTeam} members)</div>
                )}

                {/* Faculty Incharge */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Faculty Incharge</label>
                    <button type="button" onClick={() => setFormData({...formData, facultyIncharge: [...formData.facultyIncharge, { name: '', number: '' }]})} style={{ background: 'none', border: 'none', color: 'var(--color-accent-primary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>+ Add Faculty</button>
                  </div>
                  {formData.facultyIncharge.map((fac, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input required placeholder="Name" value={fac.name} onChange={e => {
                        const newFac = [...formData.facultyIncharge]; newFac[i].name = e.target.value;
                        setFormData({...formData, facultyIncharge: newFac});
                      }} style={{ flex: 1, padding: '0.6rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }} />
                      <input placeholder="Phone / Details" value={fac.number} onChange={e => {
                        const newFac = [...formData.facultyIncharge]; newFac[i].number = e.target.value;
                        setFormData({...formData, facultyIncharge: newFac});
                      }} style={{ flex: 1, padding: '0.6rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }} />
                      <button type="button" onClick={() => setFormData({...formData, facultyIncharge: formData.facultyIncharge.filter((_, idx) => idx !== i)})} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '0 0.8rem', cursor: 'pointer' }}><RiDeleteBinLine /></button>
                    </div>
                  ))}
                </div>

                {/* Student Incharge */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Student Incharge</label>
                    <button type="button" onClick={() => setFormData({...formData, studentIncharge: [...formData.studentIncharge, { name: '', number: '' }]})} style={{ background: 'none', border: 'none', color: 'var(--color-accent-primary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>+ Add Student</button>
                  </div>
                  {formData.studentIncharge.map((stu, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input required placeholder="Name" value={stu.name} onChange={e => {
                        const newStu = [...formData.studentIncharge]; newStu[i].name = e.target.value;
                        setFormData({...formData, studentIncharge: newStu});
                      }} style={{ flex: 1, padding: '0.6rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }} />
                      <input placeholder="Phone / Details" value={stu.number} onChange={e => {
                        const newStu = [...formData.studentIncharge]; newStu[i].number = e.target.value;
                        setFormData({...formData, studentIncharge: newStu});
                      }} style={{ flex: 1, padding: '0.6rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }} />
                      <button type="button" onClick={() => setFormData({...formData, studentIncharge: formData.studentIncharge.filter((_, idx) => idx !== i)})} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '0 0.8rem', cursor: 'pointer' }}><RiDeleteBinLine /></button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={submitting} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: 'var(--color-accent-primary)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>{submitting ? 'Creating...' : 'Publish'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Event Modal */}
      <AnimatePresence>
        {editEvent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} style={{
              background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '24px',
              width: '100%', maxWidth: '500px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}>
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--color-border)', fontWeight: '800', fontSize: '1.25rem' }}>
                ✏️ Edit Event
              </div>
              <form onSubmit={handleEditSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
                {/* Current poster preview */}
                {editEvent.poster && !editPosterPreview && (
                  <div style={{ borderRadius: '10px', overflow: 'hidden', maxHeight: '120px' }}>
                    <img src={editEvent.poster} alt="Current" style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                  </div>
                )}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Change Poster</label>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', background: 'var(--color-bg-secondary)', border: '2px dashed var(--color-border)', borderRadius: '12px', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                    <RiImageAddLine size={20} />
                    {editPosterFile ? editPosterFile.name : 'Upload new poster'}
                    <input type="file" accept="image/*" onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        const url = URL.createObjectURL(e.target.files[0]);
                        setShowCropperObj({ imageSrc: url, isEdit: true });
                      }
                      e.target.value = null; // reset input
                    }} style={{ display: 'none' }} />
                  </label>
                  {editPosterPreview && <div style={{ marginTop: '0.5rem', borderRadius: '10px', overflow: 'hidden', maxHeight: '120px' }}><img src={editPosterPreview} alt="Preview" style={{ width: '100%', height: '120px', objectFit: 'cover' }} /></div>}
                </div>

                <input required placeholder="Event Title" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />
                <textarea required placeholder="Description" rows={3} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)', resize: 'vertical' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input required type="datetime-local" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />
                  <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }}>
                    <option>Workshop</option><option>Hackathon</option><option>Seminar</option><option>Social</option><option>Other</option>
                  </select>
                </div>
                <input required placeholder="Location" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Min Team</label>
                  <input type="number" min={1} value={editForm.minTeam} onChange={e => setEditForm({...editForm, minTeam: Math.max(1, parseInt(e.target.value) || 1)})}
                    style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} /></div>
                  <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Max Team</label>
                  <input type="number" min={1} value={editForm.maxTeam} onChange={e => setEditForm({...editForm, maxTeam: Math.max(1, parseInt(e.target.value) || 1)})}
                    style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} /></div>
                </div>
                {/* Faculty Incharge */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Faculty Incharge</label>
                    <button type="button" onClick={() => setEditForm({...editForm, facultyIncharge: [...editForm.facultyIncharge, { name: '', number: '' }]})} style={{ background: 'none', border: 'none', color: 'var(--color-accent-primary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>+ Add Faculty</button>
                  </div>
                  {editForm.facultyIncharge.map((fac, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input required placeholder="Name" value={fac.name} onChange={e => {
                        const newFac = [...editForm.facultyIncharge]; newFac[i].name = e.target.value;
                        setEditForm({...editForm, facultyIncharge: newFac});
                      }} style={{ flex: 1, padding: '0.6rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }} />
                      <input placeholder="Phone / Details" value={fac.number} onChange={e => {
                        const newFac = [...editForm.facultyIncharge]; newFac[i].number = e.target.value;
                        setEditForm({...editForm, facultyIncharge: newFac});
                      }} style={{ flex: 1, padding: '0.6rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }} />
                      <button type="button" onClick={() => setEditForm({...editForm, facultyIncharge: editForm.facultyIncharge.filter((_, idx) => idx !== i)})} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '0 0.8rem', cursor: 'pointer' }}><RiDeleteBinLine /></button>
                    </div>
                  ))}
                </div>

                {/* Student Incharge */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Student Incharge</label>
                    <button type="button" onClick={() => setEditForm({...editForm, studentIncharge: [...editForm.studentIncharge, { name: '', number: '' }]})} style={{ background: 'none', border: 'none', color: 'var(--color-accent-primary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>+ Add Student</button>
                  </div>
                  {editForm.studentIncharge.map((stu, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input required placeholder="Name" value={stu.name} onChange={e => {
                        const newStu = [...editForm.studentIncharge]; newStu[i].name = e.target.value;
                        setEditForm({...editForm, studentIncharge: newStu});
                      }} style={{ flex: 1, padding: '0.6rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }} />
                      <input placeholder="Phone / Details" value={stu.number} onChange={e => {
                        const newStu = [...editForm.studentIncharge]; newStu[i].number = e.target.value;
                        setEditForm({...editForm, studentIncharge: newStu});
                      }} style={{ flex: 1, padding: '0.6rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }} />
                      <button type="button" onClick={() => setEditForm({...editForm, studentIncharge: editForm.studentIncharge.filter((_, idx) => idx !== i)})} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '0 0.8rem', cursor: 'pointer' }}><RiDeleteBinLine /></button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setEditEvent(null)} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={submitting} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: 'var(--color-accent-primary)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>{submitting ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roster Modal */}
      <AnimatePresence>
        {rosterData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} style={{
              background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '24px',
              width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
               boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}>
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontWeight: '800', fontSize: '1.25rem', marginBottom: '0.2rem' }}>Attendee Roster</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{rosterData.eventTitle} ({rosterData.users.length} registered)</div>
                </div>
                <button onClick={() => setRosterData(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
              </div>
              
              <div style={{ padding: '1.5rem 2rem', overflowY: 'auto' }}>
                {/* Team event roster */}
                {rosterData.isTeamEvent && rosterData.teams?.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {rosterData.teams.map((team, ti) => (
                      <TeamRosterCard key={ti} team={team} />
                    ))}
                  </div>
                )}

                {/* Solo event roster or fallback */}
                {(!rosterData.isTeamEvent || !rosterData.teams?.length) && (
                  <>
                  {rosterData.users.length === 0 && <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>No attendees yet.</div>}
                  {rosterData.users.map((u, i) => (
                    <div key={u._id || i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid var(--color-border-hover)' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent-gradient-start), var(--color-accent-gradient-end))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#fff' }}>
                        {u.avatar ? <img src={u.avatar} style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%'}} alt="" /> : (u.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{u.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          {u.email} {u.mobile && `• 📞 ${u.mobile}`}
                          {(u.usn || u.course || u.batch) && (
                            <div style={{ marginTop: '0.2rem', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                              {u.course} {u.batch && `(${u.batch})`} {u.usn && `• USN: ${u.usn.toUpperCase()}`}
                            </div>
                          )}
                        </div>
                      </div>
                      {(u.techStack || []).length > 0 && (
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                           {u.techStack.slice(0, 2).map(t => <span key={t} style={{ fontSize: '0.65rem', background: 'var(--color-bg-secondary)', padding: '0.15rem 0.4rem', borderRadius: '4px', color:'var(--color-text-muted)' }}>{t}</span>)}
                        </div>
                      )}
                    </div>
                  ))}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cropper Modal */}
      <AnimatePresence>
        {showCropperObj && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1200,
            background: 'var(--color-bg-primary)',
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ fontWeight: 800 }}>Adjust Poster</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                 <button onClick={() => setShowCropperObj(null)} style={{ padding: '0.5rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'inherit', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                 <button onClick={handleCropSave} style={{ padding: '0.5rem 1rem', background: 'var(--color-accent-primary)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Apply</button>
              </div>
            </div>
            <div style={{ position: 'relative', flex: 1, background: '#111' }}>
              <Cropper
                image={showCropperObj.imageSrc}
                crop={cropData.crop}
                zoom={cropData.zoom}
                aspect={16 / 9}
                onCropChange={(crop) => setCropData(prev => ({ ...prev, crop }))}
                onCropComplete={(croppedArea, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
                onZoomChange={(zoom) => setCropData(prev => ({ ...prev, zoom }))}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Poster Modal */}
      <AnimatePresence>
        {fullScreenPoster && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFullScreenPoster(null)} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1100,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', cursor: 'pointer'
          }}>
            <button onClick={() => setFullScreenPoster(null)} style={{
              position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.1)', color: '#fff',
              border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 0.2s'
            }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} >
              <RiCloseLine size={24} />
            </button>
            <motion.img 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              src={fullScreenPoster} 
              alt="Fullscreen event poster" 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Alert Modal */}
      <AnimatePresence>
        {alertData && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', padding: '1rem', backdropFilter: 'blur(4px)' }}>
             <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
               style={{ background: 'var(--color-bg-card)', borderRadius: '24px', border: '1px solid var(--color-border)', padding: '2.5rem 2rem', maxWidth: '420px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative' }}>
               
               <button onClick={() => setAlertData(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><RiCloseLine size={24} /></button>
               
               {alertData.type === 'warning' ? (
                 <div style={{ margin: '0 auto 1.5rem', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                   <RiInformationLine size={32} />
                 </div>
               ) : (
                 <div style={{ margin: '0 auto 1.5rem', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                   <RiCheckLine size={32} />
                 </div>
               )}
               
               <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>{alertData.title}</h3>
               <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>{alertData.message}</p>
               
               <button onClick={() => setAlertData(null)} style={{ padding: '0.875rem 2rem', width: '100%', background: alertData.type === 'warning' ? '#ef4444' : '#3b82f6', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                 onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                 {alertData.type === 'warning' ? 'Update Profile' : 'Awesome'}
               </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default EventsPage;
