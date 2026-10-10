import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  RotateCcw, 
  Scale, 
  Lightbulb, 
  ChevronRight, 
  ChevronUp, 
  Copy, 
  Check, 
  CheckCircle2, 
  Edit3, 
  Search, 
  ShieldAlert,
  FileText,
  HelpCircle
} from 'lucide-react';
import { ContractClauseFinding } from '../../types/contractScanner';

interface ContractClauseReviewerProps {
  clauses: ContractClauseFinding[];
  onToggleReviewed: (clauseId: string) => void;
  onSaveNote: (clauseId: string, note: string) => void;
}

export const ContractClauseReviewer: React.FC<ContractClauseReviewerProps> = ({
  clauses,
  onToggleReviewed,
  onSaveNote
}) => {
  const [selectedAttention, setSelectedAttention] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<string>('');

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyClause = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startEditNote = (clause: ContractClauseFinding) => {
    setEditingNoteId(clause.id);
    setNoteInput(clause.userNote || '');
  };

  const saveNote = (clauseId: string) => {
    onSaveNote(clauseId, noteInput.trim());
    setEditingNoteId(null);
  };

  /**
   * Helper to determine icon, badge label, and category pill tags for each clause
   */
  const getClauseVisuals = (clause: ContractClauseFinding) => {
    const text = (clause.clauseHeading + ' ' + clause.originalClauseText).toLowerCase();

    let icon = <AlertTriangle className="w-5 h-5 text-red-400" />;
    let tags: string[] = [];

    // Tag and icon mapping matching high-end legal review
    if (text.includes('renewal') || text.includes('evergreen') || text.includes('successive')) {
      icon = <RotateCcw className="w-5 h-5 text-amber-400" />;
      tags = ['Renewal', 'Contract Duration'];
    } else if (text.includes('notice') || text.includes('termination') && text.includes('days')) {
      icon = <Clock className="w-5 h-5 text-amber-400" />;
      tags = ['Termination', 'Notice Period'];
    } else if (text.includes('forfeit') || text.includes('liquidated damage') || text.includes('lock-in') || text.includes('deposit')) {
      icon = <AlertTriangle className="w-5 h-5 text-red-400" />;
      tags = ['Financial Terms', 'Termination'];
    } else if (text.includes('governing law') || text.includes('jurisdiction') || text.includes('courts') || text.includes('dispute') || text.includes('arbitration')) {
      icon = <Scale className="w-5 h-5 text-blue-400" />;
      tags = ['Jurisdiction', 'Dispute Resolution'];
    } else if (text.includes('paint') || text.includes('deduction') || text.includes('cleaning')) {
      icon = <AlertTriangle className="w-5 h-5 text-red-400" />;
      tags = ['Financial Terms', 'Move-Out Deduction'];
    } else if (text.includes('non-compete') || text.includes('restraint') || text.includes('non-solicit')) {
      icon = <ShieldAlert className="w-5 h-5 text-red-400" />;
      tags = ['Employment Terms', 'Restraint of Trade'];
    } else if (text.includes('intellectual property') || text.includes('inventions') || text.includes('copyright')) {
      icon = <FileText className="w-5 h-5 text-amber-400" />;
      tags = ['Intellectual Property', 'Invention Assignment'];
    } else if (text.includes('inspection') || text.includes('enter and inspect')) {
      icon = <Clock className="w-5 h-5 text-amber-400" />;
      tags = ['Tenant Privacy', 'Access Rights'];
    } else if (text.includes('bonus') || text.includes('clawback')) {
      icon = <AlertTriangle className="w-5 h-5 text-red-400" />;
      tags = ['Financial Terms', 'Clawback Clause'];
    } else if (text.includes('indemn') || text.includes('liability')) {
      icon = <AlertTriangle className="w-5 h-5 text-red-400" />;
      tags = ['Liability', 'Risk Allocation'];
    } else {
      // Default fallback by category
      switch (clause.category) {
        case 'financial':
          tags = ['Financial Terms', 'Payment Terms'];
          icon = <AlertTriangle className="w-5 h-5 text-red-400" />;
          break;
        case 'termination':
          tags = ['Termination', 'Exit Provisions'];
          icon = <Clock className="w-5 h-5 text-amber-400" />;
          break;
        case 'disputes':
          tags = ['Jurisdiction', 'Dispute Resolution'];
          icon = <Scale className="w-5 h-5 text-blue-400" />;
          break;
        case 'ip_confidentiality':
          tags = ['Intellectual Property', 'Confidentiality'];
          icon = <FileText className="w-5 h-5 text-amber-400" />;
          break;
        case 'obligations':
          tags = ['Obligations', 'Restrictions'];
          icon = <Clock className="w-5 h-5 text-amber-400" />;
          break;
        default:
          tags = ['General Terms', 'Contract Duration'];
          icon = clause.attentionLevel === 'High attention'
            ? <AlertTriangle className="w-5 h-5 text-red-400" />
            : clause.attentionLevel === 'Needs clarification'
            ? <Clock className="w-5 h-5 text-amber-400" />
            : <Scale className="w-5 h-5 text-blue-400" />;
      }
    }

    return { icon, tags };
  };

  // Collect all available unique tags across clauses for filtering
  const allUniqueTags = Array.from(
    new Set(clauses.flatMap((c) => getClauseVisuals(c).tags))
  );

  // Filter clauses
  const filteredClauses = clauses.filter((c) => {
    if (selectedAttention !== 'all' && c.attentionLevel !== selectedAttention) {
      return false;
    }
    if (selectedTag !== 'all') {
      const { tags } = getClauseVisuals(c);
      if (!tags.includes(selectedTag)) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchHeading = c.clauseHeading.toLowerCase().includes(q);
      const matchQuote = c.originalClauseText.toLowerCase().includes(q);
      const matchPlain = c.plainEnglishExplanation.toLowerCase().includes(q);
      const matchFix = c.suggestedNextStep.toLowerCase().includes(q);
      const { tags } = getClauseVisuals(c);
      const matchTag = tags.some((t) => t.toLowerCase().includes(q));
      return matchHeading || matchQuote || matchPlain || matchFix || matchTag;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Filter & Control Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#090d16] border border-slate-800/90 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            Contract Flaws & Clause Review
          </h3>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-900 text-cyan-300 border border-slate-800">
            {filteredClauses.length} {filteredClauses.length === 1 ? 'clause' : 'clauses'} found
          </span>
        </div>

        {/* Quick Search & Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Filter clauses, snippets, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0d1424] border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-500 outline-none transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
          </div>

          <select
            value={selectedAttention}
            onChange={(e) => setSelectedAttention(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#0d1424] border border-slate-800 focus:border-cyan-400 text-xs text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="High attention">🚨 High Attention</option>
            <option value="Needs clarification">⚠️ Needs Clarification</option>
            <option value="Informational">ℹ️ Informational</option>
          </select>

          {allUniqueTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#0d1424] border border-slate-800 focus:border-cyan-400 text-xs text-slate-200 outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {allUniqueTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Flaws List: Horizontal Sleek Strips */}
      {filteredClauses.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#090d16] border border-slate-800/80 space-y-2">
          <p className="text-sm text-slate-300 font-bold">No clauses match your current filter.</p>
          <p className="text-xs text-slate-500">
            Try resetting your search query or severity filter to view all detected findings.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredClauses.map((clause) => {
            const isHigh = clause.attentionLevel === 'High attention';
            const isClarify = clause.attentionLevel === 'Needs clarification';
            const isInformational = clause.attentionLevel === 'Informational';
            const isExpanded = !!expandedIds[clause.id];
            const isReviewed = !!clause.isReviewed;
            const visuals = getClauseVisuals(clause);

            // Severity display text
            const badgeLabel = isHigh
              ? 'High Attention'
              : isClarify
              ? 'Needs Clarification'
              : 'Informational';

            // Distinct card styling by attention level matching user's screenshot
            const cardThemeClass = isHigh
              ? 'border-red-600/80 bg-gradient-to-r from-[#200d12]/70 via-[#0b101c] to-[#0b101c] shadow-[0_0_20px_rgba(220,38,38,0.12)] hover:border-red-500'
              : isClarify
              ? 'border-amber-500/75 bg-gradient-to-r from-[#22180d]/70 via-[#0b101c] to-[#0b101c] shadow-[0_0_20px_rgba(217,119,6,0.12)] hover:border-amber-400'
              : 'border-blue-600/80 bg-gradient-to-r from-[#0d182b]/70 via-[#0b101c] to-[#0b101c] shadow-[0_0_20px_rgba(37,99,235,0.12)] hover:border-blue-400';

            const iconContainerClass = isHigh
              ? 'bg-[#2c1015] border border-red-500/40 text-red-400'
              : isClarify
              ? 'bg-[#2b1d0c] border border-amber-500/40 text-amber-400'
              : 'bg-[#0a1e38] border border-blue-500/40 text-blue-400';

            const badgePillClass = isHigh
              ? 'bg-[#371219] text-[#f87171] border border-red-500/40'
              : isClarify
              ? 'bg-[#35210b] text-[#fbbf24] border border-amber-500/40'
              : 'bg-[#0d2242] text-[#60a5fa] border border-blue-500/40';

            return (
              <div
                key={clause.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${cardThemeClass} ${
                  isReviewed ? 'opacity-90' : ''
                }`}
              >
                {/* ── THE HORIZONTAL STRIP (MATCHING SCREENSHOT) ── */}
                <div className="p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 xl:gap-6">
                  {/* COLUMN 1: Icon + Title & Tags */}
                  <div className="flex items-start gap-3.5 xl:w-[32%] shrink-0">
                    {/* Rounded Icon Circle */}
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-sm ${iconContainerClass}`}
                    >
                      {visuals.icon}
                    </div>

                    {/* Title + Severity Pill + Category Tags */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-[15px] font-bold text-white tracking-tight leading-snug">
                          {clause.clauseHeading}
                        </h4>
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full tracking-wide shrink-0 ${badgePillClass}`}
                        >
                          {badgeLabel}
                        </span>
                      </div>

                      {/* Sub-tags */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        {visuals.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 rounded-full bg-[#121c2e] border border-slate-700/60 text-slate-300 text-[11px] font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* COLUMN 2: Key Snippet */}
                  <div className="xl:w-[33%] min-w-0 border-t xl:border-t-0 border-slate-800/60 pt-3 xl:pt-0">
                    <div className="text-[11px] font-medium text-slate-400 mb-1">
                      Key Snippet
                    </div>
                    <p className="italic text-xs sm:text-[13px] text-slate-200/95 leading-relaxed line-clamp-3">
                      “{clause.originalClauseText}”
                    </p>
                  </div>

                  {/* COLUMN 3: Suggested Counter-Action */}
                  <div className="xl:w-[25%] min-w-0 border-t xl:border-t-0 border-slate-800/60 pt-3 xl:pt-0">
                    <div className="text-[11px] font-medium text-cyan-300/90 mb-1 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Suggested Counter-Action</span>
                    </div>
                    <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed line-clamp-3">
                      {clause.suggestedNextStep ||
                        'Negotiate a fairer cap or seek written clarification on this provision.'}
                    </p>
                  </div>

                  {/* COLUMN 4: View Details Button */}
                  <div className="shrink-0 flex items-center xl:justify-end border-t xl:border-t-0 border-slate-800/60 pt-3 xl:pt-0">
                    <button
                      type="button"
                      onClick={() => toggleExpand(clause.id)}
                      className="px-4 py-2 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] border border-slate-700/80 text-slate-200 text-xs sm:text-[13px] font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap active:scale-98"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isExpanded ? 'rotate-90 text-cyan-400' : 'text-slate-400'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* ── EXPANDED FULL CLAUSE DETAILS DRAWER ── */}
                {isExpanded && (
                  <div className="border-t border-slate-800/80 bg-[#070b14]/90 p-4 sm:p-6 space-y-4 transition-all">
                    {/* Header Bar with Location & Actions */}
                    <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-850 pb-3">
                      <div className="flex items-center gap-2">
                        {clause.sourceLocation && (
                          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 font-semibold">
                            Source: {clause.sourceLocation}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          Comprehensive Legal Analysis
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Toggle Reviewed */}
                        <button
                          type="button"
                          onClick={() => onToggleReviewed(clause.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isReviewed
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isReviewed ? 'Marked as Reviewed' : 'Mark as Reviewed'}</span>
                        </button>

                        {/* Copy Clause */}
                        <button
                          type="button"
                          onClick={() => handleCopyClause(clause.originalClauseText, clause.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedId === clause.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-300">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Snippet</span>
                            </>
                          )}
                        </button>

                        {/* Add / Edit Note */}
                        <button
                          type="button"
                          onClick={() => startEditNote(clause)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{clause.userNote ? 'Edit Note' : 'Add Note'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Content Section: 2 Column Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Left Side: Plain English Breakdown & Hidden Risk */}
                      <div className="space-y-3">
                        <div
                          className={`p-4 rounded-xl border leading-relaxed ${
                            isHigh
                              ? 'bg-red-950/20 border-red-900/50 text-red-200'
                              : isClarify
                              ? 'bg-amber-950/20 border-amber-900/40 text-amber-200'
                              : 'bg-slate-900/50 border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                            <span>Plain-English Translation</span>
                          </div>
                          <p className="text-sm font-semibold text-white mb-2">
                            {clause.plainEnglishExplanation}
                          </p>
                          <div className="text-xs space-y-1 text-slate-300 pt-2 border-t border-slate-800/60">
                            <span className="font-bold text-slate-200">The Legal & Financial Risk: </span>
                            <span>{clause.whyItMatters}</span>
                          </div>
                        </div>

                        {/* Full Verbatim Contract Clause */}
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850">
                          <div className="text-[11px] font-mono uppercase font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                            <span>Full Verbatim Clause in Document:</span>
                          </div>
                          <div className="font-mono text-xs text-amber-200/90 leading-relaxed pl-2.5 border-l-2 border-amber-500/50 selection:bg-amber-500/20 max-h-48 overflow-y-auto">
                            “{clause.originalClauseText}”
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Counter-Action, Questions & Indian Law */}
                      <div className="space-y-3">
                        {/* Negotiation Fix / Counter-Proposal */}
                        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/25 space-y-1.5">
                          <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wide">
                            <Lightbulb className="w-4 h-4 text-cyan-400" />
                            <span>Recommended Counter-Action & Fix:</span>
                          </div>
                          <p className="text-xs sm:text-[13px] text-cyan-100 leading-relaxed font-medium">
                            {clause.suggestedNextStep}
                          </p>
                        </div>

                        {/* Questions to Ask */}
                        {clause.questionsToAsk && clause.questionsToAsk.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-850 space-y-2">
                            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                              <span>Questions to Ask Before Signing:</span>
                            </div>
                            <ul className="space-y-1.5 text-xs text-slate-300">
                              {clause.questionsToAsk.map((q, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-amber-400 font-bold shrink-0">•</span>
                                  <span>{q}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Indian Statutory Grounding */}
                        {clause.applicableLaw && (
                          <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs text-blue-200 space-y-1">
                            <div className="flex items-center gap-1.5 text-blue-300 font-bold font-mono text-[11px]">
                              <Scale className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span>
                                {clause.applicableLaw.act}
                                {clause.applicableLaw.section ? ` — ${clause.applicableLaw.section}` : ''}
                              </span>
                              {clause.applicableLaw.verified && (
                                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                                  Statute Verified
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed pl-5">
                              {clause.applicableLaw.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* User Note Editor */}
                    {editingNoteId === clause.id ? (
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-2.5 text-xs mt-3">
                        <label className="font-bold text-white flex items-center gap-1.5">
                          <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Personal Note for this Clause:</span>
                        </label>
                        <textarea
                          rows={2}
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          placeholder="e.g. Landlord verbally agreed to reduce this to 1 month or waive if replacement found."
                          className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-cyan-400 transition-colors"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => saveNote(clause.id)}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors"
                          >
                            Save Note
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingNoteId(null)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : clause.userNote ? (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Edit3 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>
                            <strong className="text-white">Your Note:</strong> {clause.userNote}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => startEditNote(clause)}
                          className="text-amber-400 hover:text-white underline text-xs font-semibold ml-3 cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
