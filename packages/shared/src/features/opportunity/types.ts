import type { ProtoEnumValue } from '../../lib/protobuf';
import type { PublicProfile } from '../../lib/user';
import type { Organization } from '../organizations/types';
import type { EmploymentType, SalaryPeriod } from './protobuf/opportunity';
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
};

export type OpportunityKeyword = {
  keyword: string;
};

export type Opportunity = {
  id: string;
  type: ProtoEnumValue;
  title: string;
  tldr: string;
  organization: Organization;
  content: {
    overview: OpportunityContentBlock;
  };
  meta: OpportunityMeta;
  recruiters: PublicProfile[];
  location: OpportunityLocation[];
  keywords?: OpportunityKeyword[];
};

export type OpportunityMatch = {
  status: OpportunityMatchStatus;
  description?: {
    reasoning: string;
  };
};

export type UserCV = {
  blob: string;
  contentType: string;
  lastModified: Date;
};

export type UserCandidatePreferences = {
  status: CandidateStatus;
  cv?: UserCV;
  role: string;
  roleType: number;
  salaryExpectation?: Omit<Salary, 'max' | 'currency'>;
  location?: Omit<OpportunityLocation, 'type' | 'subdivision' | 'continent'>[];
  locationType?: LocationType[];
  employmentType?: EmploymentType[];
  companyStage?: CompanyStage[];
  companySize?: CompanySize[];
};
