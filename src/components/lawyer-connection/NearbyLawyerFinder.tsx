import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Scale, 
  Phone, 
  Mail, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  Languages, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  FileText, 
  UserCheck, 
  Building2, 
  RotateCcw,
  Star,
  ChevronRight,
  Filter
} from 'lucide-react';
import { HelpDestination, LawyerAuthorityService } from '../../services/lawyerAuthorityService';
import { Language } from '../../types';

interface NearbyLawyerFinderProps {
  language: Language;
  onOpenBriefingForLawyer: (lawyer: HelpDestination, userProblem: string, userCity: string) => void;
  initialCity?: string;
  initialProblem?: string;
}

const POPULAR_CITIES = [
  'Bengaluru',
  'Hyderabad',
  'New Delhi',
  'Mumbai',
  'Pune',
  'Chennai',
  'Kolkata'
];

const COMMON_PROBLEMS = [
  { label: 'Rental & Deposit Dispute', query: 'Landlord refusing to return security deposit after moving out' },
  { label: 'Police Notice (BNSS 35)', query: 'Police summons notice under Section 35(3) BNSS' },
  { label: 'Non-Compete & Salary', query: 'Company withholding salary and threatening non-compete clause' },
  { label: 'Cheque Bounce (Sec 138)', query: 'Cheque bounce notice under Section 138 Negotiable Instruments Act' },
  { label: 'Cyber Fraud & Scam', query: 'Online financial fraud and frozen bank account' },
  { label: 'Property & Eviction', query: 'Illegal eviction notice and property tenancy dispute' }
];

export const NearbyLawyerFinder: React.FC<NearbyLawyerFinderProps> = ({
  language,
  onOpenBriefingForLawyer,
  initialCity = 'Bengaluru',
  initialProblem = 'Landlord is refusing to return my security deposit'
}) => {
  const [cityInput, setCityInput] = useState<string>(initialCity);
  const [problemInput, setProblemInput] = useState<string>(initialProblem);
  const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | 'lawyer' | 'legal-aid'>('all');

  // Search Results
  const [searchResults, setSearchResults] = useState<{
    lawyers: HelpDestination[];
    matchedCount: number;
    searchCity: string;
    detectedCategoryLabel: string;
  }>(() => {
    const res = LawyerAuthorityService.searchLawyersByCityAndProblem(initialCity, initialProblem);
    return {
      lawyers: res.lawyers,
      matchedCount: res.matchedCount,
      searchCity: res.searchCity,
      detectedCategoryLabel: res.detectedCategoryLabel
    };
  });

  const handleSearch = (overrideCity?: string, overrideProblem?: string) => {
    const c = overrideCity !== undefined ? overrideCity : cityInput;
    const p = overrideProblem !== undefined ? overrideProblem : problemInput;
    const res = LawyerAuthorityService.searchLawyersByCityAndProblem(c, p);
    setSearchResults({
      lawyers: res.lawyers,
      matchedCount: res.matchedCount,
      searchCity: res.searchCity,
      detectedCategoryLabel: res.detectedCategoryLabel
    });
  };

  const handleCityPillClick = (city: string) => {
    setCityInput(city);
    handleSearch(city, problemInput);
  };

  const handleProblemPillClick = (problemText: string) => {
    setProblemInput(problemText);
    handleSearch(cityInput, problemText);
  };

  // Filter by type
  const displayedLawyers = searchResults.lawyers.filter((item) => {
    if (activeTypeFilter === 'all') return true;
    return item.type === activeTypeFilter;
  });

  return (
    <div className="w-full space-y-6">
      
      {/* ── SEARCH PANEL: ENTER CITY & PROBLEM ── */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-[#0c1322] via-[#090d16] to-[#070b12] border-2 border-teal-500/40 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-[11px] font-mono font-black text-teal-400 uppercase tracking-widest">
                NEARBY LAWYER & LEGAL AID DISCOVERY
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Enter Your City & Legal Problem
            </h2>
            <p className="text-xs text-slate-400">
              Get immediate contact info, verified Bar credentials, and chamber locations for advocates near you.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-slate-400 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
              Verified Bar Council Enrolled
            </span>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          
          {/* City Input (4 Cols) */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>Your City / District</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. Bengaluru, Hyderabad, Delhi..."
                className="w-full pl-9 pr-3.5 py-3 rounded-2xl bg-[#0e1628] border border-slate-700/80 focus:border-teal-400 text-sm text-white placeholder-slate-500 outline-none transition-colors shadow-inner"
              />
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Problem Input (6 Cols) */}
          <div className="md:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              <span>Describe the Problem You Are Facing</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={problemInput}
                onChange={(e) => setProblemInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. Landlord keeping deposit, Police notice under BNSS 35, Salary withheld..."
                className="w-full pl-9 pr-3.5 py-3 rounded-2xl bg-[#0e1628] border border-slate-700/80 focus:border-teal-400 text-sm text-white placeholder-slate-500 outline-none transition-colors shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Search Button (2 Cols) */}
          <div className="md:col-span-2 flex items-end">
            <button
              type="button"
              onClick={() => handleSearch()}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 transition-all cursor-pointer active:scale-98"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>Search</span>
            </button>
          </div>

        </div>

        {/* Quick Suggestion Pills */}
        <div className="space-y-2 pt-1 border-t border-slate-850">
          
          {/* Quick City Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-slate-500 uppercase font-semibold mr-1">
              Popular Cities:
            </span>
            {POPULAR_CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleCityPillClick(city)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  cityInput.toLowerCase() === city.toLowerCase()
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Quick Problem Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] font-mono text-slate-500 uppercase font-semibold mr-1">
              Common Issues:
            </span>
            {COMMON_PROBLEMS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleProblemPillClick(item.query)}
                className="px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* ── SEARCH SUMMARY & TYPE FILTER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-white">
            Nearby Legal Counsel for:
          </span>
          <span className="px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-mono font-bold">
            {searchResults.detectedCategoryLabel}
          </span>
          <span className="text-xs text-slate-400">
            in <strong className="text-slate-200 capitalize">{searchResults.searchCity}</strong> ({displayedLawyers.length} verified options)
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTypeFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTypeFilter === 'all'
                ? 'bg-teal-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Contacts
          </button>
          <button
            type="button"
            onClick={() => setActiveTypeFilter('lawyer')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTypeFilter === 'lawyer'
                ? 'bg-teal-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            <span>Advocates</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTypeFilter('legal-aid')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTypeFilter === 'legal-aid'
                ? 'bg-teal-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>Free Legal Aid</span>
          </button>
        </div>
      </div>

      {/* ── LAWYER CONTACT & INFO CARDS GRID ── */}
      {displayedLawyers.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-2">
          <p className="text-sm font-bold text-white">No advocates matched your current filter.</p>
          <p className="text-xs text-slate-400">
            Try choosing a larger neighboring city (e.g. Bengaluru, Hyderabad, Delhi, Mumbai) or resetting the filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {displayedLawyers.map((dest) => {
            const isLegalAid = dest.type === 'legal-aid';
            const cleanPhone = dest.contact.phone?.replace(/[^0-9+]/g, '') || '';
            const cleanWhatsapp = dest.contact.whatsapp?.replace(/[^0-9]/g, '') || '';

            return (
              <div
                key={dest.id}
                className={`p-5 sm:p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between space-y-5 shadow-xl ${
                  isLegalAid
                    ? 'bg-gradient-to-br from-emerald-950/20 via-[#0a121a] to-[#080d14] border-emerald-500/40 hover:border-emerald-400'
                    : 'bg-gradient-to-br from-[#0c1424] via-[#090e18] to-[#070b14] border-slate-700/70 hover:border-teal-500/60 shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
                }`}
              >
                {/* 1. Header Information */}
                <div className="space-y-3">
                  
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Avatar / Monogram */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-inner ${
                          isLegalAid
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        }`}
                      >
                        {isLegalAid ? (
                          <Building2 className="w-6 h-6" />
                        ) : (
                          dest.name.replace('Adv. ', '').slice(0, 2).toUpperCase()
                        )}
                      </div>

                      {/* Name & Credentials */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                            {dest.name}
                          </h3>
                          {dest.verification.barEnrollmentNumber && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-teal-300 border border-teal-500/30 flex items-center gap-1 font-semibold">
                              <ShieldCheck className="w-3 h-3 text-teal-400" />
                              <span>{dest.verification.barEnrollmentNumber}</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 font-medium mt-0.5">
                          {dest.designation}
                        </p>

                        {/* Experience / Rating */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap font-mono">
                          {dest.experienceYears && (
                            <span className="flex items-center gap-1 text-slate-300">
                              <Clock className="w-3 h-3 text-cyan-400" />
                              <strong>{dest.experienceYears}+ Years</strong> Experience
                            </span>
                          )}
                          {dest.rating && (
                            <span className="flex items-center gap-1 text-amber-300">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <strong>{dest.rating}</strong> ({dest.reviewsCount} reviews)
                            </span>
                          )}
                          <span className="text-emerald-400 font-bold">
                            ✓ Verified Profile
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Badge */}
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                        isLegalAid
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                      }`}
                    >
                      {isLegalAid ? 'GOVERNMENT AID' : 'BAR ENROLLED'}
                    </span>
                  </div>

                  {/* Match Reason Banner */}
                  {dest.matchedReason && (
                    <div className="p-2.5 rounded-xl bg-teal-950/25 border border-teal-500/25 text-xs text-teal-200 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span className="font-medium">{dest.matchedReason}</span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                    {dest.description}
                  </p>

                  {/* Practice Areas Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {dest.practiceAreas?.map((area, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        {area}
                      </span>
                    ))}
                  </div>

                  {/* Location & Chambers */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 space-y-1 text-xs">
                    <div className="flex items-start gap-2 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Chamber / Office:</strong> {dest.location.address}
                      </span>
                    </div>
                    {dest.courtPractice && (
                      <div className="flex items-center gap-2 text-slate-400 text-[11px] pl-5.5">
                        <Scale className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>Practices at: {dest.courtPractice}</span>
                      </div>
                    )}
                  </div>

                  {/* Fee & Languages Row */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 flex-wrap gap-2">
                    {dest.consultationFee && (
                      <div className="text-[11px]">
                        <strong className="text-slate-300">Consultation:</strong>{' '}
                        <span className="text-emerald-300 font-semibold">{dest.consultationFee}</span>
                      </div>
                    )}
                    {dest.languages && (
                      <div className="text-[11px] flex items-center gap-1">
                        <Languages className="w-3 h-3 text-slate-400" />
                        <span>{dest.languages.join(', ')}</span>
                      </div>
                    )}
                  </div>

                </div>

                {/* 2. Direct Contact Info Actions (The Core User Need) */}
                <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
                  
                  {/* Phone & WhatsApp Quick Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    
                    {/* Phone Call */}
                    {dest.contact.phone ? (
                      <a
                        href={`tel:${cleanPhone}`}
                        className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                        title="Call advocate directly"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{dest.contact.phone}</span>
                      </a>
                    ) : dest.contact.helpline ? (
                      <a
                        href={`tel:${dest.contact.helpline}`}
                        className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Helpline: {dest.contact.helpline}</span>
                      </a>
                    ) : null}

                    {/* WhatsApp or Email */}
                    {dest.contact.whatsapp ? (
                      <a
                        href={`https://wa.me/${cleanWhatsapp}?text=Hello%20${encodeURIComponent(dest.name)},%20I%20found%20your%20profile%20on%20Nyaya%20Now%20regarding%20a%20legal%20matter:%20${encodeURIComponent(problemInput)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>WhatsApp Chamber</span>
                      </a>
                    ) : dest.contact.email ? (
                      <a
                        href={`mailto:${dest.contact.email}?subject=Legal%20Consultation%20Inquiry%20via%20Nyaya%20Now&body=Hello%20${encodeURIComponent(dest.name)},%0D%0A%0D%0AI%20am%20seeking%20legal%20counsel%20in%20${encodeURIComponent(dest.location.city)}%20regarding:%0D%0A${encodeURIComponent(problemInput)}`}
                        className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Email Chamber</span>
                      </a>
                    ) : null}

                  </div>

                  {/* Prepare Case Briefing Button */}
                  <button
                    type="button"
                    onClick={() => onOpenBriefingForLawyer(dest, problemInput, cityInput)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98"
                  >
                    <FileText className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Prepare Confidential Case Briefing for this Advocate</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Safety & Non-Solicitation Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 leading-relaxed flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-200">Legal Practice Standard:</strong> In accordance with the Advocates Act, 1961 and Bar Council of India rules, Nyaya Now provides verified directory access and statutory routing for citizens seeking justice. It does not solicit clients or advertise for any advocate.
        </p>
      </div>

    </div>
  );
};
