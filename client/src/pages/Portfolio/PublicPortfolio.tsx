import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Layers,
  ShieldCheck,
  Trophy,
  Award,
  Sparkles,
  Github,
  Linkedin,
  Globe,
  ExternalLink,
  Code2,
  FolderGit2,
  Share2,
  Download,
  CheckCircle2,
  GraduationCap,
  Mail,
  QrCode as QrCodeIcon,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../../services/api';
import TrustScoreMeter from '../../components/TrustScoreMeter';
import { Project, Badge, UserSkill } from '../../types';

const PublicPortfolio: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    if (username) {
      fetchPublicPortfolio();
    }
  }, [username]);

  const fetchPublicPortfolio = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/users/${username}`);
      const userData = res.data.profile || res.data.user;
      
      if (!userData) {
        setProfileUser(null);
        return;
      }

      setProfileUser(userData);

      try {
        const [projRes, skillRes, badgeRes] = await Promise.all([
          api.get(`/projects?userId=${userData.id}&status=Winner,Submitted`),
          api.get(`/skills/user/${userData.id}`),
          api.get(`/badges/user/${userData.id}`),
        ]);

        setProjects(projRes.data.projects || userData.projects || []);
        setSkills(skillRes.data.userSkills || userData.skills || []);
        setBadges((badgeRes.data.userBadges || []).map((ub: any) => ub.badge) || userData.badges || []);
      } catch {
        setProjects(userData.projects || []);
        setSkills(userData.skills || []);
        setBadges((userData.badges || []).map((ub: any) => ub.badge || ub));
      }
    } catch (e) {
      console.error('Failed to load portfolio');
      setProfileUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!profileUser) return;
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text(profileUser.name, 14, 20);
      doc.setFontSize(10);
      doc.text(
        `HackTracker Portfolio — Rank #${profileUser.currentRank || 1} | Trust Score: ${profileUser.trustScore}%`,
        14,
        28
      );
      doc.text(`${profileUser.department} | ${profileUser.college || 'Engineering Institute'}`, 14, 34);

      if (profileUser.bio) {
        doc.text(profileUser.bio, 14, 42, { maxWidth: 180 });
      }

      const projectRows = projects.map((p) => [
        p.title,
        p.hackathon ? p.hackathon.title : p.hackathonCustomName || 'Hackathon',
        p.status,
        p.isVerified ? 'OCR Verified (+8)' : 'Standard',
      ]);

      autoTable(doc, {
        head: [['Project Title', 'Hackathon Event', 'Award Tier', 'Verification']],
        body: projectRows,
        startY: 55,
        theme: 'grid',
        headStyles: { fillColor: [13, 148, 136] },
      });

      doc.save(`${profileUser.username}_hackathon_portfolio.pdf`);
    } catch (e) {
      console.error('PDF export failed');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Portfolio URL copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-sm text-gray-400 gap-2">
        <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        Loading verified developer portfolio...
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="py-24 text-center space-y-3">
        <p className="text-gray-500">Portfolio not found.</p>
        <Link to="/" className="text-xs font-bold text-teal-600 hover:underline">
          &larr; Back to HackTracker Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. TOP PORTFOLIO HERO */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-teal-950/80 via-slate-900/90 to-indigo-950/80 border border-teal-500/30 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white font-black text-3xl flex items-center justify-center border-2 border-teal-500/40 shadow-xl overflow-hidden flex-shrink-0">
              {profileUser.avatar ? (
                <img src={profileUser.avatar} alt={profileUser.name} className="w-full h-full object-cover" />
              ) : (
                profileUser.name.charAt(0)
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {profileUser.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Verified
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-300">
                {profileUser.department} &bull; {profileUser.year} Year &bull; {profileUser.college || 'Engineering Institute'}
              </p>
              <div className="text-xs text-teal-400 font-bold font-mono">
                Campus Leaderboard Rank #{profileUser.currentRank || 1} &bull; {profileUser.points} Points
              </div>
            </div>
          </div>

          <TrustScoreMeter score={profileUser.trustScore} size="lg" />
        </div>

        {/* Bio */}
        <p className="text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
          {profileUser.bio || 'Passionate software engineer building resilient full-stack systems and competing in national and global collegiate hackathons.'}
        </p>

        {/* Action & Links Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-teal-500/20">
          <div className="flex flex-wrap items-center gap-2.5">
            {profileUser.githubUrl && (
              <a
                href={profileUser.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/10"
              >
                <Github className="w-4 h-4" /> GitHub
              </a>
            )}
            {profileUser.linkedinUrl && (
              <a
                href={profileUser.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/10"
              >
                <Linkedin className="w-4 h-4" /> LinkedIn
              </a>
            )}
            {profileUser.devpostUrl && (
              <a
                href={profileUser.devpostUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/10"
              >
                <Globe className="w-4 h-4" /> Devpost
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQrModal(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 border border-white/10"
              title="Show QR Code for Career Fairs"
            >
              <QrCodeIcon className="w-4 h-4" /> QR Pass
            </button>
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 border border-white/10"
            >
              <Share2 className="w-4 h-4" /> Copy Link
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-black text-xs font-black flex items-center gap-1.5 shadow-lg shadow-teal-500/20"
            >
              <Download className="w-4 h-4" /> Download Resume PDF
            </button>
          </div>
        </div>
      </div>

      {/* 2. VERIFIED PROJECTS SHOWCASE */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5">
            <FolderGit2 className="w-6 h-6 text-teal-500" /> Verified Hackathon Projects
          </h2>
          <span className="text-xs font-semibold text-gray-500">
            {projects.length} submissions documented
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => {
            let techTags: string[] = [];
            try {
              if (Array.isArray(proj.techStack)) {
                techTags = proj.techStack;
              } else if (typeof proj.techStack === 'string') {
                techTags = JSON.parse(proj.techStack);
              }
            } catch {
              techTags = typeof proj.techStack === 'string' ? proj.techStack.split(',') : [];
            }

            return (
              <div
                key={proj.id}
                className="glass-card-hover p-6 rounded-3xl flex flex-col justify-between space-y-4 border border-gray-200/80 dark:border-gray-800/80"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                        proj.status === 'Winner'
                          ? 'bg-amber-500 text-black font-black'
                          : 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                      }`}
                    >
                      {proj.status === 'Winner' ? '🏆 Hackathon Winner' : proj.status}
                    </span>

                    {proj.isVerified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Tesseract OCR Verified
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                    {proj.description}
                  </p>

                  <div className="text-[11px] text-gray-400 font-medium">
                    Presented at:{' '}
                    <strong className="text-gray-700 dark:text-gray-300">
                      {proj.hackathon ? proj.hackathon.title : proj.hackathonCustomName}
                    </strong>
                  </div>

                  {/* Tech stack chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {techTags.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-700 dark:text-gray-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Project Links */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-gray-700 dark:text-gray-300 hover:text-teal-500 flex items-center gap-1"
                      >
                        <Github className="w-4 h-4" /> Code
                      </a>
                    )}
                    {proj.projectUrl && (
                      <a
                        href={proj.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" /> Live Demo
                      </a>
                    )}
                  </div>

                  <Link
                    to={`/projects/${proj.id}`}
                    className="font-bold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Details &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SKILL MATRIX & BADGES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Skills */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-teal-500" /> Endorsed Skill Matrix
          </h3>

          <div className="space-y-2.5">
            {skills.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-2xl bg-gray-50 dark:bg-[#131B2A] border border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">{s.skill.name}</span>
                  <span className="text-[10px] text-gray-400">{s.proficiencyLevel}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-[11px]">
                  {s.endorsementCount} Peer Endorsements
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Achievement Badges
          </h3>

          <div className="grid grid-cols-2 gap-3">
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
        </div>
      </div>

      {/* QR Code Modal for Career Fairs */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 max-w-sm w-full text-center space-y-4 border border-gray-200 dark:border-gray-800 shadow-2xl">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
              Recruiter Quick-Scan Pass
            </h3>
            <p className="text-xs text-gray-500">
              Scan with any smartphone camera to open this verified developer portfolio directly.
            </p>

            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-inner w-fit mx-auto">
              <QRCodeSVG value={window.location.href} size={180} />
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default PublicPortfolio;
