import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { RiCalendarEventLine, RiArrowRightLine, RiTimeLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// Fallback static events for when no backend is connected
const STATIC_EVENTS = [
  { _id: '1', title: 'Hackathon 2025', date: new Date(Date.now() + 5 * 24*60*60*1000).toISOString(), description: '24-hour coding marathon', category: 'Hackathon' },
  { _id: '2', title: 'AI/ML Workshop', date: new Date(Date.now() + 10 * 24*60*60*1000).toISOString(), description: 'Deep dive into machine learning', category: 'Workshop' },
  { _id: '3', title: 'Open Source Sprint', date: new Date(Date.now() + 15 * 24*60*60*1000).toISOString(), description: 'Contribute to real projects', category: 'Sprint' },
  { _id: '4', title: 'DSA Bootcamp', date: new Date(Date.now() + 20 * 24*60*60*1000).toISOString(), description: 'Crack coding interviews together', category: 'Bootcamp' },
  { _id: '5', title: 'Design Jam', date: new Date(Date.now() + 25 * 24*60*60*1000).toISOString(), description: 'UI/UX design challenge', category: 'Design' },
];

const CATEGORY_COLORS = {
  Hackathon: '#7c3aed',
  Workshop: '#06b6d4',
  Sprint: '#10b981',
  Bootcamp: '#f59e0b',
  Design: '#ec4899',
  default: '#7c3aed',
};

const daysUntil = (dateStr) => {
  const diff = new Date(dateStr) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const EventsStrip = ({ onOpenAuth }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [events, setEvents] = useState(STATIC_EVENTS);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigate = () => {
    if (user) {
      navigate('/events');
    } else {
      onOpenAuth && onOpenAuth('login');
    }
  };

  useEffect(() => {
    api.get('/events?upcoming=true&limit=6')
      .then(({ data }) => { if (data.events?.length) setEvents(data.events); })
      .catch(() => {}); // fallback to static
  }, []);

  return (
    <section id="events" ref={ref} style={{ padding: '5rem 1.5rem', position: 'relative' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}
        >
          <div>
            <p className="section-label" style={{ marginBottom: '0.5rem' }}>📅 What's Coming Up</p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800 }}>
              Upcoming <span className="gradient-text">Events</span>
            </h2>
          </div>
          <button
            onClick={handleNavigate}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              color: 'var(--color-accent-primary)', background: 'none',
              border: 'none', cursor: 'pointer', padding: 0,
              fontSize: '0.875rem', fontWeight: 600,
            }}
          >
            View all <RiArrowRightLine size={16} />
          </button>
        </motion.div>

        {/* Horizontal scroll strip */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          overflowX: 'auto',
          paddingBottom: '1rem',
          scrollbarWidth: 'thin',
        }}>
          {events.map((event, i) => {
            const color = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.default;
            const days = daysUntil(event.date);
            return (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, x: 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -4, boxShadow: `0 12px 40px ${color}30` }}
                style={{
                  minWidth: '240px', maxWidth: '260px',
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onClick={handleNavigate}
              >
                {/* Color accent top strip */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: `linear-gradient(90deg, ${color}, transparent)`,
                }} />

                <div style={{
                  display: 'inline-block',
                  background: `${color}20`,
                  border: `1px solid ${color}40`,
                  borderRadius: '6px', padding: '0.2rem 0.6rem',
                  fontSize: '0.7rem', fontWeight: 700,
                  color, marginBottom: '0.75rem', letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}>
                  {event.category || 'Event'}
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem', lineHeight: 1.3 }}>
                  {event.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {event.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                    <RiTimeLine size={14} />
                    <span>In {days} day{days !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <RiCalendarEventLine size={13} />
                    {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EventsStrip;
