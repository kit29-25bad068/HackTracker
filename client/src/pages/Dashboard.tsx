import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  RefreshCw,
  Users,
  Briefcase,
  Trophy,
  Award,
  ShieldCheck,
  FolderGit2,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Code2,
  Clock,
  CheckCircle2,
  FileCheck,
  ChevronRight,
  Zap,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import TrustScoreMeter from '../components/TrustScoreMeter';
import ProjectModal from '../components/ProjectModal';
import CertificateModal from '../components/CertificateModal';
import { Project, Badge, Milestone, UserSkill } from '../types';

const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [leaderboardTop, setLeaderboardTop] = useState<any[]>([]);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProjectForOcr, setSelectedProjectForOcr] = useState<Project | null>(null);
  const [isSyncingDevpost, setIsSyncingDevpost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const [projRes, badgeRes, msRes, skillRes, lbRes] = await Promise.all([
        api.get(`/projects?userId=${user.id}&limit=6`),
        api.get(`/badges/user/${user.id}`),
        api.get(`/milestones/user/${user.id}`),
        api.get(`/skills/user/${user.id}`),
        api.get('/leaderboard/individual?limit=5'),
      ]);

      setProjects(projRes.data.projects || []);
      setBadges((badgeRes.data.userBadges || []).map((ub: any) => ub.badge));
      setMilestones((msRes.data.userMilestones || []).map((um: any) => um.milestone));
      setUserSkills(skillRes.data.userSkills || []);
      setLeaderboardTop(lbRes.data.leaderboard || []);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncDevpost = async () => {
    try {
      setIsSyncingDevpost(true);
      const devpostUrl = user?.devpostUrl || `https://devpost.com/${user?.username}`;
      const res = await api.post('/integrations/devpost/sync', { devpostUrl });
      addToast('success', 'Devpost Synced', `${res.data.result.syncedCount} projects updated!`);
      await refreshUser();
      await fetchDashboardData();
    } catch (err: any) {
      addToast('error', 'Sync Failed', err.response?.data?.error || 'Could not sync Devpost');
    } finally {
      setIsSyncingDevpost(false);
    }
  };

  if (!user) {
    return (
      <div className="py-24 text-center">
        <p className="text-gray-500">Please sign in to view your dashboard.</p>
        <Link to="/login" className="mt-4 inline-block font-bold text-teal-600">
          Sign In &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. TOP HERO BANNER & STATS */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-950/60 via-slate-900/80 to-indigo-950/60 border border-teal-500/20 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Leaderboard Active</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome Back, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {user.department} &bull; {user.year} Year &bull; {user.college || 'Engineering Institute'}
          </p>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-black bg-teal-400 hover:bg-teal-300 rounded-xl shadow-lg shadow-teal-500/20 flex items-center gap-1.5 transition-transform hover:scale-105"
            >
              <Plus className="w-4 h-4" /> Add Project
            </button>
            <Link
              to="/hackathons"
              className="px-4 py-2 text-xs font-bold text-white bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Search className="w-4 h-4 text-teal-400" /> Explore Hackathons
            </Link>
            <button
              onClick={handleSyncDevpost}
              disabled={isSyncingDevpost}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600/80 hover:bg-indigo-500 rounded-xl border border-indigo-500/30 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingDevpost ? 'animate-spin' : ''}`} />
              {isSyncingDevpost ? 'Syncing...' : 'Sync Devpost'}
            </button>
            <Link
              to="/teams"
              className="px-4 py-2 text-xs font-bold text-white bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Users className="w-4 h-4 text-amber-400" /> Create Team
            </Link>
            <Link
              to={`/portfolio/${user.username}`}
              className="px-4 py-2 text-xs font-bold text-white bg-purple-600/80 hover:bg-purple-500 rounded-xl border border-purple-500/30 flex items-center gap-1.5 transition-colors"
            >
              <Briefcase className="w-4 h-4" /> View Portfolio
            </Link>
          </div>
        </div>

        {/* Live Trust Score & Final Score Gauge */}
        <div className="flex items-center gap-6 p-5 rounded-2xl bg-black/40 border border-teal-500/30 backdrop-blur-md shadow-inner">
          <TrustScoreMeter score={user.trustScore} size="lg" />
          <div className="space-y-1.5 text-right sm:text-left">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Calculated Final Score
            </div>
            <div className="text-3xl font-black text-white font-mono flex items-center gap-1">
              <Zap className="w-6 h-6 text-amber-400" />
              {user.finalScore.toFixed(1)}
            </div>
            <div className="text-[11px] text-teal-400/90 font-medium">
              = {user.points} pts &times; ({user.trustScore}% Trust)
            </div>
          </div>
        </div>
      </div>

      {/* 2. CORE STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rank Card */}
        <div className="glass-card p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">
            <span>Leaderboard Rank</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-gray-900 dark:text-white font-mono flex items-center gap-2">
            #{user.currentRank || 1}
            {user.rankChange !== 0 && (
              <span
                className={`text-xs font-bold flex items-center ${
                  user.rankChange > 0 ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {user.rankChange > 0 ? (
                  <>
                    <ArrowUpRight className="w-3.5 h-3.5" /> +{user.rankChange}
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-3.5 h-3.5" /> {user.rankChange}
                  </>
                )}
              </span>
            )}
          </div>
          <div className="text-xs text-teal-600 dark:text-teal-400 font-medium">
            Campus-wide ranking
          </div>
        </div>

        {/* Total Points Card */}
        <div className="glass-card p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">
            <span>Total Points</span>
            <Flame className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-3xl font-black text-teal-600 dark:text-teal-400 font-mono">
            {user.points}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            From submissions & endorsements
          </div>
        </div>

        {/* Wins Card */}
        <div className="glass-card p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">
            <span>Podium Wins</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-black text-purple-600 dark:text-purple-400 font-mono">
            {user.winsCount}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            1st, 2nd, or Special mentions
          </div>
        </div>

        {/* Badges Card */}
        <div className="glass-card p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">
            <span>Badges Unlocked</span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {badges.length} / 10
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Gamification achievements
          </div>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT 2 COLS: RECENT PROJECTS & OCR PIPELINE */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Projects Section Header */}
          <div className="glass-card p-6 rounded-3xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FolderGit2 className="w-5 h-5 text-teal-500" />
                <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
                  My Projects & OCR Status
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsProjectModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> New Project
                </button>
                <Link
                  to="/projects"
                  className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  View All &rarr;
                </Link>
              </div>
            </div>

            {/* Projects List */}
            {projects.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-400 space-y-3">
                <FolderGit2 className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600" />
                <p className="text-sm">No hackathon projects added yet.</p>
                <button
                  onClick={() => setIsProjectModalOpen(true)}
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl"
                >
                  Log Your First Hackathon Project
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#131B2A]/60 border border-gray-200/70 dark:border-gray-800/80 hover:border-teal-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/projects/${proj.id}`}
                          className="font-bold text-sm text-gray-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400"
                        >
                          {proj.title}
                        </Link>
                        {proj.status === 'Winner' && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/30">
                            🏆 Winner
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {proj.tagline || proj.description}
                      </p>
                      <div className="text-[11px] text-gray-400 flex items-center gap-2">
                        <span>{proj.hackathon ? proj.hackathon.title : proj.hackathonCustomName || 'Hackathon'}</span>
                        &bull;
                        <span>{proj.isSolo ? 'Solo' : 'Team'}</span>
                      </div>
                    </div>

                    {/* Verification Status & OCR Trigger */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {proj.isVerified ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>OCR Verified (+8)</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedProjectForOcr(proj)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 shadow-md shadow-teal-500/20 flex items-center gap-1.5"
                        >
                          <FileCheck className="w-4 h-4" /> Upload Certificate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Badges Shelf */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
                  Unlocked Badges
                </h3>
              </div>
              <span className="text-xs font-semibold text-gray-400">
                {badges.length} of 10 unlocked
              </span>
            </div>

            {badges.length === 0 ? (
              <p className="text-xs text-gray-400">Submit your first project to unlock the "First Step" badge!</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#131B2A] border border-gray-200 dark:border-gray-800 text-center space-y-1.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-lg">
                      ✨
                    </div>
                    <div className="font-bold text-xs text-gray-900 dark:text-white truncate">
                      {b.name}
                    </div>
                    <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                      +{b.pointsAward} pts &bull; {b.tier}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 1 COL: SKILLS, MILESTONES & LEADERBOARD SNAPSHOT */}
        <div className="space-y-8">
          
          {/* Top Skills Card */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-teal-500" />
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                  My Verified Skills
                </h3>
              </div>
              <Link to={`/profile/${user.username}`} className="text-xs text-teal-600 dark:text-teal-400 hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-2">
              {userSkills.length === 0 ? (
                <p className="text-xs text-gray-400">No skills listed yet on profile.</p>
              ) : (
                userSkills.slice(0, 5).map((us) => (
                  <div
                    key={us.id}
                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#131B2A] border border-gray-200 dark:border-gray-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white">{us.skill.name}</span>
                      <span className="text-[10px] text-gray-400 block">{us.proficiencyLevel}</span>
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-500 font-semibold text-[11px]">
                      {us.endorsementCount} endorsements
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Campus Leaderboard Snapshot */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                  Leaderboard Snapshot
                </h3>
              </div>
              <Link to="/leaderboard" className="text-xs text-teal-600 dark:text-teal-400 hover:underline">
                Full View &rarr;
              </Link>
            </div>

            <div className="space-y-2">
              {leaderboardTop.map((lbUser, idx) => (
                <div
                  key={lbUser.id}
                  className={`p-2.5 rounded-xl flex items-center justify-between text-xs ${
                    lbUser.id === user.id
                      ? 'bg-teal-500/15 border border-teal-500/40 text-teal-300 font-bold'
                      : 'bg-gray-50 dark:bg-[#131B2A] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-black text-amber-500 font-mono w-4">#{idx + 1}</span>
                    <span className="truncate max-w-[110px]">{lbUser.name}</span>
                  </div>
                  <div className="font-mono text-right">
                    <span>{lbUser.finalScore.toFixed(0)} score</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones Progress */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                  Career Milestones
                </h3>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {milestones.length === 0 ? (
                <p className="text-gray-400">Complete tasks to reach milestones.</p>
              ) : (
                milestones.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#131B2A] border border-gray-200 dark:border-gray-800 flex items-center gap-2"
                  >
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{m.title}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Project Add Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSuccess={async (newProj) => {
          setProjects((prev) => [newProj, ...prev]);
          await refreshUser();
          await fetchDashboardData();
        }}
      />

      {/* Certificate OCR Verification Modal */}
      {selectedProjectForOcr && (
        <CertificateModal
          project={selectedProjectForOcr}
          isOpen={!!selectedProjectForOcr}
          onClose={() => setSelectedProjectForOcr(null)}
          onSuccess={async (updatedProj) => {
            setProjects((prev) =>
              prev.map((p) => (p.id === updatedProj.id ? updatedProj : p))
            );
            await refreshUser();
            await fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
