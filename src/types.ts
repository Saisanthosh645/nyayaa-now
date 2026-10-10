export type Language = 'en' | 'hi' | 'te';

export type SourceType = 'PRIMARY_LAW' | 'OFFICIAL_GOVERNMENT' | 'JUDICIAL' | 'LEGAL_AID';

export interface LegalBasis {
  law: string;
  section?: string;
  article?: string;
  sourceName: string;
  sourceUrl: string;
  lastVerified: string;
  sourceType: SourceType;
}

export interface LegalSource {
  id: string;
  title: string;
  organization: string;
  legalSection?: string;
  url: string;
  type: 'statute' | 'judgment' | 'guideline' | 'portal';
  sourceType?: SourceType;
  officialBadge?: boolean;
  summary: string;
  lastReviewed: string;
  category?: 'CONSTITUTION' | 'CRIMINAL_PROCEDURE' | 'LEGAL_AID' | 'JUDICIAL' | 'HUMAN_RIGHTS' | 'PUBLIC_AUTHORITIES';
}

export interface SayThisPhrase {
  id: string;
  situation: string;
  english: string;
  hindi: string;
  telugu: string;
  context: string;
}

export interface RightItem {
  id: string;
  title: string;
  plainLanguage: string;
  legalBasis: LegalBasis;
  scopeNote?: string;
  confidence: 'verified';
  // Legacy / fallback fields
  description?: string;
  bnssSection?: string;
  crpcEquivalent?: string;
  constitutionArticle?: string;
  sourceId?: string;
  landmarkCase?: string;
  legalSection?: string;
  organization?: string;
  portal?: string;
  specialNote?: string;
}

export interface ActionStep {
  number: number;
  title: string;
  instruction: string;
  detail?: string;
  urgent?: boolean;
}

export interface DontItem {
  text: string;
  reason: string;
}

export interface EscalationNode {
  level: number;
  title: string;
  designation: string;
  description: string;
  action: string;
  timeframe?: string;
  statutoryBasis?: string;
}

export interface SpecialSafeguard {
  group: 'women' | 'children' | 'seniors' | 'disabilities' | 'general';
  title: string;
  protection: string;
  statutoryProvision: string;
  sourceUrl?: string;
}

export interface ConstitutionalRight {
  article: string;
  title: string;
  plainExplanation: string;
  scopeAndExceptions: string;
  sourceUrl: string;
}

export interface Situation {
  id: string;
  slug: string;
  icon: string;
  title: string;
  shortDescription: string;
  emergencyTag?: string;
  badgeText?: string;
  quick30SecSummary: string[];
  constitutionalProtection?: ConstitutionalRight;
  rights: RightItem[];
  actions: ActionStep[];
  donts: DontItem[];
  sayThis: SayThisPhrase[];
  specialSafeguards?: SpecialSafeguard[];
  escalationPath: EscalationNode[];
  sourceIds: string[];
  specialGuide?: {
    title: string;
    content: string;
    points: string[];
    statutoryRef?: string;
  };
  keywords: string[];
  needsLegalAid?: boolean;
}

export interface StateHelpline {
  state: string;
  policeControlRoom: string;
  acbTollFree: string;
  womenHelpline: string;
  cyberCell: string;
  portalUrl?: string;
}

export type ActiveView = 
  | { type: 'home' }
  | { type: 'ai-assistant' }
  | { type: 'voice-assistant' }
  | { type: 'document-intelligence' }
  | { type: 'contract-scanner' }
  | { type: 'evidence-intelligence' }
  | { type: 'lawyer-connection' }
  | { type: 'situation'; slug: string }
  | { type: 'complaints'; subCategory?: string }
  | { type: 'sources' }
  | { type: 'methodology' }
  | { type: 'assessment' }
  | { type: 'helplines' };

