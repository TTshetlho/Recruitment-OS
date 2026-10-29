export interface JobOpening {
  id: string;
  title: string;
  department: string;
  grantCode: string;
  description: string;
  requirements: string[];
  status: 'active' | 'filled' | 'draft';
  datePosted: string;
  workplaceType?: 'onsite' | 'remote' | 'hybrid';
  province?: string;
  townCity?: string;
  category?: string;
  referenceNumber?: string;
  dateClosing?: string;
}

export interface Publication {
  title: string;
  journal: string;
  year: number;
  citations: number;
}

export interface AcademicCVData {
  education: { degree: string; institution: string; year: number }[];
  publications: Publication[];
  grantHistory: { title: string; fundingAgency: string; amount: string; year: number }[];
  hIndex?: number;
  extractedKeywords?: string[];
  summary?: string;
}

export interface ATSCriterionMatch {
  criterion: string;
  matched: boolean;
  score: number; // 0 - 100
  evidence: string;
}

export interface ATSAssessment {
  candidateId: string;
  jobId: string;
  scannedAt: string;
  overallScore: number; // 0 - 100
  probabilityOfAlignment: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  verdict: "Strongly Recommended" | "Recommended" | "Moderate Match" | "Low Alignment" | "Not Qualified";
  breakdown: {
    requirementsMatch: {
      score: number;
      summary: string;
      criteria: ATSCriterionMatch[];
    };
    jobDescriptionFit: {
      score: number;
      summary: string;
      domainRelevance: string;
    };
    keyResponsibilitiesAlignment: {
      score: number;
      summary: string;
      competenciesIdentified: string[];
      competenciesMissing: string[];
    };
    academicBibliometrics: {
      score: number;
      hIndexEvaluation: string;
      publicationEvaluation: string;
      grantCapacity: string;
    };
  };
  matchedKeywords: string[];
  missingKeywords: string[];
  executiveSummary: string;
  atsRecommendation: string;
  autoShortlisted?: boolean;
}

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  orcid?: string;
  scholarLink?: string;
  hIndex?: number;
  stage: 'applied' | 'committee_review' | 'seminar' | 'offer' | 'shortlisted' | 'rejected';
  researchProposal?: string;
  education?: string;
  grantHistory?: string;
  publications?: Publication[];
  cvParsedData?: AcademicCVData;
  cvTextRaw?: string;
  statusNotes?: string;
  dateApplied: string;
  atsAssessment?: ATSAssessment;
}

export interface Evaluation {
  id: string;
  candidateId: string;
  reviewerName: string;
  reviewerRole: 'recruiter' | 'pi' | 'reviewer';
  scoreScientificMerit: number; // 1-5
  scoreFundingPotential: number; // 1-5
  scoreTeachingAbility: number; // 1-5
  comments: string;
  blindedComments?: string; // AI masked comments for blind reviews
  dateSubmitted: string;
}

export interface Referee {
  id: string;
  candidateId: string;
  name: string;
  email: string;
  institution: string;
  status: 'pending' | 'submitted';
  token: string;
  letterContent?: string;
  dateUploaded?: string;
}

