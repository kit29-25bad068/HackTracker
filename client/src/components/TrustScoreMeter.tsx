import React from 'react';
import { ShieldCheck, Info, Sparkles, AlertTriangle } from 'lucide-react';

interface TrustScoreMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const TrustScoreMeter: React.FC<TrustScoreMeterProps> = ({
  score = 50.0,
  size = 'md',
  showDetails = true,
}) => {
  const clampedScore = Math.min(100, Math.max(0, score));

  // Determine color and tier based on score
  let strokeColor = '#14b8a6'; // teal
  let tierName = 'Established';
  let badgeBg = 'bg-teal-500/10 text-teal-500 border-teal-500/30';

  if (clampedScore >= 90) {
    strokeColor = '#10b981'; // emerald
    tierName = 'Elite Verified';
    badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  } else if (clampedScore >= 75) {
    strokeColor = '#6366f1'; // indigo
    tierName = 'Trusted Builder';
    badgeBg = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
  } else if (clampedScore >= 50) {
    strokeColor = '#0d9488'; // teal
    tierName = 'Standard Base';
    badgeBg = 'bg-teal-500/10 text-teal-400 border-teal-500/30';
  } else {
    strokeColor = '#f59e0b'; // amber
    tierName = 'Unverified Base';
    badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }

  const radius = size === 'lg' ? 44 : size === 'md' ? 36 : 24;
  const stroke = size === 'lg' ? 8 : size === 'md' ? 6 : 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        <svg
          className="transform -rotate-90"
          width={radius * 2 + stroke * 2}
          height={radius * 2 + stroke * 2}
        >
          {/* Background Track */}
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            className="text-gray-200 dark:text-gray-800"
          />
          {/* Progress Arc */}
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            stroke={strokeColor}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-extrabold text-gray-900 dark:text-white leading-none ${
              size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm'
            }`}
          >
            {clampedScore.toFixed(0)}%
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mt-0.5">
              Trust
            </span>
          )}
        </div>
      </div>

      {showDetails && (
        <div className="mt-2 text-center">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeBg}`}>
            <ShieldCheck className="w-3 h-3" />
            {tierName}
          </span>
        </div>
      )}
    </div>
  );
};

export default TrustScoreMeter;
