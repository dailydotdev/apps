import type { ProtoEnumValue } from '../../lib/protobuf';
import type { PublicProfile } from '../../lib/user';
import type { Organization } from '../organizations/types';
import type {
  EmploymentType,
  OpportunityState,
  SalaryPeriod,
} from './protobuf/opportunity';
import type { CompanySize, CompanyStage } from './protobuf/organization';
import type { CandidateStatus } from './protobuf/user-candidate-preference';
import type { LocationType } from './protobuf/util';
import type { Connection } from '../../graphql/common';
import type { Squad } from '../../graphql/sources';
import type { TopReader } from '../../components/badges/TopReaderBadge';
import type { SubscriptionStatus } from '../../lib/plus';

export enum OpportunityMatchStatus {
  Pending = 'pending',
  CandidateAccepted = 'candidate_accepted',
  CandidateRejected = 'candidate_rejected',
  CandidateTimeOut = 'candidate_time_out',
  RecruiterAccepted = 'recruiter_accepted',
  RecruiterRejected = 'recruiter_rejected',
}

export enum RoleType {
  IC = 0.0,
  Auto = 0.5,
  Managerial = 1.0,
}

export type RecruiterProfile = Pick<
  PublicProfile,
  'id' | 'name' | 'username' | 'image' | 'bio'
> & {
  title?: string;
};

type OpportunityContentBlock = {
  content?: string;
  html?: string;
};

export type OpportunityLocation = {
  type?: ProtoEnumValue;
  city?: string;
  country?: string;
  subdivision?: string;
  continent?: string;
};

export type Salary = {
  min?: number;
  max?: number;
  currency?: string;
  period?: SalaryPeriod;
};

export type OpportunityMeta = {
  employmentType?: ProtoEnumValue;
  teamSize?: number;
  salary?: Salary;
  seniorityLevel?: ProtoEnumValue;
  roleType?: number;
  equity?: boolean;
};

export type Keyword = {
  keyword: string;
};

export type OpportunityScreeningQuestion = {
  id: string;
  title: string;
  placeholder?: string;
};

export type OpportunityFeedbackQuestion = {
  id: string;
  title: string;
  order: number;
  placeholder?: string;
  opportunityId: string;
};

export type OpportunityScreeningAnswer = {
  questionId: OpportunityScreeningQuestion['id'];
  answer: string;
};

export type Opportunity = {
  id: string;
  type: ProtoEnumValue;
  state: OpportunityState;
  title: string;
  tldr: string;
  organization?: Organization;
  content: {
    overview: OpportunityContentBlock;
  };
  meta: OpportunityMeta;
  recruiters: RecruiterProfile[];
  location: OpportunityLocation[];
  keywords?: Keyword[];
  questions?: OpportunityScreeningQuestion[];
  feedbackQuestions?: OpportunityFeedbackQuestion[];
  subscriptionStatus: SubscriptionStatus;
};

export type OpportunityMatchDescription = {
  reasoning: string;
};

export type ScreeningAnswer = {
  screening: string;
  answer: string;
};

export type ApplicationRank = {
  score?: number;
  description?: string;
  warmIntro?: string;
};

export type EngagementProfile = {
  profileText: string;
  updatedAt: Date;
};

export type OpportunityMatch = {
  status: OpportunityMatchStatus;
  description: OpportunityMatchDescription;
  userId: string;
  opportunityId: string;
  createdAt: Date;
  updatedAt: Date;
  user: PublicProfile;
  opportunity?: Opportunity;
  candidatePreferences?: UserCandidatePreferences;
  screening: ScreeningAnswer[];
  feedback: ScreeningAnswer[];
  applicationRank: ApplicationRank;
  engagementProfile?: EngagementProfile;
  previewUser: OpportunityPreviewUser | null;
};

export type GcsBlob = {
  blob?: string;
  fileName: string;
  contentType?: string;
  lastModified: Date;
  signedUrl?: string;
};

export type UserCandidateKeyword = Keyword;

export type UserCandidatePreferences = {
  status: CandidateStatus;
  cv?: GcsBlob;
  employmentAgreement?: GcsBlob;
  role: string;
  roleType: number;
  salaryExpectation?: Omit<Salary, 'max' | 'currency'>;
  location?: Omit<OpportunityLocation, 'type' | 'subdivision' | 'continent'>[];
  locationType?: LocationType[];
  employmentType?: EmploymentType[];
  companyStage?: CompanyStage[];
  companySize?: CompanySize[];
  customKeywords?: boolean;
  keywords?: Array<UserCandidateKeyword>;
};

export const recruiterLayoutHeaderClassName = 'recruiter-layout-header';

export type OpportunityMatchLocation = Pick<
  OpportunityLocation,
  'city' | 'country'
>;

export interface OpportunityCandidatePreferences {
  role: string | null;
  location: OpportunityMatchLocation[];
}

export interface OpportunityMatchesData {
  opportunityMatches: Connection<OpportunityMatch>;
}

export interface OpportunityPreviewCompany {
  name: string;
  favicon?: string;
}

export interface OpportunityPreviewUser {
  /** Real user ID */
  id: string;
  /** User profile image */
  profileImage?: string;
  /** Anonymized ID (e.g., anon #1002) */
  anonId: string;
  /** User description/bio */
  description?: string;
  /** Whether the user is open to work */
  openToWork: boolean;
  /** User seniority level */
  seniority?: string;
  /** User location (from preferences or geo flags) */
  location?: string;
  /** Active company from experience */
  company?: OpportunityPreviewCompany;
  /** Last activity timestamp */
  lastActivity?: Date;
  /** Top tags for the user */
  topTags?: string[];
  /** Top reader badges with tag and issue date */
  recentlyRead?: TopReader[];
  /** Active squad IDs */
  activeSquads?: Squad[];
}

export interface OpportunityPreviewResult {
  tags: string[];
  companies: OpportunityPreviewCompany[];
  squads: Squad[];
  totalCount?: number;
  opportunityId?: string;
}

export interface OpportunityPreviewConnection
  extends Connection<OpportunityPreviewUser> {
  result?: OpportunityPreviewResult;
}

export type OpportunityPreviewResponse = OpportunityPreviewConnection;

export type OpportunityStats = {
  matched: number;
  reached: number;
  considered: number;
  decided: number;
  forReview: number;
  introduced: number;
};
