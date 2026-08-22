import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  ExternalLink,
  Github,
  Edit2,
  Trash2,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import ProjectModal from '../../components/ProjectModal';
import CertificateModal from '../../components/CertificateModal';
import { Project } from '../../types';

const STATUSES = ['All', 'Registered', 'Participated', 'Submitted', 'Winner'];

const ProjectList: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { addToast } = useNotification();

  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectForOcr, setSelectedProjectForOcr] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [search, selectedStatus, verifiedOnly, user]);

  const fetchProjects = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        userId: user.id,
        search,
        status: selectedStatus,
        verifiedOnly: String(verifiedOnly),
      });

      const res = await api.get(`/projects?${params.toString()}`);
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      addToast('info', 'Project Deleted', `"${title}" was removed.`);
      await refreshUser();
    } catch (err) {
      addToast('error', 'Error', 'Failed to delete project.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hackathon Submission Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            My Projects & Submissions
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your hackathon projects, upload certificates for OCR verification, and boost your Trust Score.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProject(null);
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold shadow-lg shadow-teal-500/25 transition-transform hover:scale-105 flex items-center gap-2 text-xs"
        >
          <Plus className="w-4 h-4" /> Add New Project
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects or tech stack..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {STATUSES.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                selectedStatus === st
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {st}
            </button>
          ))}

          <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 ml-2 cursor-pointer">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>OCR Verified Only</span>
          </label>
        </div>
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="py-24 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center space-y-4">
          <FolderGit2 className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No projects found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {search || selectedStatus !== 'All'
              ? 'Try resetting your search filters.'
              : 'Add your first hackathon project to start earning points and unlocking badges.'}
          </p>
          <button
            onClick={() => {
              setEditingProject(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl"
          >
            Add Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="glass-card-hover p-5 rounded-3xl flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Status Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                        proj.status === 'Winner'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                          : 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                      }`}
                    >
                      {proj.status === 'Winner' ? '🏆 Winner' : proj.status}
                    </span>

                    {proj.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                        <CheckCircle2 className="w-3 h-3" /> OCR Verified (+8)
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-500 font-medium">
                        Unverified (+1)
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <Link
                      to={`/projects/${proj.id}`}
                      className="font-bold text-base text-gray-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 line-clamp-1"
                    >
                      {proj.title}
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                      {proj.tagline || proj.description}
                    </p>
                  </div>

                  {/* Hackathon info & Tech Stack */}
                  <div className="space-y-2 pt-1">
                    <div className="text-xs text-gray-400 flex items-center gap-1.5">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {proj.hackathon ? proj.hackathon.title : proj.hackathonCustomName || 'Hackathon Event'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {techTags.slice(0, 4).map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-600 dark:text-gray-400 font-medium"
                        >
                          {t}
                        </span>
                      ))}
                      {techTags.length > 4 && (
                        <span className="text-[10px] text-gray-400">+{techTags.length - 4}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="GitHub Repo"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {proj.projectUrl && (
                      <a
                        href={proj.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Live Demo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setEditingProject(proj);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(proj.id, proj.title)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {!proj.isVerified ? (
                    <button
                      onClick={() => setSelectedProjectForOcr(proj)}
                      className="px-3 py-1.5 rounded-xl font-bold text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 shadow-sm flex items-center gap-1"
                    >
                      <FileCheck className="w-3.5 h-3.5" /> Upload OCR
                    </button>
                  ) : (
                    <Link
                      to={`/projects/${proj.id}`}
                      className="font-bold text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      View &rarr;
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        projectToEdit={editingProject}
        onSuccess={async () => {
          await fetchProjects();
          await refreshUser();
        }}
      />

      {/* Certificate OCR Modal */}
      {selectedProjectForOcr && (
        <CertificateModal
          project={selectedProjectForOcr}
          isOpen={!!selectedProjectForOcr}
          onClose={() => setSelectedProjectForOcr(null)}
          onSuccess={async () => {
            await fetchProjects();
            await refreshUser();
          }}
        />
      )}
    </div>
  );
};

export default ProjectList;
