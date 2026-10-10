import React from 'react';
import { 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  HelpCircle, 
  AlertCircle, 
  Users, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  FileText,
  Scale
} from 'lucide-react';
import { ContractAnalysisReport } from '../../types/contractScanner';

interface ContractOverviewTabProps {
  report: ContractAnalysisReport;
  onNavigateToTab: (tab: 'overview' | 'clauses' | 'obligations' | 'questions') => void;
}

export const ContractOverviewTab: React.FC<ContractOverviewTabProps> = ({
  report,
  onNavigateToTab
}) => {
  const { metrics, executiveSummary, parties, jurisdiction, missingInformation } = report;

  // Status visual mapping
  const statusConfig = {
    'Review complete': {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      dot: 'bg-emerald-400',
      icon: CheckCircle2,
      label: 'Review complete — Standard terms detected'
    },
    'Some clauses deserve attention': {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      dot: 'bg-amber-400',
      icon: AlertTriangle,
      label: 'Some clauses deserve attention before signing'
    },
    'Further review recommended': {
      bg: 'bg-red-500/10 border-red-500/30 text-red-300',
      dot: 'bg-red-400',
      icon: AlertCircle,
      label: 'Further review recommended — High attention clauses identified'
    }
  }[report.overallStatus] || {
    bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
    dot: 'bg-cyan-400',
    icon: ShieldCheck,
    label: report.overallStatus
  };

  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Neutral Overall Status Banner */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-3 ${statusConfig.bg}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950/60 border border-current/20 flex items-center justify-center shrink-0">
            <StatusIcon className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${statusConfig.dot} animate-pulse`} />
              <span className="text-xs uppercase font-mono font-bold tracking-wider">
                Overall Analysis Status
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
              {statusConfig.label}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateToTab('clauses')}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
        >
          View Side-by-Side Clauses →
        </button>
      </div>

      {/* 5 Distinct Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Metric 1 */}
        <button
          type="button"
          onClick={() => onNavigateToTab('clauses')}
          className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-red-500/40 text-left transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              High Attention
            </span>
            <AlertTriangle className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-red-300 font-mono">
            {metrics.highAttentionCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Clauses needing scrutiny</p>
        </button>

        {/* Metric 2 */}
        <button
          type="button"
          onClick={() => onNavigateToTab('clauses')}
          className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 text-left transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Clarifications
            </span>
            <HelpCircle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">
            {metrics.needsClarificationCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Terms requiring clarity</p>
        </button>

        {/* Metric 3 */}
        <button
          type="button"
          onClick={() => onNavigateToTab('obligations')}
          className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 text-left transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Financial Terms
            </span>
            <DollarSign className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono">
            {metrics.financialObligationsCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Payment & cost terms</p>
        </button>

        {/* Metric 4 */}
        <button
          type="button"
          onClick={() => onNavigateToTab('obligations')}
          className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/40 text-left transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Dates & Deadlines
            </span>
            <Calendar className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-blue-300 font-mono">
            {metrics.deadlinesCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Operative schedules</p>
        </button>

        {/* Metric 5 */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-left col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Missing Info
            </span>
            <AlertCircle className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono">
            {metrics.missingItemsCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Gaps or blank fields</p>
        </div>
      </div>

      {/* Executive Summary Card (Demarcating Stated Facts vs Interpretation) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Executive Summary
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
            Facts Stated in Doc vs Interpretation
          </span>
        </div>

        <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="font-bold text-cyan-300 block mb-1">Agreement Nature:</span>
            <p className="text-slate-200">{executiveSummary.agreementType}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="font-bold text-emerald-300 block mb-1">What You Are Agreeing to Do:</span>
              <p className="text-slate-300">{executiveSummary.yourCommitment}</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="font-bold text-blue-300 block mb-1">What Counterparty Is Required to Do:</span>
              <p className="text-slate-300">{executiveSummary.counterpartyCommitment}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="font-bold text-amber-300 block mb-1">Major Financial Terms:</span>
              <p className="text-slate-300">{executiveSummary.majorFinancialTerms}</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="font-bold text-purple-300 block mb-1">Critical Conditions & Restraints:</span>
              <p className="text-slate-300">{executiveSummary.criticalConditions}</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-red-950/20 border border-red-900/40 text-red-200">
            <span className="font-bold text-red-300 block mb-1">Key Uncertainties to Resolve Before Signing:</span>
            <p className="text-red-200/90">{executiveSummary.uncertaintiesToResolve}</p>
          </div>
        </div>
      </div>

      {/* Parties & Jurisdiction Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Parties (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-950/90 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Parties to the Agreement</span>
          </div>

          <div className="space-y-2.5">
            {parties.map((p, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 font-bold shrink-0 text-xs">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-white">{p.name}</h5>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                      {p.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{p.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Jurisdiction & Governing Law (1 Col) */}
        <div className="p-5 rounded-3xl bg-slate-950/90 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Jurisdiction & Law</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Stated Forum</span>
              <span className="font-bold text-white mt-0.5 block">{jurisdiction.stated}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Governing Law</span>
              <span className="font-bold text-white mt-0.5 block">{jurisdiction.governingLaw}</span>
            </div>

            {jurisdiction.note && (
              <p className="text-[11px] text-slate-400 leading-relaxed px-1">
                {jurisdiction.note}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Missing Information Alert Box */}
      {missingInformation.length > 0 && (
        <div className="p-5 rounded-3xl bg-purple-950/20 border border-purple-900/40 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-purple-400" />
            <span>Missing Information / Gaps Detected in Document</span>
          </div>

          <div className="space-y-2">
            {missingInformation.map((m, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-950/80 border border-purple-900/30 text-xs">
                <h5 className="font-bold text-white mb-0.5">{m.item}</h5>
                <p className="text-slate-400 text-[11px] mb-1.5">{m.reason}</p>
                <div className="flex items-start gap-1.5 text-purple-200 text-[11px] font-medium bg-purple-900/20 p-2 rounded-xl">
                  <span className="text-purple-400 font-bold shrink-0">Recommendation:</span>
                  <span>{m.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
