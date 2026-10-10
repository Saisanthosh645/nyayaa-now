import React from 'react';
import { 
  Compass, 
  Sparkles, 
  Scale, 
  Building2, 
  UserCheck, 
  ShieldAlert, 
  ArrowRight,
  PhoneCall,
  Search
} from 'lucide-react';
import { Language } from '../../types';
import { AshokaChakra } from '../AshokaChakra';

interface ConnectionHeroProps {
  onStartIntake: () => void;
  onSelectDirectPath: (path: 'legal-aid' | 'lawyer' | 'police' | 'emergency') => void;
  language: Language;
}

export const ConnectionHero: React.FC<ConnectionHeroProps> = ({
  onStartIntake,
  onSelectDirectPath,
  language
}) => {
  return (
    <div className="w-full space-y-6">
      {/* Title & Eyebrow */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-teal-500/30 text-teal-300 text-xs font-bold shadow-md">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span>04 / LAWYER & AUTHORITY CONNECTION</span>
          <AshokaChakra size={12} color="#14b8a6" speed="slow" />
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
          Know who to contact next.
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
          Whether you need free legal aid, an advocate, a supervisory police officer, or an emergency service, Nyaya helps you identify the appropriate next step.
        </p>
      </div>

      {/* TWO PRIMARY PATHS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        
        {/* PATH A: HELP ME DECIDE (AI Guided Routing) */}
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-teal-950/40 via-slate-900 to-slate-950 border-2 border-teal-500/40 shadow-xl space-y-4 relative overflow-hidden group hover:border-teal-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black text-teal-400 uppercase tracking-widest px-2.5 py-1 rounded bg-teal-500/10 border border-teal-500/20">
              Path A • Recommended
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shadow-inner">
              <Compass className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Help me decide who to contact
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Answer 3 focused questions about your issue, urgency, and district. Nyaya evaluates whether legal aid, a private lawyer, or an official authority is appropriate.
            </p>
          </div>

          <button
            type="button"
            onClick={onStartIntake}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
          >
            <span>Start Guided Routing</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* PATH B: I KNOW WHAT I NEED (Direct Access) */}
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
              Path B • Direct Access
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              I already know what I need
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Skip questions and jump directly to verified directories for legal aid, police oversight, courts, or advocates.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onSelectDirectPath('legal-aid')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-teal-950/40 text-teal-300 hover:text-white border border-slate-800 hover:border-teal-500/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Find Legal Aid</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectDirectPath('lawyer')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-purple-950/40 text-purple-300 hover:text-white border border-slate-800 hover:border-purple-500/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Find a Lawyer</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectDirectPath('police')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-blue-950/40 text-blue-300 hover:text-white border border-slate-800 hover:border-blue-500/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Police Oversight</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectDirectPath('emergency')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-rose-950/40 text-rose-300 hover:text-white border border-slate-800 hover:border-rose-500/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Emergency 112</span>
            </button>
          </div>
        </div>

      </div>

      {/* Safety & Neutrality Banner */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400 leading-relaxed">
        <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-200">Legal Safety Standard:</strong> Nyaya does not guarantee case outcomes or advertise lawyers. It connects citizens to verified institutional authorities and Bar-enrolled advocates with explainable routing criteria.
        </p>
      </div>
    </div>
  );
};
