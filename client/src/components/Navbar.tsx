import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Layers,
  Search,
  Bell,
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  FolderGit2,
  Users,
  Briefcase,
  ShieldCheck,
  Menu,
  X,
  CheckCircle2,
  Trophy,
  ExternalLink,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import GlobalSearchModal from './GlobalSearchModal';

interface NavbarProps {
  onOpenSearch?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
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

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-[#0B0F17]/85 border-b border-gray-200/80 dark:border-gray-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-gray-900 via-teal-600 to-indigo-600 dark:from-white dark:via-teal-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  HACKTRACKER
                </span>
                <span className="text-[10px] -mt-1 font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                  Discover &bull; Track &bull; Prove
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/hackathons"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/hackathons')
                    ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
              >
                Explore Hackathons
              </Link>
              <Link
                to="/leaderboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/leaderboard')
                    ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
              >
                Leaderboard
              </Link>
              {user && (
                <Link
                  to="/projects"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/projects')
                      ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40'
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
                  }`}
                >
                  Projects
                </Link>
              )}
            </nav>
          </div>

          {/* Center: Global Search Bar */}
          <div className="hidden sm:flex flex-1 max-w-md mx-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100/90 dark:bg-[#131B2A] hover:bg-gray-200/70 dark:hover:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 rounded-xl transition-all shadow-inner"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <span>Search hackathons, projects, skills, hackers...</span>
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] font-mono font-medium text-gray-400 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Theme Toggle, Notifications, Auth / Profile */}
          <div className="flex items-center gap-2.5">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
              )}
            </button>

            {/* User Logged In State */}
            {user ? (
              <>
                {/* Notification Bell Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setIsNotificationOpen((prev) => !prev)}
                    className="relative p-2 rounded-xl text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-teal-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown Panel */}
                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="p-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 rounded-full">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium"
                            >
                              Mark all read
                            </button>
                          )}
                          <Link
                            to="/notifications"
                            onClick={() => setIsNotificationOpen(false)}
                            className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                          >
                            View all
                          </Link>
                        </div>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markAsRead(n.id);
                                if (n.link) {
                                  setIsNotificationOpen(false);
                                  navigate(n.link);
                                }
                              }}
                              className={`p-3.5 text-left transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 flex items-start gap-3 ${
                                !n.isRead ? 'bg-teal-50/40 dark:bg-teal-950/20' : ''
                              }`}
                            >
                              <div className="mt-0.5 flex-shrink-0">
                                {n.type === 'PROJECT_VERIFIED' ? (
                                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                ) : n.type === 'BADGE_UNLOCKED' ? (
                                  <Trophy className="w-4 h-4 text-amber-500" />
                                ) : (
                                  <Sparkles className="w-4 h-4 text-teal-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-xs text-gray-900 dark:text-gray-100 truncate">
                                  {n.title}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                                  {n.message}
                                </div>
                                <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="p-2.5 bg-gray-50 dark:bg-[#0D131F] border-t border-gray-100 dark:border-gray-800 text-center">
                        <Link
                          to="/notifications"
                          onClick={() => setIsNotificationOpen(false)}
                          className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
                        >
                          Open Notification Center & Email Log &rarr;
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Avatar Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                    className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-teal-500/50 bg-white/50 dark:bg-[#131B2A]/60 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-none truncate max-w-[90px]">
                        {user.name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 leading-none mt-1">
                        Rank #{user.currentRank || 1}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {/* Profile Menu Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="p-3 border-b border-gray-100 dark:border-gray-800 mb-1">
                        <div className="font-bold text-sm text-gray-900 dark:text-white truncate">{user.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user.username}</div>
                        <div className="mt-2 flex items-center justify-between text-xs bg-teal-50 dark:bg-teal-950/40 p-2 rounded-lg text-teal-800 dark:text-teal-300">
                          <span>Trust Score</span>
                          <span className="font-bold">{user.trustScore}%</span>
                        </div>
                      </div>

                      <div className="space-y-0.5 text-sm">
                        <Link
                          to="/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
                        >
                          <Layers className="w-4 h-4 text-teal-500" />
                          Dashboard
                        </Link>
                        <Link
                          to={`/profile/${user.username}`}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
                        >
                          <User className="w-4 h-4 text-indigo-500" />
                          My Profile
                        </Link>
                        <Link
                          to="/projects"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
                        >
                          <FolderGit2 className="w-4 h-4 text-emerald-500" />
                          Projects
                        </Link>
                        <Link
                          to="/teams"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
                        >
                          <Users className="w-4 h-4 text-amber-500" />
                          Teams
                        </Link>
                        <Link
                          to={`/portfolio/${user.username}`}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
                        >
                          <Briefcase className="w-4 h-4 text-purple-500" />
                          Public Portfolio
                          <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
                        </Link>
                        <Link
                          to="/settings/integrations"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
                        >
                          <Sparkles className="w-4 h-4 text-blue-500" />
                          Integrations
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          Settings
                        </Link>
                        <Link
                          to="/settings/security"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-cyan-500" />
                          Security & 2FA
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-sm font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* User Logged Out State */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 rounded-xl shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B0F17] px-4 pt-2 pb-6 space-y-2">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Home
            </Link>
            <Link
              to="/hackathons"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Explore Hackathons
            </Link>
            <Link
              to="/leaderboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Leaderboard
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Dashboard
                </Link>
                <Link
                  to="/projects"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  My Projects
                </Link>
                <Link
                  to="/teams"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Teams
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Settings
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
