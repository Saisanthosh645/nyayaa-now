import { ContractAnalysisReport } from '../types/contractScanner';

export const SAMPLE_CONTRACTS: ContractAnalysisReport[] = [
  // ── SAMPLE 1: RESIDENTIAL RENTAL AGREEMENT ─────────────────────────────────
  {
    id: 'sample-rental-agreement',
    fileName: 'Residential_Rental_Agreement_Indiranagar.pdf',
    fileSize: '1.2 MB',
    fileType: 'application/pdf',
    detectedCategory: 'rental',
    userCategory: 'rental',
    analysisTimestamp: '10 October 2026, 11:30 AM',
    overallStatus: 'Some clauses deserve attention',
    isSample: true,
    executiveSummary: {
      agreementType: '11-Month Residential Tenancy Agreement under Karnataka Rent Control / Model Tenancy framework.',
      yourCommitment: 'Pay ₹42,000 monthly rent before the 5th of each month, maintain premises, and provide 60 days exit notice.',
      counterpartyCommitment: 'Deliver peaceful possession of the 2BHK flat and return the refundable security deposit upon handover.',
      majorFinancialTerms: 'Monthly Rent: ₹42,000. Security Deposit: ₹2,50,000 (approx. 6 months rent). Maintenance: ₹4,500/mo.',
      criticalConditions: 'Strict 6-month lock-in period with full deposit forfeiture on early exit; automatic 10% rent escalation after 11 months; mandatory 1-month painting deduction upon vacation.',
      uncertaintiesToResolve: 'Painting deduction is charged unconditionally regardless of damage; landlord entry permitted on only 2 hours notice.'
    },
    metrics: {
      highAttentionCount: 2,
      needsClarificationCount: 3,
      informationalCount: 1,
      financialObligationsCount: 4,
      deadlinesCount: 3,
      missingItemsCount: 2
    },
    parties: [
      {
        name: 'Mr. R. Raghavan (Lessor / Landlord)',
        role: 'Property Owner',
        summary: 'Entitled to monthly rent and inspection; responsible for structural repairs.'
      },
      {
        name: 'Srikar Joshi (Lessee / Tenant)',
        role: 'Occupant',
        summary: 'Liable for rent, utility charges, minor upkeep, and timely notice before vacation.'
      }
    ],
    jurisdiction: {
      stated: 'Bengaluru, Karnataka',
      governingLaw: 'Laws of India & Courts of Bengaluru Urban District',
      isIndianJurisdiction: true,
      note: 'Transfer of Property Act, 1882 & Karnataka Rent Act applicable.'
    },
    clauses: [
      {
        id: 'rent-c1',
        category: 'financial',
        attentionLevel: 'High attention',
        clauseHeading: 'Deposit Forfeiture & Liquidated Damages Stipulation',
        sourceLocation: 'Clause 5(b)',
        originalClauseText: 'Tenant shall forfeit the security deposit and pay liquidated damages of up to 2 months’ rent in the event of early termination prior to the lock-in period.',
        plainEnglishExplanation: 'If you vacate the premises before the mandatory lock-in expires, you automatically forfeit your entire security deposit plus 2 months of liquidated damages.',
        whatYouAreAgreeingTo: 'Losing up to ₹2,50,000 security deposit plus paying 2 additional months of penalty if you need to exit early.',
        whyItMatters: 'Under Section 74 of the Indian Contract Act 1872, liquidated damages must be a genuine pre-estimate of loss. Blanket forfeiture clauses without proof of landlord loss are legally void penalties.',
        questionsToAsk: [
          'Can early termination compensation be capped strictly at 1 month rent with remainder deposit refunded in full?',
          'Will the forfeiture be waived if a replacement tenant is found within 30 days?'
        ],
        suggestedNextStep: 'Negotiate a fairer cap on liquidated damages or seek removal of the forfeiture clause.',
        applicableLaw: {
          act: 'Indian Contract Act, 1872',
          section: 'Section 74',
          explanation: 'Stipulations for arbitrary penalties upon breach are legally unenforceable beyond reasonable compensation for actual proven loss.',
          verified: true
        }
      },
      {
        id: 'rent-c2',
        category: 'termination',
        attentionLevel: 'Needs clarification',
        clauseHeading: 'Notice Period for Termination (30 Days)',
        sourceLocation: 'Clause 5(c)',
        originalClauseText: 'Either party may terminate this agreement with 30 days’ prior written notice after the expiry of the mandatory lock-in period.',
        plainEnglishExplanation: 'After the initial lock-in period, either party can end this tenancy on 30 calendar days notice.',
        whatYouAreAgreeingTo: 'A 30-day exit notice window. If the landlord decides not to renew or asks you to vacate, you will have only 30 days to find alternative housing.',
        whyItMatters: 'In major urban hubs like Bengaluru, 30 days is often too brief to find and relocate to a new apartment comfortably. A 60-day bilateral notice period provides greater housing stability.',
        questionsToAsk: [
          'Can the landlord notice period be extended to 60 days to give sufficient time to secure alternative accommodation?'
        ],
        suggestedNextStep: 'Consider negotiating a longer notice period (e.g., 60 days) or flexible terms for both parties.',
        applicableLaw: {
          act: 'Transfer of Property Act, 1882',
          section: 'Section 106',
          explanation: 'Governs lease termination notices and prescribes reasonable periods for residential tenancy exits.',
          verified: true
        }
      },
      {
        id: 'rent-c3',
        category: 'obligations',
        attentionLevel: 'Needs clarification',
        clauseHeading: 'Automatic Renewal (Evergreen Provision)',
        sourceLocation: 'Clause 3(b)',
        originalClauseText: 'This agreement shall automatically renew for successive terms of 12 months unless either party provides written notice of non-renewal at least 60 days prior to expiry.',
        plainEnglishExplanation: 'If you forget to give written notice 60 days before the lease ends, the contract will roll over for another full year with automatic escalation.',
        whatYouAreAgreeingTo: 'An evergreen rollover commitment that binds you for another 12 months unless cancelled within a strict window.',
        whyItMatters: 'Evergreen provisions can trap tenants who plan to vacate or who miss the exact notice window, triggering disputes over deposit return.',
        questionsToAsk: [
          'Can renewal require affirmative written consent from both parties instead of automatic rollover?'
        ],
        suggestedNextStep: 'Request the option to opt-out or add a clear termination window before renewal.',
        applicableLaw: {
          act: 'Indian Contract Act, 1872',
          section: 'Section 10',
          explanation: 'Agreements require lawful mutual consent; automatic indefinite renewal without notice can be disputed as unilateral lock-in.',
          verified: true
        }
      },
      {
        id: 'rent-c4',
        category: 'disputes',
        attentionLevel: 'Informational',
        clauseHeading: 'Governing Law & Forum Jurisdiction',
        sourceLocation: 'Clause 8',
        originalClauseText: 'This agreement shall be governed by the laws of India and any disputes shall be subject to the exclusive jurisdiction of the civil courts in Bengaluru.',
        plainEnglishExplanation: 'Any formal dispute arising under this lease will be decided under Indian laws by civil courts in Bengaluru.',
        whatYouAreAgreeingTo: 'Bengaluru courts as the sole dispute forum.',
        whyItMatters: 'Standard forum selection clause that aligns with the location of the leased property. It ensures local convenience for resolving any disagreements.',
        questionsToAsk: [
          'Can we add a mediation step before court litigation to keep resolution swift and low-cost?'
        ],
        suggestedNextStep: 'No action needed. This clause appears standard and is generally acceptable.',
        applicableLaw: {
          act: 'Code of Civil Procedure, 1908',
          section: 'Section 20',
          explanation: 'Jurisdiction in respect of immovable property lies within the local limits where the property is situated.',
          verified: true
        }
      },
      {
        id: 'rent-c5',
        category: 'financial',
        attentionLevel: 'High attention',
        clauseHeading: 'Mandatory Painting & Refurbishment Deduction',
        sourceLocation: 'Clause 4(b)',
        originalClauseText: 'Upon vacation of the schedule premises by the Tenant for any reason whatsoever, the Landlord shall deduct one full month rent (₹42,000/-) from the Security Deposit towards painting and deep cleaning charges, irrespective of the duration of stay or the condition of the walls.',
        plainEnglishExplanation: 'Even if you stay for just 6 months and keep the walls completely clean, the landlord will keep ₹42,000 from your security deposit automatically.',
        whatYouAreAgreeingTo: 'An unconditional non-refundable deduction of ₹42,000 upon moving out, without any inspection or proof of damage.',
        whyItMatters: 'Standard practice in urban rental agreements often allows painting deductions only when wear and tear exceeds normal usage, or based on actual receipts. A blanket one-month deduction is one-sided.',
        questionsToAsk: [
          'Can we amend this so painting charges are deducted only against actual painting bills or if the walls are visibly damaged beyond normal wear and tear?',
          'Will the deduction be waived or prorated if I arrange professional repainting myself prior to key handover?'
        ],
        suggestedNextStep: 'Request an amendment: "Deduction for repainting shall be based on actual vendor invoice, capped at ₹15,000, or waived if tenant returns the premises freshly repainted."',
        applicableLaw: {
          act: 'Transfer of Property Act, 1882',
          section: 'Section 108(m)',
          explanation: 'A lessee is only bound to keep the property in as good condition as it was when put in possession, reasonable wear and tear excepted.',
          verified: true
        }
      },
      {
        id: 'rent-c6',
        category: 'obligations',
        attentionLevel: 'Needs clarification',
        clauseHeading: 'Landlord Right of Inspection on Short Notice',
        sourceLocation: 'Clause 7',
        originalClauseText: 'The Landlord or their authorized agent shall have unrestricted right to enter and inspect the premises at any hour between 8:00 AM and 9:00 PM upon giving two (2) hours verbal notice via phone or messaging.',
        plainEnglishExplanation: 'The landlord can demand entry into your home on just 2 hours notice on any day of the week.',
        whatYouAreAgreeingTo: 'Permitting entry with minimal notice, significantly compromising your privacy and peaceful enjoyment.',
        whyItMatters: 'Standard leases require at least 24 to 48 hours prior written notice during reasonable daytime hours, except in true structural emergencies.',
        questionsToAsk: [
          'Can we change the inspection notice requirement to 24 hours written notice (WhatsApp/Email), during mutually convenient hours?'
        ],
        suggestedNextStep: 'Amend clause to: "24 hours prior written notice, during mutually agreed hours, except in case of plumbing/electrical emergencies."',
        applicableLaw: {
          act: 'Transfer of Property Act, 1882',
          section: 'Section 108(c)',
          explanation: 'The lessor is bound to secure the lessee quiet and peaceful enjoyment of the property during the lease term.',
          verified: true
        }
      }
    ],
    obligations: [
      {
        id: 'obl-1',
        party: 'Tenant (Srikar Joshi)',
        obligation: 'Pay monthly rent of ₹42,000 on or before the 5th of each calendar month.',
        isFinancial: true,
        conditions: 'Late payment attracts ₹200 per day delayed charge.',
        supportingClause: 'Clause 2(a)',
        status: 'explicit'
      },
      {
        id: 'obl-2',
        party: 'Tenant (Srikar Joshi)',
        obligation: 'Deposit ₹2,50,000 interest-free security deposit prior to taking possession.',
        isFinancial: true,
        conditions: 'Refundable within 7 banking days of key return, subject to deductions.',
        supportingClause: 'Clause 4(a)',
        status: 'explicit'
      },
      {
        id: 'obl-3',
        party: 'Landlord (R. Raghavan)',
        obligation: 'Ensure peaceful possession and repair major structural damages or terrace seepage.',
        isFinancial: false,
        conditions: 'Within 7 days of written notice by tenant.',
        supportingClause: 'Clause 7(b)',
        status: 'explicit'
      },
      {
        id: 'obl-4',
        party: 'Tenant (Srikar Joshi)',
        obligation: 'Provide sixty (60) days prior written notice before vacating after lock-in period.',
        isFinancial: false,
        supportingClause: 'Clause 5(a)',
        status: 'explicit'
      }
    ],
    importantDates: [
      {
        id: 'date-1',
        label: 'Monthly Rent Due Date',
        dateOrPeriod: '5th of every month',
        isOperativeDeadline: true,
        supportingClause: 'Clause 2(a)',
        implications: 'Late fee of ₹200/day begins accruing from the 6th of the month.'
      },
      {
        id: 'date-2',
        label: 'Expiry of 6-Month Lock-in Period',
        dateOrPeriod: '6 months from Agreement Execution Date',
        isOperativeDeadline: true,
        supportingClause: 'Clause 6(a)',
        implications: 'Vacating before this milestone triggers full deposit forfeiture penalty under current terms.'
      },
      {
        id: 'date-3',
        label: 'Tenancy Term Expiry & Renewal',
        dateOrPeriod: '11 months from Possession Date',
        isOperativeDeadline: false,
        supportingClause: 'Clause 3(a)',
        implications: 'Agreement must be renewed or premises handed over; 10% rent hike takes effect upon renewal.'
      }
    ],
    questions: [
      {
        id: 'q-1',
        category: 'Financial Questions',
        question: 'Can the mandatory one-month painting deduction be replaced with actual repair bills or waived if I repaint the flat myself?',
        whyAsk: 'Avoid losing ₹42,000 needlessly if the property remains in good condition.',
        targetParty: 'Landlord',
        status: 'not_asked'
      },
      {
        id: 'q-2',
        category: 'Termination & Renewal',
        question: 'What happens to the deposit if I have an unexpected job relocation during the 6-month lock-in period?',
        whyAsk: 'Clarify whether a 1-month penalty applies instead of full ₹2.5 Lakh deposit loss.',
        targetParty: 'Landlord',
        status: 'not_asked'
      },
      {
        id: 'q-3',
        category: 'Responsibilities & Restrictions',
        question: 'Can we specify 24 hours written notice for landlord inspection visits instead of 2 hours?',
        whyAsk: 'Protects personal privacy and prevents sudden disruptions.',
        targetParty: 'Landlord',
        status: 'not_asked'
      },
      {
        id: 'q-4',
        category: 'Essential Clarifications',
        question: 'Is the society maintenance fee of ₹4,500 included in the rent or paid separately to the Residents Welfare Association (RWA)?',
        whyAsk: 'Prevents unexpected double billing.',
        targetParty: 'Landlord',
        status: 'not_asked'
      }
    ],
    missingInformation: [
      {
        item: 'Meter Reading and Baseline Inventory Schedule',
        reason: 'Agreement refers to "Schedule B - Inventory of Fixtures & Fittings" but the schedule is currently blank.',
        recommendation: 'Ensure all fans, geysers, ACs, and electrical meter readings are documented and co-signed prior to signing.'
      },
      {
        item: 'Security Deposit Refund Timeline & Penalty for Delay',
        reason: 'The agreement specifies when deductions occur, but lacks a strict penalty if the landlord delays deposit refund beyond 7 days.',
        recommendation: 'Add interest clause: "Landlord shall pay 12% p.a. interest for any deposit delay exceeding 14 days from handover."'
      }
    ],
    disclaimers: [
      'This analysis is an AI-assisted informational review of the uploaded document text.',
      'It does not constitute formal legal representation, advocacy, or an attorney-client relationship under the Advocates Act, 1961.',
      'Always consult an advocate for high-value real estate transactions or contested property matters.'
    ],
    rawExtractedText: `RENTAL AGREEMENT
This Rental Agreement is made and executed on this 10th day of October 2026 at Bengaluru by and between:
Mr. R. Raghavan, residing at Indiranagar, Bengaluru (hereinafter called the LESSOR)
AND
Mr. Srikar Joshi, residing at Bengaluru (hereinafter called the LESSEE).
WHEREAS the Lessor is the absolute owner of Residential Flat No. 302...
[CLAUSE 2] Rent: The Lessee shall pay monthly rent of INR 42,000/- on or before the 5th of each month.
[CLAUSE 4(b)] Painting: Upon vacation, Lessor shall deduct one full month rent (INR 42,000/-) towards painting...
[CLAUSE 6(a)] Lock-in: Mandatory lock-in period of 6 months. Early vacation leads to forfeiture of entire deposit of INR 2,50,000/-...`
  },

  // ── SAMPLE 2: TECH EMPLOYMENT & NON-COMPETE AGREEMENT ───────────────────────
  {
    id: 'sample-employment-agreement',
    fileName: 'Senior_Software_Engineer_Employment_Agreement.docx',
    fileSize: '840 KB',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    detectedCategory: 'employment',
    userCategory: 'employment',
    analysisTimestamp: '10 October 2026, 02:15 PM',
    overallStatus: 'Further review recommended',
    isSample: true,
    executiveSummary: {
      agreementType: 'Full-Time Employment Offer & Restrictive Covenants Agreement with a technology software company.',
      yourCommitment: 'Serve as Senior Software Engineer, assign intellectual property, provide 90-day notice, and adhere to confidentiality.',
      counterpartyCommitment: 'Pay annual CTC of ₹28,00,000 (fixed + performance incentive), provide health benefits and paid leave.',
      majorFinancialTerms: 'Base Salary: ₹2,00,000/mo. Performance Bonus: ₹4,00,000/yr. Joining Bonus: ₹2,00,000 (with 1-year clawback).',
      criticalConditions: '12-month post-employment nationwide non-compete clause; broad assignment of IP created even on personal time; 90-day notice period with employer option to enforce service.',
      uncertaintiesToResolve: 'Post-employment non-compete is legally void under Section 27 Indian Contract Act 1872; IP assignment overreaches into personal side-projects.'
    },
    metrics: {
      highAttentionCount: 2,
      needsClarificationCount: 2,
      informationalCount: 1,
      financialObligationsCount: 3,
      deadlinesCount: 2,
      missingItemsCount: 1
    },
    parties: [
      {
        name: 'ApexCloud Technologies India Pvt. Ltd.',
        role: 'Employer / Company',
        summary: 'Technology company hiring engineer for cloud platform development.'
      },
      {
        name: 'Ananya Deshmukh',
        role: 'Employee / Engineer',
        summary: 'Full-time employee subject to confidentiality, IP assignment, and notice periods.'
      }
    ],
    jurisdiction: {
      stated: 'Bengaluru, Karnataka',
      governingLaw: 'Laws of India & Courts of Bengaluru',
      isIndianJurisdiction: true,
      note: 'Indian Contract Act 1872 & Industrial Disputes / Labour codes applicable.'
    },
    clauses: [
      {
        id: 'emp-c1',
        category: 'obligations',
        attentionLevel: 'High attention',
        clauseHeading: '12-Month Post-Employment Nationwide Non-Compete',
        sourceLocation: 'Clause 8.1',
        originalClauseText: 'For a period of twelve (12) months following the termination or cessation of Employment for any reason, the Employee shall not directly or indirectly engage in, advise, invest in, or work for any company, enterprise, or startup operating in cloud computing, developer tooling, or distributed systems anywhere in the territory of India.',
        plainEnglishExplanation: 'The agreement attempts to block you from working for any other cloud computing company in India for an entire year after leaving this job.',
        whatYouAreAgreeingTo: 'A severe post-employment career restriction that attempts to bar you from working in your professional specialization for 12 months.',
        whyItMatters: 'Under Section 27 of the Indian Contract Act, 1872, any agreement that restrains anyone from exercising a lawful profession, trade, or business is void to that extent. The Supreme Court of India (Percept D\'Mark v. Zaheer Khan, 2006; Niranjan Shankar Golikari, 1967) has repeatedly confirmed that post-employment non-compete restrictions are completely unenforceable in India.',
        questionsToAsk: [
          'Can we remove the post-employment non-compete clause or restrict it strictly to non-solicitation of clients and employees?'
        ],
        suggestedNextStep: 'Point out Section 27 and request replacement with a reasonable non-solicitation clause: "Employee agrees not to solicit existing company clients or recruit current staff for 6 months."',
        applicableLaw: {
          act: 'Indian Contract Act, 1872',
          section: 'Section 27',
          explanation: 'Every agreement by which anyone is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void.',
          verified: true
        }
      },
      {
        id: 'emp-c2',
        category: 'ip_confidentiality',
        attentionLevel: 'High attention',
        clauseHeading: 'Broad Assignment of Personal Intellectual Property',
        sourceLocation: 'Clause 5.3',
        originalClauseText: 'The Employee hereby irrevocably assigns to the Company all rights, title, and interest in and to all inventions, software code, algorithms, designs, and works of authorship created, conceived, or reduced to practice during the term of employment, whether or not created during working hours or using Company equipment.',
        plainEnglishExplanation: 'The company claims ownership of everything you code or write during your employment period—even weekend open-source projects or personal side apps built on your own laptop.',
        whatYouAreAgreeingTo: 'Giving away ownership of your independent personal software projects developed completely outside office hours.',
        whyItMatters: 'Standard IP assignment clauses should strictly cover works created in the course of employment, during working hours, using employer resources, or directly relating to the company\'s line of business.',
        questionsToAsk: [
          'Can we add a carve-out for personal projects developed outside working hours on personal equipment that do not relate to the company\'s proprietary technology?'
        ],
        suggestedNextStep: 'Amend clause to include: "Excluding works created by the Employee entirely on personal time, using personal equipment, which do not relate to the Company’s actual or demonstrably anticipated business."',
        applicableLaw: {
          act: 'Copyright Act, 1957',
          section: 'Section 17(c)',
          explanation: 'The employer is the first owner of copyright only in works made in the course of employment under a contract of service.',
          verified: true
        }
      },
      {
        id: 'emp-c3',
        category: 'termination',
        attentionLevel: 'Needs clarification',
        clauseHeading: '90-Day Notice Period with Unilateral Buyout Discretion',
        sourceLocation: 'Clause 9.2',
        originalClauseText: 'Either party may terminate employment by giving ninety (90) calendar days prior written notice. However, the Company reserves the sole discretion to relieve the Employee earlier by paying basic salary in lieu of notice, whereas the Employee shall have no right to buy out the notice period without express written consent of the Management.',
        plainEnglishExplanation: 'You must serve 90 days (3 months) if you resign, and cannot pay money to leave earlier unless the company agrees. But if the company fires you, they can let you go immediately just by paying basic salary.',
        whatYouAreAgreeingTo: 'An asymmetrical termination process where you have zero flexibility to negotiate a shorter transition when moving to a new job.',
        whyItMatters: 'A 90-day notice can complicate accepting new job offers where prospective employers require joining within 30 to 45 days.',
        questionsToAsk: [
          'Can the notice period be reduced to 30 or 45 days during the first year, or can an employee notice buyout option be included?'
        ],
        suggestedNextStep: 'Ask HR if the notice period can be reduced to 30 days during probation and 60 days post-confirmation with mutual buyout rights.',
        applicableLaw: {
          act: 'Industrial Employment (Standing Orders) Act / State Shops & Establishments Act',
          section: 'Notice Provisions',
          explanation: 'State Shops and Establishment Acts generally mandate reasonable notice (usually 30 days) for permanent employees.',
          verified: true
        }
      }
    ],
    obligations: [
      {
        id: 'emp-obl-1',
        party: 'Employer (ApexCloud)',
        obligation: 'Pay agreed remuneration on or before the last working day of each calendar month.',
        isFinancial: true,
        supportingClause: 'Clause 3.1',
        status: 'explicit'
      },
      {
        id: 'emp-obl-2',
        party: 'Employee (Ananya Deshmukh)',
        obligation: 'Serve 90 days notice period upon resignation unless waived in writing by employer.',
        isFinancial: false,
        supportingClause: 'Clause 9.2',
        status: 'explicit'
      },
      {
        id: 'emp-obl-3',
        party: 'Employee (Ananya Deshmukh)',
        obligation: 'Repay full Joining Bonus of ₹2,00,000 if resigning within twelve (12) months of joining.',
        isFinancial: true,
        conditions: 'Deducted directly from final settlement salary.',
        supportingClause: 'Clause 3.4',
        status: 'explicit'
      }
    ],
    importantDates: [
      {
        id: 'emp-date-1',
        label: 'Probation Confirmation Review',
        dateOrPeriod: '3 months from Joining Date',
        isOperativeDeadline: true,
        supportingClause: 'Clause 2.2',
        implications: 'Performance assessment; notice period transitions to 90 days upon confirmation.'
      },
      {
        id: 'emp-date-2',
        label: 'Joining Bonus Clawback Window Expiry',
        dateOrPeriod: '12 months from Joining Date',
        isOperativeDeadline: true,
        supportingClause: 'Clause 3.4',
        implications: 'Resigning before this date triggers ₹2,00,000 clawback obligation.'
      }
    ],
    questions: [
      {
        id: 'emp-q-1',
        category: 'Termination & Renewal',
        question: 'Will the company remove or revise Clause 8.1 (post-employment non-compete) given that non-competes post-termination are void under Section 27 of the Indian Contract Act?',
        whyAsk: 'Ensures contractual clarity and prevents intimidation when pursuing future career opportunities.',
        targetParty: 'HR / Talent Team',
        status: 'not_asked'
      },
      {
        id: 'emp-q-2',
        category: 'Responsibilities & Restrictions',
        question: 'Can the IP assignment clause be limited to code created for the company during working hours or using company repositories?',
        whyAsk: 'Protects personal side-projects, open-source work, and hobbies from company claims.',
        targetParty: 'Legal / HR',
        status: 'not_asked'
      },
      {
        id: 'emp-q-3',
        category: 'Financial Questions',
        question: 'Is the Joining Bonus clawback prorated (e.g. half repaid if leaving at 9 months), or is it strictly 100%?',
        whyAsk: 'Prevents disproportionate deduction upon early exit.',
        targetParty: 'HR',
        status: 'not_asked'
      }
    ],
    missingInformation: [
      {
        item: 'Performance Bonus Criteria & Payout Schedule',
        reason: 'Clause 3.3 mentions ₹4,00,000 annual bonus but marks KPI targets as "at management sole discretion" without clear metrics.',
        recommendation: 'Request written KPI targets and payout timeline (quarterly vs annual).'
      }
    ],
    disclaimers: [
      'This analysis is an informational review comparing terms against prevailing Indian statutory principles.',
      'It does not substitute for customized advice from an employment lawyer.'
    ],
    rawExtractedText: `EMPLOYMENT AGREEMENT & RESTRICTIVE COVENANTS
ApexCloud Technologies India Pvt. Ltd. (Company) and Ananya Deshmukh (Employee).
[CLAUSE 3.4] Joining Bonus of INR 2,00,000 refundable if Employee leaves within 12 months.
[CLAUSE 5.3] Intellectual Property: All works created on or off hours assigned to Company...
[CLAUSE 8.1] Non-Compete: 12 months nationwide restriction post-cessation...
[CLAUSE 9.2] Notice: 90 days mandatory notice with Company buyout right only...`
  },

  // ── SAMPLE 3: FREELANCE / CONSULTANCY SERVICES AGREEMENT ────────────────────
  {
    id: 'sample-freelance-agreement',
    fileName: 'Freelance_Software_Consultancy_Agreement.txt',
    fileSize: '320 KB',
    fileType: 'text/plain',
    detectedCategory: 'freelance',
    userCategory: 'freelance',
    analysisTimestamp: '10 October 2026, 04:45 PM',
    overallStatus: 'Some clauses deserve attention',
    isSample: true,
    executiveSummary: {
      agreementType: 'Independent Contractor / Freelance Software Development & UI Engineering Agreement.',
      yourCommitment: 'Deliver mobile app frontend engineering, provide bug fixes for 30 days, maintain client confidentiality.',
      counterpartyCommitment: 'Pay total fee of ₹3,50,000 in milestones upon written acceptance.',
      majorFinancialTerms: 'Milestone 1: ₹1,00,000 (UI build). Milestone 2: ₹1,50,000 (API wiring). Milestone 3: ₹1,00,000 (Launch).',
      criticalConditions: 'Net-60 payment credit term; client claims IP ownership upon creation before payment is received; uncapped indemnity for indirect damages; distant dispute jurisdiction in Gurugram.',
      uncertaintiesToResolve: 'Delay in payment does not pause IP transfer; acceptance criteria are subjective with no automatic acceptance timeline.'
    },
    metrics: {
      highAttentionCount: 2,
      needsClarificationCount: 2,
      informationalCount: 1,
      financialObligationsCount: 2,
      deadlinesCount: 3,
      missingItemsCount: 1
    },
    parties: [
      {
        name: 'Nexus Retail Ventures LLP',
        role: 'Client',
        summary: 'Commissioning mobile e-commerce application development.'
      },
      {
        name: 'Rohan Varma',
        role: 'Independent Consultant / Developer',
        summary: 'Freelancer delivering engineering services on contractor basis.'
      }
    ],
    jurisdiction: {
      stated: 'Gurugram, Haryana',
      governingLaw: 'Laws of India; Courts of Gurugram',
      isIndianJurisdiction: true,
      note: 'Indian Contract Act 1872 & MSMED Act 2006 (for registered MSMEs).'
    },
    clauses: [
      {
        id: 'free-c1',
        category: 'financial',
        attentionLevel: 'High attention',
        clauseHeading: 'Net-60 Payment Cycle & Delayed Compensation',
        sourceLocation: 'Clause 4(c)',
        originalClauseText: 'Invoices approved by the Client shall be payable within sixty (60) business days from the date of final written sign-off of the corresponding milestone deliverables.',
        plainEnglishExplanation: 'You may have to wait up to 3 months (60 business days = ~84 calendar days) after delivering your work to actually get paid.',
        whatYouAreAgreeingTo: 'Financing the client\'s project on personal credit for nearly 3 months after work completion.',
        whyItMatters: 'Industry standard for freelance contractors in India is Net-15 or Net-30. If the freelancer is registered under MSMED Act 2006, payment cannot exceed 45 days by statute (Section 15 MSMED Act).',
        questionsToAsk: [
          'Can we revise payment terms to Net-15 or Net-30 from invoice submission date?'
        ],
        suggestedNextStep: 'Counter with: "Payment within fifteen (15) calendar days from invoice presentation. Delayed payments incur 1.5% interest per month."',
        applicableLaw: {
          act: 'Micro, Small and Medium Enterprises Development Act, 2006',
          section: 'Section 15 & 16',
          explanation: 'Buyer is mandated to make payment on or before the agreed date, not exceeding forty-five (45) days, with compound interest on delayed payment.',
          verified: true
        }
      },
      {
        id: 'free-c2',
        category: 'ip_confidentiality',
        attentionLevel: 'High attention',
        clauseHeading: 'IP Transfer Prior to Receipt of Full Payment',
        sourceLocation: 'Clause 6(a)',
        originalClauseText: 'All source code, documentation, and deliverables produced by the Consultant shall immediately become the exclusive proprietary property of the Client upon creation, with all copyrights assigned irrevocably.',
        plainEnglishExplanation: 'The client owns all your code the moment you write it, even if they later default on paying your fee.',
        whatYouAreAgreeingTo: 'Transferring your IP ownership without requiring full payment as a condition precedent.',
        whyItMatters: 'If a payment dispute arises, you lose the leverage of retaining code ownership.',
        questionsToAsk: [
          'Can we amend this so IP transfers only upon receipt of full payment for the relevant milestone?'
        ],
        suggestedNextStep: 'Add standard protection clause: "Title and copyright to all deliverables shall transfer to Client strictly upon receipt of full payment of the invoice for the corresponding milestone."',
        applicableLaw: {
          act: 'Copyright Act, 1957',
          section: 'Section 19',
          explanation: 'Assignment of copyright can be made conditional upon fulfillment of agreed contractual terms.',
          verified: true
        }
      },
      {
        id: 'free-c3',
        category: 'disputes',
        attentionLevel: 'Needs clarification',
        clauseHeading: 'Unlimited Consequential Damages Indemnity',
        sourceLocation: 'Clause 9(b)',
        originalClauseText: 'The Consultant shall defend, indemnify, and hold harmless the Client against any and all claims, liabilities, losses, damages, or lost business profits arising directly or indirectly from bugs, errors, or delays in the deliverables.',
        plainEnglishExplanation: 'If a software bug causes the client\'s shop to go down and lose sales, they could theoretically sue you for all their lost profits without any cap.',
        whatYouAreAgreeingTo: 'Unlimited financial liability for indirect business losses far exceeding your total ₹3.5 Lakh contract fee.',
        whyItMatters: 'Independent contractors should never accept uncapped liability for consequential damages. Liability should always be capped at the total fee actually received.',
        questionsToAsk: [
          'Can we add a mutual liability cap equal to 100% of the total fees paid under this agreement, excluding indirect or consequential damages?'
        ],
        suggestedNextStep: 'Insert standard liability limitation: "In no event shall either party be liable for indirect, incidental, or lost-profit damages. Consultant total liability under this agreement shall be capped at fees received."',
        applicableLaw: {
          act: 'Indian Contract Act, 1872',
          section: 'Section 73',
          explanation: 'Compensation is not given for any remote and indirect loss or damage sustained by reason of the breach.',
          verified: true
        }
      }
    ],
    obligations: [
      {
        id: 'free-obl-1',
        party: 'Consultant (Rohan Varma)',
        obligation: 'Deliver milestone deliverables according to agreed specifications within 45 days.',
        isFinancial: false,
        supportingClause: 'Clause 2(b)',
        status: 'explicit'
      },
      {
        id: 'free-obl-2',
        party: 'Client (Nexus Retail)',
        obligation: 'Pay total compensation of ₹3,50,000 upon milestone sign-offs.',
        isFinancial: true,
        supportingClause: 'Clause 4(a)',
        status: 'explicit'
      }
    ],
    importantDates: [
      {
        id: 'free-date-1',
        label: 'Milestone 1 UI Delivery Date',
        dateOrPeriod: 'Day 15 of project kickoff',
        isOperativeDeadline: true,
        supportingClause: 'Schedule A',
        implications: 'Delivery of core screens triggers 5-day review window.'
      },
      {
        id: 'free-date-2',
        label: 'Client Milestone Review Window',
        dateOrPeriod: '5 business days from delivery',
        isOperativeDeadline: false,
        supportingClause: 'Clause 3(b)',
        implications: 'Deliverables deemed accepted if no written rejection within 5 business days.'
      }
    ],
    questions: [
      {
        id: 'free-q-1',
        category: 'Financial Questions',
        question: 'Can payment terms be shortened from Net-60 to Net-15 or Net-30?',
        whyAsk: '60 business days creates severe cash flow vulnerability.',
        targetParty: 'Client Finance',
        status: 'not_asked'
      },
      {
        id: 'free-q-2',
        category: 'Responsibilities & Restrictions',
        question: 'Can we specify that IP transfers strictly upon receipt of cleared payment?',
        whyAsk: 'Ensures legal protection against non-payment.',
        targetParty: 'Client Legal',
        status: 'not_asked'
      },
      {
        id: 'free-q-3',
        category: 'Essential Clarifications',
        question: 'Can we cap consultant liability to the total fee value (₹3,50,000) and exclude consequential damages?',
        whyAsk: 'Prevents disproportionate exposure to business losses.',
        targetParty: 'Client Management',
        status: 'not_asked'
      }
    ],
    missingInformation: [
      {
        item: 'Change Request / Scope Creep Process',
        reason: 'Agreement lacks a clear mechanism for billing additional work if client requests new screens or features.',
        recommendation: 'Add hourly change request rate: "Features outside Schedule A shall be billed at ₹2,500/hour with written approval."'
      }
    ],
    disclaimers: [
      'This analysis is an informational review of contractor terms.',
      'It does not constitute formal legal counsel.'
    ],
    rawExtractedText: `CONSULTING SERVICES AGREEMENT
Nexus Retail Ventures LLP (Client) and Rohan Varma (Consultant).
Total fee: INR 3,50,000/- in 3 milestones.
[CLAUSE 4(c)] Invoices approved payable within 60 business days...
[CLAUSE 6(a)] IP: Deliverables become exclusive property upon creation...
[CLAUSE 9(b)] Indemnity: Consultant indemnifies against lost profits and consequential damages...`
  }
];
