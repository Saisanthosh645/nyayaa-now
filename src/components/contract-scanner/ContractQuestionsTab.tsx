import React, { useState } from 'react';
import { 
  HelpCircle, 
  Copy, 
  Check, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Circle, 
  ShieldAlert, 
  Send 
} from 'lucide-react';
import { ContractQuestion, QuestionStatus } from '../../types/contractScanner';
import { ContractScannerService } from '../../services/contractScannerService';

interface ContractQuestionsTabProps {
  questions: ContractQuestion[];
  contractTitle: string;
  onUpdateQuestionStatus: (questionId: string, status: QuestionStatus) => void;
}

export const ContractQuestionsTab: React.FC<ContractQuestionsTabProps> = ({
  questions,
  contractTitle,
  onUpdateQuestionStatus
}) => {
  const [copiedChecklist, setCopiedChecklist] = useState(false);

  const handleCopyChecklist = () => {
    const text = ContractScannerService.generateQuestionsChecklist(questions, contractTitle);
    navigator.clipboard.writeText(text);
    setCopiedChecklist(true);
    setTimeout(() => setCopiedChecklist(false), 2500);
  };

  // Group questions by category
  const categories: Array<ContractQuestion['category']> = [
    'Essential Clarifications',
    'Financial Questions',
    'Termination & Renewal',
    'Responsibilities & Restrictions',
    'For a Qualified Lawyer'
  ];

  return (
    <div className="space-y-6">
      {/* Header with Checklist Copy Action */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>Questions to Ask Before Signing</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Document-grounded discussion points to clarify with the counterparty or your lawyer.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyChecklist}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer shrink-0"
        >
          {copiedChecklist ? (
            <>
              <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>Checklist Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Discussion Checklist</span>
            </>
          )}
        </button>
      </div>

      {/* Categories of Questions */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const group = questions.filter((q) => q.category === cat);
          if (group.length === 0) return null;

          return (
            <div key={cat} className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {cat}
                </h4>
                <span className="text-[10px] font-mono text-slate-500 px-2 py-0.2 rounded-full bg-slate-900">
                  {group.length}
                </span>
              </div>

              <div className="space-y-3">
                {group.map((q) => {
                  const isNotAsked = q.status === 'not_asked';
                  const isAsked = q.status === 'asked';
                  const isAnswered = q.status === 'answered';

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                            {q.question}
                          </p>
                          <div className="text-[11px] text-slate-400 leading-relaxed">
                            <strong className="text-cyan-300">Why to ask:</strong> {q.whyAsk}
                          </div>
                        </div>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
                          To: {q.targetParty}
                        </span>
                      </div>

                      {/* User-Managed Status Toggles */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                        <span className="text-[11px] text-slate-500">Your Discussion Status:</span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onUpdateQuestionStatus(q.id, 'not_asked')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                              isNotAsked
                                ? 'bg-slate-800 text-slate-200 border border-slate-700'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            <Circle className="w-2.5 h-2.5" />
                            <span>Not asked</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onUpdateQuestionStatus(q.id, 'asked')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                              isAsked
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            <Clock className="w-2.5 h-2.5" />
                            <span>Asked</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onUpdateQuestionStatus(q.id, 'answered')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                              isAnswered
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Answer received</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
        💡 <strong>Tip:</strong> Use the "Copy Discussion Checklist" button above to send these exact questions in an email or WhatsApp thread to the counterparty or your advocate before meeting to sign.
      </div>
    </div>
  );
};
