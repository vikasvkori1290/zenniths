import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine, RiZoomInLine, RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const PublicGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const { data } = await api.get('/gallery');
        if (data.success) setImages(data.data);
      } catch (err) { console.error('Failed to load gallery', err); }
      finally { setLoading(false); }
    };
    fetchGallery();
  }, []);

  const closeLightbox = () => setLightboxIndex(null);
  const prev = useCallback(() => setLightboxIndex(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setLightboxIndex(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, prev, next]);

  if (loading || images.length === 0) return null;

  return (
    <section id="gallery" style={{ padding: '6rem 2rem', background: '#fff', position: 'relative' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.03em' }}>
            Moments & <span style={{ color: 'var(--color-accent-primary)' }}>Memories</span>
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            A glimpse into our past events, hackathons, and community gatherings.
          </p>
        </div>

        <style>
          {`
            @keyframes galleryScroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(calc(-50% - 0.75rem)); }
            }
            .gallery-carousel-track {
              display: flex;
              gap: 1.5rem;
              width: max-content;
              animation: galleryScroll 40s linear infinite;
              padding-bottom: 2rem;
            }
            .gallery-carousel-track:hover {
              animation-play-state: paused;
            }
          `}
        </style>

        <div style={{ overflow: 'hidden', margin: '0 -2rem', padding: '0 2rem' }}>
          <div className="gallery-carousel-track">
            {[...images.slice(0,8), ...images.slice(0,8)].map((img, index) => (
              <motion.div
                key={`${img._id}-${index}`}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '100px' }}
                transition={{ duration: 0.5 }}
                style={{ minWidth: '300px', flex: '0 0 auto', position: 'relative', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: '#f8fafc', border: '1px solid var(--color-border)' }}
                onClick={() => setLightboxIndex(index % Math.min(images.length, 8))}
                whileHover={{ y: -5, boxShadow: '0 12px 30px rgba(0,0,0,0.12)' }}
              >
                <img src={img.url} alt={img.title} loading="lazy" style={{ width: '100%', height: '220px', display: 'block', objectFit: 'cover' }} />
                <div
                  style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)', opacity: 0, transition: 'opacity 0.3s ease', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1.5rem' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0}
                >
                  <RiZoomInLine size={24} color="#fff" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }} />
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{img.title}</span>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{new Date(img.createdAt).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/gallery" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', background: 'var(--color-bg-primary)', border: '2px solid var(--color-border)', borderRadius: '100px', color: 'var(--color-text-primary)', fontWeight: 800, fontSize: '1rem', textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent-primary)'; e.currentTarget.style.color = 'var(--color-accent-primary)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}>
            View All Memories <RiArrowRightSLine size={20} />
          </Link>
        </div>
      </div>

      {/* Lightbox with prev/next/keyboard */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
            onClick={closeLightbox}
          >
            {/* Counter */}
            <div style={{ position: 'absolute', top: '1.75rem', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(0,0,0,0.5)', padding: '0.3rem 0.9rem', borderRadius: '100px', zIndex: 2 }}>
              {lightboxIndex + 1} / {images.length}
            </div>

            <button onClick={closeLightbox} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
              <RiCloseLine size={22} />
            </button>

            {/* Prev */}
            <button onClick={e => { e.stopPropagation(); prev(); }} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', borderRadius: '50%', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
              <RiArrowLeftSLine size={30} />
            </button>

            {/* Image */}
            <motion.img
              key={lightboxIndex}
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} transition={{ duration: 0.2 }}
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].title}
              style={{ maxHeight: '85vh', maxWidth: 'calc(100% - 160px)', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
              onClick={e => e.stopPropagation()}
            />

            {/* Next */}
            <button onClick={e => { e.stopPropagation(); next(); }} style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', borderRadius: '50%', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
              <RiArrowRightSLine size={30} />
            </button>

            {/* Caption */}
            <div style={{ position: 'absolute', bottom: '2rem', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{images[lightboxIndex].title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>{new Date(images[lightboxIndex].createdAt).toLocaleDateString()}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PublicGallery;
