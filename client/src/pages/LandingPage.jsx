import { useState } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import EventsStrip from '../components/EventsStrip';
import LeaderboardSnippet from '../components/LeaderboardSnippet';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';

const LandingPage = () => {
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' });

  const openAuth = (tab = 'login') => setAuthModal({ open: true, tab });
  const closeAuth = () => setAuthModal({ open: false, tab: 'login' });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onOpenAuth={openAuth} />

      <main style={{ flex: 1 }}>
        <HeroSection onOpenAuth={openAuth} />
        <EventsStrip />
        <LeaderboardSnippet />
      </main>

      <Footer />

      <AuthModal
        isOpen={authModal.open}
        onClose={closeAuth}
        initialTab={authModal.tab}
      />
    </div>
  );
};

export default LandingPage;
