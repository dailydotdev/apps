import { useQuery } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import { RequestKey, StaleTime } from '../../../lib/query';
import { gqlClient } from '../../../graphql/common';
import { OPPORTUNITY_BY_ID_QUERY } from '../graphql';
import type { Organization } from '../../organizations/types';
import type { PublicProfile } from '../../../lib/user';
import type { ProtoEnumValue } from '../../../lib/protobuf';

export const getOpportunityByIdKey = (id: string): QueryKey => [
  RequestKey.Opportunity,
  id,
];

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

export const opportunityByIdOptions = ({ id }: { id: string }) => {
  return {
    queryKey: getOpportunityByIdKey(id),
    queryFn: async () => {
      const res = await gqlClient.request<{
        opportunityById: Opportunity;
      }>(OPPORTUNITY_BY_ID_QUERY, {
        id,
      });

      return res.opportunityById;
    },
    staleTime: StaleTime.Default,
    enabled: !!id,
  };
};

export const useOpportunity = (id: string) => {
  const { data: opportunity } = useQuery(opportunityByIdOptions({ id }));

  return { opportunity };
};
