import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine, RiZoomInLine } from 'react-icons/ri';
import api from '../api/axios';

const PublicGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

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

  if (loading) return null;
  if (images.length === 0) return null; // Don't show empty gallery block

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

        {/* Masonry Layout Approximation */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {images.map((img, index) => (
            <motion.div
              key={img._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: (index % 4) * 0.1, duration: 0.6 }}
              style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                background: '#f8fafc',
                border: '1px solid var(--color-border)'
              }}
              onClick={() => setSelectedImage(img)}
              whileHover={{ y: -5, boxShadow: '0 12px 30px rgba(0,0,0,0.12)' }}
            >
              <img 
                src={img.url} 
                alt={img.title} 
                style={{ width: '100%', display: 'block', objectFit: 'cover' }} 
              />
              <div 
                style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
                  opacity: 0, transition: 'opacity 0.3s ease',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                  padding: '1.5rem'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >
                <RiZoomInLine size={24} color="#fff" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }} />
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {img.title}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {new Date(img.createdAt).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Viewer */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 10000,
              background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '2rem'
            }}
            onClick={() => setSelectedImage(null)}
          >
            <button 
              style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onClick={() => setSelectedImage(null)}
            >
              <RiCloseLine size={24} />
            </button>

            <motion.img 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              src={selectedImage.url} 
              alt={selectedImage.title}
              style={{ maxHeight: '90vh', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} 
              onClick={e => e.stopPropagation()} 
            />
            
            <div style={{ position: 'absolute', bottom: '2rem', left: '0', right: '0', textAlign: 'center', pointerEvents: 'none' }}>
               <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{selectedImage.title}</h3>
               <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>{new Date(selectedImage.createdAt).toLocaleDateString()}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PublicGallery;
