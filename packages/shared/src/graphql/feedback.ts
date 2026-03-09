import { useInfiniteQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { generateQueryKey, getNextPageParam, RequestKey } from '../lib/query';
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
}

export interface FeedbackReply {
  id: string;
  body: string;
  authorName?: string | null;
  createdAt: string;
}

export interface FeedbackItem {
  id: string;
  category: FeedbackCategory;
  description: string;
  status: FeedbackStatus;
  screenshotUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  replies: FeedbackReply[];
  user?: {
    id: string;
    name?: string | null;
    username?: string | null;
    image?: string | null;
  } | null;
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
          replies {
            id
            body
            authorName
            createdAt
          }
        }
      }
    }
  }
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
          user {
            id
            name
            username
            image
          }
          replies {
            id
            body
            authorName
            createdAt
          }
        }
      }
    }
  }
`;

export const submitFeedback = (input: FeedbackInput): Promise<EmptyResponse> =>
  gqlClient.request(SUBMIT_FEEDBACK_MUTATION, { input });

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
