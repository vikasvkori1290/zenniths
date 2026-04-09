import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiCalendarEventLine, RiMapPinLine, RiTimeLine, RiTeamLine,
  RiCheckLine, RiAddLine, RiSearchLine, RiInformationLine, RiDeleteBinLine, RiEdit2Line, RiImageAddLine, RiCloseLine, RiArrowRightSLine, RiShareForwardLine, RiDownloadLine, RiArrowRightLine, RiNotification3Line, RiStarFill, RiStarLine, RiFeedbackLine
} from 'react-icons/ri';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';

// ── Live Countdown Timer ───────────────────────────────────────────────────
const CountdownTimer = ({ targetDate }) => {
  const calcTimeLeft = () => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return null;
    return {
      d: Math.floor(diff / (1000 * 60 * 60 * 24)),
      h: Math.floor((diff / (1000 * 60 * 60)) % 24),
      m: Math.floor((diff / 1000 / 60) % 60),
      s: Math.floor((diff / 1000) % 60),
    };
  };
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft());
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  if (!timeLeft) return <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700 }}>Event Started!</span>;
  const urgent = timeLeft.d === 0;
  const pad = n => String(n).padStart(2, '0');
  return (
    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: urgent ? '#ef4444' : 'var(--color-accent-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', letterSpacing: '0.03em' }}>
      {timeLeft.d > 0 && <>{timeLeft.d}d </>}{pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
    </span>
  );
};


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

const EventCard = ({ event, onToggleRegister, onDelete, onRegisterTeam, onEdit, currentUserId, isAdmin, onOpenRoster, onPosterClick, user, onShowAlert, onVolunteer, onOpenFeedback }) => {
  const isRegistered = event.registeredUsers?.some(id => (id?._id || id)?.toString() === currentUserId?.toString());
  const hasTeamRegistered = event.teams?.some(t => ((t.leader?._id || t.leader)?.toString() === currentUserId?.toString()) || t.members?.some(m => m.email === user?.email));
  const isVolunteered = event.volunteers?.some(id => (id?._id || id)?.toString() === currentUserId?.toString());
  const volunteersLeft = event.volunteersNeeded > 0 ? event.volunteersNeeded - (event.volunteers?.length || 0) : null;
  const [loading, setLoading] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [hoverReg, setHoverReg] = useState(false);
  const [hoverVol, setHoverVol] = useState(false);
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

  const handleVolunteer = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onVolunteer(event._id);
    } finally {
      setLoading(false);
    }
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
              {isUpcoming && (
                <span style={{ marginLeft: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(6,182,212,0.08)', padding: '0.1rem 0.6rem', borderRadius: '100px', border: '1px solid rgba(6,182,212,0.2)' }}>
                  ⏱ <CountdownTimer targetDate={event.date} />
                </span>
              )}
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
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            {/* Volunteer button — shown only when admin set volunteersNeeded > 0 AND slots remain OR user is already volunteered */}
            {isUpcoming && event.volunteersNeeded > 0 && (isVolunteered || volunteersLeft > 0) && (
              <button
                onClick={handleVolunteer}
                disabled={loading || (alreadyDone && !isVolunteered)}
                onMouseEnter={() => setHoverVol(true)}
                onMouseLeave={() => setHoverVol(false)}
                title={alreadyDone && !isVolunteered ? 'Unregister as participant first to volunteer' : ''}
                style={{
                  width: '100%', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem',
                  border: '1px solid', cursor: (alreadyDone && !isVolunteered) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s',
                  opacity: (alreadyDone && !isVolunteered) ? 0.45 : 1,
                  ...(isVolunteered
                    ? (hoverVol 
                        ? { background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.4)' } 
                        : { background: 'rgba(16,185,129,0.1)', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' })
                    : { background: 'rgba(245,158,11,0.08)', color: '#b45309', borderColor: 'rgba(245,158,11,0.3)' }
                  )
                }}
              >
                {isVolunteered ? (hoverVol ? '❌ Cancel Volunteering' : '✅ Registered as Volunteer') : `🙋 Volunteer (${volunteersLeft} slot${volunteersLeft !== 1 ? 's' : ''} left)`}
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                {!isUpcoming ? (
                  <button onClick={() => onOpenFeedback(event)} style={{ padding: '0.5rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px', background: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04', border: '1px solid rgba(234, 179, 8, 0.3)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(234, 179, 8, 0.2)' }}
                    onMouseLeave={e => { e.currentTarget.style.background='rgba(234, 179, 8, 0.1)' }}>
                    <RiStarFill size={16} />
                    {event.feedbacks?.length > 0 ? `${event.averageRating || '5.0'} (${event.feedbacks.length} Reviews)` : 'Leave Feedback'}
                  </button>
                ) : (
                  <>
                    <RiTeamLine size={18} />
                    {isTeamEvent ? `${event.teams?.length || 0} Teams` : `${event.registeredUsers?.length || 0} Registered`}
                  </>
                )}
                {isAdmin && (event.registeredUsers?.length > 0 || event.teams?.length > 0) && (
                  <button onClick={() => onOpenRoster(event._id)} style={{ marginLeft: '0.5rem', padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '6px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', cursor: 'pointer', fontWeight: 700 }}>
                    View Roster
                  </button>
                )}
              </div>

              {isUpcoming && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {alreadyDone && (
                    <button
                      onClick={() => {
                        const title = encodeURIComponent(event.title);
                        const details = encodeURIComponent(event.description || '');
                        const location = encodeURIComponent(event.location || '');
                        const start = new Date(event.date);
                        const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours default duration
                        const fmt = d => d.toISOString().replace(/-|:|\.\d+/g, '');
                        const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${fmt(start)}/${fmt(end)}`;
                        window.open(gcalUrl, '_blank');
                      }}
                      title="Add to Google Calendar"
                      style={{
                        padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)',
                        background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-accent-primary)'; e.currentTarget.style.borderColor = 'var(--color-accent-primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                    >
                      <RiNotification3Line size={18} />
                    </button>
                  )}
                  <button
                    onClick={handleRegister} disabled={loading || isVolunteered}
                    onMouseEnter={() => setHoverReg(true)}
                    onMouseLeave={() => setHoverReg(false)}
                    title={isVolunteered ? 'Cancel volunteering first to register' : ''}
                    style={{
                      padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', border: 'none',
                      cursor: isVolunteered ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s',
                      opacity: isVolunteered ? 0.45 : 1,
                      ...(alreadyDone
                        ? (hoverReg
                            ? { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }
                            : { background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' })
                        : { background: 'var(--color-accent-primary)', color: '#fff' }
                      )
                    }}
                  >
                    {alreadyDone ? (hoverReg ? <><RiCloseLine size={18} /> Cancel</> : <><RiCheckLine size={18} /> Registered</>) : (isTeamEvent ? '👥 Register Team' : 'Register Now')}
                  </button>
                </div>
              )}
            </div>
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
  const [formData, setFormData] = useState({ title: '', description: '', date: '', location: '', category: 'Workshop', minTeam: 1, maxTeam: 1, volunteersNeeded: 0, facultyIncharge: [], studentIncharge: [] });
  const [posterFile, setPosterFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [rosterData, setRosterData] = useState(null);
  const [rosterView, setRosterView] = useState('attendees');
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', date: '', location: '', category: 'Workshop', minTeam: 1, maxTeam: 1, volunteersNeeded: 0, facultyIncharge: [], studentIncharge: [] });
  const [editPosterFile, setEditPosterFile] = useState(null);

  // --- Crop & Fullscreen state ---
  const [fullScreenPoster, setFullScreenPoster] = useState(null);
  const [cropData, setCropData] = useState({ crop: { x: 0, y: 0 }, zoom: 1 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropperObj, setShowCropperObj] = useState(null); // { imageSrc, isEdit }
  const [posterPreview, setPosterPreview] = useState(null);
  const [editPosterPreview, setEditPosterPreview] = useState(null);
  const [alertData, setAlertData] = useState(null);

  // --- Feedback ---
  const [feedbackEvent, setFeedbackEvent] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

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
      if (data.success && data.event) {
        setEvents(prev => prev.map(e => e._id === eventId ? data.event : e));
      } else if (data.success) {
        const userId = user?.id || user?._id;
        setEvents(prev => prev.map(e => {
          if (e._id === eventId) {
            const isNowRegistered = data.registered;
            const newUsers = isNowRegistered
              ? [...(e.registeredUsers || []), userId]
              : (e.registeredUsers || []).filter(id => (id?._id || id)?.toString() !== userId?.toString());
            return { ...e, registeredUsers: newUsers };
          }
          return e;
        }));
      }
    } catch (error) {
      console.error('Registration failed', error);
    }
  };

  const handleToggleVolunteer = async (eventId) => {
    try {
      const { data } = await api.patch(`/events/${eventId}/volunteer`);
      if (data.success) {
        const userId = user?.id || user?._id;
        setEvents(prev => prev.map(e => {
          if (e._id === eventId) {
            const newVolunteers = data.volunteered
              ? [...(e.volunteers || []), userId]
              : (e.volunteers || []).filter(id => (id?._id || id)?.toString() !== userId?.toString());
            return { ...e, volunteers: newVolunteers };
          }
          return e;
        }));
      }
    } catch (error) {
      const msg = error?.response?.data?.message || 'Could not update volunteer status.';
      alert(msg);
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
      volunteersNeeded: event.volunteersNeeded || 0,
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
      if (data.success && data.event) {
        // Optimistically update local event state to avoid sluggish refetch
        setEvents(prev => prev.map(e => e._id === eventId ? data.event : e));
      } else if (data.success) {
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
        setRosterView('attendees');
        setRosterData({
          eventTitle: data.event.title,
          users: data.event.registeredUsers || [],
          teams: data.event.teams || [],
          volunteers: data.event.volunteers || [],
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

  const handleExportCSV = () => {
    if (!rosterData) return;
    let csvStr = '';

    if (rosterData.isTeamEvent && rosterData.teams?.length > 0) {
      csvStr += 'Team Name,Role,Name,Email,Mobile,Course/Branch,Batch,USN,Tech Stack\n';
      rosterData.teams.forEach(team => {
        const l = team.leader || {};
        csvStr += `"${team.teamName}","Leader","${l.name || ''}","${l.email || ''}","'${l.mobile || ''}","${l.course || ''}","${l.batch || ''}","${(l.usn || '').toUpperCase()}","${(l.techStack || []).join('; ')}"\n`;
        (team.members || []).forEach(m => {
          csvStr += `"${team.teamName}","Member","${m.name || ''}","${m.email || ''}","'${m.phno || m.mobile || ''}","${m.course || m.branch || ''}","${m.batch || ''}","${(m.usn || '').toUpperCase()}","${(m.techStack || []).join('; ')}"\n`;
        });
      });
    } else {
      csvStr += 'Name,Email,Mobile,Course,Batch,USN,Tech Stack\n';
      (rosterData.users || []).forEach(u => {
        csvStr += `"${u.name || ''}","${u.email || ''}","'${u.mobile || ''}","${u.course || ''}","${u.batch || ''}","${(u.usn || '').toUpperCase()}","${(u.techStack || []).join('; ')}"\n`;
      });
    }

    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${rosterData.eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post(`/events/${feedbackEvent._id}/feedback`, { rating: feedbackRating, comment: feedbackComment });
      if (data.success && data.event) {
        setEvents(prev => prev.map(ev => ev._id === feedbackEvent._id ? data.event : ev));
        setFeedbackEvent(null);
        setFeedbackRating(5);
        setFeedbackComment('');
        setAlertData({ title: 'Feedback Submitted!', message: 'Thank you for reviewing.', type: 'success' });
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
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
                <EventCard key={event._id} event={event} onToggleRegister={handleToggleRegister} onDelete={handleDeleteEvent} onRegisterTeam={handleRegisterTeam} onEdit={openEditModal} currentUserId={user?.id || user?._id} isAdmin={user?.role === 'admin'} onOpenRoster={handleOpenRoster} onPosterClick={setFullScreenPoster} user={user} onShowAlert={setAlertData} onVolunteer={handleToggleVolunteer} onOpenFeedback={setFeedbackEvent} />
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

      {/* Quick link to Gallery for past events */}
      {activeTab === 'past' && events.length > 0 && (
        <div style={{ marginTop: '5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>See the Action</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>Check out the full media gallery of our past club victories.</p>
          <a href="/#gallery" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-accent-primary)', fontWeight: 700, textDecoration: 'none' }}>
            Open Media Gallery <RiArrowRightLine />
          </a>
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
              width: '100%', maxWidth: '500px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}>
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '800', fontSize: '1.25rem' }}>
                Create New Event
              </div>
              <form onSubmit={handleCreateSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
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

                <input required placeholder="Event Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />

                <textarea required placeholder="Description" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)', resize: 'vertical' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input required type="datetime-local" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                    style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }}>
                    <option>Workshop</option><option>Hackathon</option><option>Seminar</option><option>Talk</option><option>Competition</option><option>Social</option><option>Other</option>
                  </select>
                </div>

                <input required placeholder="Location (Room 101, Discord, etc)" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Min Team Members</label>
                    <input required type="number" min={1} value={formData.minTeam} onChange={e => setFormData({ ...formData, minTeam: Math.max(1, parseInt(e.target.value) || 1) })}
                      style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Max Team Members</label>
                    <input required type="number" min={1} value={formData.maxTeam} onChange={e => setFormData({ ...formData, maxTeam: Math.max(1, parseInt(e.target.value) || 1) })}
                      style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />
                  </div>
                </div>
                {formData.minTeam === 1 && formData.maxTeam === 1 && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-accent-primary)', fontWeight: 600, marginTop: '-0.5rem' }}>🏆 Solo Competition</div>
                )}
                {(formData.minTeam > 1 || formData.maxTeam > 1) && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-accent-primary)', fontWeight: 600, marginTop: '-0.5rem' }}>👥 Team Competition ({formData.minTeam}–{formData.maxTeam} members)</div>
                )}

                {/* Volunteers Needed */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>🙋 Volunteers Needed</label>
                  <input
                    type="number" min={0} placeholder="How many volunteers are required? (0 = none)"
                    value={formData.volunteersNeeded}
                    onChange={e => setFormData({ ...formData, volunteersNeeded: Math.max(0, parseInt(e.target.value) || 0) })}
                    style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }}
                  />
                </div>

                {/* Faculty Incharge */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Faculty Incharge</label>
                    <button type="button" onClick={() => setFormData({ ...formData, facultyIncharge: [...formData.facultyIncharge, { name: '', number: '' }] })} style={{ background: 'none', border: 'none', color: 'var(--color-accent-primary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>+ Add Faculty</button>
                  </div>
                  {formData.facultyIncharge.map((fac, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input required placeholder="Name" value={fac.name} onChange={e => {
                        const newFac = [...formData.facultyIncharge]; newFac[i].name = e.target.value;
                        setFormData({ ...formData, facultyIncharge: newFac });
                      }} style={{ flex: 1, padding: '0.6rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }} />
                      <input placeholder="Phone / Details" value={fac.number} onChange={e => {
                        const newFac = [...formData.facultyIncharge]; newFac[i].number = e.target.value;
                        setFormData({ ...formData, facultyIncharge: newFac });
                      }} style={{ flex: 1, padding: '0.6rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }} />
                      <button type="button" onClick={() => setFormData({ ...formData, facultyIncharge: formData.facultyIncharge.filter((_, idx) => idx !== i) })} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '0 0.8rem', cursor: 'pointer' }}><RiDeleteBinLine /></button>
                    </div>
                  ))}
                </div>

                {/* Student Incharge */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Student Incharge</label>
                    <button type="button" onClick={() => setFormData({ ...formData, studentIncharge: [...formData.studentIncharge, { name: '', number: '' }] })} style={{ background: 'none', border: 'none', color: 'var(--color-accent-primary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>+ Add Student</button>
                  </div>
                  {formData.studentIncharge.map((stu, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input required placeholder="Name" value={stu.name} onChange={e => {
                        const newStu = [...formData.studentIncharge]; newStu[i].name = e.target.value;
                        setFormData({ ...formData, studentIncharge: newStu });
                      }} style={{ flex: 1, padding: '0.6rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }} />
                      <input placeholder="Phone / Details" value={stu.number} onChange={e => {
                        const newStu = [...formData.studentIncharge]; newStu[i].number = e.target.value;
                        setFormData({ ...formData, studentIncharge: newStu });
                      }} style={{ flex: 1, padding: '0.6rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }} />
                      <button type="button" onClick={() => setFormData({ ...formData, studentIncharge: formData.studentIncharge.filter((_, idx) => idx !== i) })} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '0 0.8rem', cursor: 'pointer' }}><RiDeleteBinLine /></button>
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

                <input required placeholder="Event Title" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />
                <textarea required placeholder="Description" rows={3} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)', resize: 'vertical' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input required type="datetime-local" value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                    style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />
                  <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                    style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }}>
                    <option>Workshop</option><option>Hackathon</option><option>Seminar</option><option>Talk</option><option>Competition</option><option>Social</option><option>Other</option>
                  </select>
                </div>
                <input required placeholder="Location" value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Min Team</label>
                    <input type="number" min={1} value={editForm.minTeam} onChange={e => setEditForm({ ...editForm, minTeam: Math.max(1, parseInt(e.target.value) || 1) })}
                      style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} /></div>
                  <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Max Team</label>
                    <input type="number" min={1} value={editForm.maxTeam} onChange={e => setEditForm({ ...editForm, maxTeam: Math.max(1, parseInt(e.target.value) || 1) })}
                      style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }} /></div>
                </div>

                {/* Volunteers Needed */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>🙋 Volunteers Needed</label>
                  <input
                    type="number" min={0} placeholder="How many volunteers are required? (0 = none)"
                    value={editForm.volunteersNeeded}
                    onChange={e => setEditForm({ ...editForm, volunteersNeeded: Math.max(0, parseInt(e.target.value) || 0) })}
                    style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }}
                  />
                </div>

                {/* Faculty Incharge */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Faculty Incharge</label>
                    <button type="button" onClick={() => setEditForm({ ...editForm, facultyIncharge: [...editForm.facultyIncharge, { name: '', number: '' }] })} style={{ background: 'none', border: 'none', color: 'var(--color-accent-primary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>+ Add Faculty</button>
                  </div>
                  {editForm.facultyIncharge.map((fac, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input required placeholder="Name" value={fac.name} onChange={e => {
                        const newFac = [...editForm.facultyIncharge]; newFac[i].name = e.target.value;
                        setEditForm({ ...editForm, facultyIncharge: newFac });
                      }} style={{ flex: 1, padding: '0.6rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }} />
                      <input placeholder="Phone / Details" value={fac.number} onChange={e => {
                        const newFac = [...editForm.facultyIncharge]; newFac[i].number = e.target.value;
                        setEditForm({ ...editForm, facultyIncharge: newFac });
                      }} style={{ flex: 1, padding: '0.6rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }} />
                      <button type="button" onClick={() => setEditForm({ ...editForm, facultyIncharge: editForm.facultyIncharge.filter((_, idx) => idx !== i) })} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '0 0.8rem', cursor: 'pointer' }}><RiDeleteBinLine /></button>
                    </div>
                  ))}
                </div>

                {/* Student Incharge */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Student Incharge</label>
                    <button type="button" onClick={() => setEditForm({ ...editForm, studentIncharge: [...editForm.studentIncharge, { name: '', number: '' }] })} style={{ background: 'none', border: 'none', color: 'var(--color-accent-primary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>+ Add Student</button>
                  </div>
                  {editForm.studentIncharge.map((stu, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input required placeholder="Name" value={stu.name} onChange={e => {
                        const newStu = [...editForm.studentIncharge]; newStu[i].name = e.target.value;
                        setEditForm({ ...editForm, studentIncharge: newStu });
                      }} style={{ flex: 1, padding: '0.6rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }} />
                      <input placeholder="Phone / Details" value={stu.number} onChange={e => {
                        const newStu = [...editForm.studentIncharge]; newStu[i].number = e.target.value;
                        setEditForm({ ...editForm, studentIncharge: newStu });
                      }} style={{ flex: 1, padding: '0.6rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }} />
                      <button type="button" onClick={() => setEditForm({ ...editForm, studentIncharge: editForm.studentIncharge.filter((_, idx) => idx !== i) })} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '0 0.8rem', cursor: 'pointer' }}><RiDeleteBinLine /></button>
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
                  <h3 style={{ fontWeight: '800', fontSize: '1.25rem', marginBottom: '0.2rem' }}>
                    {rosterView === 'attendees' ? 'Attendee Roster' : 'Volunteer Roster'}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    {rosterData.eventTitle} ({rosterView === 'attendees' ? rosterData.users.length + ' registered' : rosterData.volunteers.length + ' volunteers'})
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {rosterData.volunteers?.length > 0 && (
                    <button onClick={() => setRosterView(rosterView === 'attendees' ? 'volunteers' : 'attendees')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'var(--color-accent-primary)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                      {rosterView === 'attendees' ? 'View Volunteers' : 'View Attendees'}
                    </button>
                  )}
                  <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    <RiDownloadLine size={16} /> Export to Excel
                  </button>
                  <button onClick={() => setRosterData(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}><RiCloseLine /></button>
                </div>
              </div>

              <div style={{ padding: '1.5rem 2rem', overflowY: 'auto' }}>
                {rosterView === 'attendees' ? (
                  <>
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
                              {u.avatar ? <img src={u.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt="" /> : (u.name || '?').charAt(0).toUpperCase()}
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
                                {u.techStack.slice(0, 2).map(t => <span key={t} style={{ fontSize: '0.65rem', background: 'var(--color-bg-secondary)', padding: '0.15rem 0.4rem', borderRadius: '4px', color: 'var(--color-text-muted)' }}>{t}</span>)}
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {rosterData.volunteers.length === 0 && <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>No volunteers yet.</div>}
                    {rosterData.volunteers.map((u, i) => (
                      <div key={u._id || i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid var(--color-border-hover)' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#fff' }}>
                          {u.avatar ? <img src={u.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt="" /> : (u.name || '?').charAt(0).toUpperCase()}
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
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                           <span style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px', color: '#10b981', fontWeight: 600 }}>Volunteer</span>
                        </div>
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

      {/* Feedback Modal */}
      <AnimatePresence>
        {feedbackEvent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1100,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} style={{
              background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '24px',
              width: '100%', maxWidth: '500px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}>
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontWeight: '800', fontSize: '1.25rem', marginBottom: '0.2rem' }}>Feedback & Reviews</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{feedbackEvent.title}</div>
                </div>
                <button onClick={() => setFeedbackEvent(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}><RiCloseLine /></button>
              </div>

              <div style={{ padding: '1.5rem 2rem', overflowY: 'auto' }}>
                <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  {!user ? (
                    <div style={{ padding: '1rem', background: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04', borderRadius: '12px', border: '1px solid rgba(234, 179, 8, 0.3)', fontSize: '0.9rem', fontWeight: 600 }}>
                      You must be logged in to leave feedback.
                    </div>
                  ) : (
                    <>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Your Rating</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {[1,2,3,4,5].map(star => (
                            <button
                              key={star} type="button"
                              onClick={() => setFeedbackRating(star)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: star <= feedbackRating ? '#ca8a04' : 'var(--color-text-muted)' }}
                            >
                              {star <= feedbackRating ? <RiStarFill size={28} /> : <RiStarLine size={28} />}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Comment (Optional)</label>
                        <textarea rows={3} placeholder="What did you think of this event?" value={feedbackComment} onChange={e => setFeedbackComment(e.target.value)}
                          style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)', resize: 'vertical' }} />
                      </div>
                      <button type="submit" disabled={submitting} style={{ padding: '0.875rem', borderRadius: '12px', background: 'var(--color-accent-primary)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}>
                        {submitting ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                    </>
                  )}
                </form>

                <h4 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Overall Feedback ({feedbackEvent.feedbacks?.length || 0})</h4>
                {feedbackEvent.feedbacks?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {feedbackEvent.feedbacks.map((fb, idx) => (
                      <div key={idx} style={{ background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                           <div style={{ display: 'flex', gap: '0.2rem', color: '#ca8a04' }}>
                              {[1,2,3,4,5].map(star => star <= fb.rating ? <RiStarFill key={star} size={14} /> : null)}
                           </div>
                           <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                             {new Date(fb.createdAt).toLocaleDateString()}
                           </span>
                        </div>
                        {fb.comment && <p style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', lineHeight: 1.5, margin: 0 }}>"{fb.comment}"</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem 0' }}>No feedback yet. Be the first!</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default EventsPage;
