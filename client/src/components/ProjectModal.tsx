import React, { useState, useEffect } from 'react';
import { X, FolderGit2, Plus, Trash2, Globe, Github, Sparkles } from 'lucide-react';
import api from '../services/api';
import { Project, Hackathon, Team } from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: Project) => void;
  projectToEdit?: Project | null;
}

const COMMON_TAGS = ['React', 'TypeScript', 'Node.js', 'Python', 'AI/ML', 'Docker', 'PostgreSQL', 'Next.js', 'FastAPI', 'Solidity', 'Tailwind CSS'];

const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  projectToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [hackathonId, setHackathonId] = useState<string>('');
  const [hackathonCustomName, setHackathonCustomName] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isSolo, setIsSolo] = useState(true);
  const [teamId, setTeamId] = useState<string>('');
  const [status, setStatus] = useState<'Registered' | 'Participated' | 'Submitted' | 'Winner'>('Submitted');

  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchHackathons();
      fetchUserTeams();

      if (projectToEdit) {
        setTitle(projectToEdit.title);
        setTagline(projectToEdit.tagline || '');
        setDescription(projectToEdit.description);
        setHackathonId(projectToEdit.hackathonId || '');
        setHackathonCustomName(projectToEdit.hackathonCustomName || '');
        setProjectUrl(projectToEdit.projectUrl || '');
        setGithubUrl(projectToEdit.githubUrl || '');
        
        let tags: string[] = [];
        if (Array.isArray(projectToEdit.techStack)) {
          tags = projectToEdit.techStack;
        } else if (typeof projectToEdit.techStack === 'string') {
          try {
            tags = JSON.parse(projectToEdit.techStack);
          } catch {
            tags = projectToEdit.techStack.split(',').map((t) => t.trim());
          }
        }
        setTechStack(tags);
        setIsSolo(projectToEdit.isSolo);
        setTeamId(projectToEdit.teamId || '');
        setStatus(projectToEdit.status as any);
      } else {
        setTitle('');
        setTagline('');
        setDescription('');
        setHackathonId('');
        setHackathonCustomName('');
        setProjectUrl('');
        setGithubUrl('');
        setTechStack(['React', 'TypeScript']);
        setIsSolo(true);
        setTeamId('');
        setStatus('Submitted');
      }
      setError(null);
    }
  }, [isOpen, projectToEdit]);

  const fetchHackathons = async () => {
    try {
      const res = await api.get('/hackathons?limit=50');
      setHackathons(res.data.hackathons || []);
    } catch (e) {
      console.error('Failed to load hackathons list');
    }
  };

  const fetchUserTeams = async () => {
    try {
      const res = await api.get('/teams');
      setUserTeams(res.data.teams || []);
    } catch (e) {
      console.error('Failed to load teams list');
    }
  };

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setTechStack((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (customTag.trim() && !techStack.includes(customTag.trim())) {
      setTechStack((prev) => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide project title and description.');
      return;
    }

    if (!githubUrl.trim()) {
      setError('GitHub Repository URL is mandatory.');
      return;
    }

    if (!githubUrl.toLowerCase().includes('github.com')) {
      setError('Please provide a valid GitHub repository URL (e.g. https://github.com/username/repository).');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        title,
        tagline,
        description,
        hackathonId: hackathonId || null,
        hackathonCustomName: !hackathonId ? hackathonCustomName : null,
        projectUrl,
        githubUrl,
        techStack,
        isSolo,
        teamId: !isSolo && teamId ? teamId : null,
        status,
      };

      let res;
      if (projectToEdit) {
        res = await api.put(`/projects/${projectToEdit.id}`, payload);
      } else {
        res = await api.post('/projects', payload);
      }

      setIsSubmitting(false);
      onSuccess(res.data.project);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.response?.data?.error || 'Failed to save project.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                {projectToEdit ? 'Edit Project' : 'Add Hackathon Project'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Track your hackathon submission and prepare certificate verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. NeuroFlow — Autonomous Code Reviewer"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Tagline (One-line pitch)
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Instant architectural review and security auditing in git PRs"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Hackathon Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Select Hackathon
              </label>
              <select
                value={hackathonId}
                onChange={(e) => {
                  setHackathonId(e.target.value);
                  if (e.target.value) setHackathonCustomName('');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="">-- Choose from Catalog or Custom --</option>
                {hackathons.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.title} ({h.platform})
                  </option>
                ))}
              </select>
            </div>

            {!hackathonId && (
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Or Custom Hackathon Name
                </label>
                <input
                  type="text"
                  value={hackathonCustomName}
                  onChange={(e) => setHackathonCustomName(e.target.value)}
                  placeholder="e.g. Stanford TreeHacks 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Project Description *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What problem does this project solve? What technical architecture and APIs did you build?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
            />
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>GitHub Repository URL <span className="text-rose-500 font-black">*</span></span>
                <span className="text-[10px] text-teal-500 font-semibold normal-case">Mandatory</span>
              </label>
              <div className="relative">
                <Github className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="url"
                  required
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Live Demo / Video URL</span>
                <span className="text-[10px] text-gray-400 font-normal normal-case">Optional</span>
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="url"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  placeholder="https://myproject.dev"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tech Stack Chips */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Technologies Used
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    techStack.includes(tag)
                      ? 'bg-teal-500 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Custom Tag Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={handleAddCustomTag}
                placeholder="Add other tech (e.g. Redis, PyTorch)..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-3 py-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
              >
                Add
              </button>
            </div>
          </div>

          {/* Status & Team / Solo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-800">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Project Status
              </label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="Registered">Registered</option>
                <option value="Participated">Participated</option>
                <option value="Submitted">Submitted</option>
                <option value="Winner">🏆 Winner (1st, 2nd, 3rd, Special)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Collaboration Type
              </label>
              <div className="flex items-center gap-4 mt-2 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="isSolo"
                    checked={isSolo}
                    onChange={() => setIsSolo(true)}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span>Solo Hacker</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="isSolo"
                    checked={!isSolo}
                    onChange={() => setIsSolo(false)}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span>Team Project</span>
                </label>
              </div>

              {!isSolo && userTeams.length > 0 && (
                <div className="mt-2">
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-xs text-gray-900 dark:text-white"
                  >
                    <option value="">-- Select Team --</option>
                    {userTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3 bg-gray-50 dark:bg-[#0D131F]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 rounded-xl shadow-md shadow-teal-500/20 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : projectToEdit ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
