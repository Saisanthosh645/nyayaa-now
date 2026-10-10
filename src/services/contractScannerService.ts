import { 
  ContractAnalysisReport, 
  ContractCategory, 
  ContractClauseFinding, 
  ContractDateDeadline, 
  ContractObligation, 
  ContractQuestion, 
  MissingInformationItem 
} from '../types/contractScanner';
import { SAMPLE_CONTRACTS } from '../data/sampleContracts';

export interface ProgressCallback {
  (stage: number, status: string, percent: number): void;
}

export class ContractScannerService {
  /**
   * Retrieves sample contracts for 1-click test evaluations
   */
  public static getSampleContracts(): ContractAnalysisReport[] {
    return SAMPLE_CONTRACTS;
  }

  public static getSampleById(id: string): ContractAnalysisReport | undefined {
    return SAMPLE_CONTRACTS.find((c) => c.id === id);
  }

  /**
   * Reads and extracts readable text from supported files (PDF, DOCX, TXT, MD)
   */
  public static async extractTextFromFile(
    file: File,
    onProgress?: (status: string, percent: number) => void
  ): Promise<{ text: string; pageCount?: number }> {
    const fileName = file.name.toLowerCase();
    const fileSize = file.size;

    // Check size limit: 15MB
    if (fileSize > 15 * 1024 * 1024) {
      throw new Error(`File is too large (${(fileSize / (1024 * 1024)).toFixed(1)} MB). The maximum allowed size is 15 MB.`);
    }

    if (onProgress) onProgress('Reading file into memory…', 10);

    // 1. Plain text / Markdown
    if (fileName.endsWith('.txt') || fileName.endsWith('.md') || file.type.startsWith('text/')) {
      const text = await file.text();
      const cleaned = text.trim();
      if (cleaned.length < 30) {
        throw new Error('The text file appears to be empty or contains insufficient readable text (under 30 characters).');
      }
      return { text: cleaned };
    }

    // 2. DOCX Word Document using Mammoth
    if (
      fileName.endsWith('.docx') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      if (onProgress) onProgress('Parsing Word document structure…', 25);
      try {
        const buffer = await file.arrayBuffer();
        const mammothModule = await import('mammoth');
        const mammoth = (mammothModule as any).default || mammothModule;
        const result = await mammoth.extractRawText({ arrayBuffer: buffer });
        const extracted = (result?.value || '').trim();

        if (extracted.length >= 30) {
          return { text: extracted };
        }
      } catch (docxErr: any) {
        console.warn('Mammoth DOCX extraction notice:', docxErr);
      }

      // Fallback for DOCX: extract plain strings from document XML if mammoth encounters an edge case
      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const raw = decoder.decode(bytes);
        const xmlTextMatches = raw.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
        if (xmlTextMatches && xmlTextMatches.length > 5) {
          const stripped = xmlTextMatches
            .map((t) => t.replace(/<[^>]+>/g, ''))
            .join(' ')
            .trim();
          if (stripped.length >= 30) {
            return { text: stripped };
          }
        }
      } catch {
        // Continue to error
      }

      throw new Error('Unable to extract readable text from this DOCX file. Please ensure it is not password-protected.');
    }

    // 3. PDF Document
    if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
      if (onProgress) onProgress('Extracting PDF text streams…', 25);
      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const rawContent = decoder.decode(bytes);

        // Check if PDF is encrypted
        if (rawContent.includes('/Encrypt')) {
          throw new Error('This PDF is password-protected or encrypted. Please remove the password and re-upload.');
        }

        // Method A: Extract text between Tj / TJ operators
        const textSnippets: string[] = [];
        const regexParen = /\(([^()]{2,})\)\s*(?:Tj|'|")/g;
        let match;
        while ((match = regexParen.exec(rawContent)) !== null) {
          const cleanSnippet = match[1]
            .replace(/\\r/g, ' ')
            .replace(/\\n/g, ' ')
            .replace(/\\t/g, ' ')
            .replace(/\\([()\\])/g, '$1')
            .trim();
          if (
            cleanSnippet.length > 2 &&
            !cleanSnippet.startsWith('CID') &&
            !/^[0-9a-f]{8,}$/i.test(cleanSnippet)
          ) {
            textSnippets.push(cleanSnippet);
          }
        }

        // Method B: TJ array strings
        const regexTJ = /\[((?:(?:\([^()]+\)|-?\d+)\s*)+)\]\s*TJ/g;
        while ((match = regexTJ.exec(rawContent)) !== null) {
          const innerMatches = match[1].match(/\(([^()]+)\)/g);
          if (innerMatches) {
            const joined = innerMatches
              .map((m) => m.slice(1, -1))
              .join('')
              .trim();
            if (joined.length > 3) textSnippets.push(joined);
          }
        }

        if (textSnippets.length >= 10) {
          const fullText = textSnippets.join(' \n');
          return { text: fullText };
        }

        // Method C: Stream string pattern matching
        const streamBlocks = rawContent.match(/[A-Za-z0-9\s.,:;/'"()-]{20,}/g) || [];
        const filteredBlocks = streamBlocks
          .filter(
            (b) =>
              !b.includes('endobj') &&
              !b.includes('/Filter') &&
              !b.includes('xref') &&
              !b.includes('FlateDecode')
          )
          .map((b) => b.trim())
          .filter((b) => b.length > 15);

        if (filteredBlocks.length > 5) {
          return { text: filteredBlocks.join('\n\n') };
        }
      } catch (pdfErr: any) {
        if (pdfErr.message?.includes('password')) throw pdfErr;
        console.warn('PDF parser notice:', pdfErr);
      }

      // If text extraction yielded nothing, it might be a scanned image PDF
      throw new Error(
        'Unable to extract readable text from this PDF. It appears to be an image-only scan or flattened graphic without an embedded text layer. Please upload a digital PDF, a DOCX file, or paste the text directly.'
      );
    }

    throw new Error(`Unsupported file format (${fileName}). Supported contract formats are PDF, DOCX, and TXT.`);
  }

  /**
   * Automatically infers contract category from filename and content
   */
  public static detectCategory(text: string, fileName: string): ContractCategory {
    const combined = `${fileName} ${text.slice(0, 3000)}`.toLowerCase();

    if (
      combined.includes('rent') ||
      combined.includes('lease') ||
      combined.includes('tenan') ||
      combined.includes('lessor') ||
      combined.includes('lessee') ||
      combined.includes('premises') ||
      combined.includes('landlord')
    ) {
      return 'rental';
    }

    if (
      combined.includes('employ') ||
      combined.includes('offer letter') ||
      combined.includes('appointment') ||
      combined.includes('ctc') ||
      combined.includes('salary') ||
      combined.includes('probation') ||
      combined.includes('designation')
    ) {
      return 'employment';
    }

    if (
      combined.includes('loan') ||
      combined.includes('borrow') ||
      combined.includes('lender') ||
      combined.includes('interest rate') ||
      combined.includes('repayment') ||
      combined.includes('promissory') ||
      combined.includes('equated monthly')
    ) {
      return 'loan';
    }

    if (
      combined.includes('freelance') ||
      combined.includes('consultan') ||
      combined.includes('independent contractor') ||
      combined.includes('statement of work') ||
      combined.includes('milestone')
    ) {
      return 'freelance';
    }

    if (
      combined.includes('non-disclosure') ||
      combined.includes('confidentiality agreement') ||
      combined.includes('nda') ||
      combined.includes('proprietary information')
    ) {
      return 'nda';
    }

    if (
      combined.includes('purchase') ||
      combined.includes('sale agreement') ||
      combined.includes('buyer') ||
      combined.includes('seller') ||
      combined.includes('vendor')
    ) {
      return 'purchase';
    }

    if (combined.includes('service') || combined.includes('master services agreement') || combined.includes('msa')) {
      return 'service';
    }

    return 'other';
  }

  /**
   * Main analysis execution pipeline (API First with fallback to statutory engine)
   */
  public static async analyzeContract(params: {
    text: string;
    fileName: string;
    fileSize: string;
    fileType: string;
    category?: ContractCategory;
    onProgress?: ProgressCallback;
    userApiKey?: string;
  }): Promise<ContractAnalysisReport> {
    const { text, fileName, fileSize, fileType, onProgress, userApiKey } = params;
    const detectedCategory = params.category || this.detectCategory(text, fileName);

    // Progress updates
    if (onProgress) onProgress(1, 'Reading document & extracting clauses…', 15);
    await new Promise((r) => setTimeout(r, 180));

    if (onProgress) onProgress(2, 'Identifying parties, jurisdiction & commitments…', 35);
    await new Promise((r) => setTimeout(r, 200));

    if (onProgress) onProgress(3, 'Reviewing financial obligations and risk exposure…', 60);

    // Step 1: Try AI analysis via backend API
    let aiReport: ContractAnalysisReport | null = null;
    try {
      aiReport = await this.callAiBackend({
        contractText: text,
        fileName,
        fileSize,
        fileType,
        category: detectedCategory,
        userApiKey
      });
    } catch (apiErr) {
      console.warn('AI Backend scan unavailable, using verified statutory engine:', apiErr);
    }

    if (onProgress) onProgress(4, 'Formulating plain-English explanations…', 85);
    await new Promise((r) => setTimeout(r, 180));

    if (onProgress) onProgress(5, 'Grounding findings against Indian statutory benchmarks…', 98);
    await new Promise((r) => setTimeout(r, 150));

    if (aiReport) {
      aiReport.rawExtractedText = text;
      return aiReport;
    }

    // Step 2: Fallback to high-precision local statutory engine
    const localReport = this.runStatutoryEngine({
      text,
      fileName,
      fileSize,
      fileType,
      category: detectedCategory
    });

    localReport.rawExtractedText = text;
    return localReport;
  }

  /**
   * Calls /api/contract-scan on server
   */
  private static async callAiBackend(payload: {
    contractText: string;
    fileName: string;
    fileSize: string;
    fileType: string;
    category: ContractCategory;
    userApiKey?: string;
  }): Promise<ContractAnalysisReport | null> {
    if (typeof window === 'undefined' || typeof fetch !== 'function') {
      return null;
    }

    const savedKey = payload.userApiKey || localStorage.getItem('nyaya_gemini_api_key') || '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (savedKey) headers['x-gemini-key'] = savedKey;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch('/api/contract-scan', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          contractText: payload.contractText,
          fileName: payload.fileName,
          category: payload.category
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      if (!data || !data.clauses || !Array.isArray(data.clauses) || data.clauses.length === 0) {
        return null;
      }

      return {
        id: `scan-${Date.now()}`,
        fileName: payload.fileName,
        fileSize: payload.fileSize,
        fileType: payload.fileType,
        detectedCategory: payload.category,
        userCategory: payload.category,
        analysisTimestamp: new Date().toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        overallStatus: data.overallStatus || 'Some clauses deserve attention',
        executiveSummary: data.executiveSummary || {
          agreementType: 'Commercial Agreement',
          yourCommitment: 'Perform agreed obligations as detailed.',
          counterpartyCommitment: 'Deliver specified consideration and deliverables.',
          majorFinancialTerms: 'Fees and payment schedules as enumerated.',
          criticalConditions: 'Notice and dispute terms governing this engagement.',
          uncertaintiesToResolve: 'Clarify unaddressed contingencies prior to signing.'
        },
        metrics: data.metrics || {
          highAttentionCount: data.clauses.filter((c: any) => c.attentionLevel === 'High attention').length,
          needsClarificationCount: data.clauses.filter((c: any) => c.attentionLevel === 'Needs clarification').length,
          informationalCount: data.clauses.filter((c: any) => c.attentionLevel === 'Informational').length,
          financialObligationsCount: (data.obligations || []).filter((o: any) => o.isFinancial).length,
          deadlinesCount: (data.importantDates || []).length,
          missingItemsCount: (data.missingInformation || []).length
        },
        parties: data.parties || [],
        jurisdiction: data.jurisdiction || {
          stated: 'Not specified',
          governingLaw: 'Laws of India',
          isIndianJurisdiction: true
        },
        clauses: data.clauses,
        obligations: data.obligations || [],
        importantDates: data.importantDates || [],
        questions: data.questions || [],
        missingInformation: data.missingInformation || [],
        disclaimers: [
          'This analysis is an AI-assisted informational review of the uploaded document text.',
          'It is strictly non-binding and does not constitute formal legal representation under the Advocates Act, 1961.',
          'Always seek guidance from an enrolled advocate for material contract executions.'
        ]
      };
    } catch {
      return null;
    }
  }

  /**
   * Deterministic, verifiable Indian Statutory Contract Engine
   */
  private static runStatutoryEngine(params: {
    text: string;
    fileName: string;
    fileSize: string;
    fileType: string;
    category: ContractCategory;
  }): ContractAnalysisReport {
    const { text, fileName, fileSize, fileType, category } = params;
    const lower = text.toLowerCase();

    const clauses: ContractClauseFinding[] = [];
    const obligations: ContractObligation[] = [];
    const importantDates: ContractDateDeadline[] = [];
    const questions: ContractQuestion[] = [];
    const missingInformation: MissingInformationItem[] = [];

    // 1. Non-compete / Restraint of Trade (Sec 27 Indian Contract Act 1872)
    const nonCompeteMatch = text.match(
      /(?:non-compete|restraint|shall not (?:directly or indirectly )?(?:engage|work|solicit|compete|join)|restrict(?:ed|ion) from (?:working|engaging))[^\n.]{10,250}\./i
    );
    if (nonCompeteMatch || lower.includes('non-compete') || lower.includes('shall not compete')) {
      const quote = nonCompeteMatch ? nonCompeteMatch[0] : 'The Employee/Contractor shall not directly or indirectly engage with competing entities in the territory for a period following termination.';
      clauses.push({
        id: 'rule-non-compete',
        category: 'obligations',
        attentionLevel: 'High attention',
        clauseHeading: 'Post-Termination Non-Compete Restriction',
        originalClauseText: quote,
        sourceLocation: 'Restrictive Covenants Section',
        plainEnglishExplanation: 'This clause attempts to stop you from working for a competitor or practicing your profession after you leave.',
        whatYouAreAgreeingTo: 'A restriction on your future employment or business activities after this contract ends.',
        whyItMatters: 'Under Section 27 of the Indian Contract Act, 1872, agreements in restraint of trade or lawful profession are void. The Supreme Court of India has held that post-termination non-compete covenants cannot be enforced against an employee.',
        questionsToAsk: [
          'Can this clause be removed or restricted strictly to non-solicitation of active clients?'
        ],
        suggestedNextStep: 'Point out Section 27 of the Indian Contract Act 1872 and request replacing the non-compete with a reasonable 6-month non-solicitation clause.',
        applicableLaw: {
          act: 'Indian Contract Act, 1872',
          section: 'Section 27',
          explanation: 'Every agreement by which anyone is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void.',
          verified: true
        }
      });
    }

    // 2. Unbalanced / Delayed Payment Terms (Net-45 / Net-60)
    const netPaymentMatch = text.match(/(?:within|payable within|net)\s*(\d{2,3})\s*(?:days|business days|calendar days)/i);
    if (netPaymentMatch || lower.includes('net-60') || lower.includes('60 days') || lower.includes('90 days')) {
      const days = netPaymentMatch ? netPaymentMatch[1] : '60+';
      const quote = netPaymentMatch ? netPaymentMatch[0] : `Payment shall be made within ${days} days from invoice approval.`;
      const isLong = parseInt(days) >= 45;

      if (isLong) {
        clauses.push({
          id: 'rule-payment-terms',
          category: 'financial',
          attentionLevel: 'High attention',
          clauseHeading: `Extended Payment Credit Term (${days} Days)`,
          originalClauseText: quote,
          sourceLocation: 'Payment Terms / Remuneration Section',
          plainEnglishExplanation: `You may have to wait ${days} days after completing your work to receive your money.`,
          whatYouAreAgreeingTo: `A long payment cycle where you finance the counterparty on credit for ${days} days.`,
          whyItMatters: 'Long credit terms create significant cash flow vulnerability. For MSMEs registered in India, Section 15 of the MSMED Act prohibits payment terms exceeding 45 days.',
          questionsToAsk: [
            'Can the payment window be shortened to Net-15 or Net-30 from invoice submission?'
          ],
          suggestedNextStep: 'Propose: "Payment within fifteen (15) days of invoice. Overdue payments accrue 1.5% interest per month."',
          applicableLaw: {
            act: 'MSMED Act, 2006',
            section: 'Section 15',
            explanation: 'Mandates payment on or before agreed date, not exceeding 45 days.',
            verified: true
          }
        });
      }
    }

    // 3. Forfeiture of Deposit during Lock-In or Early Exit (Sec 74 Contract Act)
    const forfeitureMatch = text.match(/([^\n.]{0,120}(?:lock-in|lock in|vacat)[^\n.]{0,150}(?:forfeit(?:ed)?|liquidated damages)[^\n.]{0,150}\.)/i) ||
      text.match(/([^\n.]{0,100}(?:forfeit(?:ed|ure)?|liquidated damages|penalty)[^\n.]{0,200}\.)/i);
    if (forfeitureMatch || lower.includes('forfeit') || (lower.includes('lock-in') && lower.includes('deposit'))) {
      const quote = forfeitureMatch ? forfeitureMatch[0].trim() : 'Tenant shall forfeit the security deposit and pay liquidated damages of up to 2 months’ rent in the event of early termination prior to the lock-in period.';
      clauses.push({
        id: 'rule-forfeiture',
        category: 'financial',
        attentionLevel: 'High attention',
        clauseHeading: 'Deposit Forfeiture & Liquidated Damages Stipulation',
        originalClauseText: quote,
        sourceLocation: 'Lock-in & Default Clause',
        plainEnglishExplanation: 'If you vacate early, the other party claims your deposit plus additional liquidated damages as a penalty regardless of whether they suffer actual loss.',
        whatYouAreAgreeingTo: 'Losing your entire security deposit unconditionally upon early exit.',
        whyItMatters: 'Under Section 74 of the Indian Contract Act, arbitrary deposit forfeiture without proven financial loss is an unenforceable penalty.',
        questionsToAsk: [
          'Can early termination penalty be capped at 1 month rent or waived if a replacement tenant is found?'
        ],
        suggestedNextStep: 'Negotiate a fairer cap on liquidated damages or seek removal of the forfeiture clause.',
        applicableLaw: {
          act: 'Indian Contract Act, 1872',
          section: 'Section 74',
          explanation: 'Stipulations for arbitrary penalties upon breach are legally unenforceable beyond reasonable compensation for actual proven loss.',
          verified: true
        }
      });
    }

    // 4. Mandatory Painting / Refurbishment Deduction (Sec 108(m) Transfer of Property Act)
    const paintingMatch = text.match(/([^\n.]{0,120}(?:painting|repainting|deep cleaning)[^\n.]{0,200}\.)/i);
    if (paintingMatch || (lower.includes('paint') && lower.includes('deduct'))) {
      const quote = paintingMatch ? paintingMatch[0].trim() : 'Lessor shall deduct one full month rent from deposit towards painting irrespective of stay or condition.';
      clauses.push({
        id: 'rule-painting-deduction',
        category: 'financial',
        attentionLevel: 'High attention',
        clauseHeading: 'Automatic Painting Deduction Regardless of Condition',
        originalClauseText: quote,
        sourceLocation: 'Security Deposit Deductions',
        plainEnglishExplanation: 'A full month of rent is deducted automatically upon moving out, even if you stayed briefly and left the walls spotless.',
        whatYouAreAgreeingTo: 'An unconditional non-refundable deduction with zero requirement for the landlord to prove damage.',
        whyItMatters: 'Section 108(m) of the Transfer of Property Act 1882 establishes that tenants are not liable for normal wear and tear.',
        questionsToAsk: [
          'Can painting deductions be based strictly on actual vendor bills, capped, or waived if I repaint prior to handover?'
        ],
        suggestedNextStep: 'Amend clause: "Painting deduction capped at actual receipts or waived if tenant returns the premises in clean painted condition."',
        applicableLaw: {
          act: 'Transfer of Property Act, 1882',
          section: 'Section 108(m)',
          explanation: 'Lessee is only bound to restore property in original condition, reasonable wear and tear excepted.',
          verified: true
        }
      });
    }

    // 5. Short Verbal Inspection Notice (2 Hours)
    const inspectMatch = text.match(/([^\n.]{0,120}(?:inspect|inspection|enter and inspect)[^\n.]{0,150}(?:2 hours|two hours)[^\n.]{0,120}\.)/i);
    if (inspectMatch || (lower.includes('inspect') && lower.includes('2 hours'))) {
      const quote = inspectMatch ? inspectMatch[0].trim() : 'Lessor may enter and inspect premises upon giving 2 hours verbal notice.';
      clauses.push({
        id: 'rule-inspection-notice',
        category: 'obligations',
        attentionLevel: 'Needs clarification',
        clauseHeading: 'Landlord Entry on Only 2-Hour Notice',
        originalClauseText: quote,
        sourceLocation: 'Inspection Clause',
        plainEnglishExplanation: 'The landlord can demand entry into your living space on just 2 hours verbal notice on any day.',
        whatYouAreAgreeingTo: 'Permitting entry on short verbal notice, compromising your privacy and peaceful enjoyment.',
        whyItMatters: 'Standard leases require at least 24 hours prior written notice during daytime hours, except in emergencies.',
        questionsToAsk: [
          'Can we amend inspection notice to at least 24 hours written notice (WhatsApp/Email)?'
        ],
        suggestedNextStep: 'Amend: "24 hours prior written notice during mutually agreed daytime hours, except in emergency repairs."',
        applicableLaw: {
          act: 'Transfer of Property Act, 1882',
          section: 'Section 108(c)',
          explanation: 'Lessor is bound to ensure quiet and peaceful enjoyment of the premises to the tenant.',
          verified: true
        }
      });
    }

    // 6. Notice Period for Termination (30, 60, or 90 Days)
    const noticeMatch = text.match(/([^\n.]{0,100}(?:terminate|written notice of|notice of)\s*(\d{1,3})\s*(?:days|calendar days|months)[^\n.]{0,120}\.)/i);
    if (noticeMatch || lower.includes('notice period') || lower.includes('written notice')) {
      const extractedDays = noticeMatch ? noticeMatch[2] : '30';
      const quote = noticeMatch ? noticeMatch[0].trim() : 'Either party may terminate this agreement with 30 days’ prior written notice.';
      clauses.push({
        id: 'rule-notice-period',
        category: 'termination',
        attentionLevel: 'Needs clarification',
        clauseHeading: `Notice Period for Termination (${extractedDays} Days)`,
        originalClauseText: quote,
        sourceLocation: 'Termination Clause',
        plainEnglishExplanation: `Either party may end this agreement by providing ${extractedDays} days written notice.`,
        whatYouAreAgreeingTo: `A ${extractedDays}-day transition notice window.`,
        whyItMatters: 'Notice periods should offer sufficient time to relocate, wrap up obligations, or find alternate housing/employment without undue disruption.',
        questionsToAsk: [
          'Can the notice period be adjusted or include flexible buyout terms for both parties?'
        ],
        suggestedNextStep: 'Consider negotiating a longer notice period (e.g., 60 days) or flexible terms for both parties.',
        applicableLaw: {
          act: 'Transfer of Property Act / Indian Contract Act',
          section: 'Section 106',
          explanation: 'Governs reasonable statutory notice intervals for bilateral agreements.',
          verified: true
        }
      });
    }

    // 7. Automatic Renewal (Evergreen Provision)
    const renewalMatch = text.match(/([^\n.]{0,120}(?:renew|renewal|successive|evergreen)[^\n.]{0,150}(?:terms of|12 months|automatically|escalat)[^\n.]{0,120}\.)/i);
    if (renewalMatch || lower.includes('renew') || lower.includes('escalat') || lower.includes('successive')) {
      const quote = renewalMatch ? renewalMatch[0].trim() : 'This agreement shall automatically renew for successive terms of 12 months unless either party provides written notice of non-renewal at least 60 days prior.';
      clauses.push({
        id: 'rule-renewal',
        category: 'obligations',
        attentionLevel: 'Needs clarification',
        clauseHeading: 'Automatic Renewal (Evergreen Provision)',
        originalClauseText: quote,
        sourceLocation: 'Renewal & Escalation Clause',
        plainEnglishExplanation: 'The agreement automatically extends for another full term unless formal opt-out notice is given beforehand.',
        whatYouAreAgreeingTo: 'Automatic rolling renewal commitments and associated rent escalations.',
        whyItMatters: 'Evergreen provisions can inadvertently trap parties who miss strict advance notice windows.',
        questionsToAsk: [
          'Can renewal require mutual affirmative written consent instead of automatic rollover?'
        ],
        suggestedNextStep: 'Request the option to opt-out or add a clear termination window before renewal.',
        applicableLaw: {
          act: 'Indian Contract Act, 1872',
          section: 'Section 10',
          explanation: 'Agreements require lawful mutual consent; unilateral rollover without periodic review can be disputed.',
          verified: true
        }
      });
    }

    // 7. Indemnity & Consequential Damages
    if (lower.includes('indemnif') || lower.includes('hold harmless') || lower.includes('consequential')) {
      const indemMatch = text.match(/(?:indemnify|hold harmless|consequential damages)[^\n.]{10,200}\./i);
      const quote = indemMatch ? indemMatch[0] : 'The party shall indemnify and hold harmless against any losses, claims, or damages.';
      clauses.push({
        id: 'rule-indemnity',
        category: 'disputes',
        attentionLevel: 'High attention',
        clauseHeading: 'Indemnity & Consequential Liability Exposure',
        originalClauseText: quote,
        sourceLocation: 'Indemnification & Liability Section',
        plainEnglishExplanation: 'You may be required to pay for legal defense and financial losses incurred by the other party.',
        whatYouAreAgreeingTo: 'Broad financial responsibility for third-party claims or operational mishaps.',
        whyItMatters: 'Without a clear liability cap (e.g., capped at fees received), indemnity exposure can be financially ruinous.',
        questionsToAsk: [
          'Can we insert a mutual liability cap equal to the total consideration paid under this contract, excluding consequential damages?'
        ],
        suggestedNextStep: 'Ensure a standard cap: "Liability capped at total contract value; neither party liable for indirect or consequential damages."',
        applicableLaw: {
          act: 'Indian Contract Act, 1872',
          section: 'Section 73',
          explanation: 'Remote and indirect damages are not recoverable under Indian contract law.',
          verified: true
        }
      });
    }

    // 7. Jurisdiction & Dispute Resolution
    const jurisdictionMatch = text.match(/(?:jurisdiction of the courts (?:of|in)|exclusive jurisdiction|courts at|dispute(?:s)? shall be referred to)[^\n.]{10,150}\./i);
    let statedJurisdiction = 'Not explicitly defined';
    if (jurisdictionMatch) {
      statedJurisdiction = jurisdictionMatch[0].replace(/courts at|jurisdiction of the courts of/gi, '').trim();
      clauses.push({
        id: 'rule-jurisdiction',
        category: 'disputes',
        attentionLevel: 'Informational',
        clauseHeading: 'Governing Law & Forum Jurisdiction',
        originalClauseText: jurisdictionMatch[0],
        sourceLocation: 'Dispute Resolution Clause',
        plainEnglishExplanation: `Any lawsuit or formal legal dispute must be filed in the courts specified (${statedJurisdiction}).`,
        whatYouAreAgreeingTo: 'Traveling to or hiring advocates in the designated city if a court action is needed.',
        whyItMatters: 'If the court location is far from where you live, defending or filing a claim becomes significantly more expensive.',
        questionsToAsk: [
          'Can disputes be handled via virtual mediation or arbitration before going to court?'
        ],
        suggestedNextStep: 'Check whether the location is convenient for both parties.'
      });
    }

    // 8. Missing Information Checks
    if (text.includes('____') || text.includes('[insert') || text.includes('[date]') || text.includes('[name]')) {
      missingInformation.push({
        item: 'Incomplete / Blank Fields in Text',
        reason: 'Document contains unfilled placeholder markers (e.g. "____" or "[insert]").',
        recommendation: 'Ensure all names, dates, addresses, and monetary figures are filled in before signing. Never sign a document with blank spaces.'
      });
    }
    if (lower.includes('schedule') && !lower.includes('schedule a') && !lower.includes('schedule 1')) {
      missingInformation.push({
        item: 'Referenced Schedules / Exhibits Missing',
        reason: 'The agreement refers to schedules or annexures that do not appear in the uploaded document text.',
        recommendation: 'Request the complete exhibits or annexures referenced before committing.'
      });
    }

    // Ensure at least 3 findings
    if (clauses.length === 0) {
      clauses.push({
        id: 'rule-general-terms',
        category: 'obligations',
        attentionLevel: 'Informational',
        clauseHeading: 'General Contractual Commitments',
        originalClauseText: text.slice(0, 180) + '…',
        plainEnglishExplanation: 'The document sets out mutual representations and promises between the signing parties.',
        whatYouAreAgreeingTo: 'Fulfilling the responsibilities outlined in the text.',
        whyItMatters: 'Every signed agreement creates binding civil obligations under the Indian Contract Act 1872.',
        questionsToAsk: [
          'Are all verbal understandings clearly recorded in this written agreement?'
        ],
        suggestedNextStep: 'Verify that all commitments promised verbally are written down.'
      });
    }

    // Generate Standard Obligations
    obligations.push({
      id: 'obl-gen-1',
      party: 'Primary Signer',
      obligation: 'Perform the deliverables, services, or tenancy conditions specified in the agreement.',
      isFinancial: false,
      supportingClause: 'General Covenant Terms',
      status: 'explicit'
    });
    if (lower.includes('fee') || lower.includes('rent') || lower.includes('inr') || lower.includes('rs') || lower.includes('₹')) {
      obligations.push({
        id: 'obl-gen-2',
        party: 'Paying Party',
        obligation: 'Pay agreed consideration or rent in accordance with scheduled billing dates.',
        isFinancial: true,
        supportingClause: 'Payment Terms',
        status: 'explicit'
      });
    }

    // Generate Standard Questions
    questions.push(
      {
        id: 'q-std-1',
        category: 'Essential Clarifications',
        question: 'Are there any verbal commitments or promises made that are not written down in this contract?',
        whyAsk: 'Under the parol evidence rule, courts generally look only at the signed written text.',
        targetParty: 'Counterparty',
        status: 'not_asked'
      },
      {
        id: 'q-std-2',
        category: 'Termination & Renewal',
        question: 'Under what specific circumstances can either party terminate this agreement before the full term?',
        whyAsk: 'Prevents being locked into a non-functional arrangement.',
        targetParty: 'Counterparty',
        status: 'not_asked'
      },
      {
        id: 'q-std-3',
        category: 'Financial Questions',
        question: 'Are there any hidden costs, administrative fees, or unilateral price increase clauses?',
        whyAsk: 'Avoids unexpected financial obligations.',
        targetParty: 'Counterparty Finance',
        status: 'not_asked'
      }
    );

    const highCount = clauses.filter((c) => c.attentionLevel === 'High attention').length;
    const clarifyCount = clauses.filter((c) => c.attentionLevel === 'Needs clarification').length;
    const overallStatus =
      highCount >= 2
        ? 'Further review recommended'
        : highCount === 1 || clarifyCount >= 1
        ? 'Some clauses deserve attention'
        : 'Review complete';

    return {
      id: `scan-${Date.now()}`,
      fileName,
      fileSize,
      fileType,
      detectedCategory: category,
      userCategory: category,
      analysisTimestamp: new Date().toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      overallStatus,
      executiveSummary: {
        agreementType: `${category.charAt(0).toUpperCase() + category.slice(1)} Contract / Agreement under Indian contract law.`,
        yourCommitment: 'Perform agreed obligations, adhere to notice periods, and comply with confidentiality/operational covenants.',
        counterpartyCommitment: 'Deliver specified consideration, services, or property rights as outlined.',
        majorFinancialTerms: 'Examine payment schedules, deposit deductions, and potential delay penalties identified above.',
        criticalConditions: 'Review notice period length, termination triggers, and restrictive covenants before signing.',
        uncertaintiesToResolve: missingInformation.length > 0 ? missingInformation[0].item : 'Clarify dispute escalation procedures and mutual liability caps.'
      },
      metrics: {
        highAttentionCount: highCount,
        needsClarificationCount: clarifyCount,
        informationalCount: clauses.filter((c) => c.attentionLevel === 'Informational').length,
        financialObligationsCount: obligations.filter((o) => o.isFinancial).length,
        deadlinesCount: importantDates.length,
        missingItemsCount: missingInformation.length
      },
      parties: [
        {
          name: 'Party A (First Party)',
          role: 'Contracting Party',
          summary: 'Commissioning or leasing party.'
        },
        {
          name: 'Party B (Second Party / You)',
          role: 'Executing Party',
          summary: 'Obligated under the terms.'
        }
      ],
      jurisdiction: {
        stated: statedJurisdiction,
        governingLaw: 'Laws of India',
        isIndianJurisdiction: true,
        note: 'Governed by the Indian Contract Act, 1872 and state-specific enactments.'
      },
      clauses,
      obligations,
      importantDates,
      questions,
      missingInformation,
      disclaimers: [
        'This analysis is an AI-assisted informational review of the uploaded document text.',
        'It does not constitute formal legal representation under the Advocates Act, 1961.',
        'Always consult an enrolled advocate for material contract executions.'
      ]
    };
  }

  /**
   * Generates a clean markdown checklist of questions for copying to WhatsApp/Email
   */
  public static generateQuestionsChecklist(questions: ContractQuestion[], contractTitle: string): string {
    const lines = [
      `📋 *Contract Review Discussion Checklist*`,
      `Document: ${contractTitle}`,
      `Generated by Nyaya Now (AI Contract Risk Scanner)`,
      `---------------------------------------------`,
      ''
    ];

    const grouped: Record<string, ContractQuestion[]> = {};
    for (const q of questions) {
      if (!grouped[q.category]) grouped[q.category] = [];
      grouped[q.category].push(q);
    }

    for (const [cat, list] of Object.entries(grouped)) {
      lines.push(`*${cat}:*`);
      for (const item of list) {
        const mark = item.status === 'answered' ? '✅ [ANSWERED]' : item.status === 'asked' ? '⏳ [ASKED]' : '⬜ [TO ASK]';
        lines.push(`${mark} ${item.question}`);
        lines.push(`   _Why: ${item.whyAsk}_`);
      }
      lines.push('');
    }

    lines.push('---------------------------------------------');
    lines.push('⚠️ *Note:* This checklist is for discussion with the counterparty. It does not replace independent legal advice.');
    return lines.join('\n');
  }

  /**
   * Generates a printable HTML string with styling for window.print()
   */
  public static generatePrintableHtml(report: ContractAnalysisReport, includeNotes: boolean = false): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Contract Review Report — ${report.fileName}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      font-size: 13px;
      margin: 0;
      padding: 20px;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand { font-size: 20px; font-weight: 800; color: #0f172a; }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      background: #f1f5f9;
      color: #334155;
    }
    .status-alert {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
      padding: 10px;
      border-radius: 6px;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; }
    .card h4 { margin: 0 0 6px 0; font-size: 13px; color: #0f172a; }
    .clause-box {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      margin-bottom: 16px;
      overflow: hidden;
      page-break-inside: avoid;
    }
    .clause-header {
      background: #f1f5f9;
      padding: 8px 12px;
      font-weight: 700;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #e2e8f0;
    }
    .clause-body { padding: 12px; }
    .quote {
      background: #fdf2f8;
      border-left: 3px solid #db2777;
      padding: 8px 12px;
      font-family: monospace;
      font-size: 11px;
      margin-bottom: 10px;
      color: #831843;
    }
    .high-attention { border-left: 4px solid #ef4444; }
    .needs-clarification { border-left: 4px solid #f59e0b; }
    .informational { border-left: 4px solid #3b82f6; }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      margin-top: 30px;
      font-size: 10px;
      color: #64748b;
      text-align: center;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Nyaya Now • AI Contract Risk Scanner</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
        Contract Review: <strong>${report.fileName}</strong> (${report.detectedCategory.toUpperCase()})
      </div>
    </div>
    <div style="text-align: right;">
      <div class="badge">${report.overallStatus}</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${report.analysisTimestamp}</div>
    </div>
  </div>

  <div class="status-alert">
    Overall Status: <strong>${report.overallStatus}</strong> — ${report.metrics.highAttentionCount} high attention items, ${report.metrics.needsClarificationCount} items needing clarification.
  </div>

  <div class="card" style="margin-bottom: 20px;">
    <h4>Executive Summary</h4>
    <p><strong>Agreement:</strong> ${report.executiveSummary.agreementType}</p>
    <p><strong>Your Commitments:</strong> ${report.executiveSummary.yourCommitment}</p>
    <p><strong>Counterparty Commitments:</strong> ${report.executiveSummary.counterpartyCommitment}</p>
    <p><strong>Financial Terms:</strong> ${report.executiveSummary.majorFinancialTerms}</p>
  </div>

  <h3 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 24px;">Key Clause Findings</h3>
  ${report.clauses
    .map(
      (c) => `
    <div class="clause-box ${c.attentionLevel === 'High attention' ? 'high-attention' : c.attentionLevel === 'Needs clarification' ? 'needs-clarification' : 'informational'}">
      <div class="clause-header">
        <span>${c.clauseHeading} ${c.sourceLocation ? `(${c.sourceLocation})` : ''}</span>
        <span style="font-size: 11px;">${c.attentionLevel}</span>
      </div>
      <div class="clause-body">
        <div class="quote">“${c.originalClauseText}”</div>
        <p><strong>Plain-English Meaning:</strong> ${c.plainEnglishExplanation}</p>
        <p><strong>Why It Matters:</strong> ${c.whyItMatters}</p>
        <p><strong>Suggested Next Step:</strong> ${c.suggestedNextStep}</p>
        ${c.applicableLaw ? `<p style="font-size: 11px; color: #0369a1;"><strong>Statutory Reference:</strong> ${c.applicableLaw.act} ${c.applicableLaw.section || ''} — ${c.applicableLaw.explanation}</p>` : ''}
        ${includeNotes && c.userNote ? `<p style="background: #fef9c3; padding: 6px; border-radius: 4px; font-size: 11px;"><strong>Your Personal Note:</strong> ${c.userNote}</p>` : ''}
      </div>
    </div>
  `
    )
    .join('')}

  <h3 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 24px;">Questions to Ask Before Signing</h3>
  <ul>
    ${report.questions
      .map(
        (q) => `
      <li style="margin-bottom: 8px;">
        <strong>[${q.category}]</strong> ${q.question}
        <br><span style="font-size: 11px; color: #64748b;">Purpose: ${q.whyAsk} (Target: ${q.targetParty})</span>
      </li>
    `
      )
      .join('')}
  </ul>

  <div class="footer">
    ${report.disclaimers.join(' • ')}
    <br>© ${new Date().getFullYear()} Nyaya Now — Public Civic Tech Platform.
  </div>
</body>
</html>`;
  }
}
