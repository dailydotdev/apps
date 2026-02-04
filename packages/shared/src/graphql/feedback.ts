import { gql } from 'graphql-request';
import { gqlClient } from './common';
import type { EmptyResponse } from './emptyResponse';

/**
 * @generated from enum dailydotdev.bragi.pipelines.FeedbackCategory
 */
export enum FeedbackCategory {
  Unspecified = 0,
  BugReport = 1,
  FeatureRequest = 2,
  UxIssue = 3,
  PerformanceComplaint = 4,
  ContentQuality = 5,
}

export interface FeedbackInput {
  category: FeedbackCategory;
  description: string;
  pageUrl?: string;
  userAgent?: string;
  screenshotUrl?: string;
}

export const SUBMIT_FEEDBACK_MUTATION = gql`
  mutation SubmitFeedback($input: FeedbackInput!) {
    submitFeedback(input: $input) {
      _
    }
  }
`;

export const submitFeedback = (input: FeedbackInput): Promise<EmptyResponse> =>
  gqlClient.request(SUBMIT_FEEDBACK_MUTATION, { input });
