import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Layers,
  User,
  FolderGit2,
  Code2,
  ArrowRight,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'hackathons' | 'projects' | 'users' | 'skills'>('all');
  const [results, setResults] = useState<any>({ users: [], projects: [], hackathons: [], skills: [] });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      fetchRecentSearches();
    } else {
      setQuery('');
      setResults({ users: [], projects: [], hackathons: [], skills: [] });
    }
  }, [isOpen]);

  const fetchRecentSearches = async () => {
    try {
      const res = await api.get('/search/recent');
      setRecentSearches(res.data.recentSearches || []);
    } catch (err) {
      // Ignore if not logged in
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], projects: [], hackathons: [], skills: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/search?q=${encodeURIComponent(query)}&type=${activeFilter}`);
        setResults(res.data.results || { users: [], projects: [], hackathons: [], skills: [] });
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, activeFilter]);

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  const totalResults =
    (results.hackathons?.length || 0) +
    (results.projects?.length || 0) +
    (results.users?.length || 0) +
    (results.skills?.length || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-teal-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hackathons, projects, skills, hackers..."
            className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-[#0D131F] border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 overflow-x-auto text-xs">
          {(['all', 'hackathons', 'projects', 'users', 'skills'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-lg font-semibold capitalize transition-colors ${
                activeFilter === filter
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="overflow-y-auto p-4 space-y-6 flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              Searching across platforms...
            </div>
          ) : !query.trim() ? (
            /* Recent Searches & Suggestions */
            <div className="space-y-4">
              {recentSearches.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Recent Searches
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQuery(item)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-950 text-gray-700 dark:text-gray-300 hover:text-teal-600 transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Trending Topics
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { label: 'AI Innovation Challenge', path: '/hackathons' },
                    { label: 'Generative AI & LLMs', path: '/hackathons?theme=AI/ML' },
                    { label: 'Top Individual Leaderboard', path: '/leaderboard' },
                    { label: 'Web3 & Blockchain', path: '/hackathons?theme=Blockchain' },
                  ].map((trending, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelect(trending.path)}
                      className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800 text-left text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between group"
                    >
                      <span>{trending.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-teal-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              No results found for "<span className="font-semibold text-gray-700 dark:text-gray-300">{query}</span>".
              <p className="text-xs mt-1">Try searching by theme, platform (e.g. Devpost, Unstop), or skill name.</p>
            </div>
          ) : (
            /* Result Sections */
            <div className="space-y-5">
              {/* Hackathons */}
              {results.hackathons && results.hackathons.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-teal-500" /> Hackathons ({results.hackathons.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.hackathons.map((h: any) => (
                      <div
                        key={h.id}
                        onClick={() => handleSelect(`/hackathons/${h.id}`)}
                        className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/60 cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                            {h.platform}
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                              {h.title}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                              <span>{h.theme}</span>
                              &bull;
                              <span className="text-emerald-500 font-semibold">{h.prizePool}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {results.projects && results.projects.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1.5">
                    <FolderGit2 className="w-3.5 h-3.5 text-indigo-500" /> Projects ({results.projects.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.projects.map((p: any) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelect(`/projects/${p.id}`)}
                        className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/60 cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {p.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            By {p.user?.name} {p.status === 'Winner' && '🏆 Winner'}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {results.users && results.users.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-500" /> Hackers ({results.users.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.users.map((u: any) => (
                      <div
                        key={u.id}
                        onClick={() => handleSelect(`/profile/${u.username}`)}
                        className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/60 cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                              {u.name} <span className="text-xs text-gray-400 font-normal">@{u.username}</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Rank #{u.currentRank || 1} &bull; {u.department} &bull; Trust: {u.trustScore}%
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {results.skills && results.skills.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-amber-500" /> Skills ({results.skills.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {results.skills.map((s: any) => (
                      <div
                        key={s.id}
                        onClick={() => handleSelect(`/hackathons?search=${encodeURIComponent(s.name)}`)}
                        className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 cursor-pointer text-xs font-semibold text-gray-800 dark:text-gray-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                      >
                        {s.name} <span className="text-gray-400 font-normal">({s.category})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-gray-50 dark:bg-[#0D131F] border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
          <span>Navigate with mouse or keyboard</span>
          <button
            onClick={() => handleSelect(`/search?q=${encodeURIComponent(query)}`)}
            className="font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            See full search page <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
