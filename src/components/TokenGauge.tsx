import React from 'react';
import { Gauge, CheckCircle2, ShieldAlert } from 'lucide-react';

interface TokenGaugeProps {
  stats?: {
    estimatedPromptTokens: number;
    estimatedCompletionTokens: number;
    totalTokensUsed: number;
    budgetLimit: number;
    status: string;
  };
}

export const TokenGauge: React.FC<TokenGaugeProps> = ({ stats }) => {
  const total = stats?.totalTokensUsed || 2250;
  const limit = stats?.budgetLimit || 25000;
  const percentage = Math.min(Math.round((total / limit) * 100), 100);
  const isSafe = total < limit;

  return (
    <div className="flex items-center space-x-3 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs">
      <div className="flex items-center space-x-1.5 text-slate-300">
        <Gauge className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-medium text-slate-400">Token Efficiency:</span>
      </div>

      <div className="flex items-center space-x-2">
        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentage < 40 ? 'bg-emerald-400' : percentage < 80 ? 'bg-amber-400' : 'bg-rose-500'
            }`}
            style={{ width: `${Math.max(percentage, 5)}%` }}
          />
        </div>
        <span className="font-mono text-[11px] text-slate-200">
          {total.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>

      <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-[10px] font-semibold">
        {isSafe ? (
          <>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>&lt;25k Constraint Met</span>
          </>
        ) : (
          <>
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span>Budget Exceeded</span>
          </>
        )}
      </div>
    </div>
  );
};
