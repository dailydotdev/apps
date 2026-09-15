import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { postWithCommunitySentiment as post } from '../../../__tests__/fixture/post';
import { EndOfThreadShare } from './EndOfThreadShare';

const renderBand = (commentsCount: number) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <EndOfThreadShare commentsCount={commentsCount} post={post} />
    </TestBootProvider>,
  );

describe('EndOfThreadShare', () => {
  it('offers the link at the end of a conversation', () => {
    renderBand(24);

    expect(screen.getByText('Enjoyed this discussion?')).toBeInTheDocument();
    expect(
      screen.getByText('Send it to someone who\u2019d have opinions.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy link' })).toBeVisible();
  });

  it.each([0, 1, 2])(
    'stays away when %i replies is not yet a conversation',
    (commentsCount) => {
      renderBand(commentsCount);

      expect(
        screen.queryByText('Enjoyed this discussion?'),
      ).not.toBeInTheDocument();
    },
  );

  it('appears from the third comment, where a thread becomes a discussion', () => {
    renderBand(3);

    expect(screen.getByText('Enjoyed this discussion?')).toBeInTheDocument();
  });
});
