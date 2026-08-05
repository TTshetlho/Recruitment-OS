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

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  orcid?: string;
  scholarLink?: string;
  hIndex?: number;
  stage: 'applied' | 'committee_review' | 'seminar' | 'offer';
  researchProposal?: string;
  education?: string;
  grantHistory?: string;
  publications?: Publication[];
  cvParsedData?: AcademicCVData;
  cvTextRaw?: string;
  statusNotes?: string;
  dateApplied: string;
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
