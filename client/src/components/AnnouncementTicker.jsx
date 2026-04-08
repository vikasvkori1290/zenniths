import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiNotification3Line } from 'react-icons/ri';
import api from '../api/axios';

const AnnouncementTicker = () => {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data } = await api.get('/announcements');
        if (data.success && data.data.length > 0) {
          setAnnouncements(data.data.map(ann => ann.text));
        } else {
           // Fallback if no specific notices are published
           setAnnouncements([
              "🚀 Welcome to ClubFlow - Your college's central technical hub!",
              "✨ Register for an account to participate in weekly coding challenges.",
              "🛠️ Showcase your projects and build your official digital identity."
           ]);
        }
      } catch (err) {
        console.error('Ticker fetch error', err);
      }
    };
    fetchAnnouncements();
  }, []);

  if (announcements.length === 0) return null;

  return (
    <div style={{
      background: 'var(--color-bg-secondary)',
      borderBottom: '1px solid var(--color-border)',
      padding: '0.45rem 1rem',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--color-accent-primary)',
        fontWeight: 700,
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        flexShrink: 0,
        background: 'rgba(124, 58, 237, 0.1)',
        padding: '0.2rem 0.6rem',
        borderRadius: '6px'
      }}>
        <RiNotification3Line size={16} />
        Latest
      </div>

      <div style={{ overflow: 'hidden', flex: 1, position: 'relative' }}>
        <motion.div
          animate={{ x: [0, -1500] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 35,
              ease: "linear",
            },
          }}
          style={{
            display: 'flex',
            gap: '4rem',
            whiteSpace: 'nowrap',
            width: 'fit-content'
          }}
        >
          {/* Repeat for seamless loop */}
          {[...announcements, ...announcements, ...announcements].map((text, i) => (
            <span key={i} style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              {text}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AnnouncementTicker;
