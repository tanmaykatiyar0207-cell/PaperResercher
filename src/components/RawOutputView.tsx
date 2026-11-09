import React, { useState } from 'react';
import { Terminal, Copy, Check, FileCheck } from 'lucide-react';

interface RawOutputViewProps {
  rawOutput: string;
}

export const RawOutputView: React.FC<RawOutputViewProps> = ({ rawOutput }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(rawOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Agent Operational Output (Verbatim)
            </h3>
            <span className="text-[11px] text-slate-400">
              Raw system agent response containing CORE CONCEPT EXTRACTION, [FLOWCHART] block, and FUTURE WORK
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono bg-slate-800 border border-slate-700 text-slate-300 rounded">
            <FileCheck className="w-3 h-3 text-emerald-400" />
            [FLOWCHART] Segment Verified
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Raw Text'}</span>
          </button>
        </div>
      </div>

      <div className="p-5 bg-slate-950">
        <pre className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[500px]">
          {rawOutput}
        </pre>
      </div>
    </div>
  );
};
