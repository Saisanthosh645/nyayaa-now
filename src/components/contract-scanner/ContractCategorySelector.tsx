import React from 'react';
import { 
  Home, 
  Briefcase, 
  CreditCard, 
  FileCheck, 
  Code, 
  Lock, 
  ShoppingCart, 
  FileText,
  Sparkles
} from 'lucide-react';
import { ContractCategory } from '../../types/contractScanner';

interface ContractCategorySelectorProps {
  selectedCategory: ContractCategory | null;
  onSelectCategory: (category: ContractCategory) => void;
  detectedCategory?: ContractCategory | null;
  className?: string;
}

export const CATEGORY_DEFINITIONS: Array<{
  id: ContractCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    id: 'rental',
    label: 'Rental / Lease Agreement',
    icon: Home,
    description: 'Residential & commercial tenancies, lock-ins, deposits'
  },
  {
    id: 'employment',
    label: 'Employment Offer / Agreement',
    icon: Briefcase,
    description: 'Notice periods, non-competes, IP assignments, CTC'
  },
  {
    id: 'loan',
    label: 'Loan / Lending Agreement',
    icon: CreditCard,
    description: 'Repayment terms, default penalties, hidden charges'
  },
  {
    id: 'service',
    label: 'Service Agreement',
    icon: FileCheck,
    description: 'Master service agreements, SLAs, liability caps'
  },
  {
    id: 'freelance',
    label: 'Freelance / Consultancy',
    icon: Code,
    description: 'Milestones, Net-30/60 terms, IP transfer on payment'
  },
  {
    id: 'nda',
    label: 'Non-Disclosure (NDA)',
    icon: Lock,
    description: 'Trade secrets, definition of confidential info, term'
  },
  {
    id: 'purchase',
    label: 'Purchase / Sale Agreement',
    icon: ShoppingCart,
    description: 'Goods/property sales, warranties, title transfer'
  },
  {
    id: 'other',
    label: 'Other Contract',
    icon: FileText,
    description: 'General legal agreements, memorandums, terms'
  }
];

export const ContractCategorySelector: React.FC<ContractCategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
  detectedCategory,
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <span>Contract Category</span>
          {detectedCategory && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-medium normal-case">
              <Sparkles className="w-2.5 h-2.5" />
              Auto-detected
            </span>
          )}
        </label>
        <span className="text-[11px] text-slate-500">Select to tune review guidelines</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {CATEGORY_DEFINITIONS.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          const isAuto = detectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`relative p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-1.5 group ${
                isSelected
                  ? 'bg-gradient-to-b from-cyan-950/60 to-slate-900 border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.18)] text-white'
                  : 'bg-slate-950/60 hover:bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900 text-slate-400 group-hover:text-cyan-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {isAuto && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    Match
                  </span>
                )}
              </div>

              <div>
                <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {cat.label}
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                  {cat.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
