import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiCalendarEventLine, RiMapPinLine, RiTimeLine, RiTeamLine,
  RiCheckLine, RiAddLine, RiSearchLine, RiInformationLine
} from 'react-icons/ri';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const EventCard = ({ event, onToggleRegister, currentUserId }) => {
  const isRegistered = event.registeredUsers?.includes(currentUserId);
  const [loading, setLoading] = useState(false);

  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();

  const handleRegister = async () => {
    if (loading) return;
    setLoading(true);
    await onToggleRegister(event._id);
    setLoading(false);
  };

  return (
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
          <img src={event.poster} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
        </div>

        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, flex: 1, marginBottom: '1.5rem' }}>
          {event.description}
        </p>

        {/* Footer actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
            <RiTeamLine size={18} />
            {event.registeredUsers?.length || 0} Registered
          </div>

          {isUpcoming && (
            <button
              onClick={handleRegister} disabled={loading}
              style={{
                padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s',
                ...(isRegistered
                  ? { background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }
                  : { background: 'var(--color-accent-primary)', color: '#fff' }
                )
              }}
            >
              {isRegistered ? <><RiCheckLine size={18} /> Going</> : 'RSVP Now'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};


const EventsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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
          <button style={{
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
            color: activeTab === tab ? '#fff' : 'var(--color-text-muted)', transition: 'color 0.2s',
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
                <EventCard key={event._id} event={event} onToggleRegister={handleToggleRegister} currentUserId={user?.id} />
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
    </div>
  );
};

export default EventsPage;
