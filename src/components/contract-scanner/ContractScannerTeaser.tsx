import React from 'react';
import { ShieldCheck, Sparkles, ArrowRight, FileSearch, CheckCircle2, Lock, FileText, AlertTriangle } from 'lucide-react';
import { Language } from '../../types';

interface ContractScannerTeaserProps {
  language: Language;
  onOpenContractScanner: () => void;
}

export const ContractScannerTeaser: React.FC<ContractScannerTeaserProps> = ({
  language,
  onOpenContractScanner
}) => {
  const isHi = language === 'hi';
  const isTe = language === 'te';

  return (
    <section id="contract-scanner-teaser" className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/30 p-6 sm:p-10 shadow-[0_20px_50px_rgba(2,6,23,0.8),0_0_30px_rgba(6,182,212,0.08)] overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Column: Copy & Value Proposition */}
          <div className="space-y-4 max-w-2xl text-center lg:text-left">
            {/* Feature Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs font-bold shadow-md">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/40">
                NEW
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="uppercase tracking-wider">
                {isHi ? 'अनुबंध जोखिम स्कैनर' : isTe ? 'కాంట్రాక్ట్ రిస్క్ స్కానర్' : 'KNOW BEFORE YOU SIGN'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            </div>

            {/* Heading */}
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {isHi
                ? 'हस्ताक्षर करने से पहले हर शर्त समझें। संभावित जोखिम तुरंत पहचानें।'
                : isTe
                ? 'సంతకం చేసే ముందు ప్రతి నిబంధనను అర్థం చేసుకోండి. సంభావ్య ప్రమాదాలను గుర్తించండి.'
                : 'Understand every clause. Spot potential risks. Sign with confidence.'}
            </h2>

            <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
              {isHi
                ? 'किराया समझौता, नौकरी का ऑफर, लोन एग्रीमेंट या फ्रीलांस अनुबंध अपलोड करें। न्याय कठिन कानूनी शर्तों को सरल भाषा में समझाता है।'
                : isTe
                ? 'అద్దె ఒప్పందం, ఉద్యోగ ఆఫర్ లేదా సేవా ఒప్పందాన్ని అప్‌లోడ్ చేయండి. న్యాయ జరిమానాలు, నోటీసు వ్యవధి మరియు ముఖ్యమైన ప్రశ్నలను సరళమైన భాషలో వివరిస్తుంది.'
                : 'Upload rental leases, employment offers, loan papers, or freelance contracts. Compare original clauses side-by-side with plain-English explanations, hidden charges, and questions to ask.'}
            </p>

            {/* Supported Document Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs">
              <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-cyan-300 font-semibold">
                🏠 Rental & Lease
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-cyan-300 font-semibold">
                💼 Job Offers & Non-Competes
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-cyan-300 font-semibold">
                💳 Loans & Lending
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium">
                🔒 In-Memory Private Analysis
              </span>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenContractScanner}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all cursor-pointer group active:scale-95"
              >
                <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                <span>
                  {isHi ? 'अनुबंध की जांच करें' : isTe ? 'కాంట్రాక్ట్‌ను స్కాన్ చేయండి' : 'Scan a Contract Now'}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: Visual Mock Preview Card */}
          <div className="w-full lg:w-96 p-5 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="font-mono text-cyan-300 font-bold">Lease_Indiranagar.pdf</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                ⚠️ Attention Deserved
              </span>
            </div>

            {/* Clause comparison snippet */}
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Original Clause 4(b)
                </span>
                <div className="font-mono text-[11px] text-amber-200/90 line-clamp-2">
                  “Deduct one full month rent (₹42,000) towards painting upon vacation irrespective of stay…”
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-cyan-400 block">
                  Plain-English Meaning
                </span>
                <div className="text-[11px] text-slate-200 leading-relaxed">
                  Landlord deducts ₹42,000 automatically, even if walls are clean. Transfer of Property Act 108(m) limits this to actual wear & tear.
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Questions to ask counterparty:</span>
                <span className="font-bold text-cyan-300">4 Prepared</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
