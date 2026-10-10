import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowLeft, 
  Upload, 
  Printer, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Lock,
  Layers,
  HelpCircle,
  Calendar
} from 'lucide-react';
import { Language } from '../../types';
import { 
  ContractAnalysisReport, 
  ContractCategory, 
  QuestionStatus 
} from '../../types/contractScanner';
import { ContractScannerService } from '../../services/contractScannerService';
import { ContractUploadDropzone } from './ContractUploadDropzone';
import { ContractCategorySelector } from './ContractCategorySelector';
import { ContractWhatWeCheck } from './ContractWhatWeCheck';
import { ContractSamplePicker } from './ContractSamplePicker';
import { ContractProcessingStages } from './ContractProcessingStages';
import { ContractOverviewTab } from './ContractOverviewTab';
import { ContractClauseReviewer } from './ContractClauseReviewer';
import { ContractObligationsDatesTab } from './ContractObligationsDatesTab';
import { ContractQuestionsTab } from './ContractQuestionsTab';

interface ContractScannerProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigateBack: () => void;
  onNavigateToAssistantWithPrompt?: (prompt: string) => void;
}

export const ContractScanner: React.FC<ContractScannerProps> = ({
  language,
  onLanguageChange,
  onNavigateBack,
  onNavigateToAssistantWithPrompt
}) => {
  // Document state
  const [activeReport, setActiveReport] = useState<ContractAnalysisReport | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ContractCategory | null>(null);
  const [detectedCategory, setDetectedCategory] = useState<ContractCategory | null>(null);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(1);
  const [processingStatus, setProcessingStatus] = useState('Reading document…');
  const [processingPercent, setProcessingPercent] = useState(10);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active tab in results view
  const [activeTab, setActiveTab] = useState<'overview' | 'clauses' | 'obligations' | 'questions'>('overview');

  // Modals
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [printIncludeNotes, setPrintIncludeNotes] = useState(true);

  // Handle file selection from dropzone
  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);

    // Auto-detect category
    const autoCat = ContractScannerService.detectCategory('', file.name);
    setDetectedCategory(autoCat);
    if (!selectedCategory) {
      setSelectedCategory(autoCat);
    }
  };

  // Start analysis of selected file
  const handleStartAnalysis = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProcessingStage(1);
    setProcessingStatus('Extracting document text…');
    setProcessingPercent(15);
    setErrorMessage(null);

    try {
      // Step 1: Extract text
      const { text } = await ContractScannerService.extractTextFromFile(
        selectedFile,
        (status, pct) => {
          setProcessingStatus(status);
          setProcessingPercent(pct);
        }
      );

      // Step 2: Analyze contract
      const report = await ContractScannerService.analyzeContract({
        text,
        fileName: selectedFile.name,
        fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
        fileType: selectedFile.type || 'Document',
        category: selectedCategory || detectedCategory || 'other',
        onProgress: (stg, status, pct) => {
          setProcessingStage(stg);
          setProcessingStatus(status);
          setProcessingPercent(pct);
        }
      });

      setProcessingPercent(100);
      setTimeout(() => {
        setActiveReport(report);
        setIsProcessing(false);
        setActiveTab('overview');
      }, 300);
    } catch (err: any) {
      console.error('Contract scan error:', err);
      setErrorMessage(err.message || 'Failed to analyze the contract. Please check file formatting.');
      setIsProcessing(false);
    }
  };

  // Handle direct text paste
  const handleTextPaste = async (text: string, title?: string) => {
    const docTitle = title || 'Pasted_Contract.txt';
    setIsProcessing(true);
    setProcessingStage(1);
    setProcessingStatus('Parsing contract text…');
    setProcessingPercent(20);
    setErrorMessage(null);

    try {
      const autoCat = ContractScannerService.detectCategory(text, docTitle);
      const report = await ContractScannerService.analyzeContract({
        text,
        fileName: docTitle,
        fileSize: `${(new Blob([text]).size / 1024).toFixed(0)} KB`,
        fileType: 'text/plain',
        category: selectedCategory || autoCat,
        onProgress: (stg, status, pct) => {
          setProcessingStage(stg);
          setProcessingStatus(status);
          setProcessingPercent(pct);
        }
      });

      setProcessingPercent(100);
      setTimeout(() => {
        setActiveReport(report);
        setIsProcessing(false);
        setActiveTab('overview');
      }, 300);
    } catch (err: any) {
      setErrorMessage(err.message || 'Analysis failed.');
      setIsProcessing(false);
    }
  };

  // Handle sample contract selection
  const handleSelectSample = async (sample: ContractAnalysisReport) => {
    setSelectedFile(null);
    setErrorMessage(null);
    setIsProcessing(true);
    setProcessingStage(1);
    setProcessingStatus(`Loading ${sample.fileName}…`);
    setProcessingPercent(25);

    const steps = [
      { stg: 2, status: 'Identifying contract clauses & structure…', pct: 50, delay: 200 },
      { stg: 3, status: 'Reviewing obligations and potential concerns…', pct: 75, delay: 200 },
      { stg: 4, status: 'Preparing plain-language explanations…', pct: 90, delay: 200 },
      { stg: 5, status: 'Checking supporting sources against Indian law…', pct: 100, delay: 200 }
    ];

    for (const step of steps) {
      await new Promise((r) => setTimeout(r, step.delay));
      setProcessingStage(step.stg);
      setProcessingStatus(step.status);
      setProcessingPercent(step.pct);
    }

    setTimeout(() => {
      setActiveReport(sample);
      setIsProcessing(false);
      setActiveTab('overview');
    }, 200);
  };

  // Clause interactive updates
  const handleToggleReviewed = (clauseId: string) => {
    if (!activeReport) return;
    setActiveReport((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        clauses: prev.clauses.map((c) =>
          c.id === clauseId ? { ...c, isReviewed: !c.isReviewed } : c
        )
      };
    });
  };

  const handleSaveNote = (clauseId: string, note: string) => {
    if (!activeReport) return;
    setActiveReport((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        clauses: prev.clauses.map((c) =>
          c.id === clauseId ? { ...c, userNote: note } : c
        )
      };
    });
  };

  // Question status update
  const handleUpdateQuestionStatus = (questionId: string, status: QuestionStatus) => {
    if (!activeReport) return;
    setActiveReport((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId ? { ...q, status } : q
        )
      };
    });
  };

  // Complete document deletion
  const handleDeleteDocument = () => {
    setActiveReport(null);
    setSelectedFile(null);
    setSelectedCategory(null);
    setDetectedCategory(null);
    setDeleteConfirmOpen(false);
    setErrorMessage(null);
  };

  // Export / Print Report
  const handlePrintReport = () => {
    if (!activeReport) return;
    const html = ContractScannerService.generatePrintableHtml(activeReport, printIncludeNotes);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 400);
    }
  };

  return (
    <section className="relative w-full min-h-screen bg-[#070B14] text-slate-100 font-sans overflow-x-hidden flex flex-col">
      {/* Ambient Lighting & Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-cyan-500/10 via-blue-900/10 to-transparent blur-3xl opacity-80" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-40 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top Navigation Bar */}
      <div className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={onNavigateBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Know Before You Sign</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Page Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-bold shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="uppercase tracking-widest text-[11px]">AI Contract Intelligence</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Know Before You Sign
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Turn complex legal documents into clear explanations, potential risks, and practical questions before you commit.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Source-grounded analysis · Private document handling · You stay in control</span>
          </div>
        </div>

        {/* VIEW 1: PROCESSING SCREEN */}
        {isProcessing && (
          <ContractProcessingStages
            stage={processingStage}
            statusText={processingStatus}
            percent={processingPercent}
            fileName={selectedFile?.name || 'Contract Document'}
          />
        )}

        {/* VIEW 2: EMPTY STATE / UPLOAD FLOW */}
        {!isProcessing && !activeReport && (
          <div className="space-y-10 max-w-5xl mx-auto">
            {/* Upload Area */}
            <ContractUploadDropzone
              onFileSelect={handleFileSelect}
              onTextPaste={handleTextPaste}
              selectedFile={selectedFile}
              onClearFile={() => setSelectedFile(null)}
              onStartAnalysis={handleStartAnalysis}
              isProcessing={isProcessing}
              selectedCategory={selectedCategory}
              errorMessage={errorMessage}
            />

            {/* Category Selector */}
            <ContractCategorySelector
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              detectedCategory={detectedCategory}
            />

            {/* Sample Contract Picker */}
            <ContractSamplePicker
              onSelectSample={handleSelectSample}
              isLoading={isProcessing}
            />

            {/* What the scanner checks Feature Grid */}
            <ContractWhatWeCheck />
          </div>
        )}

        {/* VIEW 3: RICH RESULTS DASHBOARD */}
        {!isProcessing && activeReport && (
          <div className="space-y-6">
            {/* Results Action Bar */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      {activeReport.fileName}
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 capitalize border border-slate-700">
                      {activeReport.detectedCategory}
                    </span>
                    {activeReport.isSample && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        Demo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Analyzed on {activeReport.analysisTimestamp} • {activeReport.fileSize}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Print / Export Report */}
                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Print or export PDF report"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Export Report</span>
                </button>

                {/* Upload Another Document */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveReport(null);
                    setSelectedFile(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Upload Another</span>
                </button>

                {/* Delete Document & Data */}
                <button
                  type="button"
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-xs font-bold text-red-300 hover:text-red-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Permanently clear this document and data"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden sm:inline">Delete Data</span>
                </button>
              </div>
            </div>

            {/* Tab Navigation Segmented Bar */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'overview'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('clauses')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'clauses'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Clause Reviews</span>
                {activeReport.metrics.highAttentionCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      activeTab === 'clauses'
                        ? 'bg-red-950 text-red-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {activeReport.metrics.highAttentionCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('obligations')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'obligations'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Obligations & Dates</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('questions')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'questions'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Questions to Ask</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeTab === 'questions'
                      ? 'bg-slate-900 text-cyan-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {activeReport.questions.length}
                </span>
              </button>
            </div>

            {/* Tab Views */}
            {activeTab === 'overview' && (
              <ContractOverviewTab
                report={activeReport}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'clauses' && (
              <ContractClauseReviewer
                clauses={activeReport.clauses}
                onToggleReviewed={handleToggleReviewed}
                onSaveNote={handleSaveNote}
              />
            )}

            {activeTab === 'obligations' && (
              <ContractObligationsDatesTab
                obligations={activeReport.obligations}
                importantDates={activeReport.importantDates}
              />
            )}

            {activeTab === 'questions' && (
              <ContractQuestionsTab
                questions={activeReport.questions}
                contractTitle={activeReport.fileName}
                onUpdateQuestionStatus={handleUpdateQuestionStatus}
              />
            )}

            {/* Disclaimers & Legal Notice at Bottom */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-500 space-y-1">
              <div className="font-bold uppercase tracking-wider text-slate-400">
                Statutory & Legal Information Notice
              </div>
              <ul className="list-disc pl-4 space-y-0.5">
                {activeReport.disclaimers.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Document & Extracted Data</h3>
                <p className="text-xs text-slate-400">This action immediately purges all in-memory analysis.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to remove <strong>{activeReport?.fileName}</strong> and all related findings, notes, and questions from this session?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDocument}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Yes, Delete Data
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
