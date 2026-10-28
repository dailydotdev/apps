import { useInfiniteQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import {
  generateQueryKey,
  getNextPageParam,
  RequestKey,
  StaleTime,
} from '../lib/query';
import type { Connection } from './common';
import { gqlClient } from './common';
import type { EmptyResponse } from './emptyResponse';

export enum FeedbackCategory {
  Unspecified = 0,
  BugReport = 1,
  FeatureRequest = 2,
  UxIssue = 5,
  PerformanceComplaint = 6,
  ContentQuality = 7,
}

export enum FeedbackStatus {
  Pending = 0,
  Processing = 1,
  Accepted = 2,
  Completed = 3,
  Cancelled = 4,
  Failed = 5,
  Spam = 6,
}

// Mirrors the api's feedbackReplySchema body limit
export const FEEDBACK_REPLY_MAX_LENGTH = 5000;

export interface FeedbackUser {
  id: string;
  name?: string | null;
  username?: string | null;
  image?: string | null;
}

export interface FeedbackReply {
  id: string;
  body: string;
  authorName?: string | null;
  isTeam: boolean;
  author?: FeedbackUser | null;
  createdAt: string;
}

export interface FeedbackClassification {
  sentiment?: string;
  urgency?: string;
  tags?: string[];
  summary?: string;
  hasPromptInjection?: boolean;
  suggestedTeam?: string;
}

export interface FeedbackItem {
  id: string;
  category: FeedbackCategory;
  description: string;
  pageUrl?: string | null;
  userAgent?: string | null;
  clientInfo?: Record<string, string | null | undefined> | null;
  classification?: FeedbackClassification | null;
  status: FeedbackStatus;
  screenshotUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  lastReplyIsTeam: boolean;
  replies: FeedbackReply[];
  user?: FeedbackUser | null;
}

export interface FeedbackInput {
  category: FeedbackCategory;
  description: string;
  pageUrl?: string;
  userAgent?: string;
  clientInfo?: Record<string, string | number | undefined>;
  screenshotUrl?: string;
}

type UserFeedbackData = {
  userFeedback: Connection<FeedbackItem>;
};

type UserFeedbackByUserIdData = {
  userFeedbackByUserId: Connection<FeedbackItem>;
};

type FeedbackListData = {
  feedbackList: Connection<FeedbackItem>;
};

type FeedbackData = {
  feedback: FeedbackItem;
};

const FEEDBACK_REPLY_FRAGMENT = gql`
  fragment FeedbackReplyFragment on FeedbackReply {
    id
    body
    authorName
    isTeam
    author {
      id
      name
      username
      image
    }
    createdAt
  }
`;

export const SUBMIT_FEEDBACK_MUTATION = gql`
  mutation SubmitFeedback($input: FeedbackInput!) {
    submitFeedback(input: $input) {
      _
    }
  }
`;

export const USER_FEEDBACK_QUERY = gql`
  query UserFeedback($after: String, $first: Int) {
    userFeedback(after: $after, first: $first) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          category
          description
          status
          screenshotUrl
          createdAt
          updatedAt
          lastActivityAt
          lastReplyIsTeam
          replies {
            ...FeedbackReplyFragment
          }
        }
      }
    }
  }
  ${FEEDBACK_REPLY_FRAGMENT}
`;

export const USER_FEEDBACK_BY_USER_ID_QUERY = gql`
  query UserFeedbackByUserId($userId: ID!, $after: String, $first: Int) {
    userFeedbackByUserId(userId: $userId, after: $after, first: $first) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          category
          description
          status
          screenshotUrl
          createdAt
          updatedAt
          lastActivityAt
          lastReplyIsTeam
          user {
            id
            name
            username
            image
          }
          replies {
            ...FeedbackReplyFragment
          }
        }
      }
    }
  }
  ${FEEDBACK_REPLY_FRAGMENT}
`;

export const FEEDBACK_LIST_QUERY = gql`
  query FeedbackList(
    $after: String
    $first: Int
    $status: Int
    $statuses: [Int!]
    $category: ProtoEnumValue
    $awaitingTeam: Boolean
  ) {
    feedbackList(
      after: $after
      first: $first
      status: $status
      statuses: $statuses
      category: $category
      awaitingTeam: $awaitingTeam
    ) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          category
          description
          status
          screenshotUrl
          createdAt
          updatedAt
          lastActivityAt
          lastReplyIsTeam
          user {
            id
            name
            username
            image
          }
          replies {
            ...FeedbackReplyFragment
          }
        }
      }
    }
  }
  ${FEEDBACK_REPLY_FRAGMENT}
`;

export const FEEDBACK_QUERY = gql`
  query Feedback($id: ID!) {
    feedback(id: $id) {
      id
      category
      description
      pageUrl
      userAgent
      clientInfo
      classification
      status
      screenshotUrl
      createdAt
      updatedAt
      lastActivityAt
      lastReplyIsTeam
      user {
        id
        name
        username
        image
      }
      replies {
        ...FeedbackReplyFragment
      }
    }
  }
  ${FEEDBACK_REPLY_FRAGMENT}
`;

export const REPLY_TO_FEEDBACK_MUTATION = gql`
  mutation ReplyToFeedback($id: ID!, $body: String!) {
    replyToFeedback(id: $id, body: $body) {
      ...FeedbackReplyFragment
    }
  }
  ${FEEDBACK_REPLY_FRAGMENT}
`;

export const UPDATE_FEEDBACK_STATUS_MUTATION = gql`
  mutation UpdateFeedbackStatus($id: ID!, $status: Int!, $message: String) {
    updateFeedbackStatus(id: $id, status: $status, message: $message) {
      id
      status
      updatedAt
      replies {
        ...FeedbackReplyFragment
      }
    }
  }
  ${FEEDBACK_REPLY_FRAGMENT}
`;

export const submitFeedback = (input: FeedbackInput): Promise<EmptyResponse> =>
  gqlClient.request(SUBMIT_FEEDBACK_MUTATION, { input });

export const replyToFeedback = async ({
  id,
  body,
}: {
  id: string;
  body: string;
}): Promise<FeedbackReply> => {
  const res = await gqlClient.request<{ replyToFeedback: FeedbackReply }>(
    REPLY_TO_FEEDBACK_MUTATION,
    { id, body },
  );
  return res.replyToFeedback;
};

export const updateFeedbackStatus = async ({
  id,
  status,
  message,
}: {
  id: string;
  status: FeedbackStatus;
  message?: string;
}): Promise<Pick<FeedbackItem, 'id' | 'status' | 'updatedAt' | 'replies'>> => {
  const res = await gqlClient.request<{
    updateFeedbackStatus: Pick<
      FeedbackItem,
      'id' | 'status' | 'updatedAt' | 'replies'
    >;
  }>(UPDATE_FEEDBACK_STATUS_MUTATION, { id, status, message });
  return res.updateFeedbackStatus;
};

export const feedbackQueryOptions = ({ id }: { id: string }) => ({
  queryKey: generateQueryKey(RequestKey.Feedback, undefined, id),
  queryFn: async (): Promise<FeedbackItem> => {
    const res = await gqlClient.request<FeedbackData>(FEEDBACK_QUERY, { id });
    return res.feedback;
  },
  staleTime: StaleTime.Default,
  enabled: !!id,
});

export const useUserFeedback = (first = 20) => {
  return useInfiniteQuery({
    queryKey: generateQueryKey(RequestKey.UserFeedback),
    queryFn: ({ pageParam }) =>
      gqlClient.request<UserFeedbackData>(USER_FEEDBACK_QUERY, {
        first,
        after: pageParam,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      getNextPageParam(lastPage?.userFeedback?.pageInfo),
  });
};

export const useUserFeedbackByUserId = ({
  userId,
  first = 20,
  enabled = true,
}: {
  userId: string;
  first?: number;
  enabled?: boolean;
}) => {
  return useInfiniteQuery({
    queryKey: generateQueryKey(
      RequestKey.UserFeedbackByUserId,
      undefined,
      userId,
    ),
    queryFn: ({ pageParam }) =>
      gqlClient.request<UserFeedbackByUserIdData>(
        USER_FEEDBACK_BY_USER_ID_QUERY,
        {
          userId,
          first,
          after: pageParam,
        },
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      getNextPageParam(lastPage?.userFeedbackByUserId?.pageInfo),
    enabled: enabled && !!userId,
  });
};

export const useFeedbackList = ({
  first = 20,
  status,
  statuses,
  category,
  awaitingTeam,
  enabled = true,
}: {
  first?: number;
  status?: FeedbackStatus;
  statuses?: FeedbackStatus[];
  category?: FeedbackCategory;
  awaitingTeam?: boolean;
  enabled?: boolean;
}) => {
  return useInfiniteQuery({
    queryKey: generateQueryKey(
      RequestKey.FeedbackList,
      undefined,
      status ?? null,
      statuses?.join(',') ?? null,
      category ?? null,
      awaitingTeam ?? null,
    ),
    queryFn: ({ pageParam }) =>
      gqlClient.request<FeedbackListData>(FEEDBACK_LIST_QUERY, {
        first,
        after: pageParam,
        status,
        statuses,
        category,
        awaitingTeam,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      getNextPageParam(lastPage?.feedbackList?.pageInfo),
    enabled,
  });
};
