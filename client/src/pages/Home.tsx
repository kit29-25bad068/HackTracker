import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Trophy,
  Award,
  Users,
  ShieldCheck,
  Briefcase,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  Flame,
  CheckCircle2,
  Code2,
  Zap,
  Globe,
  Star,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Hackathon } from '../types';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({
    activeUsers: 1420,
    hackathonsTracked: 450,
    projectsSubmitted: 890,
    averageTrustScore: 88.4,
    popularSkills: [],
  });
  const [featuredHackathons, setFeaturedHackathons] = useState<Hackathon[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchFeaturedHackathons();
    fetchTopLeaderboard();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats');
      setStats(res.data);
    } catch (e) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchFeaturedHackathons = async () => {
    try {
      const res = await api.get('/hackathons/featured');
      setFeaturedHackathons(res.data.hackathons || []);
    } catch (e) {
      console.error('Failed to fetch featured hackathons');
    }
  };

  const fetchTopLeaderboard = async () => {
    try {
      const res = await api.get('/leaderboard/individual?limit=5');
      setTopUsers(res.data.leaderboard || []);
    } catch (e) {
      console.error('Failed to fetch top leaderboard');
    }
  };

  const howItWorksSteps = [
    { num: '01', title: 'Sign Up', desc: 'Create your verified student profile with department & year.' },
    { num: '02', title: 'Discover Hackathons', desc: 'Find curated events from Unstop, Devpost, MLH, Kaggle & more.' },
    { num: '03', title: 'Register Officially', desc: 'Redirect smoothly to the official platform to register.' },
    { num: '04', title: 'Participate & Build', desc: 'Collaborate solo or in teams with campus teammates.' },
    { num: '05', title: 'Submit Projects', desc: 'Log your tech stack, GitHub repo, live demo, and pitch.' },
    { num: '06', title: 'Verify with OCR', desc: 'Scan certificate pixels with Tesseract OCR to boost Trust Score.' },
    { num: '07', title: 'Earn Points & Badges', desc: 'Climb Individual, Team, and Department Leaderboards.' },
    { num: '08', title: 'Build Your Legacy', desc: 'Share a sleek, recruiter-ready public portfolio.' },
  ];

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 lg:pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Subtle Background Glow Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-teal-500/20 via-indigo-500/20 to-purple-500/20 blur-[120px] pointer-events-none -z-10 rounded-full" />

        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 mb-8 shadow-sm">
          <Sparkles className="w-4 h-4 text-teal-500" />
          <span>The All-In-One Hackathon & Portfolio Ecosystem</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-4xl mx-auto leading-[1.15]">
          Discover Hackathons.{' '}
          <span className="bg-gradient-to-r from-teal-500 via-teal-400 to-indigo-500 bg-clip-text text-transparent">
            Track Achievements.
          </span>{' '}
          Build Your Legacy.
        </h1>

        {/* Hero Description */}
        <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          HackTracker is your all-in-one platform to discover hackathons across Unstop, Devpost, MLH, and HackerEarth, verify certificates with automated OCR, compete on dual leaderboards, and build a professional recruiter portfolio.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {!user ? (
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 rounded-2xl shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 rounded-2xl shadow-xl shadow-teal-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              Open Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          )}
          <Link
            to="/hackathons"
            className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-gray-800 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Search className="w-4 h-4 text-teal-500" /> Explore Hackathons
          </Link>
          <Link
            to="/leaderboard"
            className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-gray-800 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Trophy className="w-4 h-4 text-amber-500" /> View Leaderboard
          </Link>
        </div>

        {/* Highlight Note */}
        <div className="mt-8 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Automated Tesseract OCR verification &bull; Zero hardcoded rankings &bull; 100% persistent data</span>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-white/60 dark:bg-[#111827]/70 backdrop-blur-xl border border-gray-200/80 dark:border-gray-800/80 shadow-lg">
          <div className="p-4 text-center border-r border-gray-200/60 dark:border-gray-800/60 last:border-none">
            <div className="text-3xl sm:text-4xl font-extrabold text-teal-600 dark:text-teal-400">
              {stats.activeUsers.toLocaleString()}+
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1">
              Active Builders
            </div>
          </div>
          <div className="p-4 text-center border-r border-gray-200/60 dark:border-gray-800/60 last:border-none">
            <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {stats.hackathonsTracked}+
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1">
              Hackathons Tracked
            </div>
          </div>
          <div className="p-4 text-center border-r border-gray-200/60 dark:border-gray-800/60 last:border-none">
            <div className="text-3xl sm:text-4xl font-extrabold text-purple-600 dark:text-purple-400">
              {stats.projectsSubmitted}+
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1">
              Verified Projects
            </div>
          </div>
          <div className="p-4 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-500">
              {stats.averageTrustScore}%
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1">
              Average Trust Score
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURE CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            Built for Serious Hackathon Builders
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need to discover multi-platform hackathons, track projects, prove credentials, and showcase your developer legacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-card p-6 rounded-3xl space-y-4 hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              🔍 Discover Hackathons
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Find curated hackathons from Devpost, Unstop, MLH, Kaggle, and HackerEarth in one unified real-time feed with multi-criteria filtering.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-6 rounded-3xl space-y-4 hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              📊 Dual & Department Leaderboards
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Compete individually or with your squad. Real-time dynamic ranking weighted by your verified Trust Score and podium wins.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-6 rounded-3xl space-y-4 hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              🛡️ Certificate OCR & Trust Score
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Upload certificates to be optically parsed by Tesseract OCR. Authenticate achievements, earn +8 Trust Score, and unlock elite badges.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-card p-6 rounded-3xl space-y-4 hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              🤝 Team Collaboration
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Form squads, invite friends by email or handle, collaborate on team submissions, and climb the Team Leaderboard together.
            </p>
          </div>

          {/* Card 5 */}
          <div className="glass-card p-6 rounded-3xl space-y-4 hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              🎖️ Rule-Based Gamification
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Unlock prestigious badges (First Step, Project Master, Legendary Hacker) and reach career milestones as you submit and win.
            </p>
          </div>

          {/* Card 6 */}
          <div className="glass-card p-6 rounded-3xl space-y-4 hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              💼 Recruiter-Ready Portfolio
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Share your public profile (<code className="text-teal-500 text-xs">/portfolio/:username</code>) displaying verified projects, skill matrix, and certificates.
            </p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS JOURNEY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <div className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
            End-To-End Journey
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            How HackTracker Works
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            From initial event discovery to authenticated proof and recruiter visibility in 8 simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {howItWorksSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white/70 dark:bg-[#111827]/70 border border-gray-200 dark:border-gray-800 relative hover:border-teal-500/50 transition-all group"
            >
              <div className="text-2xl font-black text-teal-500/40 group-hover:text-teal-500 transition-colors font-mono mb-2">
                {step.num}
              </div>
              <h4 className="font-bold text-base text-gray-900 dark:text-white mb-1.5">
                {step.title}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FEATURED HACKATHONS PREVIEW */}
      {featuredHackathons.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Flame className="w-6 h-6 text-amber-500" /> Featured Hackathons
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Trending opportunities ready for your project submission
              </p>
            </div>
            <Link
              to="/hackathons"
              className="text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              View all hackathons <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredHackathons.slice(0, 3).map((h) => (
              <div
                key={h.id}
                className="glass-card-hover p-5 rounded-3xl flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                      {h.platform}
                    </span>
                    <span className="text-xs font-semibold text-emerald-500 font-mono">
                      {h.prizePool}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                    {h.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {h.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                  <Link
                    to={`/hackathons/${h.id}`}
                    className="flex-1 py-1.5 rounded-xl text-xs font-bold text-center text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition-colors"
                  >
                    View Details
                  </Link>
                  <a
                    href={h.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 rounded-xl text-xs font-bold text-center text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 shadow-sm flex items-center justify-center gap-1"
                  >
                    Register <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. TOP LEADERBOARD PREVIEW */}
      {topUsers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500" /> Top Campus Builders
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Verified high-trust hackers dominating the campus leaderboard
              </p>
            </div>
            <Link
              to="/leaderboard"
              className="text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              Full Leaderboard &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {topUsers.map((u, idx) => (
              <Link
                key={u.id}
                to={`/profile/${u.username}`}
                className="glass-card-hover p-4 rounded-2xl text-center space-y-2.5 flex flex-col items-center justify-center group"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg overflow-hidden shadow-md">
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                    ) : (
                      u.name.charAt(0)
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-black text-xs font-black flex items-center justify-center border-2 border-white dark:border-[#111827]">
                    #{idx + 1}
                  </span>
                </div>

                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-teal-500 transition-colors truncate max-w-[120px]">
                    {u.name}
                  </div>
                  <div className="text-[11px] text-gray-400">{u.department} &bull; {u.year}</div>
                </div>

                <div className="w-full pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between text-xs font-semibold">
                  <span className="text-teal-600 dark:text-teal-400">{u.points} pts</span>
                  <span className="text-emerald-500">{u.trustScore}% Trust</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 7. BOTTOM CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-teal-900/60 via-indigo-900/60 to-purple-900/60 border border-teal-500/30 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -z-10" />
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Build Your Hackathon Legacy?
          </h3>
          <p className="text-gray-300 max-w-xl mx-auto text-sm sm:text-base">
            Create your account today, import past projects from Devpost, and prove your capabilities with OCR-verified certificates.
          </p>
          <div>
            <Link
              to={user ? '/dashboard' : '/signup'}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-gray-900 font-bold hover:bg-gray-100 shadow-xl transition-transform hover:scale-105"
            >
              {user ? 'Go to Dashboard' : 'Join HackTracker Free'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
