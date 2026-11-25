import { gql } from 'graphql-request';
import { gqlClient } from './common';
import type { PollOption } from './posts';

export type FeedSurveyOption = Pick<PollOption, 'id' | 'text' | 'order'> & {
  /** A stable name for what the option means, independent of the wording. */
  key?: string | null;
};

/** A single-choice question asked in the feed. */
export type FeedSurvey = {
  id: string;
  question: string;
  options: FeedSurveyOption[];
};

export const ANSWER_FEED_SURVEY_MUTATION = gql`
  mutation AnswerFeedSurvey($surveyId: ID!, $optionId: ID!) {
    answerFeedSurvey(surveyId: $surveyId, optionId: $optionId) {
      _
    }
  }
`;

export const answerFeedSurvey = (variables: {
  surveyId: string;
  optionId: string;
}): Promise<void> => gqlClient.request(ANSWER_FEED_SURVEY_MUTATION, variables);
