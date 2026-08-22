import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Users,
  Building2,
  Download,
  Search,
  Filter,
  ShieldCheck,
  Award,
  Sparkles,
  Zap,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Crown,
  Flame,
  Clock,
  CheckCircle2,
  Star,
  ArrowUpRight,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const DEPARTMENTS = ['All', 'CSE', 'ECE', 'IT', 'AI & DS', 'Others'];

const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const currentUserRowRef = useRef<HTMLTableRowElement>(null);

  const [activeTab, setActiveTab] = useState<'individual' | 'team' | 'department'>('individual');

  // Individual Leaderboard State
  const [individualList, setIndividualList] = useState<any[]>([]);
  const [currentUserPosition, setCurrentUserPosition] = useState<any>(null);
  const [selectedDept, setSelectedDept] = useState('All');
  const [sortBy, setSortBy] = useState('finalScore');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframe, setTimeframe] = useState<'season' | 'month' | 'all'>('season');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });

  // Team Leaderboard State
  const [teamsList, setTeamsList] = useState<any[]>([]);
  const [teamSortBy, setTeamSortBy] = useState('points');

  // Department Leaderboard State
  const [deptStats, setDeptStats] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'individual') {
      fetchIndividualLeaderboard();
    } else if (activeTab === 'team') {
      fetchTeamLeaderboard();
    } else if (activeTab === 'department') {
      fetchDepartmentLeaderboard();
    }
  }, [activeTab, selectedDept, sortBy, searchQuery, page, teamSortBy]);

  const fetchIndividualLeaderboard = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        department: selectedDept,
        sortBy,
        search: searchQuery,
        page: String(page),
        limit: '25',
      });

      const res = await api.get(`/leaderboard/individual?${params.toString()}`);
      setIndividualList(res.data.leaderboard || []);
      setCurrentUserPosition(res.data.currentUserPosition || null);
      setPagination(res.data.pagination || { page: 1, limit: 25, total: 0, totalPages: 1 });
    } catch (e) {
      console.error('Failed to load individual leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamLeaderboard = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/leaderboard/teams?department=${selectedDept}&sortBy=${teamSortBy}`);
      setTeamsList(res.data.teams || []);
    } catch (e) {
      console.error('Failed to load team leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartmentLeaderboard = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/leaderboard/departments');
      setDeptStats(res.data.departmentStats || []);
    } catch (e) {
      console.error('Failed to load department leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScrollToMe = () => {
    if (currentUserRowRef.current) {
      currentUserRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      addToast('info', 'Located', 'Scrolled to your leaderboard ranking.');
    } else {
      addToast('info', 'Notice', `You are currently Rank #${user?.currentRank || 'N/A'}`);
    }
  };

  const handleExportCSV = () => {
    window.open('/api/leaderboard/export/csv', '_blank');
    addToast('success', 'Exporting CSV', 'Downloading campus leaderboard CSV.');
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('HackTracker Campus Leaderboard', 14, 18);
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleDateString()} — Official Rankings`, 14, 25);

      const tableRows = individualList.map((u, i) => [
        u.currentRank || i + 1,
        u.name,
        u.department,
        u.year,
        u.points,
        `${u.trustScore}%`,
        u.finalScore.toFixed(1),
        u.winsCount,
      ]);

      autoTable(doc, {
        head: [['Rank', 'Name', 'Dept', 'Year', 'Points', 'Trust', 'Final Score', 'Wins']],
        body: tableRows,
        startY: 32,
        theme: 'striped',
        headStyles: { fillColor: [13, 148, 136] },
      });

      doc.save('hacktracker_leaderboard.pdf');
      addToast('success', 'PDF Generated', 'Downloaded leaderboard PDF document.');
    } catch (err) {
      addToast('error', 'Error', 'Failed to generate PDF document.');
    }
  };

  // Top 3 Podium Candidates
  const top1 = activeTab === 'individual' ? individualList[0] : teamsList[0];
  const top2 = activeTab === 'individual' ? individualList[1] : teamsList[1];
  const top3 = activeTab === 'individual' ? individualList[2] : teamsList[2];

  const getTierBadge = (rank: number) => {
    if (rank === 1) return { label: 'Grandmaster Champion', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    if (rank === 2) return { label: 'Master Contender', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' };
    if (rank === 3) return { label: 'Elite Innovator', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    if (rank <= 10) return { label: 'Top 10 Finalist', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
    return { label: 'Verified Hacker', color: 'bg-gray-700/40 text-gray-400 border-gray-600/40' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* 1. GRAND 3D-STYLE PODIUM SHOWCASE (TOP 3 CHAMPIONS) */}
      <div className="relative pt-2 pb-2">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-2">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Grand Campus Podium</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {activeTab === 'individual' ? 'Top 3 Individual Hackers' : activeTab === 'team' ? 'Top 3 Campus Squads' : 'Department Champions'}
          </h2>
        </div>

        {/* Podium Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto items-end">
          
          {/* #2 RUNNER UP (LEFT PEDESTAL) */}
          <div className="order-2 md:order-1 flex flex-col items-center">
            {top2 ? (
              <div className="w-full flex flex-col items-center">
                {/* Crown / Horns */}
                <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mb-2 animate-bounce">
                  <Crown className="w-5 h-5 text-teal-300 drop-shadow" />
                </div>

                {/* Avatar with Teal Ring */}
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-b from-teal-400 to-emerald-600 shadow-xl shadow-teal-500/20">
                    <div className="w-full h-full rounded-full bg-[#0E1624] overflow-hidden flex items-center justify-center text-xl font-black text-teal-300">
                      {top2.avatar || top2.logoUrl ? (
                        <img src={top2.avatar || top2.logoUrl} alt={top2.name} className="w-full h-full object-cover" />
                      ) : (
                        top2.name?.charAt(0)
                      )}
                    </div>
                  </div>
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-teal-500 text-black font-black text-xs flex items-center justify-center shadow-md">
                    2
                  </span>
                </div>

                {/* Name & Handle */}
                <h3 className="font-extrabold text-base text-white text-center line-clamp-1 mt-1">
                  {top2.name}
                </h3>
                <span className="text-xs text-teal-400 font-medium">
                  {top2.department || 'Campus Squad'}
                </span>

                {/* Pedestal Step */}
                <div className="w-full mt-4 h-36 rounded-3xl bg-gradient-to-b from-[#132735] via-[#0E1E2B] to-[#0A151E] border border-teal-500/30 p-4 flex flex-col items-center justify-center text-center shadow-lg">
                  <span className="text-xs text-gray-400 uppercase font-bold text-[10px]">Runner Up</span>
                  <div className="text-xl font-black font-mono text-teal-300 mt-1">
                    {top2.finalScore ? `${top2.finalScore.toFixed(0)} Pts` : `${top2.totalPoints || 0} Pts`}
                  </div>
                  <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    <ShieldCheck className="w-3 h-3 text-teal-400" />
                    <span>{top2.trustScore || top2.averageTrust || 90}% Trust</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-44 rounded-3xl bg-gray-900/40 border border-gray-800 flex items-center justify-center text-gray-500 text-xs">
                Awaiting Contender
              </div>
            )}
          </div>

          {/* #1 CHAMPION (CENTER PEDESTAL - HIGHEST) */}
          <div className="order-1 md:order-2 flex flex-col items-center">
            {top1 ? (
              <div className="w-full flex flex-col items-center">
                {/* Crown / Horns */}
                <div className="w-10 h-10 rounded-full bg-amber-500/25 text-amber-300 flex items-center justify-center mb-2 animate-bounce">
                  <Crown className="w-6 h-6 text-amber-400 drop-shadow-lg" />
                </div>

                {/* Avatar with Gold Ring & Glow */}
                <div className="relative mb-3">
                  <div className="w-24 h-24 rounded-full p-1.5 bg-gradient-to-b from-amber-300 via-amber-500 to-yellow-600 shadow-2xl shadow-amber-500/40 ring-4 ring-amber-500/20">
                    <div className="w-full h-full rounded-full bg-[#0E1624] overflow-hidden flex items-center justify-center text-2xl font-black text-amber-300">
                      {top1.avatar || top1.logoUrl ? (
                        <img src={top1.avatar || top1.logoUrl} alt={top1.name} className="w-full h-full object-cover" />
                      ) : (
                        top1.name?.charAt(0)
                      )}
                    </div>
                  </div>
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-sm flex items-center justify-center shadow-lg shadow-amber-500/30">
                    1
                  </span>
                </div>

                {/* Name & Handle */}
                <h3 className="font-black text-lg text-white text-center line-clamp-1 mt-1">
                  {top1.name}
                </h3>
                <span className="text-xs text-amber-400 font-bold">
                  {top1.department || 'Top Campus Squad'}
                </span>

                {/* Pedestal Step (Tallest) */}
                <div className="w-full mt-4 h-48 rounded-3xl bg-gradient-to-b from-[#2A200E] via-[#1D170A] to-[#120E06] border border-amber-500/40 p-4 flex flex-col items-center justify-center text-center shadow-2xl shadow-amber-500/10">
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-extrabold uppercase tracking-widest text-[10px]">
                    <Sparkles className="w-3 h-3" /> Grand Champion
                  </div>
                  <div className="text-2xl font-black font-mono text-amber-300 mt-1">
                    {top1.finalScore ? `${top1.finalScore.toFixed(0)} Pts` : `${top1.totalPoints || 0} Pts`}
                  </div>
                  <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-black bg-amber-500/25 text-amber-300 border border-amber-400/40 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>{top1.trustScore || top1.averageTrust || 98}% Trust</span>
                  </div>
                  <span className="text-[10px] text-amber-400/80 font-bold mt-2">
                    🏆 Tier 1 Recruiter Pass Unlocked
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full h-56 rounded-3xl bg-gray-900/40 border border-gray-800 flex items-center justify-center text-gray-500 text-xs">
                Awaiting Champion
              </div>
            )}
          </div>

          {/* #3 THIRD PLACE (RIGHT PEDESTAL) */}
          <div className="order-3 md:order-3 flex flex-col items-center">
            {top3 ? (
              <div className="w-full flex flex-col items-center">
                {/* Crown / Horns */}
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 animate-bounce">
                  <Crown className="w-5 h-5 text-emerald-300 drop-shadow" />
                </div>

                {/* Avatar with Emerald Ring */}
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-b from-emerald-400 to-teal-700 shadow-xl shadow-emerald-500/20">
                    <div className="w-full h-full rounded-full bg-[#0E1624] overflow-hidden flex items-center justify-center text-xl font-black text-emerald-300">
                      {top3.avatar || top3.logoUrl ? (
                        <img src={top3.avatar || top3.logoUrl} alt={top3.name} className="w-full h-full object-cover" />
                      ) : (
                        top3.name?.charAt(0)
                      )}
                    </div>
                  </div>
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-emerald-500 text-black font-black text-xs flex items-center justify-center shadow-md">
                    3
                  </span>
                </div>

                {/* Name & Handle */}
                <h3 className="font-extrabold text-base text-white text-center line-clamp-1 mt-1">
                  {top3.name}
                </h3>
                <span className="text-xs text-emerald-400 font-medium">
                  {top3.department || 'Campus Squad'}
                </span>

                {/* Pedestal Step */}
                <div className="w-full mt-4 h-32 rounded-3xl bg-gradient-to-b from-[#0F261E] via-[#0B1D17] to-[#07130F] border border-emerald-500/30 p-4 flex flex-col items-center justify-center text-center shadow-lg">
                  <span className="text-xs text-gray-400 uppercase font-bold text-[10px]">3rd Podium</span>
                  <div className="text-xl font-black font-mono text-emerald-300 mt-1">
                    {top3.finalScore ? `${top3.finalScore.toFixed(0)} Pts` : `${top3.totalPoints || 0} Pts`}
                  </div>
                  <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>{top3.trustScore || top3.averageTrust || 85}% Trust</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-40 rounded-3xl bg-gray-900/40 border border-gray-800 flex items-center justify-center text-gray-500 text-xs">
                Awaiting Contender
              </div>
            )}
          </div>

        </div>

        {/* MOTIVATIONAL BANNER UNDER PODIUM (From Reference Image) */}
        <div className="mt-10 text-center space-y-1.5 max-w-2xl mx-auto px-4">
          <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-400">
            CLIMB THE LEADERBOARD AND CLAIM YOUR REWARDS
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Each week, the top builders with the highest verified Trust Scores earn exclusive recruiter endorsements, career referrals, and cash rewards. Track your position on the live leaderboard below.
          </p>
        </div>
      </div>

      {/* 3. TABS SWITCHER & ACTION CONTROLS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'individual'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" /> Individual Rankings
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'team'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> Campus Squads
          </button>
          <button
            onClick={() => setActiveTab('department')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'department'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" /> Department Analytics
          </button>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {user && (
            <button
              onClick={handleScrollToMe}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4 text-amber-400" /> Scroll to Me (#{user.currentRank || 1})
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#131B2A] hover:bg-gray-800 text-gray-300 border border-gray-700 flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black shadow-md shadow-amber-500/20 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      </div>

      {/* 4. TAB 1: INDIVIDUAL LEADERBOARD */}
      {activeTab === 'individual' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-[#0E1624] border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search hacker name, handle, college..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-700 bg-[#090D15] text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-gray-400 font-bold uppercase text-[10px]">Dept:</span>
                <select
                  value={selectedDept}
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-gray-700 bg-[#090D15] text-xs font-semibold text-white"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-gray-400 font-bold uppercase text-[10px]">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-gray-700 bg-[#090D15] text-xs font-semibold text-white"
                >
                  <option value="finalScore">Final Score (Points &times; Trust)</option>
                  <option value="points">Total Points</option>
                  <option value="trustScore">Trust Score %</option>
                  <option value="wins">Podium Wins</option>
                </select>
              </div>
            </div>
          </div>

          {/* Gamified Dark Table */}
          <div className="rounded-3xl overflow-hidden border border-gray-800/80 bg-[#0B111E] shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#080D17] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-800">
                  <tr>
                    <th className="py-4 px-4 text-center w-16">#</th>
                    <th className="py-4 px-4">Player / Hacker</th>
                    <th className="py-4 px-4">Department & Year</th>
                    <th className="py-4 px-4 text-center">Points</th>
                    <th className="py-4 px-4 text-center">Trust Multiplier</th>
                    <th className="py-4 px-4 text-center">Final Score</th>
                    <th className="py-4 px-4 text-center">Reward Status</th>
                    <th className="py-4 px-4 text-right">Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {individualList.map((hacker, idx) => {
                    const isCurrentUser = user && user.id === hacker.id;
                    const rankNum = hacker.currentRank || idx + 1;
                    const badge = getTierBadge(rankNum);

                    return (
                      <tr
                        key={hacker.id}
                        ref={isCurrentUser ? currentUserRowRef : null}
                        className={`transition-colors hover:bg-gray-800/30 ${
                          isCurrentUser
                            ? 'bg-amber-500/10 font-semibold border-l-4 border-l-amber-500'
                            : ''
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center">
                            <span
                              className={`w-7 h-7 rounded-xl font-black font-mono flex items-center justify-center text-xs ${
                                rankNum === 1
                                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-md shadow-amber-500/20'
                                  : rankNum === 2
                                  ? 'bg-teal-500 text-black shadow-md shadow-teal-500/20'
                                  : rankNum === 3
                                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                                  : 'bg-gray-800/80 text-gray-400 border border-gray-700'
                              }`}
                            >
                              {rankNum}
                            </span>
                          </div>
                        </td>

                        {/* Student Name & Avatar */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gray-800 text-white font-bold text-xs flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-700">
                              {hacker.avatar ? (
                                <img src={hacker.avatar} alt={hacker.name} className="w-full h-full object-cover" />
                              ) : (
                                hacker.name?.charAt(0)
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-white flex items-center gap-1.5">
                                {hacker.name}
                                {isCurrentUser && (
                                  <span className="px-1.5 py-0.5 text-[9px] bg-amber-500 text-black rounded font-black">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-gray-400 font-mono">@{hacker.username}</div>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="py-4 px-4 text-gray-300">
                          <div className="font-semibold text-white">{hacker.department}</div>
                          <div className="text-[10px] text-gray-500">{hacker.year} Year</div>
                        </td>

                        {/* Points */}
                        <td className="py-4 px-4 text-center font-mono font-black text-amber-400">
                          {hacker.points}
                        </td>

                        {/* Trust Score */}
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            {hacker.trustScore}%
                          </span>
                        </td>

                        {/* Final Score */}
                        <td className="py-4 px-4 text-center font-mono font-black text-white text-sm">
                          {hacker.finalScore.toFixed(1)}
                        </td>

                        {/* Reward Tier */}
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-4 px-4 text-right">
                          <Link
                            to={`/portfolio/${hacker.username}`}
                            className="px-3 py-1.5 rounded-xl bg-[#131B2A] hover:bg-amber-500 hover:text-black transition-colors text-xs font-bold text-gray-300 border border-gray-700 hover:border-amber-400"
                          >
                            Portfolio
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="p-2 rounded-xl border border-gray-800 bg-[#0E1624] text-gray-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold px-3 py-2 text-gray-300 font-mono">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-xl border border-gray-800 bg-[#0E1624] text-gray-300 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 2: TEAM LEADERBOARD */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamsList.map((tm, idx) => (
              <div
                key={tm.id}
                className="rounded-3xl bg-[#0E1624] border border-gray-800 p-6 flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs flex items-center justify-center font-mono shadow-md">
                      #{idx + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {tm.department}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-800 flex items-center justify-center text-lg font-bold text-white border border-gray-700">
                      {tm.logoUrl ? (
                        <img src={tm.logoUrl} alt={tm.name} className="w-full h-full object-cover" />
                      ) : (
                        tm.name?.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-white">
                        {tm.name}
                      </h4>
                      <span className="text-xs text-gray-400">
                        Led by {tm.leader?.name || 'Leader'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2">
                    {tm.description || 'Dedicated campus hackathon squad.'}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-800">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-[#090D15] border border-gray-800">
                      <span className="text-gray-400 text-[10px] block">Points</span>
                      <span className="font-bold font-mono text-amber-400">{tm.totalPoints}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#090D15] border border-gray-800">
                      <span className="text-gray-400 text-[10px] block">Avg Trust</span>
                      <span className="font-bold font-mono text-emerald-400">{tm.averageTrust}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#090D15] border border-gray-800">
                      <span className="text-gray-400 text-[10px] block">Wins</span>
                      <span className="font-bold text-amber-400">🏆 {tm.winsCount}</span>
                    </div>
                  </div>

                  <Link
                    to={`/teams/${tm.id}`}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-center block bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
                  >
                    View Team Details &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB 3: DEPARTMENT ANALYTICS CARDS */}
      {activeTab === 'department' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deptStats.map((dept) => (
              <div
                key={dept.department}
                className="rounded-3xl bg-[#0E1624] border border-gray-800 p-6 space-y-5 shadow-xl hover:border-teal-500/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-gradient-to-r from-teal-500 to-emerald-600 text-black">
                    {dept.department}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">
                    {dept.averageTrust}% Avg Trust
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-[#090D15] border border-gray-800">
                    <span className="text-gray-400 text-[10px] block">Builders</span>
                    <span className="font-extrabold text-sm text-white">
                      {dept.activeStudents}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#090D15] border border-gray-800">
                    <span className="text-gray-400 text-[10px] block">Projects</span>
                    <span className="font-extrabold text-sm text-teal-400">
                      {dept.projects}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#090D15] border border-gray-800">
                    <span className="text-gray-400 text-[10px] block">Podium Wins</span>
                    <span className="font-extrabold text-sm text-amber-400">
                      🏆 {dept.wins}
                    </span>
                  </div>
                </div>

                {/* Top 3 Students in this department */}
                <div className="space-y-2 pt-2 border-t border-gray-800">
                  <div className="text-[11px] font-bold uppercase text-gray-400">
                    Top Department Hackers:
                  </div>
                  {dept.topStudents.map((st: any, i: number) => (
                    <Link
                      key={st.id}
                      to={`/portfolio/${st.username}`}
                      className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#090D15] hover:bg-gray-800 transition-colors border border-gray-800"
                    >
                      <span className="font-semibold text-gray-200">
                        #{i + 1} {st.name}
                      </span>
                      <span className="font-mono text-teal-400 font-bold">{st.finalScore.toFixed(0)} score</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default LeaderboardPage;
