import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine, RiZoomInLine, RiArrowLeftSLine, RiArrowRightSLine, RiArrowLeftLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const GalleryDatabasePage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  
  // Filter state
  const [activeAlbum, setActiveAlbum] = useState('All');

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const { data } = await api.get('/gallery');
        if (data.success) {
          setImages(data.data);
        }
      } catch (err) {
        console.error('Failed to load gallery', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  // Compute unique album titles
  const albums = useMemo(() => {
    const uniqueTitles = new Set(images.map(img => img.title));
    return ['All', ...Array.from(uniqueTitles)];
  }, [images]);

  // Filter images
  const filteredImages = useMemo(() => {
    if (activeAlbum === 'All') return images;
    return images.filter(img => img.title === activeAlbum);
  }, [activeAlbum, images]);

  // Lightbox handlers (needs to operate on filtered images)
  const closeLightbox = () => setLightboxIndex(null);
  const prev = useCallback(() => setLightboxIndex(i => (i - 1 + filteredImages.length) % filteredImages.length), [filteredImages.length]);
  const next = useCallback(() => setLightboxIndex(i => (i + 1) % filteredImages.length), [filteredImages.length]);

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

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header & Back Navigation */}
        <div style={{ marginBottom: '3rem', textAlign: 'center', position: 'relative' }}>
          <Link to="/" style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', textDecoration: 'none', fontWeight: 600, padding: '0.5rem 1rem', background: '#fff', borderRadius: '100px', border: '1px solid var(--color-border)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <RiArrowLeftLine /> Back to Home
          </Link>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--color-text-primary)', margin: 0 }}>
            Moments & <span style={{ color: 'var(--color-accent-primary)' }}>Memories</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', marginTop: '1rem' }}>
            Browse through all our past events and community gatherings.
          </p>
        </div>

        {/* Filters */}
        {!loading && albums.length > 1 && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3rem' }}>
            {albums.map((album) => (
              <button
                key={album}
                onClick={() => setActiveAlbum(album)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '100px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: activeAlbum === album ? 'var(--color-accent-primary)' : 'var(--color-border)',
                  background: activeAlbum === album ? 'var(--color-accent-primary)' : '#fff',
                  color: activeAlbum === album ? '#fff' : 'var(--color-text-primary)',
                  transition: 'all 0.2s',
                  boxShadow: activeAlbum === album ? '0 4px 15px rgba(59, 130, 246, 0.4)' : '0 2px 5px rgba(0,0,0,0.02)'
                }}
              >
                {album} {album === 'All' && <span style={{ opacity: 0.8, fontSize: '0.8rem', marginLeft: '0.3rem' }}>({images.length})</span>}
              </button>
            ))}
          </div>
        )}

        {/* Gallery Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>Loading gallery...</div>
        ) : filteredImages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>No images found.</div>
        ) : (
          <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
            <AnimatePresence mode="popLayout">
              {filteredImages.map((img, index) => (
                <motion.div
                  layout
                  key={img._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: '#fff', border: '1px solid var(--color-border)' }}
                  onClick={() => setLightboxIndex(index)}
                  whileHover={{ y: -5, boxShadow: '0 12px 30px rgba(0,0,0,0.12)' }}
                >
                  <img src={img.url} alt={img.title} loading="lazy" style={{ width: '100%', display: 'block', objectFit: 'cover', height: '240px' }} />
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
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Lightbox with prev/next/keyboard */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredImages[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
            onClick={closeLightbox}
          >
            {/* Counter */}
            <div style={{ position: 'absolute', top: '1.75rem', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(0,0,0,0.5)', padding: '0.3rem 0.9rem', borderRadius: '100px', zIndex: 2 }}>
              {lightboxIndex + 1} / {filteredImages.length}
            </div>

            <button onClick={closeLightbox} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
              <RiCloseLine size={22} />
            </button>

            {/* Prev */}
            {filteredImages.length > 1 && (
              <button onClick={e => { e.stopPropagation(); prev(); }} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', borderRadius: '50%', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
                <RiArrowLeftSLine size={30} />
              </button>
            )}

            {/* Image */}
            <motion.img
              key={lightboxIndex}
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} transition={{ duration: 0.2 }}
              src={filteredImages[lightboxIndex].url}
              alt={filteredImages[lightboxIndex].title}
              style={{ maxHeight: '85vh', maxWidth: 'calc(100% - 160px)', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
              onClick={e => e.stopPropagation()}
            />

            {/* Next */}
            {filteredImages.length > 1 && (
              <button onClick={e => { e.stopPropagation(); next(); }} style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', borderRadius: '50%', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
                <RiArrowRightSLine size={30} />
              </button>
            )}

            {/* Caption */}
            <div style={{ position: 'absolute', bottom: '2rem', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{filteredImages[lightboxIndex].title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>{new Date(filteredImages[lightboxIndex].createdAt).toLocaleDateString()}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryDatabasePage;
