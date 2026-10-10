import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Scale, 
  Building2, 
  UserCheck, 
  Compass, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  PhoneCall,
  Languages,
  RotateCcw,
  MapPin
} from 'lucide-react';
import { Language } from '../../types';
import { 
  HelpDestination, 
  HelpRequest, 
  RoutingResult, 
  LawyerAuthorityService, 
  VERIFIED_DESTINATIONS,
  NyayaBriefingData 
} from '../../services/lawyerAuthorityService';
import { ConnectionHero } from './ConnectionHero';
import { SituationIntake } from './SituationIntake';
import { RecommendationCard } from './RecommendationCard';
import { SecondaryOptionsGrid } from './SecondaryOptionsGrid';
import { LawyerDirectory } from './LawyerDirectory';
import { AuthorityDirectory } from './AuthorityDirectory';
import { NyayaBriefingModal } from './NyayaBriefingModal';
import { EmergencyHelpBanner } from './EmergencyHelpBanner';
import { NearbyLawyerFinder } from './NearbyLawyerFinder';

interface LawyerAuthorityConnectionProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigateBack: () => void;
  onNavigateToAssistantWithPrompt: (prompt: string) => void;
  onNavigateToVoiceAssistant?: () => void;
}

type ViewTab = 'nearby' | 'recommended' | 'authorities' | 'lawyers';

export const LawyerAuthorityConnection: React.FC<LawyerAuthorityConnectionProps> = ({
  language,
  onLanguageChange,
  onNavigateBack,
  onNavigateToAssistantWithPrompt,
  onNavigateToVoiceAssistant
}) => {
  // State: Default directly to Nearby Lawyers Search per user request
  const [activeTab, setActiveTab] = useState<ViewTab>('nearby');
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [selectedBriefingDestination, setSelectedBriefingDestination] = useState<HelpDestination | undefined>();
  const [briefingContext, setBriefingContext] = useState<{ problem: string; city: string } | null>(null);

  // Current routing result (Defaults to Bengaluru Tenancy sample)
  const [routingResult, setRoutingResult] = useState<RoutingResult>(() => {
    return LawyerAuthorityService.routeSituation({
      category: 'rental',
      urgency: 'today',
      location: { state: 'Karnataka', district: 'Bengaluru Urban', city: 'Bengaluru' },
      language
    });
  });

  const [hasCustomIntake, setHasCustomIntake] = useState(false);

  // Handle guided intake submission
  const handleIntakeSubmit = (req: HelpRequest) => {
    setIsIntakeOpen(false);
    const result = LawyerAuthorityService.routeSituation(req);
    setRoutingResult(result);
    setHasCustomIntake(true);
    setActiveTab('recommended');
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Direct Path quick selector
  const handleSelectDirectPath = (path: 'legal-aid' | 'lawyer' | 'police' | 'emergency') => {
    if (path === 'lawyer') {
      setActiveTab('nearby');
    } else if (path === 'emergency') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveTab('authorities');
    }
  };

  // Briefing generation for generic selection
  const handleOpenBriefing = (dest?: HelpDestination) => {
    setSelectedBriefingDestination(dest || routingResult.primaryRecommendation);
    setBriefingContext(null);
    setIsBriefingOpen(true);
  };

  // Briefing generation specifically from Nearby Lawyer Finder
  const handleOpenBriefingFromFinder = (lawyer: HelpDestination, userProblem: string, userCity: string) => {
    setSelectedBriefingDestination(lawyer);
    setBriefingContext({ problem: userProblem, city: userCity });
    setIsBriefingOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 selection:bg-teal-500 selection:text-slate-950">
      
      {/* Top Sticky Header */}
      <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-14 h-auto py-2 flex items-center justify-between gap-2">
          
          <button
            type="button"
            onClick={onNavigateBack}
            className="flex items-center gap-1.5 sm:gap-2 text-slate-400 hover:text-white transition-colors text-xs sm:text-sm font-semibold cursor-pointer group shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back to Nyaya Now</span>
            <span className="sm:hidden">Back</span>
          </button>

          {/* Center Badge */}
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 font-mono text-xs font-black border border-teal-500/40">
              04
            </span>
            <span className="text-xs sm:text-sm font-black tracking-tight text-white uppercase hidden sm:inline">
              Lawyer & Authority Connection
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {(['en', 'hi', 'te'] as Language[]).map((lng) => (
                <button
                  key={lng}
                  type="button"
                  onClick={() => onLanguageChange(lng)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    language === lng
                      ? 'bg-teal-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {lng === 'en' ? 'EN' : lng === 'hi' ? 'हिंदी' : 'తెలుగు'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsIntakeOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Route Help</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Page Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-8">
        
        {/* HERO SECTION */}
        <ConnectionHero
          onStartIntake={() => setIsIntakeOpen(true)}
          onSelectDirectPath={handleSelectDirectPath}
          language={language}
        />

        {/* EMERGENCY BANNER IF ACTIVE */}
        {routingResult.emergencyBanner && (
          <EmergencyHelpBanner />
        )}

        {/* WORKSPACE DIRECTORY TABS */}
        <div className="space-y-6 pt-2">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
              
              {/* PRIMARY TAB: NEARBY LAWYERS (CITY & PROBLEM SEARCH) */}
              <button
                type="button"
                onClick={() => setActiveTab('nearby')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeTab === 'nearby'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Find Nearby Lawyers (City Search)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('recommended')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeTab === 'recommended'
                    ? 'bg-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Smart AI Routing</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('authorities')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeTab === 'authorities'
                    ? 'bg-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Official Authorities & Legal Aid</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('lawyers')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeTab === 'lawyers'
                    ? 'bg-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>All Advocates Directory</span>
              </button>

            </div>

            {hasCustomIntake && (
              <button
                type="button"
                onClick={() => setIsIntakeOpen(true)}
                className="text-xs font-mono text-teal-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Re-run Routing Questions</span>
              </button>
            )}
          </div>

          {/* TAB 0: NEARBY LAWYERS DISCOVERY BY CITY & PROBLEM (PRIMARY FEATURE) */}
          {activeTab === 'nearby' && (
            <NearbyLawyerFinder
              language={language}
              onOpenBriefingForLawyer={handleOpenBriefingFromFinder}
            />
          )}

          {/* TAB 1: RECOMMENDED NEXT DESTINATION */}
          {activeTab === 'recommended' && (
            <div className="space-y-8">
              <RecommendationCard
                routingResult={routingResult}
                onCreateBriefing={() => handleOpenBriefing(routingResult.primaryRecommendation)}
              />

              <SecondaryOptionsGrid
                options={routingResult.secondaryOptions}
                onSelectOption={(dest) => handleOpenBriefing(dest)}
              />
            </div>
          )}

          {/* TAB 2: AUTHORITIES DIRECTORY */}
          {activeTab === 'authorities' && (
            <AuthorityDirectory
              onSelectAuthority={(auth) => handleOpenBriefing(auth)}
              onCreateBriefingForAuthority={(auth) => handleOpenBriefing(auth)}
            />
          )}

          {/* TAB 3: LAWYER DISCOVERY */}
          {activeTab === 'lawyers' && (
            <LawyerDirectory
              onSelectLawyer={(lawyer) => handleOpenBriefing(lawyer)}
              onRequestBriefingForLawyer={(lawyer) => handleOpenBriefing(lawyer)}
            />
          )}

        </div>

        {/* HAND-OFF PROMPT TO FEATURE 01 */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Need help preparing what to say to the officer or lawyer?</span>
            </h4>
            <p className="text-xs text-slate-400">
              Use Nyaya's AI Legal Assistant (Feature 01) to practice polite, legally protected responses under BNSS 2023.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToAssistantWithPrompt('I need help preparing for my upcoming interaction with legal aid / police authority. What exact questions and statutory points should I raise?')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition-colors shrink-0 cursor-pointer"
          >
            Practice with AI Assistant
          </button>
        </div>

      </div>

      {/* MODAL 1: GUIDED SITUATION INTAKE */}
      {isIntakeOpen && (
        <SituationIntake
          onSubmit={handleIntakeSubmit}
          onClose={() => setIsIntakeOpen(false)}
          language={language}
        />
      )}

      {/* MODAL 2: NYAYA CASE BRIEFING */}
      {isBriefingOpen && (
        <NyayaBriefingModal
          briefing={LawyerAuthorityService.generateBriefing({
            situationSummary: briefingContext
              ? `Citizen in ${briefingContext.city} is facing: "${briefingContext.problem}". Seeking advocate consultation and statutory notice guidance.`
              : `Citizen is navigating statutory inquiry in ${routingResult.primaryRecommendation.jurisdiction}. Seeking procedural advice.`,
            urgency: 'today',
            jurisdiction: briefingContext
              ? briefingContext.city
              : routingResult.primaryRecommendation.jurisdiction
          })}
          destination={selectedBriefingDestination}
          onClose={() => setIsBriefingOpen(false)}
        />
      )}

    </div>
  );
};
