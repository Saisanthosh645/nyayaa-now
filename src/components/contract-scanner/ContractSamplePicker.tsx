import React from 'react';
import { Sparkles, ArrowRight, Home, Briefcase, Code, ShieldCheck } from 'lucide-react';
import { ContractAnalysisReport } from '../../types/contractScanner';
import { SAMPLE_CONTRACTS } from '../../data/sampleContracts';

interface ContractSamplePickerProps {
  onSelectSample: (sample: ContractAnalysisReport) => void;
  isLoading?: boolean;
}

export const ContractSamplePicker: React.FC<ContractSamplePickerProps> = ({
  onSelectSample,
  isLoading = false
}) => {
  return (
    <div className="space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Try a sample contract
          </h3>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
            Synthetic Fictional Demos
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          Instant 1-click test with real Indian statutory risk patterns
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SAMPLE_CONTRACTS.map((sample) => {
          const isRental = sample.detectedCategory === 'rental';
          const isEmp = sample.detectedCategory === 'employment';
          const Icon = isRental ? Home : isEmp ? Briefcase : Code;

          return (
            <div
              key={sample.id}
              className="p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950/80 to-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all duration-200 flex flex-col justify-between gap-3 group relative overflow-hidden"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
                    {sample.fileSize}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {sample.fileName.replace(/_/g, ' ')}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {sample.executiveSummary.agreementType}
                  </p>
                </div>

                <div className="pt-1 flex flex-wrap gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-300 font-semibold">
                    {sample.metrics.highAttentionCount} High Attention
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold">
                    {sample.metrics.needsClarificationCount} Clarifications
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => onSelectSample(sample)}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>Load Sample Review</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <span>
          <strong>Synthetic Demo Disclaimer:</strong> These sample contracts are purely fictional models crafted for testing. They do not represent real persons, entities, or active legal disputes.
        </span>
      </div>
    </div>
  );
};
