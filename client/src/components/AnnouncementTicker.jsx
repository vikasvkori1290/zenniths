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

  // Ensure there's enough content to span large screens seamlessly
  // by repeating the array until it has a healthy length (e.g., at least 8 items)
  const displayItems = [...announcements];
  while (displayItems.length < 8) {
    displayItems.push(...announcements);
  }

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
        <style>{`
          @keyframes ticker-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .ticker-content:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div
          className="ticker-content"
          style={{
            display: 'flex',
            width: 'max-content',
            animation: 'ticker-scroll 35s linear infinite',
            willChange: 'transform'
          }}
        >
          {/* Group 1 */}
          <div style={{ display: 'flex', gap: '4rem', paddingRight: '4rem' }}>
            {displayItems.map((text, i) => (
              <span key={`g1-${i}`} style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                {text}
              </span>
            ))}
          </div>
          {/* Group 2 (Exact duplicate for seamless looping) */}
          <div style={{ display: 'flex', gap: '4rem', paddingRight: '4rem' }}>
            {displayItems.map((text, i) => (
              <span key={`g2-${i}`} style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementTicker;
