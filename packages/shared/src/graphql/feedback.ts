import { gql } from 'graphql-request';
import { gqlClient } from './common';

export enum FeedbackCategory {
  Bug = 'BUG',
  FeatureRequest = 'FEATURE_REQUEST',
  General = 'GENERAL',
  Other = 'OTHER',
}

export interface FeedbackInput {
  category: FeedbackCategory;
  description: string;
  pageUrl?: string;
  userAgent?: string;
}

export interface FeedbackResult {
  success: boolean;
  feedbackId?: string;
}

export interface SubmitFeedbackData {
  submitFeedback: FeedbackResult;
}

export const SUBMIT_FEEDBACK_MUTATION = gql`
  mutation SubmitFeedback($input: FeedbackInput!) {
    submitFeedback(input: $input) {
      success
      feedbackId
    }
  }
`;

export const submitFeedback = (input: FeedbackInput): Promise<FeedbackResult> =>
  gqlClient
    .request<SubmitFeedbackData>(SUBMIT_FEEDBACK_MUTATION, { input })
    .then((res) => res.submitFeedback);
