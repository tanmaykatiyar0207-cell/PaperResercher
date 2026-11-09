import React from 'react';
import { Layers, Network, Activity } from 'lucide-react';
import { ArchitectureHighlight } from '../data/samplePapers';

interface ArchitectureInspectorProps {
  highlights: ArchitectureHighlight[];
}

export const ArchitectureInspector: React.FC<ArchitectureInspectorProps> = ({ highlights }) => {
  if (!highlights || highlights.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="flex items-center space-x-2.5 px-5 py-3.5 bg-slate-950 border-b border-slate-800">
        <div className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg">
          <Network className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Architecture Component Breakdown
          </h3>
          <span className="text-[11px] text-slate-400">
            Internal computational units, tensor dimensionality, and mathematical pathways
          </span>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {highlights.map((item, idx) => (
          <div
            key={idx}
            className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5 hover:border-cyan-800/60 transition-colors"
          >
            <div className="flex items-center space-x-2 text-cyan-400">
              <Layers className="w-4 h-4 flex-shrink-0" />
              <h4 className="text-xs font-bold text-white tracking-wide truncate">{item.component}</h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">{item.role}</p>

            <div className="pt-2 border-t border-slate-900">
              <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono mb-1">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span>Tensor Shape / Data Flow:</span>
              </div>
              <code className="block p-1.5 bg-slate-900 border border-slate-800/80 rounded text-[11px] font-mono text-cyan-300 break-all">
                {item.tensorShapeOrFlow}
              </code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
