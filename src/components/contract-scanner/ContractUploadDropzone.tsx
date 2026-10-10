import React, { useRef, useState } from 'react';
import { 
  Upload, 
  FileText, 
  Lock, 
  AlertCircle, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  FileSearch,
  FileType
} from 'lucide-react';
import { ContractCategory } from '../../types/contractScanner';

interface ContractUploadDropzoneProps {
  onFileSelect: (file: File) => void;
  onTextPaste: (text: string, title?: string) => void;
  selectedFile: File | null;
  onClearFile: () => void;
  onStartAnalysis: () => void;
  isProcessing: boolean;
  selectedCategory: ContractCategory | null;
  errorMessage?: string | null;
}

export const ContractUploadDropzone: React.FC<ContractUploadDropzoneProps> = ({
  onFileSelect,
  onTextPaste,
  selectedFile,
  onClearFile,
  onStartAnalysis,
  isProcessing,
  selectedCategory,
  errorMessage
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragOver, setIsDragOver] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [pastedTitle, setPastedTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pastedText.trim().length >= 30) {
      onTextPaste(pastedText.trim(), pastedTitle.trim() || 'Pasted_Contract.txt');
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept=".pdf,.docx,.txt,.md"
        className="hidden"
      />

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Clause Text</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
          <FileType className="w-3.5 h-3.5 text-cyan-400" />
          <span>PDF • DOCX • TXT (Max 15MB)</span>
        </div>
      </div>

      {activeTab === 'upload' ? (
        /* Upload Area */
        <div>
          {!selectedFile ? (
            /* Dropzone Empty State */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group relative rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer overflow-hidden ${
                isDragOver
                  ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_40px_rgba(6,182,212,0.25)] scale-[1.01]'
                  : 'border-slate-800 hover:border-cyan-500/50 bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950 shadow-2xl hover:shadow-[0_0_30px_rgba(6,182,212,0.12)]'
              }`}
            >
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
                {/* Central Icon */}
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shadow-xl group-hover:scale-105 group-hover:border-cyan-500/50 group-hover:shadow-cyan-500/20 transition-all">
                    <FileSearch className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.75]" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform">
                    <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>

                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Review a contract
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Upload a document to understand its important terms, obligations, and potential risks before signing.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                  >
                    Browse Files
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-slate-500">
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 font-mono">
                    .PDF
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 font-mono">
                    .DOCX
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 font-mono">
                    .TXT
                  </span>
                  <span>• Maximum size 15 MB</span>
                </div>
              </div>
            </div>
          ) : (
            /* Selected File Preview Box */
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{selectedFile.name}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Document'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClearFile}
                  disabled={isProcessing}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Remove file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                <div className="text-xs text-slate-400">
                  Ready to scan under: <strong className="text-cyan-300 capitalize">{selectedCategory || 'Auto-detect'}</strong>
                </div>

                <button
                  type="button"
                  onClick={onStartAnalysis}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                  <span>Start AI Contract Scan</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Paste Text Area */
        <form onSubmit={handlePasteSubmit} className="space-y-4">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Agreement Title (optional, e.g., NDA_Draft_2026.txt)"
              value={pastedTitle}
              onChange={(e) => setPastedTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-500 outline-none"
            />
            <textarea
              rows={8}
              placeholder="Paste contract text, specific clauses, or term sheet here (minimum 30 characters)…"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-500 outline-none font-mono leading-relaxed resize-y"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {pastedText.length} characters entered {pastedText.length < 30 ? '(minimum 30 required)' : ''}
            </span>

            <button
              type="submit"
              disabled={pastedText.trim().length < 30 || isProcessing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              Analyze Pasted Text
            </button>
          </div>
        </form>
      )}

      {/* Error notification if any */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
          <div className="flex-1 leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Privacy Explanation Callout */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            <strong>Private document handling:</strong> Processed in-memory. Never retained permanently by default. You can purge all data with 1 click.
          </span>
        </div>
      </div>
    </div>
  );
};
