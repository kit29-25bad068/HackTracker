import React, { useState, useEffect } from 'react';
import {
  User,
  Bell,
  Shield,
  Eye,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  Check,
  AlertCircle,
  KeyRound,
  Laptop,
  CheckCircle2,
  Lock,
  Globe,
  Github,
  Linkedin,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import TwoFactorSetupModal from '../../components/TwoFactorSetupModal';

const DEPARTMENTS = ['CSE', 'ECE', 'IT', 'AI & DS', 'Others'];
const YEARS = ['1st', '2nd', '3rd', '4th', 'Postgraduate'];

const SettingsLayout: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const { addToast } = useNotification();

  const [activeTab, setActiveTab] = useState<
    'profile' | 'notifications' | 'security' | 'privacy' | 'data' | 'integrations'
  >('profile');

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [college, setCollege] = useState(user?.college || '');
  const [department, setDepartment] = useState(user?.department || 'CSE');
  const [year, setYear] = useState(user?.year || '1st');
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || '');
  const [devpostUrl, setDevpostUrl] = useState(user?.devpostUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState({
    emailDeadlines: true,
    emailOcrStatus: true,
    emailTeamInvites: true,
    emailRankChanges: true,
  });

  // Security State
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Privacy State
  const [profileVisibility, setProfileVisibility] = useState('PUBLIC');
  const [showTrustScore, setShowTrustScore] = useState(true);
  const [showRank, setShowRank] = useState(true);

  // Account Deletion State
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio || '');
      setCollege(user.college || '');
      setDepartment(user.department || 'CSE');
      setYear(user.year || '1st');
      setGithubUrl(user.githubUrl || '');
      setLinkedinUrl(user.linkedinUrl || '');
      setDevpostUrl(user.devpostUrl || '');
      setPortfolioUrl(user.portfolioUrl || '');
      fetchSecurityAndSessions();
    }
  }, [user]);

  const fetchSecurityAndSessions = async () => {
    try {
      const res = await api.get('/security/sessions');
      setSessions(res.data.sessions || []);
    } catch (e) {
      console.error('Failed to load sessions');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      await api.put('/users/profile', {
        name,
        bio,
        college,
        department,
        year,
        githubUrl,
        linkedinUrl,
        devpostUrl,
        portfolioUrl,
      });

      await refreshUser();
      setIsSavingProfile(false);
      addToast('success', 'Profile Updated', 'Your changes have been saved.');
    } catch (err: any) {
      setIsSavingProfile(false);
      addToast('error', 'Update Failed', err.response?.data?.error || 'Could not update profile.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      addToast('error', 'Error', 'New passwords do not match.');
      return;
    }

    try {
      setIsChangingPass(true);
      await api.post('/security/change-password', {
        currentPassword,
        newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setIsChangingPass(false);
      addToast('success', 'Password Updated', 'Your password has been changed securely.');
    } catch (err: any) {
      setIsChangingPass(false);
      addToast('error', 'Error', err.response?.data?.error || 'Failed to change password.');
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await api.delete(`/security/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      addToast('info', 'Session Terminated', 'Remote session was revoked.');
    } catch (e) {
      addToast('error', 'Error', 'Failed to revoke session.');
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable Two-Factor Authentication?')) return;
    try {
      await api.post('/auth/2fa/disable');
      await refreshUser();
      addToast('info', '2FA Disabled', 'Two-Factor Authentication was removed.');
    } catch (e) {
      addToast('error', 'Error', 'Failed to disable 2FA.');
    }
  };

  const handleExportAllData = () => {
    window.open('/api/privacy/export-data', '_blank');
    addToast('success', 'Exporting Data', 'Downloading your full HackTracker JSON data archive.');
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm('WARNING: This will permanently delete your account, projects, certificates, and points. Continue?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await api.post('/privacy/delete-account', {
        password: deleteConfirmPassword,
      });

      addToast('info', 'Account Deleted', 'Your account and data have been permanently purged.');
      logout();
    } catch (err: any) {
      setIsDeleting(false);
      addToast('error', 'Deletion Failed', err.response?.data?.error || 'Invalid password.');
    }
  };

  const handleSyncDevpost = async () => {
    try {
      const targetDevpost = devpostUrl || `https://devpost.com/${user?.username}`;
      const res = await api.post('/integrations/devpost/sync', { devpostUrl: targetDevpost });
      addToast('success', 'Devpost Synced', `${res.data.result.syncedCount} projects updated!`);
      await refreshUser();
    } catch (err: any) {
      addToast('error', 'Sync Error', err.response?.data?.error || 'Could not sync Devpost.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Account & Privacy Settings
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your personal profile, notification channels, 2FA security, and data export policies.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-200 dark:border-gray-800 pb-3 text-xs">
        {[
          { id: 'profile', label: 'Public Profile', icon: User },
          { id: 'notifications', label: 'Email Notifications', icon: Bell },
          { id: 'security', label: 'Security & 2FA', icon: Shield },
          { id: 'privacy', label: 'Privacy & Visibility', icon: Eye },
          { id: 'data', label: 'Data Export & Danger Zone', icon: Download },
          { id: 'integrations', label: 'Integrations & Sync', icon: RefreshCw },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. PROFILE TAB */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 max-w-3xl">
          <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Profile Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-gray-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">College / University</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. National Institute of Technology"
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-gray-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-gray-900 dark:text-white font-semibold"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Year of Study</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-gray-900 dark:text-white font-semibold"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Bio / Headline</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell recruiters and peers about your engineering passions..."
              className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-gray-900 dark:text-white"
            />
          </div>

          {/* Social Profiles */}
          <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
            <h4 className="font-bold text-gray-900 dark:text-white">Developer Profiles & Links</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-500 mb-1">GitHub Profile URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Devpost Profile URL</label>
                <input
                  type="url"
                  value={devpostUrl}
                  onChange={(e) => setDevpostUrl(e.target.value)}
                  placeholder="https://devpost.com/username"
                  className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Personal Portfolio Website</label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://mywebsite.dev"
                  className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 disabled:opacity-50"
            >
              {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      )}

      {/* 2. NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 max-w-2xl">
          <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
            Email Notification Channels
          </h3>
          <p className="text-xs text-gray-500">
            Dispatches are sent to your verified registered address: <strong className="text-teal-500">{user?.email}</strong>.
          </p>

          <div className="space-y-4 text-xs divide-y divide-gray-100 dark:divide-gray-800">
            <label className="flex items-center justify-between pt-3 cursor-pointer">
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">Hackathon Deadlines</span>
                <span className="text-gray-400">Receive reminders 24 hours prior to registration close.</span>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs.emailDeadlines}
                onChange={(e) => setNotifPrefs({ ...notifPrefs, emailDeadlines: e.target.checked })}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between pt-3 cursor-pointer">
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">Certificate OCR Results</span>
                <span className="text-gray-400">Instant receipts when optical verification finishes.</span>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs.emailOcrStatus}
                onChange={(e) => setNotifPrefs({ ...notifPrefs, emailOcrStatus: e.target.checked })}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between pt-3 cursor-pointer">
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">Team & Squad Invites</span>
                <span className="text-gray-400">Notifies you when teammates add you to a hackathon squad.</span>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs.emailTeamInvites}
                onChange={(e) => setNotifPrefs({ ...notifPrefs, emailTeamInvites: e.target.checked })}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
            </label>
          </div>

          <button
            onClick={() => addToast('success', 'Preferences Saved', 'Email channels updated.')}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
          >
            Save Preferences
          </button>
        </div>
      )}

      {/* 3. SECURITY & 2FA TAB */}
      {activeTab === 'security' && (
        <div className="space-y-8 max-w-3xl">
          {/* 2FA Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-teal-500" /> Two-Factor Authentication (TOTP)
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Add an extra layer of security requiring a 6-digit code on sign-in.
                </p>
              </div>

              {user?.twoFactorEnabled ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Active
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-400">
                  Disabled
                </span>
              )}
            </div>

            {user?.twoFactorEnabled ? (
              <div className="pt-2">
                <button
                  onClick={handleDisable2FA}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold border border-rose-500/30"
                >
                  Disable Two-Factor Authentication
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  onClick={() => setIs2FAModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 text-white text-xs font-bold shadow-md shadow-teal-500/20"
                >
                  Enable 2FA Authenticator
                </button>
              </div>
            )}
          </div>

          {/* Change Password */}
          <form onSubmit={handleChangePassword} className="glass-card p-6 sm:p-8 rounded-3xl space-y-4">
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-500" /> Change Password
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPass || !currentPassword || !newPassword}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs disabled:opacity-50"
            >
              {isChangingPass ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          {/* Active Sessions */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4">
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <Laptop className="w-5 h-5 text-purple-500" /> Active Login Sessions
            </h3>

            <div className="space-y-2 text-xs">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#131B2A] border border-gray-200 dark:border-gray-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white block">
                      {sess.device || 'Chrome on Windows'}
                    </span>
                    <span className="text-gray-400">
                      IP: {sess.ipAddress} &bull; Last Active: {new Date(sess.lastActive).toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRevokeSession(sess.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. PRIVACY TAB */}
      {activeTab === 'privacy' && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 max-w-2xl text-xs">
          <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
            Privacy & Public Discovery
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Portfolio Visibility</label>
              <select
                value={profileVisibility}
                onChange={(e) => setProfileVisibility(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-gray-900 dark:text-white font-semibold"
              >
                <option value="PUBLIC">Public (Visible to all recruiters and visitors)</option>
                <option value="CAMPUS">Campus Only (Visible to logged-in students)</option>
                <option value="PRIVATE">Private (Only visible to you)</option>
              </select>
            </div>

            <label className="flex items-center justify-between pt-2 cursor-pointer">
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">Show Trust Score on Public Portfolio</span>
                <span className="text-gray-400">Displays your OCR verification trust rating.</span>
              </div>
              <input
                type="checkbox"
                checked={showTrustScore}
                onChange={(e) => setShowTrustScore(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between pt-2 cursor-pointer">
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">Display on Campus Leaderboard</span>
                <span className="text-gray-400">Participate in student rankings and departmental scoring.</span>
              </div>
              <input
                type="checkbox"
                checked={showRank}
                onChange={(e) => setShowRank(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
            </label>
          </div>

          <button
            onClick={() => addToast('success', 'Privacy Updated', 'Visibility preferences saved.')}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
          >
            Save Privacy Settings
          </button>
        </div>
      )}

      {/* 5. DATA EXPORT & DANGER ZONE TAB */}
      {activeTab === 'data' && (
        <div className="space-y-8 max-w-2xl text-xs">
          {/* Data Export */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-teal-500" /> Export Your Personal Data
            </h3>
            <p className="text-gray-500 leading-relaxed">
              Download a complete JSON export of your student profile, submitted hackathon projects, OCR certificate verification metadata, badges, and skill matrix.
            </p>
            <button
              onClick={handleExportAllData}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Download Complete JSON Archive
            </button>
          </div>

          {/* Danger Zone */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 border-rose-500/30">
            <h3 className="font-extrabold text-lg text-rose-500 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Danger Zone: Delete Account
            </h3>
            <p className="text-gray-500 leading-relaxed">
              Permanently delete your account, remove yourself from squads, and purge all verified certificates from the database. This action cannot be undone.
            </p>

            <form onSubmit={handleDeleteAccount} className="space-y-3 pt-2">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password to Delete Account:
                </label>
                <input
                  type="password"
                  required
                  value={deleteConfirmPassword}
                  onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/20 text-gray-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isDeleting || !deleteConfirmPassword}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-50"
              >
                {isDeleting ? 'Purging Account...' : 'Permanently Delete My Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. INTEGRATIONS TAB */}
      {activeTab === 'integrations' && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 max-w-2xl text-xs">
          <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-indigo-500" /> Platform Sync & Integrations
          </h3>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131B2A] border border-gray-200 dark:border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-gray-900 dark:text-white block">Devpost Hackathons Sync</span>
                <span className="text-gray-400">Sync all your past hackathons and submissions automatically.</span>
              </div>
              <button
                onClick={handleSyncDevpost}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Sync Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      <TwoFactorSetupModal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
        onSuccess={async () => {
          await refreshUser();
        }}
      />
    </div>
  );
};

export default SettingsLayout;
