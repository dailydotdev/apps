import { gqlClient } from './common';
import type { Post } from './posts';

export enum UserInterestStatus {
  Active = 'active',
  Paused = 'paused',
  Stopped = 'stopped',
}

export type UserInterest = {
  id: string;
  query: string;
  status: UserInterestStatus;
  feedId?: string | null;
  sourceId?: string | null;
  lastRunAt?: string | null;
  lastRunSummary?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InterestFinding = {
  id: string;
  postId: string;
  score: number;
  rationale?: string | null;
  status: string;
  createdAt: string;
  post?: Pick<
    Post,
    'id' | 'title' | 'image' | 'permalink' | 'commentsPermalink' | 'readTime'
  > | null;
};

const USER_INTEREST_FRAGMENT = `
  fragment UserInterestFragment on UserInterest {
    id
    query
    status
    feedId
    sourceId
    lastRunAt
    lastRunSummary
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
  query InterestFindings($id: ID!) {
    interestFindings(id: $id) {
      id
      postId
      score
      rationale
      status
      createdAt
      post {
        id
        title
        image
        permalink
        commentsPermalink
        readTime
      }
    }
  }
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
  mutation SendInterestCommand($id: ID!, $text: String!) {
    sendInterestCommand(id: $id, text: $text) {
      id
    }
  }
`;

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
}: {
  id: string;
  text: string;
}): Promise<Pick<UserInterest, 'id'>> => {
  const res = await gqlClient.request<{
    sendInterestCommand: Pick<UserInterest, 'id'>;
  }>(SEND_INTEREST_COMMAND_MUTATION, { id, text });
  return res.sendInterestCommand;
};
