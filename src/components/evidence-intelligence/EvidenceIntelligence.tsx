import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter, 
  Layers, 
  Calendar, 
  Network, 
  User as UserIcon, 
  FileQuestion, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  Trash2,
  Image,
  FileText,
  MessageSquare,
  AlertCircle,
  FolderLock,
  Lock,
  CheckCircle2,
  X,
  LogOut
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { Language } from '../../types';
import { 
  EvidenceItem, 
  EvidenceEvent, 
  EvidenceCollection, 
  EvidenceGap, 
  EvidenceConnection, 
  EvidenceType,
  EvidenceIntelligenceService,
  SAMPLE_EVIDENCE_ITEMS,
  SAMPLE_TIMELINE_EVENTS,
  SAMPLE_COLLECTIONS,
  SAMPLE_EVIDENCE_GAPS,
  SAMPLE_CONNECTIONS
} from '../../services/evidenceIntelligenceService';
import { 
  SupabaseAuth, 
  SupabaseEvidenceVault, 
  validateEvidenceFile, 
  isSupabaseConfigured 
} from '../../services/supabaseClient';
import { EvidenceHero } from './EvidenceHero';
import { EvidenceEmptyState } from './EvidenceEmptyState';
import { EvidenceUploader } from './EvidenceUploader';
import { EvidenceProcessingPipeline } from './EvidenceProcessingPipeline';
import { EvidenceCard } from './EvidenceCard';
import { EvidenceDetailPanel } from './EvidenceDetailPanel';
import { EvidenceTimeline } from './EvidenceTimeline';
import { EntityExplorer } from './EntityExplorer';
import { EvidenceRelationshipMap } from './EvidenceRelationshipMap';
import { EvidenceGapAnalysis } from './EvidenceGapAnalysis';
import { EvidenceExportModal } from './EvidenceExportModal';
import { AskNyayaEvidencePanel } from './AskNyayaEvidencePanel';
import { EvidenceAuthModal } from './EvidenceAuthModal';

interface EvidenceIntelligenceProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigateBack: () => void;
  onNavigateToAssistantWithPrompt: (prompt: string) => void;
  onNavigateToVoiceAssistant?: () => void;
  onNavigateToDocumentIntelligence?: () => void;
  onNavigateToLawyerConnection?: () => void;
}

type WorkspaceTab = 'library' | 'timeline' | 'connections' | 'entities' | 'gaps';

type PendingUploadPayload = 
  | { type: 'files'; files: File[] }
  | { type: 'text'; text: string; title?: string };

export const EvidenceIntelligence: React.FC<EvidenceIntelligenceProps> = ({
  language,
  onLanguageChange,
  onNavigateBack,
  onNavigateToAssistantWithPrompt,
  onNavigateToVoiceAssistant,
  onNavigateToDocumentIntelligence,
  onNavigateToLawyerConnection
}) => {
  // Primary state
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<EvidenceEvent[]>([]);
  const [collections, setCollections] = useState<EvidenceCollection[]>(SAMPLE_COLLECTIONS);
  const [gaps, setGaps] = useState<EvidenceGap[]>([]);
  const [connections, setConnections] = useState<EvidenceConnection[]>([]);

  // Authentication & Pending Upload state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<PendingUploadPayload | null>(null);

  // Status banners & feedback
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [authNotification, setAuthNotification] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('library');
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingFileName, setProcessingFileName] = useState('');
  const [processingStage, setProcessingStage] = useState(1);
  const [processingStatus, setProcessingStatus] = useState('Reading file…');
  const [processingPercent, setProcessingPercent] = useState(20);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<string | null>(null);

  // Derive live metrics
  const metrics = useMemo(() => {
    return EvidenceIntelligenceService.calculateMetrics(evidenceItems, timelineEvents);
  }, [evidenceItems, timelineEvents]);

  // Load existing evidence from Supabase database for authenticated user
  const loadUserRecords = async (userId: string) => {
    try {
      const records = await SupabaseEvidenceVault.fetchUserEvidenceRecords(userId);
      if (records.length > 0) {
        const loadedItems: EvidenceItem[] = records.map((rec) => ({
          id: rec.id,
          filename: rec.filename,
          type: (rec.evidence_type as EvidenceType) || 'document',
          aiSuggestedType: (rec.evidence_type as EvidenceType) || 'document',
          isAiClassified: true,
          fileSize: `${(rec.file_size_bytes / (1024 * 1024)).toFixed(1)} MB`,
          fileSizeBytes: rec.file_size_bytes,
          uploadedAt: new Date(rec.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
          previewUrl: rec.signed_url,
          metadata: {
            createdAt: new Date(rec.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
            source: rec.file_path,
            hash: rec.sha256_hash,
            mimeType: rec.mime_type
          },
          extractedText: rec.extracted_text,
          hasExtractedText: Boolean(rec.extracted_text && rec.extracted_text.length > 5),
          ocrConfidence: rec.ocr_confidence,
          entities: rec.entities || [],
          dates: rec.dates || [],
          linkedEvents: [],
          userNotes: rec.user_notes || [],
          aiInferences: [`Authenticated vault record • ID: ${rec.id.slice(0, 8)}…`],
          potentialInconsistencies: [],
          reviewStatus: (rec.review_status as any) || 'needs-review',
          collectionIds: []
        }));

        setEvidenceItems((prev) => {
          const existingIds = new Set(prev.map(p => p.id));
          const newItems = loadedItems.filter(l => !existingIds.has(l.id));
          const updated = [...prev, ...newItems];
          const newTimeline = EvidenceIntelligenceService.buildTimelineFromEvidence(updated);
          setTimelineEvents(newTimeline);
          return updated;
        });
      }
    } catch (err) {
      console.warn('Could not load user records from Supabase:', err);
    }
  };

  // Check auth session on component mount & subscribe to auth changes
  useEffect(() => {
    SupabaseAuth.getCurrentUser().then((user) => {
      if (user) {
        setCurrentUser(user);
        loadUserRecords(user.id);
      }
    });

    const subscription = SupabaseAuth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);
      if (user) {
        loadUserRecords(user.id);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Load sample Hackathon dataset (remains accessible without authentication)
  const handleLoadDemoData = () => {
    setEvidenceItems(SAMPLE_EVIDENCE_ITEMS);
    setTimelineEvents(SAMPLE_TIMELINE_EVENTS);
    setGaps(SAMPLE_EVIDENCE_GAPS);
    setConnections(SAMPLE_CONNECTIONS);
    setActiveTab('library');
  };

  // Clear workspace
  const handleClearWorkspace = () => {
    if (window.confirm('Are you sure you want to clear this evidence workspace? Original files stored on your device will not be deleted.')) {
      setEvidenceItems([]);
      setTimelineEvents([]);
      setGaps([]);
      setConnections([]);
      setSelectedItem(null);
    }
  };

  /**
   * Core upload execution with Supabase private storage & DB persistence
   */
  const executeFilesUpload = async (files: File[], user: User) => {
    setIsUploaderOpen(false);
    setIsProcessing(true);
    setUploadError(null);

    // Validate all files first
    for (const f of files) {
      const check = validateEvidenceFile(f);
      if (!check.valid) {
        setUploadError(check.error || `File ${f.name} is not permitted.`);
        setIsProcessing(false);
        return;
      }
    }

    const newlyProcessedItems: EvidenceItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProcessingFileName(file.name);
      setProcessingStage(1);
      setProcessingStatus(`Hashing & validating ${file.name} (${i + 1}/${files.length})…`);
      setProcessingPercent(15);

      // 1. Process client-side OCR & NLP analysis
      const processed = await EvidenceIntelligenceService.processEvidenceFile(
        file,
        (stage, name) => {
          setProcessingStage(stage);
          setProcessingStatus(name);
          setProcessingPercent(Math.min(65, stage * 13));
        }
      );

      // 2. Upload file to Supabase private storage vault
      setProcessingStatus(`Uploading ${file.name} to private Supabase Evidence Vault…`);
      setProcessingPercent(75);

      const storageResult = await SupabaseEvidenceVault.uploadFile(
        file,
        user.id,
        (progress) => {
          setProcessingPercent(70 + Math.round(progress * 0.15));
        }
      );

      if (storageResult.error) {
        console.warn('Storage upload error:', storageResult.error);
        processed.aiInferences.push(`Storage Warning: ${storageResult.error}`);
      } else if (storageResult.filePath) {
        processed.metadata = {
          ...processed.metadata,
          source: storageResult.filePath
        };
        if (storageResult.signedUrl) {
          processed.previewUrl = storageResult.signedUrl;
        }

        // 3. Persist record in Supabase database with user_id
        setProcessingStatus(`Saving tamper-evident metadata to Supabase DB…`);
        setProcessingPercent(92);

        const dbResult = await SupabaseEvidenceVault.saveEvidenceRecord({
          user_id: user.id,
          filename: processed.filename,
          file_path: storageResult.filePath,
          file_size_bytes: processed.fileSizeBytes,
          mime_type: processed.metadata?.mimeType || 'application/octet-stream',
          evidence_type: processed.type,
          sha256_hash: processed.metadata?.hash,
          extracted_text: processed.extractedText,
          ocr_confidence: processed.ocrConfidence,
          entities: processed.entities,
          dates: processed.dates,
          user_notes: processed.userNotes,
          review_status: processed.reviewStatus
        });

        if (dbResult.data?.id) {
          processed.id = dbResult.data.id;
        }
      }

      newlyProcessedItems.push(processed);
    }

    setProcessingPercent(100);
    await new Promise((r) => setTimeout(r, 300));

    setEvidenceItems((prev) => {
      const updated = [...prev, ...newlyProcessedItems];
      const newTimeline = EvidenceIntelligenceService.buildTimelineFromEvidence(updated);
      setTimelineEvents(newTimeline);
      return updated;
    });

    setIsProcessing(false);
    setUploadSuccessMessage(
      `Successfully encrypted and vaulted ${files.length} evidence file${files.length > 1 ? 's' : ''} in Supabase.`
    );
  };

  const executeTextUpload = async (text: string, title: string | undefined, user: User) => {
    const mockFile = new File([text], title || 'Pasted_Evidence_Notice.txt', { type: 'text/plain' });
    await executeFilesUpload([mockFile], user);
  };

  /**
   * TRIGGER: Invoked when the user selects files in the uploader.
   * If not authenticated: triggers authentication modal and stores pending upload.
   * If authenticated: proceeds directly with upload.
   */
  const handleFilesSelected = async (files: File[]) => {
    if (!currentUser) {
      setPendingUpload({ type: 'files', files });
      setIsUploaderOpen(false);
      setIsAuthModalOpen(true);
      return;
    }

    await executeFilesUpload(files, currentUser);
  };

  /**
   * TRIGGER: Invoked when user pastes text in the uploader.
   */
  const handleTextImported = async (text: string, title?: string) => {
    if (!currentUser) {
      setPendingUpload({ type: 'text', text, title });
      setIsUploaderOpen(false);
      setIsAuthModalOpen(true);
      return;
    }

    await executeTextUpload(text, title, currentUser);
  };

  /**
   * Invoked after successful authentication:
   * Automatically resumes pending upload!
   */
  const handleAuthSuccess = async (user: User) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setAuthNotification(`Signed in as ${user.email}. Private vault active.`);

    if (pendingUpload) {
      if (pendingUpload.type === 'files') {
        const filesToUpload = pendingUpload.files;
        setPendingUpload(null);
        await executeFilesUpload(filesToUpload, user);
      } else if (pendingUpload.type === 'text') {
        const { text, title } = pendingUpload;
        setPendingUpload(null);
        await executeTextUpload(text, title, user);
      }
    } else {
      await loadUserRecords(user.id);
    }
  };

  /**
   * Invoked when authentication is cancelled:
   * Returns to the Evidence page without uploading the file.
   */
  const handleAuthCancel = () => {
    setPendingUpload(null);
    setIsAuthModalOpen(false);
  };

  /**
   * Sign out handler
   */
  const handleSignOut = async () => {
    await SupabaseAuth.signOut();
    setCurrentUser(null);
    setAuthNotification(null);
    setUploadSuccessMessage(null);
  };

  // Update item type
  const handleChangeItemType = async (itemId: string, newType: EvidenceType) => {
    setEvidenceItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, type: newType, isAiClassified: false } : item))
    );
    if (currentUser) {
      await SupabaseEvidenceVault.updateEvidenceRecord(itemId, currentUser.id, {
        evidence_type: newType
      });
    }
  };

  // Add user note
  const handleAddNote = async (itemId: string, note: string) => {
    const item = evidenceItems.find(i => i.id === itemId);
    const updatedNotes = item ? [...item.userNotes, note] : [note];

    setEvidenceItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, userNotes: [...i.userNotes, note] } : i
      )
    );
    if (selectedItem?.id === itemId) {
      setSelectedItem((prev) => (prev ? { ...prev, userNotes: [...prev.userNotes, note] } : null));
    }

    if (currentUser && item) {
      await SupabaseEvidenceVault.updateEvidenceRecord(itemId, currentUser.id, {
        user_notes: updatedNotes
      });
    }
  };

  // Toggle review status
  const handleToggleReviewStatus = async (itemId: string) => {
    const item = evidenceItems.find(i => i.id === itemId);
    const nextStatus = item?.reviewStatus === 'reviewed' ? 'needs-review' : 'reviewed';

    setEvidenceItems((prev) =>
      prev.map((i) => {
        if (i.id === itemId) {
          return { ...i, reviewStatus: nextStatus };
        }
        return i;
      })
    );
    if (selectedItem?.id === itemId) {
      setSelectedItem((prev) =>
        prev
          ? { ...prev, reviewStatus: nextStatus }
          : null
      );
    }

    if (currentUser && item) {
      await SupabaseEvidenceVault.updateEvidenceRecord(itemId, currentUser.id, {
        review_status: nextStatus
      });
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId: string) => {
    const item = evidenceItems.find(i => i.id === itemId);
    setEvidenceItems((prev) => prev.filter((i) => i.id !== itemId));
    setTimelineEvents((prev) => prev.filter((e) => !e.evidenceIds.includes(itemId)));
    if (selectedItem?.id === itemId) setSelectedItem(null);

    if (currentUser && item) {
      await SupabaseEvidenceVault.deleteEvidenceRecord(
        itemId,
        item.metadata?.source || '',
        currentUser.id
      );
    }
  };

  // Hand-off to Feature 01 (AI Assistant)
  const handleAskQuestion = (question: string) => {
    const summary = `Regarding my evidence record (${evidenceItems.length} items, ${timelineEvents.length} events): ${question}`;
    onNavigateToAssistantWithPrompt(summary);
  };

  const handleOpenAssistantWithContext = () => {
    const prompt = `I have organized an evidence record with ${evidenceItems.length} items (including ${metrics.totalDocuments} documents and ${metrics.totalScreenshots} screenshots). The key events span from ${timelineEvents[0]?.formattedDateTime || 'recent dates'}. What are my statutory legal rights and recommended next steps under BNSS 2023?`;
    onNavigateToAssistantWithPrompt(prompt);
  };

  // Filtered evidence items
  const filteredItems = useMemo(() => {
    return evidenceItems.filter((item) => {
      // Type filter
      if (selectedTypeFilter === 'needs-review' && item.reviewStatus !== 'needs-review') {
        return false;
      } else if (selectedTypeFilter !== 'all' && selectedTypeFilter !== 'needs-review' && item.type !== selectedTypeFilter) {
        return false;
      }

      // Entity filter
      if (selectedEntityFilter && !item.entities.some((e) => e.value.toLowerCase() === selectedEntityFilter.toLowerCase())) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesFilename = item.filename.toLowerCase().includes(q);
        const matchesText = item.extractedText?.toLowerCase().includes(q);
        const matchesEntity = item.entities.some((e) => e.value.toLowerCase().includes(q));
        const matchesNote = item.userNotes.some((n) => n.toLowerCase().includes(q));
        if (!matchesFilename && !matchesText && !matchesEntity && !matchesNote) {
          return false;
        }
      }

      return true;
    });
  }, [evidenceItems, selectedTypeFilter, selectedEntityFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 selection:bg-purple-500 selection:text-slate-950">
      
      {/* Top Sticky Header */}
      <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          <button
            type="button"
            onClick={onNavigateBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs sm:text-sm font-semibold cursor-pointer group shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Nyaya Now</span>
          </button>

          {/* Center Badge */}
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 font-mono text-xs font-black border border-purple-500/40">
              04
            </span>
            <span className="text-xs sm:text-sm font-black tracking-tight text-white uppercase hidden sm:inline">
              Evidence Intelligence
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {(['en', 'hi', 'te'] as Language[]).map((lng) => (
                <button
                  key={lng}
                  type="button"
                  onClick={() => onLanguageChange(lng)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    language === lng
                      ? 'bg-purple-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {lng === 'en' ? 'EN' : lng === 'hi' ? 'हिंदी' : 'తెలుగు'}
                </button>
              ))}
            </div>

            {/* Supabase Vault User Session Badge */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                <div 
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium"
                  title={`Authenticated as ${currentUser.email}`}
                >
                  <Lock className="w-3 h-3 text-purple-400 shrink-0" />
                  <span className="max-w-[130px] truncate">{currentUser.email}</span>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-2 py-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                  title="Sign out of Evidence Vault"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-medium cursor-pointer transition-colors"
                  title="Sign in to your private Evidence Vault"
                >
                  <Lock className="w-3 h-3 text-purple-400" />
                  <span>Vault Sign In</span>
                </button>
              </div>
            )}

            {/* Quick Add CTA */}
            {evidenceItems.length > 0 && (
              <button
                type="button"
                onClick={() => setIsUploaderOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-6">

        {/* FEEDBACK BANNERS */}
        {uploadSuccessMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-emerald-300 text-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-medium leading-relaxed">{uploadSuccessMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setUploadSuccessMessage(null)}
              className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {authNotification && (
          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between gap-3 text-purple-300 text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{authNotification}</span>
            </div>
            <button
              type="button"
              onClick={() => setAuthNotification(null)}
              className="p-1 rounded-lg hover:bg-purple-500/20 text-purple-400 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {uploadError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 text-rose-300 text-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span className="font-medium leading-relaxed">{uploadError}</span>
            </div>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* HERO SECTION */}
        <EvidenceHero
          metrics={metrics}
          onAddEvidence={() => setIsUploaderOpen(true)}
          onLoadDemoData={handleLoadDemoData}
          onExport={() => setIsExportOpen(true)}
          onClearWorkspace={handleClearWorkspace}
          language={language}
          hasItems={evidenceItems.length > 0}
        />

        {/* PROCESSING MODAL/VIEW IF ACTIVE */}
        {isProcessing && (
          <div className="py-6 sm:py-12">
            <EvidenceProcessingPipeline
              fileName={processingFileName}
              currentStage={processingStage}
              statusText={processingStatus}
              progressPercent={processingPercent}
            />
          </div>
        )}

        {/* EMPTY STATE */}
        {!isProcessing && evidenceItems.length === 0 && (
          <EvidenceEmptyState
            onAddEvidence={() => setIsUploaderOpen(true)}
            onLoadDemoData={handleLoadDemoData}
          />
        )}

        {/* MAIN WORKSPACE CONTENT */}
        {!isProcessing && evidenceItems.length > 0 && (
          <div className="space-y-6">
            
            {/* WORKSPACE NAVIGATION TABS */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto max-w-full">
                
                <button
                  type="button"
                  onClick={() => setActiveTab('library')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    activeTab === 'library'
                      ? 'bg-purple-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Evidence Library ({evidenceItems.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('timeline')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    activeTab === 'timeline'
                      ? 'bg-purple-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Timeline ({timelineEvents.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('connections')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    activeTab === 'connections'
                      ? 'bg-purple-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>Connections ({connections.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('entities')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    activeTab === 'entities'
                      ? 'bg-purple-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>People & Entities</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('gaps')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    activeTab === 'gaps'
                      ? 'bg-purple-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <FileQuestion className="w-3.5 h-3.5" />
                  <span>Gaps & Completeness ({gaps.length})</span>
                </button>

              </div>

              {/* View Count Badge */}
              <div className="text-xs text-slate-400 font-mono">
                Showing {filteredItems.length} of {evidenceItems.length} items
              </div>
            </div>

            {/* TAB VIEW 1: EVIDENCE LIBRARY */}
            {activeTab === 'library' && (
              <div className="space-y-6">
                
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search filename, OCR text, notes or identified people…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {[
                      { id: 'all', label: 'All Items' },
                      { id: 'screenshot', label: 'Screenshots' },
                      { id: 'document', label: 'Documents' },
                      { id: 'notice', label: 'Notices' },
                      { id: 'message', label: 'Messages' },
                      { id: 'needs-review', label: 'Needs Review' }
                    ].map((pill) => (
                      <button
                        key={pill.id}
                        type="button"
                        onClick={() => setSelectedTypeFilter(pill.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          selectedTypeFilter === pill.id
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Entity active filter indicator */}
                {selectedEntityFilter && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs">
                    <span>Filtering by entity: <strong>{selectedEntityFilter}</strong></span>
                    <button
                      type="button"
                      onClick={() => setSelectedEntityFilter(null)}
                      className="ml-auto text-purple-400 hover:text-white underline cursor-pointer"
                    >
                      Clear Filter
                    </button>
                  </div>
                )}

                {/* Grid of Evidence Cards */}
                {filteredItems.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-2">
                    <p className="text-slate-400 text-sm">No evidence items match the current filters.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedTypeFilter('all');
                        setSelectedEntityFilter(null);
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300 underline cursor-pointer"
                    >
                      Reset all filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map((item) => (
                      <EvidenceCard
                        key={item.id}
                        item={item}
                        onSelect={() => setSelectedItem(item)}
                        onDelete={() => handleDeleteItem(item.id)}
                        onToggleReview={() => handleToggleReviewStatus(item.id)}
                      />
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* TAB VIEW 2: TIMELINE */}
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                <EvidenceTimeline
                  events={timelineEvents}
                  evidenceItems={evidenceItems}
                  onSelectEvidence={(it) => setSelectedItem(it)}
                />
              </div>
            )}

            {/* TAB VIEW 3: CONNECTIONS */}
            {activeTab === 'connections' && (
              <EvidenceRelationshipMap
                connections={connections}
                evidenceItems={evidenceItems}
                onSelectEvidence={(it) => setSelectedItem(it)}
              />
            )}

            {/* TAB VIEW 4: PEOPLE & ENTITIES */}
            {activeTab === 'entities' && (
              <div className="space-y-6">
                <EntityExplorer
                  evidenceItems={evidenceItems}
                  selectedEntityValue={selectedEntityFilter}
                  onSelectEntity={(val) => {
                    setSelectedEntityFilter(val);
                    if (val) setActiveTab('library');
                  }}
                />
              </div>
            )}

            {/* TAB VIEW 5: GAPS & COMPLETENESS */}
            {activeTab === 'gaps' && (
              <EvidenceGapAnalysis
                gaps={gaps}
                metrics={metrics}
                evidenceItems={evidenceItems}
                onAddEvidence={() => setIsUploaderOpen(true)}
                onSelectEvidenceById={(id) => {
                  const it = evidenceItems.find((i) => i.id === id);
                  if (it) setSelectedItem(it);
                }}
              />
            )}

            {/* ASK NYAYA ABOUT THIS EVIDENCE (Hand-off to Feature 01 & 02) */}
            <div className="pt-6">
              <AskNyayaEvidencePanel
                evidenceItems={evidenceItems}
                events={timelineEvents}
                onAskQuestion={handleAskQuestion}
                onOpenAssistantWithContext={handleOpenAssistantWithContext}
                onOpenVoiceAssistant={onNavigateToVoiceAssistant}
                language={language}
              />
            </div>

          </div>
        )}

      </div>

      {/* MODAL 1: ADD EVIDENCE UPLOADER */}
      {isUploaderOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <EvidenceUploader
            onFilesSelected={handleFilesSelected}
            onTextImported={handleTextImported}
            onClose={() => setIsUploaderOpen(false)}
            language={language}
          />
        </div>
      )}

      {/* MODAL 2: EVIDENCE AUTHENTICATION MODAL (Triggered only when uploading evidence) */}
      <EvidenceAuthModal
        isOpen={isAuthModalOpen}
        onSuccess={handleAuthSuccess}
        onCancel={handleAuthCancel}
        pendingCount={pendingUpload?.type === 'files' ? pendingUpload.files.length : 1}
        pendingType={pendingUpload?.type || 'files'}
      />

      {/* MODAL 3: EVIDENCE DETAIL PANEL */}
      {selectedItem && (
        <EvidenceDetailPanel
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddNote={handleAddNote}
          onToggleReviewStatus={handleToggleReviewStatus}
          onDeleteItem={handleDeleteItem}
          onChangeType={handleChangeItemType}
          onNavigateToDocumentIntelligence={onNavigateToDocumentIntelligence}
        />
      )}

      {/* MODAL 4: EXPORT RECORD */}
      {isExportOpen && (
        <EvidenceExportModal
          evidenceItems={evidenceItems}
          events={timelineEvents}
          gaps={gaps}
          onClose={() => setIsExportOpen(false)}
          onNavigateToLawyerConnection={onNavigateToLawyerConnection}
        />
      )}

    </div>
  );
};
