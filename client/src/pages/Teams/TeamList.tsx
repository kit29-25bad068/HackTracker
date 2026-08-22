import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Trophy,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  UserPlus,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Team } from '../../types';

const TeamList: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Create Team Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, [search]);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/teams?search=${encodeURIComponent(search)}`);
      setTeams(res.data.teams || []);
    } catch (e) {
      console.error('Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await api.post('/teams', {
        name: teamName.trim(),
        description: description.trim(),
        department,
      });

      addToast('success', 'Team Created', `Squad "${res.data.team.name}" is now ready!`);
      setIsModalOpen(false);
      setTeamName('');
      setDescription('');
      setIsSubmitting(false);
      await fetchTeams();
    } catch (err: any) {
      setIsSubmitting(false);
      addToast('error', 'Error', err.response?.data?.error || 'Failed to create team.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Squad Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Hackathon Teams & Squads
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Form multi-disciplinary squads, invite friends, collaborate on projects, and compete on the Team Leaderboard.
          </p>
        </div>

        {user && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold shadow-lg shadow-teal-500/25 transition-transform hover:scale-105 flex items-center gap-2 text-xs"
          >
            <Plus className="w-4 h-4" /> Create New Squad
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams by name, leader, or department..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Teams Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          Loading squads...
        </div>
      ) : teams.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center space-y-4">
          <Users className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No squads found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Be the pioneer! Form the first hackathon squad in your department.
          </p>
          {user && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl"
            >
              Create Squad
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((tm) => (
            <div
              key={tm.id}
              className="glass-card-hover p-6 rounded-3xl flex flex-col justify-between space-y-4 border border-gray-200/80 dark:border-gray-800/80"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    {tm.department}
                  </span>
                  <span className="text-xs font-bold text-amber-500 font-mono">
                    {tm.winsCount > 0 ? `🏆 ${tm.winsCount} Wins` : '0 Wins'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-extrabold text-lg flex items-center justify-center overflow-hidden">
                    {tm.logoUrl ? (
                      <img src={tm.logoUrl} alt={tm.name} className="w-full h-full object-cover" />
                    ) : (
                      tm.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                      {tm.name}
                    </h3>
                    <span className="text-xs text-gray-400">
                      Led by {tm.leader?.name || 'Leader'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {tm.description || 'Dedicated campus hackathon squad.'}
                </p>

                {/* Team Members Preview */}
                <div className="flex items-center gap-2 pt-1 text-xs text-gray-400">
                  <Users className="w-3.5 h-3.5 text-teal-500" />
                  <span>{tm.members?.length || 1} squad members</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="text-xs font-bold font-mono text-teal-600 dark:text-teal-400">
                  {tm.totalPoints} pts &bull; {tm.averageTrust}% Trust
                </div>
                <Link
                  to={`/teams/${tm.id}`}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 shadow-md shadow-teal-500/20 transition-all flex items-center gap-1"
                >
                  Manage Squad <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 max-w-md w-full space-y-4 border border-gray-200 dark:border-gray-800 shadow-2xl">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
              Create Hackathon Squad
            </h3>

            <form onSubmit={handleCreateTeam} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Squad Name *</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. CodeMasters AI"
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Primary Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-gray-900 dark:text-white font-semibold"
                >
                  {['CSE', 'ECE', 'IT', 'AI & DS', 'Others'].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Squad Pitch / Bio</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is your squad's focus area and hackathon goals?"
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !teamName.trim()}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  {isSubmitting ? 'Creating...' : 'Create Squad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeamList;
