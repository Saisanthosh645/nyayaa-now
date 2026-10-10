export type ContractCategory =
  | 'rental'
  | 'employment'
  | 'loan'
  | 'service'
  | 'freelance'
  | 'nda'
  | 'purchase'
  | 'other';

export type AttentionLevel = 'High attention' | 'Needs clarification' | 'Informational';

export type RiskCategory =
  | 'financial'
  | 'termination'
  | 'obligations'
  | 'disputes'
  | 'ambiguity'
  | 'ip_confidentiality';

export interface ApplicableLawRef {
  act: string;
  section?: string;
  explanation: string;
  verified: boolean;
  sourceUrl?: string;
}

export interface ContractClauseFinding {
  id: string;
  category: RiskCategory;
  attentionLevel: AttentionLevel;
  clauseHeading: string;
  originalClauseText: string;
  sourceLocation?: string;
  plainEnglishExplanation: string;
  whatYouAreAgreeingTo: string;
  whyItMatters: string;
  questionsToAsk: string[];
  suggestedNextStep: string;
  isReviewed?: boolean;
  userNote?: string;
  applicableLaw?: ApplicableLawRef;
}

export interface ContractObligation {
  id: string;
  party: string;
  obligation: string;
  isFinancial: boolean;
  conditions?: string;
  supportingClause: string;
  status: 'explicit' | 'inferred';
}

export interface ContractDateDeadline {
  id: string;
  label: string;
  dateOrPeriod: string;
  isOperativeDeadline: boolean;
  supportingClause: string;
  implications: string;
}

export type QuestionStatus = 'not_asked' | 'asked' | 'answered';

export interface ContractQuestion {
  id: string;
  question: string;
  category:
    | 'Essential Clarifications'
    | 'Financial Questions'
    | 'Termination & Renewal'
    | 'Responsibilities & Restrictions'
    | 'For a Qualified Lawyer';
  whyAsk: string;
  targetParty: string;
  status: QuestionStatus;
}

export interface MissingInformationItem {
  item: string;
  reason: string;
  recommendation: string;
}

export interface ContractExecutiveSummary {
  agreementType: string;
  yourCommitment: string;
  counterpartyCommitment: string;
  majorFinancialTerms: string;
  criticalConditions: string;
  uncertaintiesToResolve: string;
}

export interface ContractParty {
  name: string;
  role: string;
  summary: string;
}

export interface ContractJurisdiction {
  stated: string;
  governingLaw: string;
  isIndianJurisdiction: boolean;
  note?: string;
}

export interface ContractAnalysisReport {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  detectedCategory: ContractCategory;
  userCategory?: ContractCategory;
  analysisTimestamp: string;
  overallStatus: 'Review complete' | 'Some clauses deserve attention' | 'Further review recommended';
  executiveSummary: ContractExecutiveSummary;
  metrics: {
    highAttentionCount: number;
    needsClarificationCount: number;
    informationalCount: number;
    financialObligationsCount: number;
    deadlinesCount: number;
    missingItemsCount: number;
  };
  parties: ContractParty[];
  jurisdiction: ContractJurisdiction;
  clauses: ContractClauseFinding[];
  obligations: ContractObligation[];
  importantDates: ContractDateDeadline[];
  questions: ContractQuestion[];
  missingInformation: MissingInformationItem[];
  disclaimers: string[];
  rawExtractedText?: string;
  isSample?: boolean;
}
