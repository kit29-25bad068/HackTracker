import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GlobalSearchModal from './components/GlobalSearchModal';

// Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import HackathonList from './pages/Hackathons/HackathonList';
import HackathonDetails from './pages/Hackathons/HackathonDetails';
import ProjectList from './pages/Projects/ProjectList';
import ProjectDetails from './pages/Projects/ProjectDetails';
import LeaderboardPage from './pages/Leaderboard/LeaderboardPage';
import ProfilePage from './pages/Profile/ProfilePage';
import PublicPortfolio from './pages/Portfolio/PublicPortfolio';
import TeamList from './pages/Teams/TeamList';
import TeamDetails from './pages/Teams/TeamDetails';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import SearchPage from './pages/Search/SearchPage';
import SettingsLayout from './pages/Settings/SettingsLayout';

import { useAuth } from './context/AuthContext';
import { useNotification } from './context/NotificationContext';
import { CheckCircle2, AlertCircle, Info, Award, X } from 'lucide-react';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { toasts, removeToast } = useNotification();
  const location = useLocation();

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isPublicPortfolio = location.pathname.startsWith('/portfolio/');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#070B12] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Global Navbar */}
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Main Page Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route path="/hackathons" element={<HackathonList />} />
          <Route path="/hackathons/:id" element={<HackathonDetails />} />
          
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectList />
              </ProtectedRoute>
            }
          />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile/:username?" element={<ProfilePage />} />
          <Route path="/portfolio/:username" element={<PublicPortfolio />} />
          
          <Route path="/teams" element={<TeamList />} />
          <Route path="/teams/:id" element={<TeamDetails />} />
          
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          
          <Route path="/search" element={<SearchPage />} />
          
          <Route
            path="/settings/*"
            element={
              <ProtectedRoute>
                <SettingsLayout />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div className="py-32 text-center space-y-4">
                <h1 className="text-4xl font-extrabold text-teal-500">404</h1>
                <p className="text-gray-500 text-sm">Page not found in HackTracker.</p>
                <a
                  href="/"
                  className="inline-block px-5 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs"
                >
                  Return Home
                </a>
              </div>
            }
          />
        </Routes>
      </main>

      {/* Footer */}
      {!isPublicPortfolio && <Footer />}

      {/* Global Quick-Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Global Toasts Container */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto p-4 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-2xl flex items-start justify-between gap-3 animate-in slide-in-from-bottom duration-200"
          >
            <div className="flex items-start gap-2.5">
              {t.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : t.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              ) : t.type === 'badge' ? (
                <Award className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">{t.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.message}</div>
              </div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
