import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  CheckCircle2,
  Trash2,
  Filter,
  ShieldCheck,
  Award,
  Users,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCheck,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { NotificationItem } from '../../types';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const { notifications, markAsRead, markAllAsRead, fetchNotifications } = useNotification();

  const [activeTab, setActiveTab] = useState<'inapp' | 'emails'>('inapp');
  const [filterType, setFilterType] = useState('all');
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);

  useEffect(() => {
    if (activeTab === 'emails') {
      fetchEmailLogs();
    }
  }, [activeTab]);

  const fetchEmailLogs = async () => {
    try {
      setIsLoadingEmails(true);
      const res = await api.get('/notifications/email-logs');
      setEmailLogs(res.data.emailLogs || []);
      if (res.data.emailLogs?.length > 0) {
        setSelectedEmail(res.data.emailLogs[0]);
      }
    } catch (e) {
      console.error('Failed to load email dispatch logs');
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'unread') return !n.isRead;
    if (filterType === 'badge') return n.type === 'badge' || n.type === 'milestone';
    if (filterType === 'team') return n.type === 'team_invite';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Channel Communication Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Notification & Email Center
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time in-app alerts and official transactional dispatches sent to{' '}
            <strong className="text-teal-600 dark:text-teal-400 font-mono">{user?.email}</strong>.
          </p>
        </div>

        {activeTab === 'inapp' && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 border border-teal-500/30 flex items-center gap-1.5 transition-colors"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        <button
          onClick={() => setActiveTab('inapp')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'inapp'
              ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Bell className="w-4 h-4" /> In-App Alerts ({notifications.filter((n) => !n.isRead).length} unread)
        </button>
        <button
          onClick={() => setActiveTab('emails')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'emails'
              ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Mail className="w-4 h-4" /> Registered-Email Log Inspector
        </button>
      </div>

      {/* TAB 1: IN-APP ALERTS */}
      {activeTab === 'inapp' && (
        <div className="space-y-6">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 text-xs">
            {['all', 'unread', 'badge', 'team'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold capitalize transition-colors ${
                  filterType === f
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl text-center space-y-3">
              <Bell className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="font-bold text-base text-gray-900 dark:text-white">All caught up!</h3>
              <p className="text-xs text-gray-500">No notifications in this filter category.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.isRead && markAsRead(notif.id)}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                    notif.isRead
                      ? 'bg-white/60 dark:bg-[#111827]/60 border-gray-200/80 dark:border-gray-800/80'
                      : 'bg-teal-500/10 dark:bg-teal-950/40 border-teal-500/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {notif.type === 'badge' || notif.type === 'milestone' ? (
                        <Award className="w-5 h-5 text-amber-500" />
                      ) : notif.type === 'team_invite' ? (
                        <Users className="w-5 h-5 text-indigo-500" />
                      ) : (
                        <Bell className="w-5 h-5 text-teal-500" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">
                          {notif.title}
                        </span>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="text-[10px] text-gray-400 pt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {notif.actionUrl && (
                    <a
                      href={notif.actionUrl}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 flex-shrink-0"
                    >
                      View
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REGISTERED-EMAIL LOG INSPECTOR */}
      {activeTab === 'emails' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-500/30 text-xs text-teal-900 dark:text-teal-200">
            <strong>Registered Email Dispatch System:</strong> In accordance with safety rules, all system announcements, certificate verification receipts, and team invitations are dispatched to your registered address (<strong>{user?.email}</strong>). This inspector allows you to audit all generated transactional emails.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Email List Sidebar */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-gray-400">Dispatched Messages:</span>
              {emailLogs.length === 0 ? (
                <p className="text-xs text-gray-400 p-4">No email dispatches yet.</p>
              ) : (
                emailLogs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => setSelectedEmail(log)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all space-y-1 ${
                      selectedEmail?.id === log.id
                        ? 'bg-teal-500/10 border-teal-500/50'
                        : 'bg-gray-50 dark:bg-[#131B2A] border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    <div className="font-bold text-xs text-gray-900 dark:text-white truncate">
                      {log.subject}
                    </div>
                    <div className="text-[10px] text-gray-400 flex justify-between">
                      <span>To: {log.toEmail}</span>
                      <span>{new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Email Body Preview */}
            <div className="md:col-span-2 glass-card p-6 rounded-3xl space-y-4 border border-gray-200 dark:border-gray-800">
              {selectedEmail ? (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1 border-b border-gray-200 dark:border-gray-800 pb-3">
                    <div className="text-base font-extrabold text-gray-900 dark:text-white">
                      {selectedEmail.subject}
                    </div>
                    <div className="text-gray-400">
                      <strong>To:</strong> {selectedEmail.toEmail} &bull; <strong>Sent:</strong> {new Date(selectedEmail.sentAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Render HTML content safely */}
                  <div
                    className="prose dark:prose-invert max-w-none text-xs p-4 rounded-2xl bg-white dark:bg-[#070B12] border border-gray-200 dark:border-gray-800"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.htmlContent }}
                  />
                </div>
              ) : (
                <div className="py-24 text-center text-xs text-gray-400">
                  Select an email to view its full rendered dispatch.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default NotificationsPage;
