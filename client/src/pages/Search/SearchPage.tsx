import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Layers,
  User,
  FolderGit2,
  Code2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import api from '../../services/api';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'hackathons' | 'projects' | 'users' | 'skills'>(
    initialType as any
  );
  const [results, setResults] = useState<any>({
    hackathons: [],
    projects: [],
    users: [],
    skills: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.trim()) {
      handlePerformSearch();
    }
  }, [query, activeTab]);

  const handlePerformSearch = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/search?q=${encodeURIComponent(query)}&type=${activeTab}`);
      setResults(res.data.results || { hackathons: [], projects: [], users: [], skills: [] });
    } catch (e) {
      console.error('Search query failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query, type: activeTab });
    handlePerformSearch();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Search HackTracker
        </h1>

        <form onSubmit={handleFormSubmit} className="relative max-w-2xl">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hackathons, projects, skills, hackers..."
            className="w-full pl-12 pr-28 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 px-5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Search
          </button>
        </form>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs pt-2">
          {(['all', 'hackathons', 'projects', 'users', 'skills'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl font-bold capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Results Container */}
      {isLoading ? (
        <div className="py-24 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          Searching cross-entity databases...
        </div>
      ) : !query.trim() ? (
        <div className="glass-card p-12 rounded-3xl text-center space-y-3">
          <Search className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="font-bold text-base text-gray-900 dark:text-white">Explore HackTracker</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Search across thousands of hackathons, verified projects, skills, and collegiate developers.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Hackathons */}
          {results.hackathons?.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-500" /> Hackathons ({results.hackathons.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.hackathons.map((h: any) => (
                  <Link
                    key={h.id}
                    to={`/hackathons/${h.id}`}
                    className="glass-card-hover p-4 rounded-2xl flex items-center justify-between group"
                  >
                    <div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 mb-1 inline-block">
                        {h.platform}
                      </span>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-teal-500">
                        {h.title}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-1">{h.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {results.projects?.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-indigo-500" /> Projects ({results.projects.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.projects.map((p: any) => (
                  <Link
                    key={p.id}
                    to={`/projects/${p.id}`}
                    className="glass-card-hover p-4 rounded-2xl flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-indigo-500">
                        {p.title}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-1">By {p.user?.name} &bull; {p.status}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Users */}
          {results.users?.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-500" /> Hackers ({results.users.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.users.map((u: any) => (
                  <Link
                    key={u.id}
                    to={`/profile/${u.username}`}
                    className="glass-card-hover p-4 rounded-2xl flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center flex-shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-purple-500">
                        {u.name}
                      </h4>
                      <span className="text-xs text-gray-400 block">{u.department} &bull; Trust: {u.trustScore}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {results.skills?.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-500" /> Skills ({results.skills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {results.skills.map((sk: any) => (
                  <Link
                    key={sk.id}
                    to={`/hackathons?search=${encodeURIComponent(sk.name)}`}
                    className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-950 font-bold text-xs text-gray-800 dark:text-gray-200 hover:text-teal-600 transition-colors"
                  >
                    {sk.name} <span className="text-gray-400 font-normal">({sk.category})</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default SearchPage;
