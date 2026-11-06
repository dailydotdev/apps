import { gql } from 'graphql-request';
import type { ApiErrorResult } from './common';
import { ApiError, getApiError, gqlClient } from './common';
import type { EmptyResponse } from './emptyResponse';
import type { Squad } from './sources';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';

// A verified squad's public jobs board. Every job field and mutation lives
// here so the API contract has one place to change.

export enum SquadJobWorkplace {
  OnSite = 'onsite',
  Hybrid = 'hybrid',
  Remote = 'remote',
}

export enum SquadJobEmploymentType {
  FullTime = 'full_time',
  PartTime = 'part_time',
  Contract = 'contract',
  Internship = 'internship',
}

export const squadJobWorkplaceLabel: Record<SquadJobWorkplace, string> = {
  [SquadJobWorkplace.OnSite]: 'On-site',
  [SquadJobWorkplace.Hybrid]: 'Hybrid',
  [SquadJobWorkplace.Remote]: 'Remote',
};

export const squadJobEmploymentTypeLabel: Record<
  SquadJobEmploymentType,
  string
> = {
  [SquadJobEmploymentType.FullTime]: 'Full-time',
  [SquadJobEmploymentType.PartTime]: 'Part-time',
  [SquadJobEmploymentType.Contract]: 'Contract',
  [SquadJobEmploymentType.Internship]: 'Internship',
};

export interface SquadJob {
  id: string;
  /** The squad that lists the role. */
  sourceId: string;
  title: string;
  team: string | null;
  location: string;
  workplace: SquadJobWorkplace;
  employmentType: SquadJobEmploymentType;
  salary: string | null;
  about: string | null;
  bullets: string[];
  applyUrl: string;
  createdAt: string;
}

export type SquadJobInput = Omit<SquadJob, 'id' | 'sourceId' | 'createdAt'>;

const SQUAD_JOB_FRAGMENT = gql`
  fragment SquadJobInfo on SquadJob {
    id
    sourceId
    title
    team
    location
    workplace
    employmentType
    salary
    about
    bullets
    applyUrl
    createdAt
  }
`;

const SQUAD_JOBS_QUERY = gql`
  query SquadJobs($sourceId: ID!) {
    squadJobs(sourceId: $sourceId) {
      ...SquadJobInfo
    }
  }
  ${SQUAD_JOB_FRAGMENT}
`;

const SQUAD_JOB_QUERY = gql`
  query SquadJob($id: ID!) {
    squadJob(id: $id) {
      ...SquadJobInfo
    }
  }
  ${SQUAD_JOB_FRAGMENT}
`;

/** A role that was removed, or is not this viewer's to see. */
export const isSquadJobGone = (error: unknown): boolean =>
  !!getApiError(error as ApiErrorResult, ApiError.NotFound) ||
  !!getApiError(error as ApiErrorResult, ApiError.Forbidden);

export const squadJobsQueryOptions = ({
  squad,
}: {
  squad?: Pick<Squad, 'id' | 'handle' | 'features'>;
}) => ({
  queryKey: generateQueryKey(
    RequestKey.Squad,
    undefined,
    squad?.handle,
    'jobs',
  ),
  queryFn: async (): Promise<SquadJob[]> => {
    const res = await gqlClient.request<{ squadJobs: SquadJob[] }>(
      SQUAD_JOBS_QUERY,
      { sourceId: squad?.id },
    );

    return res.squadJobs;
  },
  enabled: !!squad?.id && !!squad?.features?.jobs,
  staleTime: StaleTime.Default,
});

export const squadJobQueryOptions = (id?: string) => ({
  queryKey: generateQueryKey(RequestKey.Squad, undefined, 'job', id),
  queryFn: async (): Promise<SquadJob> => {
    const res = await gqlClient.request<{ squadJob: SquadJob }>(
      SQUAD_JOB_QUERY,
      { id },
    );

    return res.squadJob;
  },
  enabled: !!id,
  // A blip is retried, a removed role stops at once
  retry: (failureCount: number, error: unknown): boolean =>
    !isSquadJobGone(error) && failureCount < 2,
  staleTime: StaleTime.Default,
});

const ADD_SQUAD_JOB_MUTATION = gql`
  mutation AddSquadJob($sourceId: ID!, $input: SquadJobInput!) {
    addSquadJob(sourceId: $sourceId, input: $input) {
      ...SquadJobInfo
    }
  }
  ${SQUAD_JOB_FRAGMENT}
`;

const UPDATE_SQUAD_JOB_MUTATION = gql`
  mutation UpdateSquadJob($id: ID!, $input: UpdateSquadJobInput!) {
    updateSquadJob(id: $id, input: $input) {
      ...SquadJobInfo
    }
  }
  ${SQUAD_JOB_FRAGMENT}
`;

const REMOVE_SQUAD_JOB_MUTATION = gql`
  mutation RemoveSquadJob($id: ID!) {
    removeSquadJob(id: $id) {
      _
    }
  }
`;

const REORDER_SQUAD_JOBS_MUTATION = gql`
  mutation ReorderSquadJobs($sourceId: ID!, $ids: [ID!]!) {
    reorderSquadJobs(sourceId: $sourceId, ids: $ids) {
      ...SquadJobInfo
    }
  }
  ${SQUAD_JOB_FRAGMENT}
`;

export const addSquadJob = async (params: {
  sourceId: string;
  input: SquadJobInput;
}): Promise<SquadJob> => {
  const res = await gqlClient.request<{ addSquadJob: SquadJob }>(
    ADD_SQUAD_JOB_MUTATION,
    params,
  );

  return res.addSquadJob;
};

export const updateSquadJob = async (params: {
  id: string;
  input: SquadJobInput;
}): Promise<SquadJob> => {
  const res = await gqlClient.request<{ updateSquadJob: SquadJob }>(
    UPDATE_SQUAD_JOB_MUTATION,
    params,
  );

  return res.updateSquadJob;
};

export const removeSquadJob = (id: string): Promise<EmptyResponse> =>
  gqlClient.request(REMOVE_SQUAD_JOB_MUTATION, { id });

export const reorderSquadJobs = async (params: {
  sourceId: string;
  ids: string[];
}): Promise<SquadJob[]> => {
  const res = await gqlClient.request<{ reorderSquadJobs: SquadJob[] }>(
    REORDER_SQUAD_JOBS_MUTATION,
    params,
  );

  return res.reorderSquadJobs;
};
