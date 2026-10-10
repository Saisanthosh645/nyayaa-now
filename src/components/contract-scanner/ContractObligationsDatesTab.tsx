import React from 'react';
import { 
  CheckSquare, 
  Calendar, 
  DollarSign, 
  Clock, 
  AlertCircle, 
  Users, 
  ShieldCheck 
} from 'lucide-react';
import { ContractObligation, ContractDateDeadline } from '../../types/contractScanner';

interface ContractObligationsDatesTabProps {
  obligations: ContractObligation[];
  importantDates: ContractDateDeadline[];
}

export const ContractObligationsDatesTab: React.FC<ContractObligationsDatesTabProps> = ({
  obligations,
  importantDates
}) => {
  const financialObligations = obligations.filter((o) => o.isFinancial);
  const operationalObligations = obligations.filter((o) => !o.isFinancial);

  return (
    <div className="space-y-8">
      {/* SECTION 1: Operative Legal Deadlines & Milestones */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Operative Deadlines & Critical Dates
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {importantDates.length} Schedules Found
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {importantDates.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all ${
                item.isOperativeDeadline
                  ? 'bg-gradient-to-b from-blue-950/30 to-slate-950 border-blue-500/30 shadow-md'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  {item.label}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    item.isOperativeDeadline
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.isOperativeDeadline ? 'Operative Legal Deadline' : 'Calendar Milestone'}
                </span>
              </div>

              <div className="text-base font-black text-cyan-300 font-mono mb-2">
                {item.dateOrPeriod}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
                {item.implications}
              </p>

              <div className="text-[10px] text-slate-500 font-mono bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                Supporting Clause: <em>{item.supportingClause}</em>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Financial Commitments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Financial Commitments & Payment Obligations
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-300">
            {financialObligations.length} Financial Terms
          </span>
        </div>

        <div className="space-y-3">
          {financialObligations.map((obl) => (
            <div
              key={obl.id}
              className="p-4 rounded-2xl bg-slate-950 border border-emerald-950/60 hover:border-emerald-500/40 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {obl.party}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {obl.status === 'explicit' ? 'Explicit in Text' : 'Inferred'}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {obl.obligation}
              </p>

              {obl.conditions && (
                <div className="text-[11px] text-amber-300/90 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                  <strong>Condition:</strong> {obl.conditions}
                </div>
              )}

              <div className="text-[10px] text-slate-500 font-mono">
                Source: {obl.supportingClause}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Performance & Operational Obligations */}
      {operationalObligations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Operational & Performance Responsibilities
              </h3>
            </div>
            <span className="text-[11px] font-mono text-purple-300">
              {operationalObligations.length} Responsibilities
            </span>
          </div>

          <div className="space-y-3">
            {operationalObligations.map((obl) => (
              <div
                key={obl.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    {obl.party}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {obl.status === 'explicit' ? 'Explicit' : 'Inferred'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {obl.obligation}
                </p>

                {obl.conditions && (
                  <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <strong>Conditions:</strong> {obl.conditions}
                  </div>
                )}

                <div className="text-[10px] text-slate-500 font-mono">
                  Source: {obl.supportingClause}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
