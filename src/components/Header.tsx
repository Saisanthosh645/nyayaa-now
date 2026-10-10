import React, { useState, useRef, useEffect } from 'react';
import { Shield, AlertCircle, Menu, X, PhoneCall, Scale, BookOpen, Compass, ChevronDown, Check, Smartphone, Download, Sparkles, Globe, Mic, FileText, FolderLock, Users, ShieldCheck } from 'lucide-react';
import { Language, ActiveView } from '../types';
import { translations } from '../data/translations';
import { AshokaChakra } from './AshokaChakra';

interface HeaderProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenEmergency: () => void;
  onOpenSos: () => void;
  onOpenDownloadModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  language,
  onLanguageChange,
  onOpenEmergency,
  onOpenSos,
  onOpenDownloadModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [guidesDropdownOpen, setGuidesDropdownOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const guidesRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (guidesRef.current && !guidesRef.current.contains(e.target as Node)) {
        setGuidesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const isGuidesActive =
    currentView.type === 'situation' ||
    currentView.type === 'assessment' ||
    currentView.type === 'complaints' ||
    currentView.type === 'sources';

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'EN' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' }
  ];

  const currentLangObj = languages.find(l => l.code === language) || languages[0];

  const handleNav = (view: ActiveView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header id="app-header" className="sticky top-0 z-40 bg-slate-900/95 text-white backdrop-blur-md border-b border-slate-800 shadow-md w-full max-w-full overflow-x-clip">
      {/* Top subtle Indian tri-color indicator bar with animated shimmer */}
      <div className="h-1 w-full flex relative overflow-hidden">
        <div className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500"></div>
        <div className="flex-1 bg-slate-100 relative flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-800"></div>
        </div>
        <div className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between min-h-14 h-auto py-1.5 gap-1.5 sm:gap-2">
          
          {/* Brand Logo & Title — Compact & Uncrushable */}
          <button
            id="brand-logo-btn"
            onClick={() => handleNav({ type: 'home' })}
            className="flex items-center space-x-1.5 sm:space-x-2 text-left group focus:outline-none rounded-xl p-1 shrink-0 cursor-pointer"
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-bold group-hover:scale-105 transition-transform shrink-0 overflow-hidden">
              <div className="absolute inset-0 opacity-25 flex items-center justify-center pointer-events-none">
                <AshokaChakra size={30} speed="medium" color="#000000" strokeWidth={1.5} />
              </div>
              <Shield className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-950 stroke-[2.5] relative z-10" />
            </div>
            <div className="shrink-0 flex items-center space-x-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-amber-400 transition-colors whitespace-nowrap">
                NyayaNow
              </span>
              <span className="hidden sm:inline-flex items-center space-x-0.5 text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700 shrink-0">
                <AshokaChakra size={9} speed="slow" color="#f59e0b" strokeWidth={2} />
                <span>BNSS</span>
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links — Compact Segmented Pill & Guides Dropdown */}
          <nav className="hidden lg:flex items-center space-x-2 shrink-0">
            {/* The Signature AI & Intelligence Capabilities */}
            <div className="flex items-center bg-slate-950/80 border border-slate-800/90 rounded-full p-1 shadow-inner backdrop-blur-md gap-0.5">
              {/* 01 AI & Voice Assistant */}
              <button
                id="nav-ai-assistant"
                onClick={() => handleNav({ type: 'ai-assistant' })}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  currentView.type === 'ai-assistant' || currentView.type === 'voice-assistant'
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                }`}
                title="01 AI & Voice Legal Assistant"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>01 AI & Voice</span>
                <Mic className="w-2.5 h-2.5 text-emerald-400" />
              </button>

              {/* 02 Documents */}
              <button
                id="nav-doc-intelligence"
                onClick={() => handleNav({ type: 'document-intelligence' })}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  currentView.type === 'document-intelligence'
                    ? 'bg-blue-500/25 text-blue-300 border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.25)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                }`}
                title="02 Document Intelligence"
              >
                <FileText className="w-3 h-3 text-blue-400" />
                <span>02 Docs</span>
              </button>

              {/* Contract Scanner (Know Before You Sign) */}
              <button
                id="nav-contract-scanner"
                onClick={() => handleNav({ type: 'contract-scanner' })}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  currentView.type === 'contract-scanner'
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                }`}
                title="Contract Scanner (Know Before You Sign)"
              >
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                <span>Contracts</span>
              </button>

              {/* 03 Evidence */}
              <button
                id="nav-evidence-intelligence"
                onClick={() => handleNav({ type: 'evidence-intelligence' })}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  currentView.type === 'evidence-intelligence'
                    ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.25)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                }`}
                title="03 Evidence Intelligence"
              >
                <FolderLock className="w-3 h-3 text-purple-400" />
                <span>03 Evidence</span>
              </button>

              {/* 04 Connect */}
              <button
                id="nav-lawyer-connection"
                onClick={() => handleNav({ type: 'lawyer-connection' })}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  currentView.type === 'lawyer-connection'
                    ? 'bg-teal-500/25 text-teal-300 border border-teal-500/50 shadow-[0_0_10px_rgba(20,184,166,0.25)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                }`}
                title="04 Lawyer & Authority Connection"
              >
                <Users className="w-3 h-3 text-teal-400" />
                <span>04 Connect</span>
              </button>
            </div>

            {/* Legal Guides & Resources Dropdown */}
            <div className="relative" ref={guidesRef}>
              <button
                id="nav-guides-dropdown-btn"
                onClick={() => setGuidesDropdownOpen(!guidesDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                  isGuidesActive
                    ? 'bg-slate-800 text-amber-400 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'text-slate-300 hover:text-white bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>Guides ▾</span>
              </button>

              {guidesDropdownOpen && (
                <div
                  id="guides-dropdown-menu"
                  className="absolute left-0 mt-2 w-72 bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl shadow-black/60 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3.5 py-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {language === 'hi' ? 'कानूनी मार्गदर्शिका एवं अधिकार' : language === 'te' ? 'చట్టపరమైన మార్గదర్శకాలు' : 'Legal Guides & Rights'}
                  </div>

                  {/* Situations Guide */}
                  <button
                    onClick={() => {
                      setGuidesDropdownOpen(false);
                      handleNav({ type: 'home' });
                      setTimeout(() => {
                        const el = document.getElementById('situation-selector');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="w-full flex items-start gap-3 px-3.5 py-2.5 text-left hover:bg-slate-800 transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                        {t.situations}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-tight">
                        30-sec rights for stop, search & inquiry
                      </div>
                    </div>
                  </button>

                  {/* 30-Sec Diagnostic */}
                  <button
                    onClick={() => {
                      setGuidesDropdownOpen(false);
                      handleNav({ type: 'assessment' });
                    }}
                    className={`w-full flex items-start gap-3 px-3.5 py-2.5 text-left hover:bg-slate-800 transition-colors cursor-pointer group ${
                      currentView.type === 'assessment' ? 'bg-amber-500/10 text-amber-400' : ''
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Compass className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                        {t.diagnosticTool}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-tight">
                        3-question custody status test
                      </div>
                    </div>
                  </button>

                  {/* Where to Complain */}
                  <button
                    onClick={() => {
                      setGuidesDropdownOpen(false);
                      handleNav({ type: 'complaints' });
                    }}
                    className={`w-full flex items-start gap-3 px-3.5 py-2.5 text-left hover:bg-slate-800 transition-colors cursor-pointer group ${
                      currentView.type === 'complaints' ? 'bg-amber-500/10 text-amber-400' : ''
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Scale className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                        {t.whereToComplain}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-tight">
                        SPCA, senior police & BNSS remedies
                      </div>
                    </div>
                  </button>

                  {/* Sources & Constitution */}
                  <button
                    onClick={() => {
                      setGuidesDropdownOpen(false);
                      handleNav({ type: 'sources' });
                    }}
                    className={`w-full flex items-start gap-3 px-3.5 py-2.5 text-left hover:bg-slate-800 transition-colors cursor-pointer group ${
                      currentView.type === 'sources' ? 'bg-amber-500/10 text-amber-400' : ''
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                        {t.sources}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-tight">
                        Articles 20-22 & BNSS 2023 sections
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Controls: Language, SOS & Emergency Mode */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            
            {/* Language Selector Dropdown — Globe Icon */}
            <div className="relative" ref={langRef}>
              <button
                id="language-selector-btn"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-amber-400/50 transition-all group cursor-pointer"
                aria-label="Select Language"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-slate-200 font-semibold">{currentLangObj.native}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {langDropdownOpen && (
                <div
                  id="lang-dropdown-menu"
                  className="absolute right-0 mt-2 w-44 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl shadow-black/40 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* Header */}
                  <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-800 mb-1">
                    <Globe className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Language / भाषा</span>
                  </div>
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-left transition-all cursor-pointer ${
                        language === lang.code
                          ? 'text-amber-400 font-bold bg-amber-400/10'
                          : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`text-base leading-none ${language === lang.code ? 'opacity-100' : 'opacity-60'}`}>
                          {lang.code === 'en' ? '🇬🇧' : lang.code === 'hi' ? '🇮🇳' : '🏛️'}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold">{lang.native}</span>
                          <span className="text-[9px] text-slate-500">{lang.label}</span>
                        </div>
                      </div>
                      {language === lang.code && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick SOS Helpline Trigger — Desktop & Tablet only (Available in Mobile Drawer) */}
            <button
              id="header-sos-btn"
              onClick={onOpenSos}
              className="hidden md:flex p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700/80 items-center gap-1.5 transition-all shrink-0 cursor-pointer"
              title="Official Emergency Helplines (112, 1091, 1064)"
              aria-label="Helplines"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline text-xs">Helplines</span>
            </button>

            {/* Offline App Hub Trigger — Desktop only (Available in Mobile Drawer & Page) */}
            {onOpenDownloadModal && (
              <button
                id="header-offline-app-btn"
                onClick={onOpenDownloadModal}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700/80 hover:border-emerald-400/50 transition-all shrink-0 cursor-pointer group shadow-sm"
                title="NyayaNow Offline Suite & Lockscreen Emergency Cards"
                aria-label="Offline App"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs">Offline App</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </button>
            )}

            {/* Emergency Mode Button — Sleek High-Visibility Red Pill */}
            <button
              id="header-emergency-mode-btn"
              onClick={onOpenEmergency}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-600/30 transition-all shrink-0 cursor-pointer"
              title="Immediate Emergency Rights & 112 Dispatch"
            >
              <AlertCircle className="w-3.5 h-3.5 animate-pulse shrink-0" />
              <span className="hidden xs:inline">Emergency</span>
              <span className="xs:hidden">SOS</span>
            </button>

            {/* Mobile Menu Toggle — Always Visible, High Priority on Mobile */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-xl bg-slate-800/90 text-amber-400 hover:text-white hover:bg-slate-700 border border-slate-700/80 focus:outline-none shrink-0 cursor-pointer transition-colors"
              aria-label="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200">
          
          {/* Featured Offline App Card in Mobile Drawer */}
          {onOpenDownloadModal && (
            <button
              id="mobile-drawer-download-featured-card"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDownloadModal();
              }}
              className="w-full mb-1 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-slate-850 to-amber-500/20 border border-emerald-500/40 hover:border-emerald-400 text-left transition-all cursor-pointer group shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30 shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>NyayaNow Mobile Offline App</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 font-extrabold">BEST FEATURE</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Lockscreen rights • 1-tap install • Zero internet</div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-emerald-400 group-hover:translate-y-0.5 transition-transform shrink-0" />
              </div>
            </button>
          )}

          <div className="grid grid-cols-1 gap-1.5">
            <button
              onClick={() => handleNav({ type: 'home' })}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-left ${
                currentView.type === 'home' ? 'bg-slate-800 text-amber-400' : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>{t.home}</span>
            </button>

            <button
              onClick={() => handleNav({ type: 'ai-assistant' })}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors ${
                currentView.type === 'ai-assistant' || currentView.type === 'voice-assistant'
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50'
                  : 'text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20'
              }`}
            >
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span>{language === 'hi' ? '01 एआई एवं वॉयस कानूनी सहायक' : language === 'te' ? '01 ఏఐ & వాయిస్ లీగల్ అసిస్టెంట్' : '01 AI & Voice Legal Assistant'}</span>
            </button>

            <button
              onClick={() => handleNav({ type: 'document-intelligence' })}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors ${
                currentView.type === 'document-intelligence'
                  ? 'bg-blue-500/25 text-blue-300 border border-blue-500/50'
                  : 'text-blue-300 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>{language === 'hi' ? '02 दस्तावेज़ विश्लेषण' : language === 'te' ? '02 పత్ర విశ్లేషణ' : '02 Document Intelligence'}</span>
            </button>

            <button
              onClick={() => handleNav({ type: 'contract-scanner' })}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors ${
                currentView.type === 'contract-scanner'
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50'
                  : 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>{language === 'hi' ? 'अनुबंध जोखिम स्कैनर' : language === 'te' ? 'కాంట్రాక్ట్ స్కానర్' : 'Contract Scanner'}</span>
            </button>

            <button
              onClick={() => handleNav({ type: 'evidence-intelligence' })}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors ${
                currentView.type === 'evidence-intelligence'
                  ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50'
                  : 'text-purple-300 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20'
              }`}
            >
              <FolderLock className="w-4 h-4 text-purple-400" />
              <span>{language === 'hi' ? '03 सबूत प्रबंधन' : language === 'te' ? '03 సాక్ష్యాల నిర్వహణ' : '03 Evidence Intelligence'}</span>
            </button>

            <button
              onClick={() => handleNav({ type: 'lawyer-connection' })}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors ${
                currentView.type === 'lawyer-connection'
                  ? 'bg-teal-500/25 text-teal-300 border border-teal-500/50'
                  : 'text-teal-300 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20'
              }`}
            >
              <Users className="w-4 h-4 text-teal-400" />
              <span>{language === 'hi' ? '04 वकील / प्राधिकरण संपर्क' : language === 'te' ? '04 న్యాయవాది / అధికార సంప్రదింపు' : '04 Lawyer & Authority Connect'}</span>
            </button>

            <button
              onClick={() => {
                handleNav({ type: 'home' });
                setTimeout(() => {
                  const el = document.getElementById('situation-selector');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800 text-left"
            >
              <AlertCircle className="w-4 h-4 text-slate-400" />
              <span>{t.allRights}</span>
            </button>

            <button
              onClick={() => handleNav({ type: 'assessment' })}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-left ${
                currentView.type === 'assessment' ? 'bg-slate-800 text-amber-400' : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>{t.diagnosticTool}</span>
            </button>

            <button
              onClick={() => handleNav({ type: 'complaints' })}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-left ${
                currentView.type === 'complaints' ? 'bg-slate-800 text-amber-400' : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Scale className="w-4 h-4 text-slate-400" />
              <span>{t.whereToComplain}</span>
            </button>

            <button
              onClick={() => handleNav({ type: 'sources' })}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-left ${
                currentView.type === 'sources' ? 'bg-slate-800 text-amber-400' : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>{t.sources}</span>
            </button>

            {onOpenDownloadModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDownloadModal();
                }}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-left cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <div className="flex-1 flex items-center justify-between">
                  <span>Download / Install App</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Offline</span>
                </div>
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSos();
              }}
              className="flex-1 mr-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center space-x-2"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Emergency 112 / SOS</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenEmergency();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Help Right Now</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
