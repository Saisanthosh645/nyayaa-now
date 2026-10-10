import React from 'react';
import { Compass, ArrowRight, ShieldCheck, Scale, Building2, UserCheck, PhoneCall } from 'lucide-react';
import { Language } from '../../types';

interface LawyerAuthorityTeaserProps {
  language: Language;
  onOpenLawyerConnection: () => void;
}

export const LawyerAuthorityTeaser: React.FC<LawyerAuthorityTeaserProps> = ({
  language,
  onOpenLawyerConnection
}) => {
  const isHi = language === 'hi';
  const isTe = language === 'te';

  return (
    <section id="lawyer-connection-teaser" className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-teal-500/30 p-6 sm:p-10 shadow-[0_20px_50px_rgba(2,6,23,0.8),0_0_30px_rgba(20,184,166,0.08)] overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Column: Copy & Value Proposition */}
          <div className="space-y-4 max-w-2xl text-center lg:text-left">
            {/* Feature 04 Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-teal-500/40 text-teal-300 text-xs font-bold shadow-md">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 font-mono text-xs font-bold border border-teal-500/40">
                04
              </span>
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span className="uppercase tracking-wider">
                {isHi ? 'वकील और प्राधिकरण संपर्क' : isTe ? 'న్యాయవాది / అధికారిక సంప్రదింపులు' : 'LAWYER & AUTHORITY CONNECTION'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            </div>

            {/* Heading */}
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {isHi
                ? 'जानिए आगे किससे संपर्क करना है — कानूनी सहायता, अधिकारी या वकील।'
                : isTe
                ? 'తదుపరి ఎవరిని సంప్రదించాలో తెలుసుకోండి — అధికార యంత్రాంగం, ఉచిత న్యాయ సహాయం లేదా న్యాయవాది.'
                : 'Know where to go next — authority, legal-aid service or lawyer.'}
            </h2>

            <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
              {isHi
                ? 'न्याय आपकी स्थिति, तात्कालिकता और जिले का मूल्यांकन करता है ताकि आपको निःशुल्क कानूनी सहायता (DLSA), पुलिस पर्यवेक्षक अधिकारी या सत्यापित बार काउंसिल अधिवक्ता तक सही मार्गदर्शन मिले।'
                : isTe
                ? 'మీ పరిస్థితి, అత్యవసరత మరియు జిల్లాను బట్టి ఉచిత లీగల్ ఎయిడ్ (DLSA), పోలీసు పర్యవేక్షణ లేదా ధృవీకరించబడిన న్యాయవాదులలో సరైన మార్గాన్ని న్యాయ సూచిస్తుంది.'
                : "Nyaya helps you determine whether your matter is best served by a free Legal Services Authority (DLSA), senior police oversight under BNSS § 173(3), or an enrolled advocate."}
            </p>

            {/* Supported Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs">
              <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-teal-300 font-semibold flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span>Free Legal Aid (DLSA / NALSA 15100)</span>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-blue-300 font-semibold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Police Supervisory Oversight (SP/CP)</span>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-purple-300 font-semibold flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Verified Advocates</span>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-rose-300 font-semibold flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Emergency 112 Dispatch</span>
              </span>
            </div>
          </div>

          {/* Right Column: CTA */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col items-center">
            <button
              type="button"
              onClick={onOpenLawyerConnection}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-teal-500/20 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer group"
            >
              <span>{isHi ? 'सही मदद खोजें' : isTe ? 'సరైన సహాయాన్ని కనుగొనండి' : 'Find Who Can Help Next'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <span className="text-[11px] text-slate-400 font-mono mt-2">
              SITUATION → URGENCY → JURISDICTION → CLEAR DESTINATION
            </span>
          </div>

        </div>
      </div>
    </section>
  );
};
