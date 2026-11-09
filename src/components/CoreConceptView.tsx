import React, { useState } from 'react';
import { BookOpen, Target, Cpu, Lightbulb, Copy, Check, FileText } from 'lucide-react';

interface CoreConceptProps {
  coreConcept: {
    problemStatement: string;
    primaryMethodology: string;
    breakthroughs: string;
    conciseSummary: string;
  };
  paperTitle: string;
}

export const CoreConceptView: React.FC<CoreConceptProps> = ({ coreConcept, paperTitle }) => {
  const [copied, setCopied] = useState(false);

  // Compute word count of conciseSummary
  const words = (coreConcept.conciseSummary || '').trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const isUnder300 = wordCount <= 300;

  const handleCopy = async () => {
    const text = `Title: ${paperTitle}
    
Problem Statement:
${coreConcept.problemStatement}

Primary Methodology:
${coreConcept.primaryMethodology}

Key Breakthroughs:
${coreConcept.breakthroughs}

Unified Core Concept (<300 words):
${coreConcept.conciseSummary}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Core Concept Extraction
            </h3>
            <span className="text-[11px] text-slate-400">
              Plain-language breakdown of problems, methods, and algorithmic breakthroughs
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300">Word Count:</span>
            <span className={`font-mono font-bold ${isUnder300 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {wordCount} / 300 words
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Synthesis'}</span>
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Under 300 words Unified Synthesis Banner */}
        <div className="p-4 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-900/50 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-blue-600/30 text-blue-300 text-[10px] font-mono font-semibold uppercase tracking-widest rounded-bl-lg border-l border-b border-blue-500/30">
            &lt; 300 Words Accessible Synthesis
          </div>
          <div className="flex items-start space-x-3 pt-1">
            <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg mt-0.5">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-blue-200 uppercase tracking-wide mb-1.5">
                Executive Plain-Language Overview
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                {coreConcept.conciseSummary}
              </p>
            </div>
          </div>
        </div>

        {/* 3 Pillar Grids */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Problem Statement */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center space-x-2 text-rose-400 mb-2">
                <Target className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Problem Statement</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {coreConcept.problemStatement}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-900 text-[10px] text-slate-500 uppercase font-mono">
              Core Limitation Being Tackled
            </div>
          </div>

          {/* 2. Primary Methodology */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center space-x-2 text-blue-400 mb-2">
                <Cpu className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Primary Methodology</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {coreConcept.primaryMethodology}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-900 text-[10px] text-slate-500 uppercase font-mono">
              Novel Architectural Mechanism
            </div>
          </div>

          {/* 3. Mathematical & Algorithmic Breakthroughs */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                <Lightbulb className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Key Breakthroughs</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {coreConcept.breakthroughs}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-900 text-[10px] text-slate-500 uppercase font-mono">
              Formulations & Algorithmic Bounds
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
