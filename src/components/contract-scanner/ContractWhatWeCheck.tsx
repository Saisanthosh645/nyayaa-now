import React from 'react';
import { 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  Repeat, 
  Scale, 
  HelpCircle, 
  ShieldAlert, 
  Gavel, 
  CalendarCheck 
} from 'lucide-react';

export const WHAT_WE_CHECK_ITEMS = [
  {
    icon: DollarSign,
    title: 'Hidden or Unclear Charges',
    description: 'Surprise fees, maintenance hikes, non-refundable deposit deductions, and extra levies.',
    badge: 'Financial'
  },
  {
    icon: AlertTriangle,
    title: 'Penalties & Exposure',
    description: 'Unreasonable liquidated damages, high interest rates, and uncapped liability.',
    badge: 'Risk'
  },
  {
    icon: Clock,
    title: 'Termination & Notice',
    description: 'Asymmetric notice periods, early-exit fees, lock-in clauses, and buyout conditions.',
    badge: 'Exit'
  },
  {
    icon: Repeat,
    title: 'Automatic Renewal',
    description: 'Evergreen provisions that quietly renew agreements without your explicit consent.',
    badge: 'Term'
  },
  {
    icon: Scale,
    title: 'Unbalanced Obligations',
    description: 'One-sided performance demands, non-reciprocal covenants, and unilateral changes.',
    badge: 'Fairness'
  },
  {
    icon: HelpCircle,
    title: 'Unclear or Missing Terms',
    description: 'Blank fields, undefined terminology, missing schedules, and conflicting clauses.',
    badge: 'Clarity'
  },
  {
    icon: ShieldAlert,
    title: 'Confidentiality & IP',
    description: 'Overreaching IP claims, side-project ownership, and non-compete covenants.',
    badge: 'Rights'
  },
  {
    icon: Gavel,
    title: 'Disputes & Jurisdiction',
    description: 'Distant court venues, mandatory arbitration seats, and waiver of remedies.',
    badge: 'Legal'
  },
  {
    icon: CalendarCheck,
    title: 'Deadlines & Payment Rules',
    description: 'Operative legal deadlines, cure periods, invoice credit terms, and milestones.',
    badge: 'Timing'
  }
];

export const ContractWhatWeCheck: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="text-center sm:text-left space-y-1">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          What the scanner checks
        </h3>
        <p className="text-xs text-slate-400">
          Every document is analyzed across 9 core dimensions grounded against statutory Indian contract standards.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {WHAT_WE_CHECK_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-cyan-500/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                  {item.badge}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
