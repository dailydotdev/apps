import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
import nock from 'nock';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import { ANSWER_FEED_SURVEY_MUTATION } from '../../../graphql/feedSurvey';
import { LogEvent, TargetType } from '../../../lib/log';
import { FeedSurveyGrid } from './FeedSurveyGrid';

const survey = {
  id: 'survey-1',
  question: 'Did you discover something worth reading?',
  options: [
    { id: 'o1', text: 'Yes', order: 0, key: 'yes' },
    { id: 'o2', text: 'No, only repeats', order: 1, key: 'repeats' },
    { id: 'o3', text: 'No, wrong topics', order: 2, key: 'wrong_topics' },
    { id: 'o4', text: 'No, not useful', order: 3, key: 'not_useful' },
  ],
};

const logEvent = jest.fn();

const renderComponent = () =>
  render(
    <TestBootProvider client={new QueryClient()} log={{ logEvent }}>
      <FeedSurveyGrid
        survey={survey}
        feedMeta="feed-meta"
        feedName="my-feed"
        columns={3}
        column={1}
        row={1}
      />
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
});

describe('FeedSurveyGrid', () => {
  it('should show the question and every option', () => {
    renderComponent();

    expect(screen.getByText(survey.question)).toBeInTheDocument();
    survey.options.forEach(({ text }) =>
      expect(screen.getByRole('button', { name: text })).toBeInTheDocument(),
    );
  });

  it('should store the picked option and thank the user', async () => {
    let answered = false;
    mockGraphQL({
      request: {
        query: ANSWER_FEED_SURVEY_MUTATION,
        variables: { surveyId: survey.id, optionId: 'o3' },
      },
      result: () => {
        answered = true;
        return { data: { answerFeedSurvey: { _: true } } };
      },
    });
    renderComponent();

    await userEvent.click(
      screen.getByRole('button', { name: 'No, wrong topics' }),
    );

    expect(
      await screen.findByText("Thanks, let's fix that."),
    ).toBeInTheDocument();
    expect(answered).toBe(true);
    expect(screen.queryByText(survey.question)).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Edit my topics →' }),
    ).toHaveAttribute('href', expect.stringMatching(/settings\/feed\/tags$/));
    expect(
      screen.getByRole('link', { name: 'Block a topic →' }),
    ).toHaveAttribute(
      'href',
      expect.stringMatching(/settings\/feed\/filters$/),
    );
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.AnswerFeedSurvey,
        target_type: TargetType.FeedSurvey,
        target_id: survey.id,
        feed_item_meta: 'feed-meta',
      }),
    );
  });

  it('should keep the question when the answer could not be stored', async () => {
    mockGraphQL({
      request: {
        query: ANSWER_FEED_SURVEY_MUTATION,
        variables: { surveyId: survey.id, optionId: 'o1' },
      },
      result: { errors: [{ message: 'Feed survey is not due' }] },
    });
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Yes' }));

    await waitFor(() => expect(nock.isDone()).toBe(true));
    expect(screen.getByText(survey.question)).toBeInTheDocument();
    expect(
      screen.queryByText('Glad to hear it. Thanks!'),
    ).not.toBeInTheDocument();
  });
});
