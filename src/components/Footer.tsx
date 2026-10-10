import React, { useState } from 'react';
import { Shield, PhoneCall, AlertTriangle, FileCheck2, History, MessageSquare, Lock, Smartphone, Download } from 'lucide-react';
import { Language, ActiveView } from '../types';
import { translations } from '../data/translations';
import { MethodologyModal } from './MethodologyModal';
import { VersionModal } from './VersionModal';
import { ReportCorrectionModal } from './ReportCorrectionModal';
import { AshokaChakra } from './AshokaChakra';

interface FooterProps {
  onNavigate: (view: ActiveView) => void;
  language: Language;
  onOpenSos: () => void;
  onShowToast?: (msg: string) => void;
  onOpenDownloadModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, language, onOpenSos, onShowToast, onOpenDownloadModal }) => {
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const t = translations[language];

  return (
    <footer id="app-footer" className="relative bg-slate-950 text-slate-400 border-t border-slate-800 pt-12 pb-16 overflow-hidden">
      {/* Subtle Ashoka Chakra watermark in footer */}
      <div className="absolute -right-20 -bottom-20 opacity-[0.06] pointer-events-none">
        <AshokaChakra size={360} speed="slow" color="#38bdf8" strokeWidth={1.5} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand & Purpose */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                <Shield className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">NyayaNow</span>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                Civic Tech • India
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              India's 30-Second Police Rights Guide — empowering citizens with immediate, verified legal safeguards under the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span><strong>Privacy First:</strong> Zero tracking. No personal data, location, or logs are collected.</span>
            </div>
            
            {/* Direct Emergency Numbers Pill Bar */}
            <div className="pt-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                <span>National Emergency Hotlines</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <a href="tel:112" className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold flex items-center space-x-1 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span>Police/Emergency: <strong>112</strong></span>
                </a>
                <a href="tel:1091" className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold flex items-center space-x-1 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                  <span>Women Helpline: <strong>1091</strong></span>
                </a>
                <a href="tel:1064" className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold flex items-center space-x-1 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Anti-Corruption: <strong>1064</strong></span>
                </a>
                <a href="tel:15100" className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold flex items-center space-x-1 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>Legal Aid (NALSA): <strong>15100</strong></span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Quick Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => {
                    onNavigate({ type: 'home' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate({ type: 'contract-scanner' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors flex items-center gap-1"
                >
                  <span>Know Before You Sign (Contract Scanner)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate({ type: 'home' });
                    setTimeout(() => {
                      const el = document.getElementById('situation-selector');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  8 Primary Situations
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'assessment' })}
                  className="hover:text-amber-400 transition-colors flex items-center space-x-1"
                >
                  <span>Diagnostic Tool: Am I Detained?</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'complaints' })}
                  className="hover:text-amber-400 transition-colors"
                >
                  Where Can I Complain?
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'sources' })}
                  className="hover:text-amber-400 transition-colors"
                >
                  Verified Source Library
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSos}
                  className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  Emergency Helplines
                </button>
              </li>
              {onOpenDownloadModal && (
                <li>
                  <button
                    onClick={onOpenDownloadModal}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Download App / Offline Card</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Trust & Legal Credibility */}
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Transparency & Review
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => setMethodologyOpen(true)}
                  className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-slate-300"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verification Methodology</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setVersionOpen(true)}
                  className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-slate-300"
                >
                  <History className="w-3.5 h-3.5 text-blue-400" />
                  <span>Edition & Changelog (v2.4)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setReportOpen(true)}
                  className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-slate-300"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Report Legal Correction</span>
                </button>
              </li>
              <li className="pt-2">
                <span className="text-xs text-slate-400 block leading-relaxed">
                  Independent civic legal-awareness project. Not affiliated with the police, ministry, or judiciary.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="bg-slate-900/90 rounded-xl p-4 sm:p-5 border border-slate-800 mb-8 text-xs text-slate-400 leading-relaxed">
          <div className="flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-300">Statutory Legal Disclaimer:</strong> {t.disclaimerText}
            </div>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <span>Built for India</span>
            <span className="inline-block">🇮🇳</span>
            <span>•</span>
            <span>NyayaNow Civic Initiative</span>
          </div>
          <div>
            <span>Verified against BNSS 2023 & Supreme Court Rulings • Free Public Service</span>
          </div>
        </div>

      </div>

      {/* Modals */}
      <MethodologyModal
        isOpen={methodologyOpen}
        onClose={() => setMethodologyOpen(false)}
        language={language}
      />

      <VersionModal
        isOpen={versionOpen}
        onClose={() => setVersionOpen(false)}
        language={language}
      />

      <ReportCorrectionModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        language={language}
        onSubmittedToast={onShowToast}
      />
    </footer>
  );
};
