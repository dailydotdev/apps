import { gqlClient } from './common';
import type { Connection } from './common';
import type { Post } from './posts';
import { FEED_POST_FRAGMENT } from './fragments';
import { USER_POST_FRAGMENT } from './feed';

export enum UserInterestStatus {
  Active = 'active',
  Paused = 'paused',
  Stopped = 'stopped',
  Onboarding = 'onboarding',
}

export enum UserInterestOnboardingStep {
  Questions = 'questions',
  Brief = 'brief',
  Settings = 'settings',
}

export enum UserInterestCadence {
  Auto = 'auto',
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
  Scheduled = 'scheduled',
  Onboarding = 'onboarding',
}

export type UserInterest = {
  id: string;
  query: string;
  title?: string | null;
  brief?: string | null;
  onboardingStep?: UserInterestOnboardingStep | null;
  status: UserInterestStatus;
  cadence: UserInterestCadence;
  fomoThreshold: number;
  sources: InterestSources;
  outputModes: InterestOutputModes;
  showHistory: boolean;
  feedId?: string | null;
  sourceId?: string | null;
  lastRunAt?: string | null;
  lastRunSummary?: string | null;
  lastRunStatus?: InterestRunStatus | null;
  lastRunFindings?: number | null;
  createdAt: string;
  updatedAt: string;
};

export const interestDisplayName = (
  interest: Pick<UserInterest, 'query' | 'title'> | null | undefined,
  fallback = 'Your agent',
): string => interest?.title ?? interest?.query ?? fallback;

export type UpdateInterestInput = {
  status?: UserInterestStatus;
  cadence?: UserInterestCadence;
  fomoThreshold?: number;
  sources?: Partial<InterestSources>;
  outputModes?: Partial<InterestOutputModes>;
  showHistory?: boolean;
};

export type CreateInterestSettings = Omit<UpdateInterestInput, 'status'>;

export const defaultCreateInterestSettings: CreateInterestSettings = {
  cadence: UserInterestCadence.Auto,
  fomoThreshold: 0.5,
  outputModes: { feed: true, post: true, digest: false, notification: true },
  showHistory: true,
};

export type InterestFinding = {
  id: string;
  score: number;
  rationale?: string | null;
  createdAt: string;
  post?: Post | null;
};

export type InterestQuestionChoice = { value: string; label: string };

export type InterestRunBlock =
  | { type: 'text'; html: string }
  | { type: 'picks'; caption?: string; postIds: string[] }
  | { type: 'feedLink'; label: string; count: number; postIds?: string[] }
  | {
      type: 'question';
      questionId: string;
      html: string;
      input: 'chips' | 'text';
      multi?: boolean;
      choices?: InterestQuestionChoice[];
      selected?: string[];
    }
  | { type: 'brief'; html: string; brief: string }
  | { type: 'review' };

export type InterestTurnRelationship = {
  id: string;
  entity: 'post';
  entityId: string;
  url: string | null;
  title: string | null;
  summary: string | null;
};

export enum InterestReplyStatus {
  Queued = 'queued',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
}

export type InterestTurn = {
  id: string;
  role: 'user' | 'agent';
  createdAt: string;
  text?: string | null;
  relationships?: InterestTurnRelationship[] | null;
  status?: InterestRunStatus | null;
  trigger?: InterestRunTrigger | null;
  feedbackId?: string | null;
  replyStatus?: InterestReplyStatus | null;
  replyBlocks?: InterestRunBlock[] | null;
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
    title
    brief
    onboardingStep
    status
    cadence
    fomoThreshold
    sources
    outputModes
    showHistory
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
      score
      rationale
      createdAt
      post {
        ...FeedPost
        ...UserPost @include(if: $loggedIn)
      }
    }
  }
  ${FEED_POST_FRAGMENT}
  ${USER_POST_FRAGMENT}
`;

export const CREATE_INTEREST_MUTATION = `
  mutation CreateInterest($query: String!, $settings: CreateInterestSettingsInput, $onboarding: Boolean) {
    createInterest(query: $query, settings: $settings, onboarding: $onboarding) {
      ...UserInterestFragment
    }
  }
  ${USER_INTEREST_FRAGMENT}
`;

export const SEND_INTEREST_COMMAND_MUTATION = `
  mutation SendInterestCommand($id: ID!, $text: String!, $runId: String, $reply: Boolean, $questionId: String) {
    sendInterestCommand(id: $id, text: $text, runId: $runId, reply: $reply, questionId: $questionId) {
      id
    }
  }
`;

export const CONFIRM_INTEREST_BRIEF_MUTATION = `
  mutation ConfirmInterestBrief($id: ID!, $brief: String) {
    confirmInterestBrief(id: $id, brief: $brief) {
      ...UserInterestFragment
    }
  }
  ${USER_INTEREST_FRAGMENT}
`;

export const COMPLETE_INTEREST_ONBOARDING_MUTATION = `
  mutation CompleteInterestOnboarding($id: ID!) {
    completeInterestOnboarding(id: $id) {
      ...UserInterestFragment
    }
  }
  ${USER_INTEREST_FRAGMENT}
`;

export const INTEREST_HISTORY_QUERY = `
  query InterestHistory(
    $id: ID!
    $first: Int
    $after: String
    $last: Int
    $before: String
  ) {
    interestHistory(
      id: $id
      first: $first
      after: $after
      last: $last
      before: $before
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          id
          role
          createdAt
          text
          relationships
          status
          trigger
          feedbackId
          replyStatus
          replyBlocks
          blocks
          findingsAdded
          summaryPostId
          startedAt
          finishedAt
        }
      }
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

export const createInterest = async ({
  query,
  settings,
  onboarding,
}: {
  query: string;
  settings?: CreateInterestSettings;
  onboarding?: boolean;
}): Promise<UserInterest> => {
  const res = await gqlClient.request<{ createInterest: UserInterest }>(
    CREATE_INTEREST_MUTATION,
    { query, settings, onboarding },
  );
  return res.createInterest;
};

export const confirmInterestBrief = async ({
  id,
  brief,
}: {
  id: string;
  brief?: string;
}): Promise<UserInterest> => {
  const res = await gqlClient.request<{ confirmInterestBrief: UserInterest }>(
    CONFIRM_INTEREST_BRIEF_MUTATION,
    { id, brief },
  );
  return res.confirmInterestBrief;
};

export const completeInterestOnboarding = async (
  id: string,
): Promise<UserInterest> => {
  const res = await gqlClient.request<{
    completeInterestOnboarding: UserInterest;
  }>(COMPLETE_INTEREST_ONBOARDING_MUTATION, { id });
  return res.completeInterestOnboarding;
};

export const sendInterestCommand = async ({
  id,
  text,
  runId,
  reply,
  questionId,
}: {
  id: string;
  text: string;
  runId?: string;
  reply?: boolean;
  questionId?: string;
}): Promise<Pick<UserInterest, 'id'>> => {
  const res = await gqlClient.request<{
    sendInterestCommand: Pick<UserInterest, 'id'>;
  }>(SEND_INTEREST_COMMAND_MUTATION, { id, text, runId, reply, questionId });
  return res.sendInterestCommand;
};

export type InterestHistoryArgs = {
  id: string;
  first?: number;
  after?: string;
  last?: number;
  before?: string;
};

export const getInterestHistory = async (
  args: InterestHistoryArgs,
): Promise<Connection<InterestTurn>> => {
  const res = await gqlClient.request<{
    interestHistory: Connection<InterestTurn>;
  }>(INTEREST_HISTORY_QUERY, args);
  return res.interestHistory;
};

export const INTEREST_RUN_QUERY = `
  query InterestRun($id: ID!, $runId: ID!) {
    interestRun(id: $id, runId: $runId) {
      id
      role
      createdAt
      text
      relationships
      status
      trigger
      feedbackId
      replyStatus
      replyBlocks
      blocks
      findingsAdded
      summaryPostId
      startedAt
      finishedAt
    }
  }
`;

export const getInterestRun = async ({
  id,
  runId,
}: {
  id: string;
  runId: string;
}): Promise<InterestTurn> => {
  const res = await gqlClient.request<{ interestRun: InterestTurn }>(
    INTEREST_RUN_QUERY,
    { id, runId },
  );
  return res.interestRun;
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
