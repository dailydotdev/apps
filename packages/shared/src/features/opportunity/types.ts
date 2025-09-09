import type { ProtoEnumValue } from '../../lib/protobuf';
import type { PublicProfile } from '../../lib/user';
import type { Organization } from '../organizations/types';

export enum OpportunityMatchStatus {
  Pending = 'pending',
  CandidateAccepted = 'candidate_accepted',
  CandidateRejected = 'candidate_rejected',
  CandidateTimeOut = 'candidate_time_out',
  RecruiterAccepted = 'recruiter_accepted',
  RecruiterRejected = 'recruiter_rejected',
}

type OpportunityContentBlock = {
  content?: string;
  html?: string;
};

export type OpportunityLocation = {
  type: ProtoEnumValue;
  city?: string;
  country?: string;
  subdivision?: string;
  continent?: string;
};

export type Salary = {
  min: number;
  max: number;
  currency: string;
  period: ProtoEnumValue;
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
  meta: {
    employmentType: ProtoEnumValue;
    teamSize: number;
    salary: Salary;
    seniorityLevel: ProtoEnumValue;
    roleType: number;
  };
  recruiters: PublicProfile[];
  location: OpportunityLocation[];
  keywords?: {
    value: string;
  }[];
};

export type OpportunityMatch = {
  status: OpportunityMatchStatus;
  description?: {
    reasoning: string;
  };
};
