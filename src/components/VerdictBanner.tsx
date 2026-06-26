import React from 'react';
import { ShieldCheck, Scale, Award, Percent } from 'lucide-react';

interface VerdictBannerProps {
  recommendation: string;
  summary: string;
  confidenceScore?: number; // for pros_cons (1-100)
  keyActionableTakeaway?: string; // for SWOT
  directComparisonSummary?: string; // for Comparison table
}

export default function VerdictBanner({
  recommendation,
  summary,
  confidenceScore,
  keyActionableTakeaway,
  directComparisonSummary
}: VerdictBannerProps) {
  // SVG circular gauge calculation if confidenceScore is provided
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = confidenceScore
    ? circumference - (confidenceScore / 100) * circumference
    : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-xl shadow-indigo-200/50 sm:p-8">
      {/* Background Accent Grid / Grain effect using simple SVG */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-white/20 border border-white/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              <ShieldCheck className="h-3.5 w-3.5" />
              Tiebreaker Verdict
            </span>
          </div>

          <h2 className="font-sans text-2xl font-black tracking-tight sm:text-3xl">
            {recommendation}
          </h2>

          <p className="text-sm text-indigo-50 leading-relaxed max-w-2xl">
            {summary}
          </p>

          {keyActionableTakeaway && (
            <div className="mt-4 rounded-xl bg-white/10 border border-white/20 p-4">
              <span className="block text-xs font-bold uppercase tracking-wider text-indigo-200">
                Actionable Strategic Takeaway
              </span>
              <p className="mt-1 text-sm text-white font-medium">
                {keyActionableTakeaway}
              </p>
            </div>
          )}

          {directComparisonSummary && (
            <div className="mt-4 rounded-xl bg-white/10 border border-white/20 p-4">
              <span className="block text-xs font-bold uppercase tracking-wider text-indigo-200">
                Core Trade-off Summary
              </span>
              <p className="mt-1 text-sm text-white font-medium italic">
                &ldquo;{directComparisonSummary}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Gauge (renders if confidenceScore is supplied) */}
        {confidenceScore !== undefined && (
          <div className="flex shrink-0 items-center gap-4 border-t border-white/10 pt-6 md:border-t-0 md:pt-0">
            <div className="relative flex h-20 w-20 items-center justify-center">
              {/* Secondary circular gauge */}
              <svg className="h-full w-full -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  className="stroke-white/20 fill-none"
                  strokeWidth="6"
                />
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  className="stroke-white fill-none transition-all duration-1000 ease-out"
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold leading-none">{confidenceScore}</span>
                <span className="text-[10px] text-indigo-200 font-semibold tracking-wide">CONF</span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">Decision Confidence</span>
              <span className="text-xs text-indigo-200">
                {confidenceScore >= 80
                  ? 'Highly clear choice'
                  : confidenceScore >= 60
                  ? 'Moderate advantage'
                  : 'Extremely close call'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
