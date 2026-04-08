import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ProtectedRoute, AdminRoute } from './layouts/ProtectedRoute';
import SidebarLayout from './layouts/SidebarLayout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import TeamDirectoryPage from './pages/TeamDirectoryPage';
import ProjectsPage from './pages/ProjectsPage';
import EventsPage from './pages/EventsPage';
import ChallengesPage from './pages/ChallengesPage';
import LeaderboardPage from './pages/LeaderboardPage';

// Placeholder pages (to be replaced in upcoming phases)
const AdminPage = () => <div style={{ padding: '2rem', color: 'var(--color-text-primary)' }}>Admin Panel — Phase 7</div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />

            {/* Member protected routes — wrapped in SidebarLayout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<SidebarLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/team" element={<TeamDirectoryPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/challenges" element={<ChallengesPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
              </Route>
            </Route>

            {/* Admin-only protected routes */}
            <Route element={<AdminRoute />}>
              <Route element={<SidebarLayout />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
