import { gqlClient } from './common';
import type { Post } from './posts';
import { FEED_POST_FRAGMENT } from './fragments';
import { USER_POST_FRAGMENT } from './feed';

export enum UserInterestStatus {
  Active = 'active',
  Paused = 'paused',
  Stopped = 'stopped',
}

export enum UserInterestCadence {
  Hourly = 'hourly',
  Daily = 'daily',
  Weekly = 'weekly',
}

export type InterestSources = {
  dailyDev: boolean;
  web: boolean;
  github: boolean;
};

export type InterestOutputModes = {
  feed: boolean;
  post: boolean;
  digest: boolean;
  notification: boolean;
};

export enum InterestRunStatus {
  Queued = 'queued',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
}

export enum InterestRunTrigger {
  Spawn = 'spawn',
  Command = 'command',
  Scheduled = 'scheduled',
}

export type UserInterest = {
  id: string;
  query: string;
  status: UserInterestStatus;
  cadence: UserInterestCadence;
  fomoThreshold: number;
  sources: InterestSources;
  outputModes: InterestOutputModes;
  feedId?: string | null;
  sourceId?: string | null;
  lastRunAt?: string | null;
  lastRunSummary?: string | null;
  lastRunStatus?: InterestRunStatus | null;
  lastRunFindings?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateInterestInput = {
  status?: UserInterestStatus;
  cadence?: UserInterestCadence;
  fomoThreshold?: number;
  sources?: Partial<InterestSources>;
  outputModes?: Partial<InterestOutputModes>;
};

export type InterestFinding = {
  id: string;
  postId: string;
  score: number;
  rationale?: string | null;
  status: string;
  createdAt: string;
  post?: Post | null;
};

export type InterestRunBlock =
  | { type: 'text'; html: string }
  | { type: 'picks'; caption?: string; postIds: string[] }
  | { type: 'feedLink'; label: string; count: number; postIds?: string[] };

export type InterestTurn = {
  id: string;
  role: 'user' | 'agent';
  createdAt: string;
  text?: string | null;
  status?: InterestRunStatus | null;
  trigger?: InterestRunTrigger | null;
  feedbackId?: string | null;
  blocks?: InterestRunBlock[] | null;
  findingsAdded?: number | null;
  summaryPostId?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
};

const USER_INTEREST_FRAGMENT = `
  fragment UserInterestFragment on UserInterest {
    id
    query
    status
    cadence
    fomoThreshold
    sources
    outputModes
    feedId
    sourceId
    lastRunAt
    lastRunSummary
    lastRunStatus
    lastRunFindings
    createdAt
    updatedAt
  }
`;

export const INTERESTS_QUERY = `
  query Interests {
    interests {
      ...UserInterestFragment
    }
  }
  ${USER_INTEREST_FRAGMENT}
`;

export const INTEREST_QUERY = `
  query Interest($id: ID!) {
    interest(id: $id) {
      ...UserInterestFragment
    }
  }
  ${USER_INTEREST_FRAGMENT}
`;

export const INTEREST_FINDINGS_QUERY = `
  query InterestFindings($id: ID!, $loggedIn: Boolean! = true) {
    interestFindings(id: $id) {
      id
      postId
      score
      rationale
      status
      createdAt
      post {
        ...FeedPost
        contentHtml
        ...UserPost @include(if: $loggedIn)
      }
    }
  }
  ${FEED_POST_FRAGMENT}
  ${USER_POST_FRAGMENT}
`;

export const CREATE_INTEREST_MUTATION = `
  mutation CreateInterest($query: String!) {
    createInterest(query: $query) {
      ...UserInterestFragment
    }
  }
  ${USER_INTEREST_FRAGMENT}
`;

export const SEND_INTEREST_COMMAND_MUTATION = `
  mutation SendInterestCommand($id: ID!, $text: String!, $triggerRun: Boolean) {
    sendInterestCommand(id: $id, text: $text, triggerRun: $triggerRun) {
      id
    }
  }
`;

export const INTEREST_HISTORY_QUERY = `
  query InterestHistory($id: ID!) {
    interestHistory(id: $id) {
      id
      role
      createdAt
      text
      status
      trigger
      feedbackId
      blocks
      findingsAdded
      summaryPostId
      startedAt
      finishedAt
    }
  }
`;

export const UPDATE_INTEREST_MUTATION = `
  mutation UpdateInterest($id: ID!, $data: UpdateInterestInput!) {
    updateInterest(id: $id, data: $data) {
      ...UserInterestFragment
    }
  }
  ${USER_INTEREST_FRAGMENT}
`;

export const DELETE_INTEREST_MUTATION = `
  mutation DeleteInterest($id: ID!) {
    deleteInterest(id: $id) {
      _
    }
  }
`;

export const INTEREST_POSTS_QUERY = `
  query InterestPosts($id: ID!) {
    interestPosts(id: $id) {
      id
      title
      content
      contentHtml
      permalink
      commentsPermalink
      createdAt
    }
  }
`;

export type InterestPost = Pick<
  Post,
  | 'id'
  | 'title'
  | 'content'
  | 'contentHtml'
  | 'permalink'
  | 'commentsPermalink'
  | 'createdAt'
>;

export const getInterests = async (): Promise<UserInterest[]> => {
  const res = await gqlClient.request<{ interests: UserInterest[] }>(
    INTERESTS_QUERY,
  );
  return res.interests;
};

export const getInterest = async (id: string): Promise<UserInterest | null> => {
  const res = await gqlClient.request<{ interest: UserInterest | null }>(
    INTEREST_QUERY,
    { id },
  );
  return res.interest;
};

export const getInterestFindings = async (
  id: string,
): Promise<InterestFinding[]> => {
  const res = await gqlClient.request<{ interestFindings: InterestFinding[] }>(
    INTEREST_FINDINGS_QUERY,
    { id },
  );
  return res.interestFindings;
};

export const createInterest = async (query: string): Promise<UserInterest> => {
  const res = await gqlClient.request<{ createInterest: UserInterest }>(
    CREATE_INTEREST_MUTATION,
    { query },
  );
  return res.createInterest;
};

export const sendInterestCommand = async ({
  id,
  text,
  triggerRun,
}: {
  id: string;
  text: string;
  triggerRun?: boolean;
}): Promise<Pick<UserInterest, 'id'>> => {
  const res = await gqlClient.request<{
    sendInterestCommand: Pick<UserInterest, 'id'>;
  }>(SEND_INTEREST_COMMAND_MUTATION, { id, text, triggerRun });
  return res.sendInterestCommand;
};

export const getInterestHistory = async (
  id: string,
): Promise<InterestTurn[]> => {
  const res = await gqlClient.request<{ interestHistory: InterestTurn[] }>(
    INTEREST_HISTORY_QUERY,
    { id },
  );
  return res.interestHistory;
};

export const updateInterest = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateInterestInput;
}): Promise<UserInterest> => {
  const res = await gqlClient.request<{ updateInterest: UserInterest }>(
    UPDATE_INTEREST_MUTATION,
    { id, data },
  );
  return res.updateInterest;
};

export const deleteInterest = async (id: string): Promise<void> => {
  await gqlClient.request(DELETE_INTEREST_MUTATION, { id });
};

export const getInterestPosts = async (id: string): Promise<InterestPost[]> => {
  const res = await gqlClient.request<{ interestPosts: InterestPost[] }>(
    INTEREST_POSTS_QUERY,
    { id },
  );
  return res.interestPosts;
};
