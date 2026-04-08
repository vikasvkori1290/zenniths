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
import AdminPanelPage from './pages/AdminPanelPage';
import AuthSuccess from './pages/AuthSuccess';
import GalleryDatabasePage from './pages/GalleryDatabasePage';
import DebugBoundary from './components/DebugBoundary';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth-success" element={<AuthSuccess />} />
            <Route path="/gallery" element={<GalleryDatabasePage />} />

            {/* Member protected routes — wrapped in SidebarLayout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<SidebarLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/team" element={<TeamDirectoryPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/events" element={<DebugBoundary><EventsPage /></DebugBoundary>} />
                <Route path="/challenges" element={<DebugBoundary><ChallengesPage /></DebugBoundary>} />
                <Route path="/leaderboard" element={<DebugBoundary><LeaderboardPage /></DebugBoundary>} />
              </Route>
            </Route>

            {/* Admin-only protected routes */}
            <Route element={<AdminRoute />}>
              <Route element={<SidebarLayout />}>
                <Route path="/admin" element={<AdminPanelPage />} />
              </Route>
            </Route>
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
