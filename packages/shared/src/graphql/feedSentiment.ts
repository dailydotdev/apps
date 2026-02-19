import { gql } from 'graphql-request';
import { gqlClient } from './common';
import type { EmptyResponse } from './emptyResponse';

export type FeedSentiment = 'good' | 'neutral' | 'bad';

export const SUBMIT_FEED_SENTIMENT_MUTATION = gql`
  mutation SubmitFeedSentiment($sentiment: String!) {
    submitFeedSentiment(sentiment: $sentiment) {
      _
    }
  }
`;

export const submitFeedSentiment = (
  sentiment: FeedSentiment,
): Promise<EmptyResponse> =>
  gqlClient.request(SUBMIT_FEED_SENTIMENT_MUTATION, { sentiment });
