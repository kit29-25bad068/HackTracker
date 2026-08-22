import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Github, Twitter, Linkedin, Shield, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white dark:bg-[#070B12] border-t border-gray-200/80 dark:border-gray-800/80 transition-colors py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-gray-900 to-teal-600 dark:from-white dark:to-teal-400 bg-clip-text text-transparent">
                HACKTRACKER
              </span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Discover Hackathons. Track Achievements. Build Your Legacy.
              The unified ecosystem for collegiate builders, researchers, and recruiters.
            </p>
            <div className="flex items-center gap-3 text-gray-400">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-teal-500 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-teal-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-teal-500 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Col 2: Discovery & Features */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-200">
              Platform
            </div>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link to="/hackathons" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Explore Hackathons
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Dual Leaderboards
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Project Tracking
                </Link>
              </li>
              <li>
                <Link to="/teams" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Team Collaboration
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Integrations & Verification */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-200">
              Verification & Tools
            </div>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Tesseract OCR Verification</span>
              </li>
              <li>
                <span className="text-gray-500 dark:text-gray-400">Dynamic Trust Scoring</span>
              </li>
              <li>
                <Link to="/settings/integrations" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Devpost & GitHub Sync
                </Link>
              </li>
              <li>
                <Link to="/settings/security" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Two-Factor Authentication
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Policy */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-200">
              Transparency & Notice
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              HackTracker is an independent discovery and tracking platform. Official registrations occur directly on hosting platforms (Unstop, Devpost, MLH, Kaggle, HackerEarth).
            </p>
            <div className="pt-2">
              <Link to="/settings/privacy" className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                Data & Privacy Settings &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div>
            &copy; 2026 HackTracker. Built for high-impact collegiate hackers.
          </div>
          <div className="flex items-center gap-2">
            <span>Powered by React, Prisma & Tesseract OCR</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
