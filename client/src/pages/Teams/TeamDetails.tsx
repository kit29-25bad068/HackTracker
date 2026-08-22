import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Trophy,
  ShieldCheck,
  Award,
  Sparkles,
  UserPlus,
  FolderGit2,
  Trash2,
  LogOut,
  Mail,
  CheckCircle2,
  ArrowLeft,
  Crown,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Team, TeamMember, Project } from '../../types';

const TeamDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [team, setTeam] = useState<Team | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Invite Member Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteIdentifier, setInviteIdentifier] = useState('');
  const [inviteRole, setInviteRole] = useState('Full Stack Developer');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTeamDetails();
    }
  }, [id]);

  const fetchTeamDetails = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/teams/${id}`);
      setTeam(res.data.team);
      setProjects(res.data.team?.projects || []);
    } catch (e) {
      console.error('Failed to load team details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteIdentifier.trim() || !team) return;

    try {
      setIsInviting(true);
      await api.post(`/teams/${team.id}/invite`, {
        identifier: inviteIdentifier.trim(),
        role: inviteRole,
      });

      addToast('success', 'Invitation Dispatched', `Invite sent to ${inviteIdentifier}!`);
      setShowInviteModal(false);
      setInviteIdentifier('');
      setIsInviting(false);
      await fetchTeamDetails();
    } catch (err: any) {
      setIsInviting(false);
      addToast('error', 'Invite Failed', err.response?.data?.error || 'Could not invite user.');
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!team || !window.confirm(`Remove ${memberName} from the squad?`)) return;

    try {
      await api.delete(`/teams/${team.id}/members/${memberId}`);
      addToast('info', 'Member Removed', `${memberName} was removed.`);
      await fetchTeamDetails();
    } catch (err) {
      addToast('error', 'Error', 'Failed to remove member.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        Loading squad details...
      </div>
    );
  }

  if (!team) {
    return (
      <div className="py-24 text-center space-y-3">
        <p className="text-gray-500">Squad not found.</p>
        <Link to="/teams" className="text-xs font-bold text-teal-600 hover:underline">
          &larr; Back to Squads
        </Link>
      </div>
    );
  }

  const isLeader = user?.id === team.leaderId;
  const isMember = team.members?.some((m) => m.userId === user?.id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <Link
        to="/teams"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Squads
      </Link>

      {/* Top Squad Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-950/60 via-slate-900/80 to-indigo-950/60 border border-teal-500/20 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-teal-500 text-white shadow-sm">
              {team.department}
            </span>
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              🏆 {team.winsCount} Wins
            </span>
          </div>

          {isLeader && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-teal-500/20"
            >
              <UserPlus className="w-4 h-4" /> Invite Teammate
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-black text-2xl flex items-center justify-center overflow-hidden">
            {team.logoUrl ? (
              <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
            ) : (
              team.name.charAt(0)
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {team.name}
            </h1>
            <p className="text-xs text-gray-300">
              Led by <strong className="text-teal-400">{team.leader?.name}</strong> &bull; {team.members?.length || 1} Active Hackers
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-300 max-w-3xl leading-relaxed">
          {team.description || 'Campus hackathon squad collaborating on cutting-edge software and hardware challenges.'}
        </p>

        {/* Squad Performance Metrics */}
        <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Total Points</span>
            <span className="text-xl font-black text-teal-400 font-mono">{team.totalPoints}</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Average Trust Score</span>
            <span className="text-xl font-black text-emerald-400 font-mono">{team.averageTrust}%</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Podium Wins</span>
            <span className="text-xl font-black text-amber-400 font-mono">🏆 {team.winsCount}</span>
          </div>
        </div>
      </div>

      {/* Grid: Members & Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Squad Members */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-500" /> Squad Roster ({team.members?.length || 0})
              </h3>
            </div>

            <div className="space-y-3">
              {team.members?.map((tm) => (
                <div
                  key={tm.id}
                  className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#131B2A] border border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold text-sm flex items-center justify-center overflow-hidden">
                      {tm.user?.avatar ? (
                        <img src={tm.user.avatar} alt={tm.user.name} className="w-full h-full object-cover" />
                      ) : (
                        tm.user?.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/profile/${tm.user?.username}`}
                          className="font-bold text-sm text-gray-900 dark:text-white hover:text-teal-500"
                        >
                          {tm.user?.name}
                        </Link>
                        {tm.role === 'Leader' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-black flex items-center gap-0.5">
                            <Crown className="w-2.5 h-2.5" /> LEADER
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {tm.role} &bull; Trust: {tm.user?.trustScore}%
                      </span>
                    </div>
                  </div>

                  {isLeader && tm.userId !== user?.id && (
                    <button
                      onClick={() => handleRemoveMember(tm.id, tm.user?.name || 'Member')}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Team Projects */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-indigo-500" /> Team Submissions ({projects.length})
            </h3>

            {projects.length === 0 ? (
              <p className="text-xs text-gray-400">No projects submitted under this team name yet.</p>
            ) : (
              <div className="space-y-3">
                {projects.map((p) => (
                  <Link
                    key={p.id}
                    to={`/projects/${p.id}`}
                    className="p-3 rounded-2xl bg-gray-50 dark:bg-[#131B2A] border border-gray-200 dark:border-gray-800 hover:border-teal-500 block space-y-1 transition-all group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-900 dark:text-white group-hover:text-teal-500">
                        {p.title}
                      </span>
                      {p.status === 'Winner' && (
                        <span className="text-amber-500 text-[10px] font-bold">🏆 Winner</span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 line-clamp-1">{p.tagline || p.description}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invite Teammate Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 max-w-md w-full space-y-4 border border-gray-200 dark:border-gray-800 shadow-2xl">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
              Invite Teammate to Squad
            </h3>

            <form onSubmit={handleInvite} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Registered Email Address or Username *
                </label>
                <input
                  type="text"
                  required
                  value={inviteIdentifier}
                  onChange={(e) => setInviteIdentifier(e.target.value)}
                  placeholder="student@university.edu or username"
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-gray-900 dark:text-white font-semibold"
                >
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Frontend Engineer">Frontend Engineer</option>
                  <option value="Backend Engineer">Backend Engineer</option>
                  <option value="AI / ML Engineer">AI / ML Engineer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="Pitch Lead">Pitch Lead</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting || !inviteIdentifier.trim()}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  {isInviting ? 'Inviting...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeamDetails;
