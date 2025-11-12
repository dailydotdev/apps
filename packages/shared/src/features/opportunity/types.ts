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
  organization: Organization;
  content: {
    overview: OpportunityContentBlock;
  };
  meta: OpportunityMeta;
  recruiters: RecruiterProfile[];
  location: OpportunityLocation[];
  keywords?: Keyword[];
  questions?: OpportunityScreeningQuestion[];
  feedbackQuestions?: OpportunityFeedbackQuestion[];
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
  candidatePreferences?: UserCandidatePreferences;
  screening: ScreeningAnswer[];
  feedback: ScreeningAnswer[];
  applicationRank: ApplicationRank;
  engagementProfile?: EngagementProfile;
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
