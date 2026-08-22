import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Github,
  Globe,
  CheckCircle2,
  FileCheck,
  Trophy,
  Users,
  ShieldCheck,
  Calendar,
  Share2,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Edit2,
  Trash2,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import CertificateModal from '../../components/CertificateModal';
import ProjectModal from '../../components/ProjectModal';
import { Project } from '../../types';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, refreshUser } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.project);
    } catch (e) {
      console.error('Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('success', 'Copied', 'Project link copied to clipboard!');
  };

  const handleDelete = async () => {
    if (!project || !window.confirm(`Delete project "${project.title}"?`)) return;
    try {
      await api.delete(`/projects/${project.id}`);
      addToast('info', 'Project Deleted', 'Project removed from your portfolio.');
      await refreshUser();
      navigate('/projects');
    } catch (err) {
      addToast('error', 'Error', 'Failed to delete project.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        Loading project details...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-24 text-center space-y-3">
        <p className="text-gray-500">Project not found.</p>
        <Link to="/projects" className="text-xs font-bold text-teal-600 hover:underline">
          &larr; Back to Projects
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === project.userId;

  let techTags: string[] = [];
  try {
    if (Array.isArray(project.techStack)) {
      techTags = project.techStack;
    } else if (typeof project.techStack === 'string') {
      techTags = JSON.parse(project.techStack);
    }
  } catch {
    techTags = typeof project.techStack === 'string' ? project.techStack.split(',') : [];
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Link */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>

      {/* Main Project Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-950/60 via-slate-900/80 to-indigo-950/60 border border-teal-500/20 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold ${
                project.status === 'Winner'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'bg-teal-500 text-white'
              }`}
            >
              {project.status === 'Winner' ? '🏆 Hackathon Winner' : project.status}
            </span>

            {project.isVerified ? (
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> OCR Verified (+8 Trust)
              </span>
            ) : (
              <span className="px-3 py-1 rounded-xl text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Unverified (+1 Trust)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/10 text-xs font-bold flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
            {isOwner && (
              <>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/10 text-xs font-bold flex items-center gap-1.5"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {project.title}
          </h1>
          {project.tagline && (
            <p className="text-base text-teal-300 font-medium">{project.tagline}</p>
          )}
          <div className="text-xs text-gray-400 flex items-center gap-3 pt-1">
            <span>
              Submitted to:{' '}
              <strong className="text-gray-200">
                {project.hackathon ? project.hackathon.title : project.hackathonCustomName || 'Hackathon'}
              </strong>
            </span>
            &bull;
            <span>{project.isSolo ? 'Solo Submission' : 'Team Submission'}</span>
          </div>
        </div>

        {/* Link buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/10"
            >
              <Github className="w-4 h-4" /> View Source on GitHub <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {project.projectUrl && (
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-gray-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20"
            >
              <Globe className="w-4 h-4" /> Live Demo <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {isOwner && !project.isVerified && (
            <button
              onClick={() => setIsCertificateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <FileCheck className="w-4 h-4" /> Run OCR Certificate Verification
            </button>
          )}
        </div>
      </div>

      {/* Description & Tech Stack Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Description & OCR Breakdown */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
              Project Overview & Architecture
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* OCR Certificate Authentication Section */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" /> Certificate OCR Proof
              </h3>
              {project.isVerified && (
                <span className="text-xs font-black text-emerald-500 font-mono">
                  Confidence: {project.certificate?.confidenceScore}%
                </span>
              )}
            </div>

            {project.certificate ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/40 text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-sm">Authenticated by Tesseract OCR Engine</div>
                    <p className="text-xs mt-0.5 opacity-90">
                      Optical character recognition successfully verified that <strong>{project.certificate.extractedName}</strong> was awarded <strong>{project.certificate.extractedAchievement}</strong> for <strong>{project.certificate.extractedHackathon}</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131B2A] border border-gray-200 dark:border-gray-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Awarded To:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{project.certificate.extractedName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Event Title:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{project.certificate.extractedHackathon}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Award Tier:</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">{project.certificate.extractedAchievement}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Verification Date:</span>
                    <span className="text-gray-700 dark:text-gray-300">{project.certificate.extractedDate}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center space-y-3">
                <FileCheck className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-xs text-gray-500">No certificate uploaded yet for this project.</p>
                {isOwner && (
                  <button
                    onClick={() => setIsCertificateModalOpen(true)}
                    className="px-4 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl shadow-md shadow-teal-500/20"
                  >
                    Upload Certificate for Verification
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Tech Stack & Author */}
        <div className="space-y-8">
          
          {/* Author Card */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">
              Submitted By
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-bold text-base flex items-center justify-center overflow-hidden">
                {project.user?.avatar ? (
                  <img src={project.user.avatar} alt={project.user.name} className="w-full h-full object-cover" />
                ) : (
                  project.user?.name.charAt(0)
                )}
              </div>
              <div>
                <Link
                  to={`/profile/${project.user?.username}`}
                  className="font-bold text-sm text-gray-900 dark:text-white hover:text-teal-500 transition-colors"
                >
                  {project.user?.name}
                </Link>
                <span className="text-xs text-gray-400 block">
                  {project.user?.department} &bull; Trust: {project.user?.trustScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="glass-card p-6 rounded-3xl space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">
              Technologies & Frameworks
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {techTags.map((tech, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Certificate Modal */}
      <CertificateModal
        project={project}
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        onSuccess={async (updated) => {
          setProject(updated);
          await refreshUser();
        }}
      />

      {/* Edit Modal */}
      <ProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        projectToEdit={project}
        onSuccess={async (updated) => {
          setProject(updated);
          await refreshUser();
        }}
      />
    </div>
  );
};

export default ProjectDetails;
