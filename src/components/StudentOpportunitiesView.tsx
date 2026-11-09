import React, { useState } from 'react';
import { Briefcase, ArrowUpRight, Cpu, Target, Layers, Copy, Check, Code, Sparkles, BookOpen } from 'lucide-react';
import { StudentOpportunity } from '../data/samplePapers';

interface StudentOpportunitiesViewProps {
  opportunities: StudentOpportunity[];
  paperTitle: string;
  onOpenStarterKit: (opp: StudentOpportunity) => void;
}

export const StudentOpportunitiesView: React.FC<StudentOpportunitiesViewProps> = ({
  opportunities,
  paperTitle,
  onOpenStarterKit,
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopyResumeBullet = async (opp: StudentOpportunity) => {
    await navigator.clipboard.writeText(opp.resumeBullet);
    setCopiedId(opp.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Future Work &amp; Internship Opportunities
            </h3>
            <span className="text-[11px] text-slate-400">
              3 concrete, realistic extension projects for a 3rd-year CS student's resume &amp; GitHub
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-full">
            3 Project Tracks
          </span>
        </div>
      </div>

      {/* 3 Project Cards */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {opportunities.map((opp, idx) => (
          <div
            key={opp.id || idx}
            className="flex flex-col justify-between bg-slate-950/80 border border-slate-800 rounded-xl p-5 hover:border-blue-700/60 transition-all hover:shadow-lg hover:shadow-blue-950/20 group relative overflow-hidden"
          >
            {/* Top Project Tag & Number */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-900/60 text-blue-400 text-xs font-bold border border-blue-700/50">
                  {idx + 1}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {opp.difficulty || 'Intermediate CS'}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                {opp.title}
              </h4>

              {/* Exact Extension */}
              <div className="space-y-3 text-xs mb-4">
                <div className="p-3 bg-slate-900/90 border border-slate-800/80 rounded-lg">
                  <div className="flex items-center space-x-1.5 text-blue-400 font-semibold mb-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Exact Extension:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-sans">{opp.extension}</p>
                </div>

                {/* Targeted Metric */}
                <div className="p-3 bg-slate-900/90 border border-slate-800/80 rounded-lg">
                  <div className="flex items-center space-x-1.5 text-amber-400 font-semibold mb-1">
                    <Target className="w-3.5 h-3.5" />
                    <span>Targeted Metric:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-sans font-medium">
                    {opp.targetedMetric}
                  </p>
                </div>

                {/* Tech Stack */}
                <div className="p-3 bg-slate-900/90 border border-slate-800/80 rounded-lg">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold mb-1">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Recommended Tech Stack:</span>
                  </div>
                  <p className="font-mono text-emerald-300 text-[11px]">{opp.techStack}</p>
                </div>

                {/* Implementation Roadmap */}
                {opp.implementationRoadmap && opp.implementationRoadmap.length > 0 && (
                  <div className="pt-2">
                    <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-slate-400" />
                      <span>Roadmap Steps:</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
                      {opp.implementationRoadmap.map((step, sIdx) => (
                        <li key={sIdx} className="leading-snug">
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2 mt-2">
              {/* Resume Bullet Copy */}
              <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    Resume Bullet Formulation:
                  </span>
                  <button
                    onClick={() => handleCopyResumeBullet(opp)}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[10px]"
                    title="Copy Resume Bullet"
                  >
                    {copiedId === opp.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 italic leading-snug font-serif">
                  "{opp.resumeBullet}"
                </p>
              </div>

              {/* Starter Kit Button */}
              <button
                onClick={() => onOpenStarterKit(opp)}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm group-hover:bg-blue-500"
              >
                <Code className="w-3.5 h-3.5" />
                <span>Launch Project Starter Kit</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
