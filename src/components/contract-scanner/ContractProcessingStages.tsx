import React from 'react';
import { 
  FileText, 
  Search, 
  AlertTriangle, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

interface ContractProcessingStagesProps {
  stage: number;
  statusText: string;
  percent: number;
  fileName: string;
}

const STAGES = [
  { id: 1, label: 'Reading your document & structure', icon: FileText },
  { id: 2, label: 'Identifying contract clauses & parties', icon: Search },
  { id: 3, label: 'Reviewing obligations & potential concerns', icon: AlertTriangle },
  { id: 4, label: 'Preparing plain-language explanations', icon: BookOpen },
  { id: 5, label: 'Checking statutory sources where applicable', icon: ShieldCheck }
];

export const ContractProcessingStages: React.FC<ContractProcessingStagesProps> = ({
  stage,
  statusText,
  percent,
  fileName
}) => {
  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Processing Legal Analysis</span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Reviewing {fileName}
        </h3>
        <p className="text-xs text-slate-400 font-mono">
          {statusText}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Analysis Progress</span>
          <span className="text-cyan-400 font-bold">{percent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Sequential Checklist Stages */}
      <div className="space-y-2.5 pt-2">
        {STAGES.map((s) => {
          const isDone = stage > s.id;
          const isCurrent = stage === s.id;
          const Icon = s.icon;

          return (
            <div
              key={s.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                isDone
                  ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                  : isCurrent
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200 shadow-sm'
                  : 'bg-slate-950/40 border-slate-900 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isDone
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : isCurrent
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900 text-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className={`text-xs font-semibold ${isCurrent ? 'text-white font-bold' : ''}`}>
                  {s.label}
                </span>
              </div>

              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
              ) : (
                <div className="w-3 h-3 rounded-full border border-slate-800 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
