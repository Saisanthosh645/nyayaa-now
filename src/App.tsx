import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertCircle, 
  Sparkles, 
  BookOpen, 
  Compass, 
  Scale, 
  Lock, 
  Zap, 
  Eye, 
  CheckCircle2, 
  HelpCircle,
  PhoneCall,
  ArrowRight,
  ShieldCheck,
  Search
} from 'lucide-react';
import { Language, ActiveView, Situation } from './types';
import { situations } from './data/situations';
import { translations } from './data/translations';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { AILegalAssistant } from './components/AILegalAssistant';
import { SituationCard } from './components/SituationCard';
import { SearchBar } from './components/SearchBar';
import { SituationDetail } from './components/SituationDetail';
import { ComplaintGuidePage } from './components/ComplaintGuidePage';
import { SourcesPage } from './components/SourcesPage';
import { InteractiveAssessment } from './components/InteractiveAssessment';
import { EmergencyModal } from './components/EmergencyModal';
import { SosModal } from './components/SosModal';
import { AppDownloadModal } from './components/AppDownloadModal';
import { ConstitutionalTicker } from './components/ConstitutionalTicker';
import { Toast } from './components/Toast';
import { EmergencyFloatingButton } from './components/EmergencyFloatingButton';
import { NotFoundPage } from './components/NotFoundPage';
import { AILegalAssistantTeaser } from './components/ai-assistant/AILegalAssistantTeaser';
import { VoiceLanguageAssistant } from './components/voice-assistant/VoiceLanguageAssistant';
import { VoiceAssistantTeaser } from './components/voice-assistant/VoiceAssistantTeaser';
import { DocumentIntelligence } from './components/document-intelligence/DocumentIntelligence';
import { DocumentIntelligenceTeaser } from './components/document-intelligence/DocumentIntelligenceTeaser';
import { EvidenceIntelligence } from './components/evidence-intelligence/EvidenceIntelligence';
import { EvidenceIntelligenceTeaser } from './components/evidence-intelligence/EvidenceIntelligenceTeaser';
import { LawyerAuthorityConnection } from './components/lawyer-connection/LawyerAuthorityConnection';
import { LawyerAuthorityTeaser } from './components/lawyer-connection/LawyerAuthorityTeaser';
import { ContractScanner } from './components/contract-scanner/ContractScanner';
import { ContractScannerTeaser } from './components/contract-scanner/ContractScannerTeaser';

export default function App() {
  const [currentView, setCurrentView] = useState<ActiveView>({ type: 'home' });
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('nyayanow_lang') as Language;
    return saved && ['en', 'hi', 'te'].includes(saved) ? saved : 'en';
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [emergencyModalOpen, setEmergencyModalOpen] = useState<boolean>(false);
  const [sosModalOpen, setSosModalOpen] = useState<boolean>(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = translations[language];

  // Synchronize URL hash & pathname for routing & direct links
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const path = window.location.pathname.replace(/^\//, '');

      if (path === 'contract-scanner' || hash === 'contract-scanner' || hash === 'contracts' || hash.startsWith('contract')) {
        setCurrentView({ type: 'contract-scanner' });
      } else if (!hash || hash === '') {
        setCurrentView({ type: 'home' });
      } else if (hash.startsWith('situations/')) {
        const slug = hash.replace('situations/', '');
        const exists = situations.some(s => s.slug === slug);
        if (exists) {
          setCurrentView({ type: 'situation', slug });
        } else {
          setCurrentView({ type: 'home' });
        }
      } else if (hash === 'ai-assistant' || hash.startsWith('ai-assistant') || hash === 'voice-assistant' || hash.startsWith('voice-assistant')) {
        setCurrentView({ type: 'ai-assistant' });
      } else if (hash === 'document-intelligence' || hash === 'documents' || hash.startsWith('document')) {
        setCurrentView({ type: 'document-intelligence' });
      } else if (hash === 'contract-scanner' || hash === 'contracts' || hash.startsWith('contract')) {
        setCurrentView({ type: 'contract-scanner' });
      } else if (hash === 'evidence-intelligence' || hash === 'evidence' || hash.startsWith('evidence')) {
        setCurrentView({ type: 'evidence-intelligence' });
      } else if (hash === 'lawyer-connection' || hash === 'connect' || hash.startsWith('lawyer') || hash.startsWith('authorit')) {
        setCurrentView({ type: 'lawyer-connection' });
      } else if (hash === 'complaints') {
        setCurrentView({ type: 'complaints' });
      } else if (hash === 'sources') {
        setCurrentView({ type: 'sources' });
      } else if (hash === 'assessment') {
        setCurrentView({ type: 'assessment' });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial load check

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: ActiveView) => {
    setCurrentView(view);
    if (view.type === 'home') {
      window.location.hash = '';
    } else if (view.type === 'ai-assistant' || view.type === 'voice-assistant') {
      window.location.hash = 'ai-assistant';
    } else if (view.type === 'document-intelligence') {
      window.location.hash = 'document-intelligence';
    } else if (view.type === 'contract-scanner') {
      window.location.hash = 'contract-scanner';
    } else if (view.type === 'evidence-intelligence') {
      window.location.hash = 'evidence-intelligence';
    } else if (view.type === 'lawyer-connection') {
      window.location.hash = 'lawyer-connection';
    } else if (view.type === 'situation') {
      window.location.hash = `situations/${view.slug}`;
    } else if (view.type === 'complaints') {
      window.location.hash = 'complaints';
    } else if (view.type === 'sources') {
      window.location.hash = 'sources';
    } else if (view.type === 'assessment') {
      window.location.hash = 'assessment';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('nyayanow_lang', lang);
    showToast(`Language set to ${lang === 'hi' ? 'हिंदी' : lang === 'te' ? 'తెలుగు' : 'English'}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Filter situations based on search
  const filteredSituations = situations.filter((sit) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    const matchesTitle = sit.title.toLowerCase().includes(query);
    const matchesDesc = sit.shortDescription.toLowerCase().includes(query);
    const matchesKeywords = sit.keywords.some(k => k.toLowerCase().includes(query));
    const matchesRights = sit.rights.some(r => r.title.toLowerCase().includes(query) || r.description.toLowerCase().includes(query));
    const matchesSteps = sit.quick30SecSummary.some(s => s.toLowerCase().includes(query));

    return matchesTitle || matchesDesc || matchesKeywords || matchesRights || matchesSteps;
  });

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-[#F8FAFC] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Navigation Header */}
      <Header
        currentView={currentView}
        onNavigate={navigateTo}
        language={language}
        onLanguageChange={handleLanguageChange}
        onOpenEmergency={() => setEmergencyModalOpen(true)}
        onOpenSos={() => setSosModalOpen(true)}
        onOpenDownloadModal={() => setDownloadModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        
        {/* VIEW 1: HOME PAGE */}
        {currentView.type === 'home' && (
          <div className="w-full max-w-full overflow-x-hidden">
            {/* Original Hero Section (Main Landing at the Top) */}
            <Hero
              language={language}
              onOpenEmergency={() => setEmergencyModalOpen(true)}
              onExploreRights={() => {
                const el = document.getElementById('situation-selector');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenDownloadModal={() => setDownloadModalOpen(true)}
              onNavigate={navigateTo}
              onOpenSos={() => setSosModalOpen(true)}
            />

            {/* Live Constitutional Safeguards Marquee Ticker */}
            <ConstitutionalTicker language={language} />

            {/* SITUATION SELECTOR SECTION */}
            <section id="situation-selector" className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-10 sm:py-16">
              
              {/* Section Heading */}
              <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                  {t.whatsHappening}
                </h2>
                <p className="text-xs sm:text-base text-slate-600 font-normal">
                  {t.chooseSituation}
                </p>
              </div>

              {/* Instant Search Bar */}
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                language={language}
                onQuickQuerySelect={(q) => setSearchTerm(q)}
              />

              {/* 8 Primary Situation Cards Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
                {filteredSituations.map((situation) => (
                  <SituationCard
                    key={situation.id}
                    situation={situation}
                    onSelect={(slug) => navigateTo({ type: 'situation', slug })}
                    language={language}
                  />
                ))}
              </div>

              {/* Empty Search Result */}
              {filteredSituations.length === 0 && (
                <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-lg mx-auto">
                  <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    No matching situations found
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Try searching terms like "arrest", "phone search", "FIR refusal", or "bribe".
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                  >
                    View All 8 Situations
                  </button>
                </div>
              )}
            </section>

            {/* FEATURE 01: AI & VOICE LEGAL ASSISTANT TEASER (Opens Full Page) */}
            <section id="ai-legal-assistant" className="w-full">
              <AILegalAssistantTeaser
                language={language}
                onOpenAssistant={(prompt?: string) => {
                  navigateTo({ type: 'ai-assistant' });
                  if (prompt) {
                    sessionStorage.setItem('nyaya_pending_prompt', prompt);
                  }
                }}
              />
            </section>

            {/* FEATURE 02: DOCUMENT INTELLIGENCE TEASER (Opens Full Page) */}
            <section id="document-intelligence" className="w-full">
              <DocumentIntelligenceTeaser
                language={language}
                onOpenDocumentIntelligence={() => navigateTo({ type: 'document-intelligence' })}
              />
            </section>

            {/* FEATURE: KNOW BEFORE YOU SIGN — AI CONTRACT RISK SCANNER TEASER */}
            <section id="contract-scanner" className="w-full">
              <ContractScannerTeaser
                language={language}
                onOpenContractScanner={() => navigateTo({ type: 'contract-scanner' })}
              />
            </section>

            {/* FEATURE 04: EVIDENCE INTELLIGENCE TEASER (Opens Full Page) */}
            <section id="evidence-intelligence" className="w-full">
              <EvidenceIntelligenceTeaser
                language={language}
                onOpenEvidenceIntelligence={() => navigateTo({ type: 'evidence-intelligence' })}
              />
            </section>

            {/* FEATURE 05: LAWYER / AUTHORITY CONNECTION TEASER (Opens Full Page) */}
            <section id="lawyer-connection" className="w-full">
              <LawyerAuthorityTeaser
                language={language}
                onOpenLawyerConnection={() => navigateTo({ type: 'lawyer-connection' })}
              />
            </section>

            {/* THREE THINGS TO REMEMBER SECTION */}
            <section className="bg-white border-y border-slate-200 py-10 sm:py-16 w-full max-w-full overflow-x-hidden">
              <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8">
                
                <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
                  <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                    {t.threeRulesTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Practical, non-confrontational rules to protect yourself during any police interaction.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  
                  {/* Card 01 */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 relative overflow-hidden group hover:border-slate-300 transition-all">
                    <div className="text-3xl sm:text-4xl font-black text-slate-200 mb-2 sm:mb-3 font-mono">
                      01
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 sm:mb-2">
                      {t.rule1Title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {t.rule1Desc}
                    </p>
                  </div>

                  {/* Card 02 */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 relative overflow-hidden group hover:border-slate-300 transition-all">
                    <div className="text-3xl sm:text-4xl font-black text-slate-200 mb-2 sm:mb-3 font-mono">
                      02
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 sm:mb-2">
                      {t.rule2Title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {t.rule2Desc}
                    </p>
                  </div>

                  {/* Card 03 */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 relative overflow-hidden group hover:border-slate-300 transition-all">
                    <div className="text-3xl sm:text-4xl font-black text-slate-200 mb-2 sm:mb-3 font-mono">
                      03
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 sm:mb-2">
                      {t.rule3Title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {t.rule3Desc}
                    </p>
                  </div>

                </div>
              </div>
            </section>

            {/* DIAGNOSTIC TOOL CALLOUT BANNER */}
            <section className="w-full max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-8 sm:py-14">
              <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-10 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Interactive 30-Second Diagnostic</span>
                  </span>
                  <h3 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
                    Unsure if you are officially under arrest?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                    Answer 3 quick yes/no questions to immediately identify whether you are facing casual inquiry, street questioning, or formal custody.
                  </p>
                </div>

                <button
                  id="home-diagnostic-cta-btn"
                  onClick={() => navigateTo({ type: 'assessment' })}
                  className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold text-sm flex items-center justify-center space-x-2 shrink-0 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <span>Start 30-Sec Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </section>

            {/* TRUST AND TRANSPARENCY SECTION */}
            <section className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pb-12 sm:pb-16 pt-2 sm:pt-4">
              <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
                <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                  {t.trustTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Built as a serious public legal information product for Indian citizens.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                
                {/* Trust Item 1 */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5 sm:space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                    <BookOpen className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {t.trust1Title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {t.trust1Desc}
                  </p>
                </div>

                {/* Trust Item 2 */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5 sm:space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                    <Zap className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {t.trust2Title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {t.trust2Desc}
                  </p>
                </div>

                {/* Trust Item 3 */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5 sm:space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
                    <Lock className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {t.trust3Title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {t.trust3Desc}
                  </p>
                </div>

              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: INDIVIDUAL SITUATION PAGE */}
        {currentView.type === 'situation' && (() => {
          const currentSituation = situations.find(s => s.slug === currentView.slug);
          if (!currentSituation) {
            return (
              <NotFoundPage
                onNavigate={navigateTo}
                onOpenEmergency={() => setEmergencyModalOpen(true)}
              />
            );
          }
          return (
            <SituationDetail
              situation={currentSituation}
              language={language}
              onNavigate={navigateTo}
              onShowToast={showToast}
              onOpenEmergency={() => setEmergencyModalOpen(true)}
            />
          );
        })()}

        {/* VIEW 3: COMPLAINT GUIDE PAGE */}
        {currentView.type === 'complaints' && (
          <ComplaintGuidePage
            language={language}
            onNavigate={navigateTo}
            onOpenSos={() => setSosModalOpen(true)}
          />
        )}

        {/* VIEW 4: SOURCES LIBRARY PAGE */}
        {currentView.type === 'sources' && (
          <SourcesPage
            language={language}
            onNavigate={navigateTo}
            onShowToast={showToast}
          />
        )}

        {/* VIEW 5: DIAGNOSTIC TOOL PAGE */}
        {currentView.type === 'assessment' && (
          <InteractiveAssessment
            language={language}
            onNavigate={navigateTo}
            onOpenEmergency={() => setEmergencyModalOpen(true)}
          />
        )}

        {/* VIEW: AI & VOICE LEGAL ASSISTANT FULL PAGE */}
        {(currentView.type === 'ai-assistant' || currentView.type === 'voice-assistant') && (
          <AILegalAssistant
            language={language}
            onLanguageChange={handleLanguageChange}
            onNavigateBack={() => navigateTo({ type: 'home' })}
            onNavigateToLawyerConnection={() => navigateTo({ type: 'lawyer-connection' })}
          />
        )}

        {/* VIEW 8: DOCUMENT INTELLIGENCE FULL PAGE */}
        {currentView.type === 'document-intelligence' && (
          <DocumentIntelligence
            language={language}
            onLanguageChange={handleLanguageChange}
            onNavigateBack={() => navigateTo({ type: 'home' })}
            onNavigateToAssistantWithPrompt={(prompt) => {
              sessionStorage.setItem('nyaya_pending_prompt', prompt);
              navigateTo({ type: 'ai-assistant' });
            }}
          />
        )}

        {/* VIEW: KNOW BEFORE YOU SIGN — AI CONTRACT RISK SCANNER FULL PAGE */}
        {currentView.type === 'contract-scanner' && (
          <ContractScanner
            language={language}
            onLanguageChange={handleLanguageChange}
            onNavigateBack={() => navigateTo({ type: 'home' })}
            onNavigateToAssistantWithPrompt={(prompt) => {
              sessionStorage.setItem('nyaya_pending_prompt', prompt);
              navigateTo({ type: 'ai-assistant' });
            }}
          />
        )}

        {/* VIEW 9: EVIDENCE INTELLIGENCE FULL PAGE */}
        {currentView.type === 'evidence-intelligence' && (
          <EvidenceIntelligence
            language={language}
            onLanguageChange={handleLanguageChange}
            onNavigateBack={() => navigateTo({ type: 'home' })}
            onNavigateToAssistantWithPrompt={(prompt) => {
              sessionStorage.setItem('nyaya_pending_prompt', prompt);
              navigateTo({ type: 'ai-assistant' });
            }}
            onNavigateToVoiceAssistant={() => navigateTo({ type: 'voice-assistant' })}
            onNavigateToDocumentIntelligence={() => navigateTo({ type: 'document-intelligence' })}
            onNavigateToLawyerConnection={() => navigateTo({ type: 'lawyer-connection' })}
          />
        )}

        {/* VIEW 10: LAWYER & AUTHORITY CONNECTION FULL PAGE */}
        {currentView.type === 'lawyer-connection' && (
          <LawyerAuthorityConnection
            language={language}
            onLanguageChange={handleLanguageChange}
            onNavigateBack={() => navigateTo({ type: 'home' })}
            onNavigateToAssistantWithPrompt={(prompt) => {
              sessionStorage.setItem('nyaya_pending_prompt', prompt);
              navigateTo({ type: 'ai-assistant' });
            }}
            onNavigateToEvidenceWorkspace={() => navigateTo({ type: 'evidence-intelligence' })}
            onNavigateToDocumentIntelligence={() => navigateTo({ type: 'document-intelligence' })}
          />
        )}

      </main>

      {/* Persistent Footer */}
      <Footer
        onNavigate={navigateTo}
        language={language}
        onOpenSos={() => setSosModalOpen(true)}
        onShowToast={showToast}
        onOpenDownloadModal={() => setDownloadModalOpen(true)}
      />

      {/* Floating Emergency Mobile Button */}
      <EmergencyFloatingButton
        onOpenEmergency={() => setEmergencyModalOpen(true)}
        language={language}
      />

      {/* Fullscreen Emergency Mode Modal */}
      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
        language={language}
        onSelectSituationDetail={(slug) => {
          setEmergencyModalOpen(false);
          navigateTo({ type: 'situation', slug });
        }}
        onShowToast={showToast}
        onOpenSos={() => {
          setEmergencyModalOpen(false);
          setSosModalOpen(true);
        }}
      />

      {/* Emergency SOS Numbers Directory Modal */}
      <SosModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        language={language}
      />

      {/* App Download / Offline Access Modal */}
      <AppDownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        language={language}
        onShowToast={showToast}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} />

    </div>
  );
}
